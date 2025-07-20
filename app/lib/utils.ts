import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Click sound utility
let clickSound: HTMLAudioElement;

// Initialize click sound (only in browser)
if (typeof window !== 'undefined') {
  clickSound = new Audio('/audio/mouse-click.mp3');
  clickSound.volume = 0.5; // Set volume to 40%
  clickSound.preload = 'auto';
}

// Play click sound
export function playClickSound() {
  // For browsers that restrict audio before user interaction
  if (typeof window === 'undefined') return;
  
  try {
    // Create a new audio instance each time to avoid issues with rapid clicks
    const sound = new Audio('/audio/mouse-click.mp3');
    sound.volume = 0.5;
    sound.play().catch(err => {
      // Silently handle autoplay restrictions
      console.log('Click sound playback failed:', err);
    });
  } catch (error) {
    console.log('Error playing click sound:', error);
  }
}
