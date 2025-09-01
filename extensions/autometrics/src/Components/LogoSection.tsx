import React from 'react';

const LogoSection: React.FC = () => {
  return (
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
  );
};

export default LogoSection;
