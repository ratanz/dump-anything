'use client'
import React, { useState, useEffect } from 'react'
import {  Music, VolumeX } from 'lucide-react';
import { playClickSound } from '../lib/utils';
import { signOut, useSession } from 'next-auth/react';
import { User, LogOut, LogIn } from 'lucide-react';
import Link from 'next/link';
import 'remixicon/fonts/remixicon.css'
import { motion } from 'motion/react'

const Navbar = () => {
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const DEFAULT_VOLUME = 0.5; // Set default volume to 50%
  const { data: session, status } = useSession();

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
  };

  const animate = () => {
    return {
      initial: { opacity: 0, y: 30 },
      animate: { opacity: 1, y: 0},
      transition: { duration: 0.5, delay: 0.5 }
    }
  }


  return (
    <div className='w-full h-10 px-4 py-3 fixed inset-0 z-50'>
        <div className="logo flex items-center justify-between ">
            <motion.h1
              {...animate()}
              className='text-[10vw] md:text-sm text-transparent  bg-clip-text bg-gradient-to-bl from-zinc-100 via-zinc-100 to-110% '>
              Anything
            </motion.h1>

            {/* Auth buttons */}
            <div className="flex items-center">
              {status === 'authenticated' && session?.user ? (
                <div className="flex items-center">
                  <motion.div 
                    {...animate()}
                    className="flex items-center gap-2 text-white backdrop-blur-4xl px-3 py-1.5 ">
                    <User size={16} />
                    <span className="text-sm">{session.user.name || session.user.email}</span>
                  </motion.div>
                  <motion.button 
                    {...animate()}
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="flex items-center gap-1 text-white hover:text-red-500 cursor-pointer px-2 py-1.5 rounded-full text-sm transition-colors"
                  >
                    <LogOut size={16} />
                  </motion.button>
                </div>
              ) : status === 'unauthenticated' ? (
                <Link 
                  href="/auth/signin"
                  className="flex items-center gap-1 text-white px-3 py-1.5 rounded-full text-sm transition-colors"
                >
                  <LogIn size={16} />
                  <span>Sign in</span>
                </Link>
              ) : null}

              <div className="flex items-center gap-2">
                <motion.button 
                  {...animate()}
                  onClick={toggleMusic} 
                  className="p-1 rounded-full hover:text-blue-500 transition-colors cursor-pointer"
                  aria-label={isMusicPlaying ? "Mute music" : "Play music"}
                >
                  {isMusicPlaying ? <Music size={18} /> : <VolumeX size={18} />}
                </motion.button>
                
                <motion.div 
                  {...animate()}
                  className="menu hover:cursor-pointer"
                  onClick={handleMenuClick}
                >
                  <i className="ri-menu-3-line hover:text-blue-500"></i>
                </motion.div>
              </div>
            </div>
        </div>
    </div>
  )
}

export default Navbar
