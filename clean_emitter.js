const fs = require('fs');
const files = [
  'admin/AdminDashboard.js',
  'admin/AssignJobScreen.js',
  'client/ClientDashboard.js',
  'contractor/ContractorDashboard.js',
  'worker/WorkerDashboard.js',
  'LoginScreen.js',
  'WelcomeScreen.js'
];

files.forEach(f => {
  const file = 'D:/Users/nethmi/OneDrive/Desktop/CleaningTrackerApp/frontend/src/screens/' + f;
  if (!fs.existsSync(file)) return;
  
  let content = fs.readFileSync(file, 'utf8');
  
  content = content.replace(/import backScrollEmitter from ['"].*?backScrollEmitter['"];?/g, '');
  
  content = content.replace(/const unsub = backScrollEmitter\.subscribe\(listener\);[\s\S]*?return \(\) => unsub\(\);/g, '');
  
  content = content.replace(/useEffect\(\(\) => \{\s*const listener = \(\) => \{[\s\S]*?\}\s*\}, \[\]\);/g, '');
  
  content = content.replace(/let handled = false;\s*const markHandled = \(\) => \{ handled = true; \};\s*backScrollEmitter\.requestScrollToTop\(markHandled\);\s*if \(handled\) return true;/g, '');
  
  fs.writeFileSync(file, content);
  console.log('Cleaned backScrollEmitter from ' + f);
});
