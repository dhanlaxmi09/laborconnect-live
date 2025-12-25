import { useState, useEffect } from 'react';
import logo from '@/assets/logo.png';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Start fade out after 2.5 seconds
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 2500);

    // Complete after fade animation (3 seconds total)
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-background transition-opacity duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Logo with scale-in animation */}
      <div className="animate-scale-in">
        <img 
          src={logo} 
          alt="LaborConnect" 
          className="w-48 h-48 md:w-64 md:h-64 object-contain animate-pulse"
        />
      </div>
      
      {/* Tagline with fade-in animation */}
      <p 
        className="mt-6 text-lg text-primary font-medium animate-fade-in"
        style={{ animationDelay: '0.5s', animationFillMode: 'backwards' }}
      >
        Connecting Hands To Opportunities
      </p>

      {/* Loading dots */}
      <div className="mt-8 flex gap-2">
        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}
