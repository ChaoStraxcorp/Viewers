import React from 'react';
import { Button } from '@ohif/ui-next';

interface TalasHeaderProps {
  onBack: () => void;
}

const TalasHeader: React.FC<TalasHeaderProps> = ({ onBack }) => {
  return (
    <div className="mb-4 flex items-center space-x-3">
      <Button
        variant="outline"
        size="sm"
        onClick={onBack}
        className="text-sm"
      >
        Back
      </Button>
      <div className="text-lg font-semibold text-white">TALAS</div>
    </div>
  );
};

export default TalasHeader;

