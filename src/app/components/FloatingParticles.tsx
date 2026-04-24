import { motion } from 'motion/react';
import { Brain, Cpu, Network, Sparkles, Zap, CircuitBoard } from 'lucide-react';

const particleIcons = [Brain, Cpu, Network, Sparkles, Zap, CircuitBoard];

export function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Large floating particles */}
      {[...Array(12)].map((_, i) => {
        const Icon = particleIcons[i % particleIcons.length];
        const randomX = Math.random() * 100;
        const randomY = Math.random() * 100;
        const randomDuration = 15 + Math.random() * 10;
        const randomDelay = Math.random() * 5;
        const randomSize = 20 + Math.random() * 30;

        return (
          <motion.div
            key={`large-${i}`}
            className="absolute"
            style={{
              left: `${randomX}%`,
              top: `${randomY}%`,
            }}
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 0.15, 0.15, 0],
              y: [0, -100, -200],
              x: [0, Math.sin(i) * 50, Math.sin(i) * 100],
              rotate: [0, 180, 360],
              scale: [0.8, 1, 0.8]
            }}
            transition={{
              duration: randomDuration,
              repeat: Infinity,
              delay: randomDelay,
              ease: 'easeInOut'
            }}
          >
            <Icon
              className="text-blue-400"
              size={randomSize}
              strokeWidth={1.5}
            />
          </motion.div>
        );
      })}

      {/* Small neural nodes */}
      {[...Array(30)].map((_, i) => {
        const randomX = Math.random() * 100;
        const randomY = Math.random() * 100;
        const randomDuration = 8 + Math.random() * 8;
        const randomDelay = Math.random() * 3;
        const randomSize = 2 + Math.random() * 4;

        return (
          <motion.div
            key={`small-${i}`}
            className="absolute rounded-full bg-gradient-to-br from-blue-400 to-purple-400"
            style={{
              left: `${randomX}%`,
              top: `${randomY}%`,
              width: randomSize,
              height: randomSize,
            }}
            animate={{
              opacity: [0.2, 0.6, 0.2],
              y: [0, -150],
              scale: [1, 1.5, 1]
            }}
            transition={{
              duration: randomDuration,
              repeat: Infinity,
              delay: randomDelay,
              ease: 'easeInOut'
            }}
          />
        );
      })}

      {/* Neural connection lines */}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        {[...Array(8)].map((_, i) => {
          const x1 = Math.random() * 100;
          const y1 = Math.random() * 100;
          const x2 = Math.random() * 100;
          const y2 = Math.random() * 100;

          return (
            <motion.line
              key={`line-${i}`}
              x1={`${x1}%`}
              y1={`${y1}%`}
              x2={`${x2}%`}
              y2={`${y2}%`}
              stroke="url(#lineGradient)"
              strokeWidth="1"
              strokeDasharray="4,4"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{
                pathLength: [0, 1, 0],
                opacity: [0, 0.3, 0]
              }}
              transition={{
                duration: 6 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: 'linear'
              }}
            />
          );
        })}
      </svg>

      {/* Glowing orbs */}
      {[...Array(5)].map((_, i) => {
        const randomX = 10 + Math.random() * 80;
        const randomY = 10 + Math.random() * 80;
        const randomDuration = 10 + Math.random() * 10;

        return (
          <motion.div
            key={`orb-${i}`}
            className="absolute w-32 h-32 rounded-full blur-3xl"
            style={{
              left: `${randomX}%`,
              top: `${randomY}%`,
              background: i % 2 === 0
                ? 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)'
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.6, 0.3],
              x: [0, Math.sin(i) * 30, 0],
              y: [0, Math.cos(i) * 30, 0]
            }}
            transition={{
              duration: randomDuration,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        );
      })}

      {/* Circuit-like dots pattern */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(15)].map((_, i) => {
          const x = (i % 5) * 25;
          const y = Math.floor(i / 5) * 33;

          return (
            <motion.div
              key={`circuit-${i}`}
              className="absolute w-1 h-1 bg-blue-400 rounded-full"
              style={{
                left: `${x}%`,
                top: `${y}%`
              }}
              animate={{
                opacity: [0.2, 0.8, 0.2],
                scale: [1, 1.5, 1]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
