const User = require('../models/User');
const Package = require('../models/Package');

const MONTH_MS = 30 * 24 * 60 * 60 * 1000;

const getPackagePrice = (pkg) => {
  if (!pkg) return 299;
  return pkg.price || 299;
};

const addMonths = (fromDate, months = 1) =>
  new Date(fromDate.getTime() + months * MONTH_MS);

exports.getSubscriptionSummary = (user, pkg) => {
  const price = getPackagePrice(pkg);
  const expiresAt = user.planExpiresAt ? new Date(user.planExpiresAt) : null;
  const now = new Date();
  const isExpired = !expiresAt || expiresAt <= now;
  const autoRenew = user.planAutoRenew !== false;

  return {
    packageName: pkg?.name || 'Basic',
    packagePrice: price,
    planStatus: user.planStatus || 'active',
    planAutoRenew: autoRenew,
    planExpiresAt: expiresAt,
    lastBilledAt: user.lastBilledAt || null,
    planTotalBilled: user.planTotalBilled || 0,
    isExpired,
    renewsOn: expiresAt,
    nextChargeAmount: price,
    willRenew: autoRenew && !isExpired,
    message: autoRenew
      ? (isExpired ? 'Plan expired — renew to continue' : `Renews on ${expiresAt.toLocaleDateString()}`)
      : (isExpired ? 'Plan expired' : `Expires on ${expiresAt.toLocaleDateString()} (auto-renew off)`)
  };
};

exports.initializeSubscription = async (user, pkg) => {
  const price = getPackagePrice(pkg);
  const now = new Date();

  user.packageId = pkg._id;
  user.planExpiresAt = addMonths(now, 1);
  user.planAutoRenew = true;
  user.planStatus = 'active';
  user.lastBilledAt = now;
  user.planTotalBilled = (user.planTotalBilled || 0) + price;
  user.earlySelectCharge = 0;

  await user.save();
  return user;
};

exports.chargeRenewal = async (user, pkg) => {
  const price = getPackagePrice(pkg);
  const baseDate =
    user.planExpiresAt && new Date(user.planExpiresAt) > new Date()
      ? new Date(user.planExpiresAt)
      : new Date();

  user.planExpiresAt = addMonths(baseDate, 1);
  user.planStatus = 'active';
  user.planAutoRenew = true;
  user.lastBilledAt = new Date();
  user.planTotalBilled = (user.planTotalBilled || 0) + price;

  await user.save();
  return { user, chargedAmount: price };
};

exports.processSubscriptionRenewals = async () => {
  const now = new Date();
  const expiredContractors = await User.find({
    role: 'contractor',
    planExpiresAt: { $lte: now }
  }).populate('packageId');

  let renewed = 0;
  let expired = 0;

  for (const user of expiredContractors) {
    const pkg = user.packageId || (await Package.findOne({ name: 'Basic' }));
    if (!pkg) continue;

    if (user.planAutoRenew !== false && user.planStatus !== 'cancelled') {
      await exports.chargeRenewal(user, pkg);
      renewed += 1;
      console.log(`Subscription renewed for ${user.email} — $${getPackagePrice(pkg)}`);
    } else {
      user.planStatus = 'expired';
      await user.save();
      expired += 1;
      console.log(`Subscription expired (no auto-renew) for ${user.email}`);
    }
  }

  return { renewed, expired };
};
