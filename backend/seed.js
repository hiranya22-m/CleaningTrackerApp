const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');
const Job = require('./src/models/Job');
const LocationLog = require('./src/models/LocationLog');
const Attendance = require('./src/models/Attendance');
const Package = require('./src/models/Package');
const ClientRequest = require('./src/models/ClientRequest');
const FreelanceJob = require('./src/models/FreelanceJob');
const WorkerAssignment = require('./src/models/WorkerAssignment');
const Contract = require('./src/models/Contract');

dotenv.config();

const seedData = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cleaning_tracker';
    console.log(`Connecting to MongoDB at: ${connStr}`);
    await mongoose.connect(connStr);
    console.log('Connected to MongoDB...');

    // Clear all existing data
    await User.deleteMany();
    await Job.deleteMany();
    await LocationLog.deleteMany();
    await Attendance.deleteMany();
    await Package.deleteMany();
    await ClientRequest.deleteMany();
    await FreelanceJob.deleteMany();
    await WorkerAssignment.deleteMany();
    await Contract.deleteMany();
    console.log('Cleared all collections...');

    // ── Seed Packages ────────────────────────────────────────────────────────
    const basicPkg = await Package.create({
      name: 'Basic',
      maxWorkers: 5,
      price: 299,
      isDynamic: false,
      features: ['Up to 5 crew members', 'Fixed monthly price', 'Contract management', 'Crew requests'],
      pricePerExtraWorker: 0
    });

    const premiumPkg = await Package.create({
      name: 'Premium',
      maxWorkers: 50,
      price: 199,
      isDynamic: true,
      features: ['Choose crew count', 'Dynamic pricing', 'Live GPS tracking', 'Backup waitlist crew members'],
      pricePerExtraWorker: 25
    });
    console.log('✅ Packages created (Basic & Premium)');

    // ── Admin ────────────────────────────────────────────────────────────────
    const admin = await User.create({
      name: 'System Administrator',
      email: 'admincrewlynk@gmail.com',
      phoneNumber: '222-333-0000',
      password: 'Admin123@',
      role: 'admin',
      status: 'offline'
    });
    console.log('✅ Admin created: admincrewlynk@gmail.com / Admin123@');

    // ── Contractors (no password — OTP only) ──────────────────────────────────
    const contractor1 = await User.create({
      name: 'Robert Vance',
      email: 'contractor@crewlynk.com',
      phoneNumber: '222-333-4444',
      companyName: 'Vance Cleaning Co',
      role: 'contractor',
      status: 'available',
      packageId: basicPkg._id,
      tags: ['Cleaning', 'Electrical'],
      locations: ['NY', 'NJ']
    });

    const contractor2 = await User.create({
      name: 'Nethmi Hiranya',
      email: 'nethmihiranya22@gmail.com',
      phoneNumber: '947-759-5599',
      companyName: 'Nethmi Cleaners Ltd',
      role: 'contractor',
      status: 'available',
      packageId: premiumPkg._id,
      tags: ['Cleaning', 'Plumbing', 'Carpentry'],
      locations: ['NY', 'CA']
    });
    console.log('✅ Contractors created (OTP login only): contractor@crewlynk.com, nethmihiranya22@gmail.com');

    // ── Crew Members (no password — OTP only) ─────────────────────────────────
    const worker1 = await User.create({
      name: 'John Doe',
      email: 'worker1@crewlynk.com',
      phoneNumber: '333-444-5555',
      role: 'worker',
      status: 'available',
      contractorId: contractor1._id,
      tags: ['Cleaning', 'Electrical'],
      state: 'NY',
      hourlyRate: 25
    });

    const worker2 = await User.create({
      name: 'Jane Smith',
      email: 'worker2@crewlynk.com',
      phoneNumber: '444-555-6666',
      role: 'worker',
      status: 'available',
      contractorId: contractor2._id,
      tags: ['Cleaning', 'Plumbing'],
      state: 'NY',
      hourlyRate: 30
    });

    const worker3 = await User.create({
      name: 'Malith Hirushan',
      email: 'malithhirushan10@gmail.com',
      phoneNumber: '947-759-5500',
      role: 'worker',
      status: 'available',
      tags: ['Cleaning', 'Carpentry'],
      state: 'CA',
      hourlyRate: 28
    });
    console.log('✅ Crew Members created: worker1@crewlynk.com, worker2@crewlynk.com, malithhirushan10@gmail.com');

    // ── Clients (no password — OTP only) ─────────────────────────────────────
    const client1 = await User.create({
      name: 'Michael Scott',
      email: 'client1@crewlynk.com',
      phoneNumber: '555-666-7777',
      role: 'client',
      state: 'NY',
      status: 'available'
    });

    const client2 = await User.create({
      name: 'Dunder Mifflin',
      email: 'client2@crewlynk.com',
      phoneNumber: '555-777-8888',
      role: 'client',
      state: 'CA',
      status: 'available'
    });
    console.log('✅ Clients created: client1@crewlynk.com, client2@crewlynk.com');

    // ── Sample Jobs ──────────────────────────────────────────────────────────
    const job1 = await Job.create({
      customerName: 'Michael Scott (Dunder Mifflin NY)',
      address: '1725 Slough Avenue, Scranton, NY 18505',
      latitude: 40.7527,
      longitude: -73.9772,
      geofenceRadius: 150,
      assignedWorker: worker1._id,
      contractor: contractor1._id,
      startTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
      expectedHours: 4,
      notes: 'Clean Slough avenue offices and vacuum reception.'
    });

    const job2 = await Job.create({
      customerName: 'Dunder Mifflin CA Complex',
      address: '150 Central Park South, Los Angeles, CA 90012',
      latitude: 34.0522,
      longitude: -118.2437,
      geofenceRadius: 200,
      assignedWorker: worker3._id,
      contractor: contractor2._id,
      startTime: new Date(Date.now() + 5 * 60 * 60 * 1000),
      expectedHours: 3,
      notes: 'Wipe down conference desks and breakroom.'
    });

    console.log('\n✅ Sample Jobs created:');
    console.log(`   - Slough Ave NY (Crew Member: John Doe, Contractor: Robert Vance)`);
    console.log(`   - DM CA Complex (Crew Member: Malith Hirushan, Contractor: Nethmi Hiranya)`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('📋 Login credentials:');
    console.log('   ADMIN:        admincrewlynk@gmail.com  /  Admin123@  (password login)');
    console.log('   CREW MEMBERS: worker1@crewlynk.com, worker2@crewlynk.com, malithhirushan10@gmail.com  (OTP login)');
    console.log('   CONTRACTORS:  contractor@crewlynk.com, nethmihiranya22@gmail.com  (OTP login)');
    console.log('   CLIENTS:      client1@crewlynk.com, client2@crewlynk.com  (OTP login)');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  }
};

seedData();
