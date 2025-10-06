import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Star, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface SuperhostCelebrationProps {
  onClose: () => void;
}

export const SuperhostCelebration = ({ onClose }: SuperhostCelebrationProps) => {
  useEffect(() => {
    // Confetti animation
    const duration = 5000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      const particleCount = 50 * (timeLeft / duration);

      // Left side confetti
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#FFD700', '#FFA500', '#FF69B4', '#87CEEB', '#98FB98']
      });

      // Right side confetti
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#FFD700', '#FFA500', '#FF69B4', '#87CEEB', '#98FB98']
      });
    }, 250);

    // Star burst effect
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FFA500', '#FFFF00'],
        shapes: ['star'],
        scalar: 1.2,
        zIndex: 9999
      });
    }, 500);

    // Auto close after animation
    const autoCloseTimer = setTimeout(() => {
      onClose();
    }, 6000);

    return () => {
      clearInterval(interval);
      clearTimeout(autoCloseTimer);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <Card className="relative max-w-lg mx-4 p-8 text-center space-y-6 animate-scale-in bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50 border-4 border-yellow-400 shadow-2xl">
        {/* Decorative elements */}
        <div className="absolute -top-4 -left-4 animate-bounce">
          <Trophy className="w-12 h-12 text-yellow-500 fill-yellow-400" />
        </div>
        <div className="absolute -top-4 -right-4 animate-bounce delay-100">
          <Star className="w-12 h-12 text-orange-500 fill-orange-400" />
        </div>
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 animate-bounce delay-200">
          <Sparkles className="w-10 h-10 text-pink-500 fill-pink-400" />
        </div>

        {/* Main content */}
        <div className="space-y-4 pt-4">
          <div className="flex justify-center items-center gap-2">
            <Trophy className="w-16 h-16 text-yellow-600 fill-yellow-500 animate-pulse" />
          </div>
          
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 via-orange-600 to-pink-600 font-playfair animate-fade-in">
            🎉 Congratulations! 🎉
          </h1>
          
          <div className="space-y-2">
            <p className="text-2xl font-bold text-orange-700 animate-fade-in delay-100">
              You Are Now a Superhost!
            </p>
            <p className="text-lg text-gray-700 animate-fade-in delay-200">
              You've been recognized for your exceptional hosting and outstanding service.
            </p>
            <p className="text-base text-gray-600 animate-fade-in delay-300">
              Welcome to the exclusive Superhost community! ⭐
            </p>
          </div>

          {/* Animated badges */}
          <div className="flex justify-center gap-4 pt-4 animate-fade-in delay-400">
            <div className="flex flex-col items-center space-y-1">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center animate-pulse">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <span className="text-xs font-semibold text-gray-700">Elite Status</span>
            </div>
            <div className="flex flex-col items-center space-y-1">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center animate-pulse delay-100">
                <Star className="w-8 h-8 text-white fill-white" />
              </div>
              <span className="text-xs font-semibold text-gray-700">Top Rated</span>
            </div>
            <div className="flex flex-col items-center space-y-1">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center animate-pulse delay-200">
                <Sparkles className="w-8 h-8 text-white fill-white" />
              </div>
              <span className="text-xs font-semibold text-gray-700">Verified</span>
            </div>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="mt-6 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold rounded-full hover:from-yellow-600 hover:to-orange-600 transition-all transform hover:scale-105 shadow-lg"
        >
          Awesome! Let's Celebrate 🎊
        </button>
      </Card>
    </div>
  );
};