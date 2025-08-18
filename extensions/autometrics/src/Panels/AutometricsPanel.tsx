import React, { useState, useEffect } from 'react';
import { Button } from '@ohif/ui-next';
import Talas from './View/Talas';
import Main from './View/Main';

const AutometricsPanel = ({ commandsManager, servicesManager }) => {
  const [currentView, setCurrentView] = useState('autometrics'); // 'autometrics' or 'talas'

  // Handle ESC key to exit select mode
  const handleButtonClick = buttonName => {
    console.log(`${buttonName} button clicked`);

    if (buttonName === 'TALAS') {
      setCurrentView('talas');
      commandsManager.run({
        commandName: 'setHangingProtocol',
        commandOptions: {
          protocolId: 'mpr',
        },
      });

      // Enable crosshairs
      commandsManager.run({
        commandName: 'setToolActive',
        commandOptions: {
          toolName: 'Crosshairs',
          toolGroupId: 'mpr',
        },
      });
    } else {
      commandsManager.run({
        commandName: 'setToolActive',
        commandOptions: {
          toolName: 'Pan',
          toolGroupId: 'default',
        },
      });
      document.body.style.cursor = 'default';
    }
  };

  // TALAS view
  if (currentView && currentView === 'talas') {
    return (
      <Talas
        setCurrentView={setCurrentView}
        commandsManager={commandsManager}
      />
    );
  }

  // Default Autometrics view
  return (
    <Main handleButtonClick={handleButtonClick} />
  );
};

export default AutometricsPanel;
