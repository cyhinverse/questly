"use client";

import React, { useState, useEffect } from 'react';
import { useSound } from '@/lib/sound';

export function SoundToggle() {
  const [isEnabled, setIsEnabled] = useState(true);
  const { setEnabled, isEnabled: soundEnabled } = useSound();

  useEffect(() => {
    // Load sound preference from localStorage
    const saved = localStorage.getItem('sound-enabled');
    if (saved !== null) {
      const enabled = JSON.parse(saved);
      setIsEnabled(enabled);
      setEnabled(enabled);
    }
  }, [setEnabled]);

  const toggleSound = () => {
    const newEnabled = !isEnabled;
    setIsEnabled(newEnabled);
    setEnabled(newEnabled);
    localStorage.setItem('sound-enabled', JSON.stringify(newEnabled));
  };

  return (
    <button
      onClick={toggleSound}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
      title={isEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
    >
      {isEnabled ? (
        <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L5.617 13H2a1 1 0 01-1-1V8a1 1 0 011-1h3.617l2.766-3.793a1 1 0 011.617.793zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L5.617 13H2a1 1 0 01-1-1V8a1 1 0 011-1h3.617l2.766-3.793a1 1 0 011.617.793zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zM12.93 8.879a1 1 0 011.414 0A5.983 5.983 0 0116 10a5.983 5.983 0 01-1.657 4.121 1 1 0 01-1.414-1.414A3.987 3.987 0 0014 10a3.987 3.987 0 00-1.07-2.707 1 1 0 010-1.414z" clipRule="evenodd" />
          <path d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06L3.28 2.22z" />
        </svg>
      )}
      <span className="text-sm font-medium text-gray-700">
        {isEnabled ? 'Âm thanh' : 'Tắt tiếng'}
      </span>
    </button>
  );
}
