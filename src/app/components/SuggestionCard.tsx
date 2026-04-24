import { motion } from 'motion/react';
import { useState } from 'react';
import type { Suggestion } from './SmartSuggestions';

interface SuggestionCardProps {
  suggestion: Suggestion;
  onClick: () => void;
}

export function SuggestionCard({ suggestion, onClick }: SuggestionCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / 20;
    const y = (e.clientY - rect.top - rect.height / 2) / 20;
    setMousePosition({ x, y });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePosition({ x: 0, y: 0 });
  };

  const Icon = suggestion.icon;

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            type: 'spring',
            stiffness: 100,
            damping: 15
          }
        }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className="cursor-pointer relative"
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1000px'
      }}
    >
      {/* Ripple effect on click */}
      <motion.div
        className="absolute inset-0 rounded-2xl bg-blue-400/20"
        initial={{ scale: 0, opacity: 0.5 }}
        animate={{ scale: 0, opacity: 0 }}
        whileTap={{ scale: 2, opacity: 0 }}
        transition={{ duration: 0.5 }}
      />

      {/* Card */}
      <motion.div
        className="relative p-8 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/40 shadow-lg overflow-hidden"
        animate={{
          rotateX: isHovered ? mousePosition.y : 0,
          rotateY: isHovered ? mousePosition.x : 0,
          scale: isHovered ? 1.02 : 1
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 20
        }}
        style={{
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-blue-400/0 via-purple-400/0 to-blue-400/0 rounded-2xl"
          animate={{
            opacity: isHovered ? 0.15 : 0
          }}
          transition={{ duration: 0.3 }}
        />

        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          initial={{ x: '-100%' }}
          animate={{ x: isHovered ? '100%' : '-100%' }}
          transition={{ duration: 0.6 }}
        />

        {/* Icon container */}
        <motion.div
          className="relative mb-6"
          animate={{
            scale: isHovered ? 1.1 : 1,
            rotateZ: isHovered ? 5 : 0
          }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 10
          }}
        >
          <motion.div
            className="inline-flex p-4 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg"
            animate={{
              boxShadow: isHovered
                ? '0 20px 40px rgba(59, 130, 246, 0.4)'
                : '0 10px 20px rgba(59, 130, 246, 0.2)'
            }}
          >
            <Icon className="w-8 h-8 text-white" strokeWidth={2} />
          </motion.div>

          {/* Icon glow pulse */}
          <motion.div
            className="absolute inset-0 rounded-xl bg-blue-400/30 blur-xl"
            animate={{
              scale: isHovered ? [1, 1.2, 1] : 1,
              opacity: isHovered ? [0.3, 0.5, 0.3] : 0
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        </motion.div>

        {/* Content */}
        <div className="relative z-10">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            {suggestion.title}
          </h3>
          <p className="text-gray-600 leading-relaxed">
            {suggestion.description}
          </p>
        </div>

        {/* Corner accent */}
        <motion.div
          className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-transparent rounded-bl-full"
          animate={{
            scale: isHovered ? 1.2 : 1,
            opacity: isHovered ? 1 : 0.5
          }}
        />

        {/* Bottom shine */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>
    </motion.div>
  );
}
