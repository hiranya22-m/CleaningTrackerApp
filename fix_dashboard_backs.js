const fs = require('fs');

function updateDashboard(file, goBackLogic, deps) {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    
    let startStr = '  const goBack = () => {';
    let endStr = '  }, [tabHistory]);';
    let startIdx = content.indexOf(startStr);
    let endIdx = content.indexOf(endStr, startIdx);
    
    if (startIdx !== -1 && endIdx !== -1) {
        let block = content.substring(startIdx, endIdx + endStr.length);
        let newBlock = `  // Android Hardware Back Button Handler
  useEffect(() => {
    const onBackPress = () => {
${goBackLogic}
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => backHandler.remove();
  }, [${deps}]);`;
        content = content.replace(block, newBlock);
        fs.writeFileSync(file, content);
        console.log('Updated ' + file);
    } else {
        console.log('Could not find goBack block in ' + file);
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

updateDashboard('D:/Users/nethmi/OneDrive/Desktop/CleaningTrackerApp/frontend/src/screens/worker/WorkerDashboard.js', workerLogic, 'activeTab, tabHistory, selectedContractor');
updateDashboard('D:/Users/nethmi/OneDrive/Desktop/CleaningTrackerApp/frontend/src/screens/contractor/ContractorDashboard.js', contractorLogic, 'activeTab, tabHistory, selectedRosterWorker');
updateDashboard('D:/Users/nethmi/OneDrive/Desktop/CleaningTrackerApp/frontend/src/screens/client/ClientDashboard.js', clientLogic, 'activeTab, tabHistory, selectedContractor, selectedRosterWorker');
updateDashboard('D:/Users/nethmi/OneDrive/Desktop/CleaningTrackerApp/frontend/src/screens/admin/AdminDashboard.js', adminLogic, 'activeTab, tabHistory');
