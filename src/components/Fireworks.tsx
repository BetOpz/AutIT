import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  angle: number;
  speed: number;
}

export const Fireworks = () => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Generate particles
    const colors = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
    const newParticles: Particle[] = [];

    // Create 30 particles
    for (let i = 0; i < 30; i++) {
      newParticles.push({
        id: i,
        x: 50, // Start from center (percentage)
        y: 50,
        color: colors[Math.floor(Math.random() * colors.length)],
        angle: (360 / 30) * i,
        speed: 2 + Math.random() * 2,
      });
    }

    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden bg-black bg-opacity-30">
      {/* Celebration text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-6xl md:text-8xl font-bold text-white animate-bounce drop-shadow-2xl">
          🎉 Great Job! 🎉
        </div>
      </div>

      {/* Particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-3 h-3 rounded-full animate-firework"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            backgroundColor: particle.color,
            '--angle': `${particle.angle}deg`,
            '--speed': `${particle.speed}`,
            animationDuration: '3s',
          } as React.CSSProperties & { '--angle': string; '--speed': string }}
        />
      ))}

      <style>{`
        @keyframes firework {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(
              calc(cos(var(--angle)) * var(--speed) * 150px),
              calc(sin(var(--angle)) * var(--speed) * 150px)
            ) scale(0);
            opacity: 0;
          }
        }

        .animate-firework {
          animation: firework ease-out forwards;
        }
      `}</style>
    </div>
  );
};
