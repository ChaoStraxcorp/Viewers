import React from 'react';

interface PopupModalProps {
  isVisible: boolean;
  onClose: () => void;
  imageSrc: string;
  imageAlt: string;
}

const PopupModal: React.FC<PopupModalProps> = ({ isVisible, onClose, imageSrc, imageAlt }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative max-h-[90vh] max-w-[90vw] overflow-auto rounded-lg bg-white p-4 shadow-xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-2 top-2 z-10 rounded-full bg-gray-800 p-2 text-white hover:bg-gray-600"
        >
          ✕
        </button>

        {/* Image */}
        <img
          src={imageSrc}
          alt={imageAlt}
          className="h-auto w-full object-contain"
          onLoad={() => console.log('Image loaded successfully')}
          onError={e => console.error('Image failed to load:', e)}
        />
      </div>
    </div>
  );
};

export default PopupModal;

