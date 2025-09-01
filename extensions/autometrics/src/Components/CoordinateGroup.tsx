import React from 'react';
import { Button } from '@ohif/ui-next';

interface CoordinateGroupProps {
  title: string;
  groupKey: string;
  coordinates: { x: string; y: string; z: string };
  isSelected: boolean;
  onSelect: (groupKey: string) => void;
}

const CoordinateGroup: React.FC<CoordinateGroupProps> = ({
  title,
  groupKey,
  coordinates,
  isSelected,
  onSelect,
}) => {
  return (
    <div className="space-y-2">
      <div className="border-b border-gray-600 pb-1 text-sm font-medium text-gray-300">{title}</div>
      <div className="space-y-2 pl-2">
        <div className="flex items-center space-x-2">
          <label className="w-4 text-xs text-gray-400">X:</label>
          <input
            type="text"
            readOnly
            className="flex-1 rounded border border-gray-600 bg-gray-700 px-2 py-1 text-sm text-gray-300"
            placeholder="0.00"
            value={coordinates.x}
          />
        </div>
        <div className="flex items-center space-x-2">
          <label className="w-4 text-xs text-gray-400">Y:</label>
          <input
            type="text"
            readOnly
            className="flex-1 rounded border border-gray-600 bg-gray-700 px-2 py-1 text-sm text-gray-300"
            placeholder="0.00"
            value={coordinates.y}
          />
        </div>
        <div className="flex items-center space-x-2">
          <label className="w-4 text-xs text-gray-400">Z:</label>
          <input
            type="text"
            readOnly
            className="flex-1 rounded border border-gray-600 bg-gray-700 px-2 py-1 text-sm text-gray-300"
            placeholder="0.00"
            value={coordinates.z}
          />
        </div>
        <Button
          variant={isSelected ? 'default' : 'secondary'}
          size="sm"
          onClick={() => onSelect(groupKey)}
          className="w-full text-xs"
        >
          Select
        </Button>
      </div>
    </div>
  );
};

export default CoordinateGroup;

