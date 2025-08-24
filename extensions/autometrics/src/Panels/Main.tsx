import React from 'react';
import { Button } from '@ohif/ui-next';

const Main = ({ handleButtonClick }) => {
  return (
    <div style={{ padding: '20px' }}>
      <h2>Autometrics Panel</h2>
      <p style={{ marginBottom: '20px', fontSize: '16px', color: '#ffffff', fontStyle: 'italic' }}>
        Select the measurement you would like to modify:
      </p>
      <p>Welcome to the Autometrics extension. Select a measurement group below:</p>

      {/* Angular Measurements Group */}
      <div style={{ marginTop: '20px' }}>
        <h3
          style={{
            marginBottom: '10px',
            color: '#ffffff',
            borderBottom: '3px solid #007bff',
            paddingBottom: '5px',
            fontSize: '18px',
            fontWeight: 'bold',
            textShadow: '0 1px 2px rgba(0,0,0,0.1)',
          }}
        >
          Angular Measurements
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Button
            onClick={() => handleButtonClick('M1M2')}
            style={{ width: '100%', padding: '10px', textAlign: 'left' }}
          >
            M1M2
          </Button>

          <Button
            onClick={() => handleButtonClick('TMT')}
            style={{ width: '100%', padding: '10px', textAlign: 'left' }}
          >
            TMT
          </Button>

          <Button
            onClick={() => handleButtonClick('CP')}
            style={{ width: '100%', padding: '10px', textAlign: 'left' }}
          >
            CP
          </Button>

          <Button
            onClick={() => handleButtonClick('HA')}
            style={{ width: '100%', padding: '10px', textAlign: 'left' }}
          >
            HA
          </Button>
        </div>
      </div>

      {/* Foot Ankle OffSet Group */}
      <div style={{ marginTop: '30px' }}>
        <h3
          style={{
            marginBottom: '10px',
            color: '#ffffff',
            borderBottom: '3px solid #28a745',
            paddingBottom: '5px',
            fontSize: '18px',
            fontWeight: 'bold',
            textShadow: '0 1px 2px rgba(0,0,0,0.1)',
          }}
        >
          Foot Ankle OffSet
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Button
            onClick={() => handleButtonClick('TALAS')}
            style={{ width: '100%', padding: '10px', textAlign: 'left' }}
          >
            TALAS
          </Button>
        </div>
      </div>

      {/* CUBEVUE AUTOMETRICS Logo */}
      <div className="mt-6 flex items-center justify-center border-t border-gray-600 pt-4">
        <div className="flex w-full flex-col items-center space-y-3">
          {/* CurveBeam Logo */}
          <div className="w-full">
            <img
              src="/Curvebeam-Logo.png"
              alt="CurveBeam Logo"
              className="h-auto w-full object-contain"
            />
          </div>

          {/* Autometrics Logo */}
          <div className="w-full">
            <img
              src="/Autometrics.png"
              alt="Autometrics"
              className="h-auto w-full object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Main;
