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

  // Create a new audio instance each time to avoid issues with rapid clicks
  const sound = new Audio('/audio/mouse-click.mp3');
  sound.volume = 0.5;
  sound.play();
}

// Image validation
export const validateImageFile = (file: File) => {
  // Check file type
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'File type not supported. Please upload a JPEG, PNG, GIF or WEBP image.'
    };
  }

  // Check file size (10MB max)
  const maxSize = 10 * 1024 * 1024; // 10MB in bytes
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File too large. Maximum size is 10MB.'
    };
  }

  return { valid: true };
};

// Image URL validation
export const isValidImageUrl = (url: string) => {
  try {
    const parsedUrl = new URL(url);
    const pathname = parsedUrl.pathname.toLowerCase();
    return pathname.endsWith('.jpg') ||
      pathname.endsWith('.jpeg') ||
      pathname.endsWith('.png') ||
      pathname.endsWith('.gif') ||
      pathname.endsWith('.webp');
  } catch {
    return false;
  }
};
