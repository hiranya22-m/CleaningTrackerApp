const fs = require('fs');

function addBackHandler(file, goBackLogic, deps) {
    if (!fs.existsSync(file)) return;
    let text = fs.readFileSync(file, 'utf8');
    
    if (text.includes('BackHandler.addEventListener(\'hardwareBackPress\'')) {
        console.log('BackHandler already exists in ' + file);
        return;
    }
    
    let insertIndex = -1;
    let lines = text.split('\n');
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('const [tabHistory')) {
            insertIndex = i;
            break;
        }
    }
    
    if (insertIndex !== -1) {
        let snippet = `
  // Android Hardware Back Button Handler
  useEffect(() => {
    const onBackPress = () => {
${goBackLogic}
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => backHandler.remove();
  }, [${deps}]);
`;
        lines.splice(insertIndex + 1, 0, snippet);
        fs.writeFileSync(file, lines.join('\n'));
        console.log('Added BackHandler to ' + file);
    } else {
        console.log('Failed to add BackHandler to ' + file);
    }
}

let workerLogic = `      if (activeTab === 'home' && selectedContractor) {
        setSelectedContractor(null);
        return true;
      }
      if (activeTab !== 'home' && tabHistory.length > 1) {
        setTabHistory(prev => {
          const hist = [...prev];
          hist.pop();
          setActiveTab(hist[hist.length - 1] || 'home');
          return hist;
        });
        return true;
      }
      return false;`;

let contractorLogic = `      if (activeTab === 'roster' && selectedRosterWorker) {
        setSelectedRosterWorker(null);
        setActiveTab('projects');
        return true;
      }
      if (activeTab !== 'projects' && tabHistory.length > 1) {
        setTabHistory(prev => {
          const hist = [...prev];
          hist.pop();
          setActiveTab(hist[hist.length - 1] || 'projects');
          return hist;
        });
        return true;
      }
      return false;`;

let clientLogic = `      if (activeTab === 'network' && selectedContractor) {
        setSelectedContractor(null);
        return true;
      }
      if (activeTab === 'network' && selectedRosterWorker) {
        setSelectedRosterWorker(null);
        return true;
      }
      if (activeTab !== 'projects' && tabHistory.length > 1) {
        setTabHistory(prev => {
          const hist = [...prev];
          hist.pop();
          setActiveTab(hist[hist.length - 1] || 'projects');
          return hist;
        });
        return true;
      }
      return false;`;

let adminLogic = `      if (activeTab !== 'users' && tabHistory.length > 1) {
        setTabHistory(prev => {
          const hist = [...prev];
          hist.pop();
          setActiveTab(hist[hist.length - 1] || 'users');
          return hist;
        });
        return true;
      }
      return false;`;

addBackHandler('D:/Users/nethmi/OneDrive/Desktop/CleaningTrackerApp/frontend/src/screens/worker/WorkerDashboard.js', workerLogic, 'activeTab, tabHistory, selectedContractor');
addBackHandler('D:/Users/nethmi/OneDrive/Desktop/CleaningTrackerApp/frontend/src/screens/contractor/ContractorDashboard.js', contractorLogic, 'activeTab, tabHistory, selectedRosterWorker');
addBackHandler('D:/Users/nethmi/OneDrive/Desktop/CleaningTrackerApp/frontend/src/screens/client/ClientDashboard.js', clientLogic, 'activeTab, tabHistory, selectedContractor, selectedRosterWorker');
addBackHandler('D:/Users/nethmi/OneDrive/Desktop/CleaningTrackerApp/frontend/src/screens/admin/AdminDashboard.js', adminLogic, 'activeTab, tabHistory');
