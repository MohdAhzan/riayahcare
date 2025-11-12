// VideoPlaceholder.tsx
import React, { useState } from 'react';

// --- CONFIGURATION ---
// !! IMPORTANT: Replace this path with the actual URL or local path of your static placeholder image.
const STATIC_PLACEHOLDER_IMAGE_URL = '/images/hospital-video-placeholder.jpg'; 
// Example: '/assets/video-thumb-default.jpg' or 'https://cdn.example.com/default-thumb.webp'
// If you use a placeholder image, you can remove the CSS fallback color.
// ---------------------

interface VideoPlaceholderProps {
  url: string;
  alt: string;
}

// Simple Modal component structure for the overlay
const VideoModal: React.FC<{ url: string; onClose: () => void }> = ({ url, onClose }) => (
  <div
    className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center p-4"
    onClick={onClose}
  >
    {/*
      MOVED: The Close Button is now outside the video container
      and is positioned absolutely relative to the screen (viewport).
    */}
    <button
      className="btn-glass absolute top-4 right-4 md:top-8 md:right-8 w-10 h-10 text-white text-4xl font-light hover:text-gray-300 transition flex justify-center items-center"
      onClick={onClose}
      aria-label="Close video"
    >
      &times;
    </button>
    
    <div
      className="relative w-full max-w-5xl aspect-video"
      onClick={(e) => e.stopPropagation()}
    >
      
      {/* The actual video player */}
      <video
        src={url}
        controls
        autoPlay
        className="rounded-xl w-full h-full shadow-2xl"
      />
    </div>
  </div>
);


const VideoPlaceholder: React.FC<VideoPlaceholderProps> = ({ url, alt }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // NOTE: The unreliable useEffect and useRef have been removed.

  return (
    <>
      <div
        className="relative cursor-pointer rounded-xl w-full aspect-video overflow-hidden shadow-md transition duration-300 hover:shadow-lg group"
        onClick={() => setIsOpen(true)}
        role="button"
        aria-label={`Play video: ${alt}`}
      >
        {/* Static Image Thumbnail */}
        <img
          src={STATIC_PLACEHOLDER_IMAGE_URL}
          alt={`Video thumbnail for ${alt}`}
          // Use object-cover to make sure the image fills the aspect-video container
          className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
        />
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 transition duration-300 group-hover:bg-opacity-10">
          <div className="p-4 bg-white/80 backdrop-blur-sm rounded-full transition duration-300 group-hover:bg-white/95">
            {/* Play Icon (using SVG) */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-green-600 fill-current"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Video Modal (Conditional Render) */}
      {isOpen && <VideoModal url={url} onClose={() => setIsOpen(false)} />}
    </>
  );
};

export default VideoPlaceholder;
