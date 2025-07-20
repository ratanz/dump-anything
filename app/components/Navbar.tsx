'use client'
import React, { useState, useEffect } from 'react'
import { Menu, Music, VolumeX } from 'lucide-react';
import { playClickSound } from '../lib/utils';

const Navbar = () => {
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const DEFAULT_VOLUME = 0.3; // Set default volume to 30%

  useEffect(() => {
    // Initialize audio on client-side only
    if (typeof window !== 'undefined') {
      const audioElement = new Audio('/audio/music.mp3'); // Path to your music file
      audioElement.loop = true;
      audioElement.volume = DEFAULT_VOLUME; // Set lower volume
      setAudio(audioElement);
      
      if (isMusicPlaying) {
        audioElement.play().catch(err => console.log('Audio playback failed:', err));
      }
      
      return () => {
        audioElement.pause();
        audioElement.src = '';
      };
    }
  }, [isMusicPlaying]);

  useEffect(() => {
    if (!audio) return;
    
    if (isMusicPlaying) {
      audio.play().catch(err => console.log('Audio playback failed:', err));
    } else {
      audio.pause();
    }
  }, [isMusicPlaying, audio]);

  const toggleMusic = () => {
    playClickSound();
    setIsMusicPlaying(!isMusicPlaying);
  };

  const handleMenuClick = () => {
    playClickSound();
    console.log('Menu clicked');
  };

  return (
    <div className='w-full h-10 px-4 py-2 fixed left-0 right-0 z-50'>
        <div className="logo flex items-center justify-between ">
            <h1>Anything</h1>

            <div className="flex items-center gap-4">
              <button 
                onClick={toggleMusic} 
                className="p-1 rounded-full hover:bg-white/10 transition-colors"
                aria-label={isMusicPlaying ? "Mute music" : "Play music"}
              >
                {isMusicPlaying ? <Music size={18} /> : <VolumeX size={18} />}
              </button>
              
              <div 
                className="menu hover:cursor-pointer"
                onClick={handleMenuClick}
              >
                <Menu />
              </div>
            </div>
        </div>
    </div>
  )
}

export default Navbar
