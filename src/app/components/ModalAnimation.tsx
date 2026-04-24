import { motion } from 'motion/react';
import { TrendingUp, Box, BarChart3, Users, Zap, DollarSign } from 'lucide-react';

interface ModalAnimationProps {
  type: 'growth' | 'mvp' | 'research' | 'users' | 'wins' | 'funding';
}

export function ModalAnimation({ type }: ModalAnimationProps) {
  switch (type) {
    case 'growth': return <GrowthAnimation />;
    case 'mvp': return <MVPAnimation />;
    case 'research': return <ResearchAnimation />;
    case 'users': return <UsersAnimation />;
    case 'wins': return <WinsAnimation />;
    case 'funding': return <FundingAnimation />;
    default: return <GrowthAnimation />;
  }
}

function GrowthAnimation() {
  const bars = [40, 55, 65, 80, 95];
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative w-full max-w-md h-64">
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-end gap-4 h-48">
          {bars.map((height, index) => (
            <motion.div key={index}
              className="w-14 bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-xl relative shadow-lg"
              initial={{ height: 0 }}
              animate={{ height: `${height * 1.6}px` }}
              transition={{ delay: index * 0.15, duration: 0.8, type: 'spring', stiffness: 100 }}>
              <motion.div className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-bold text-gray-700 whitespace-nowrap bg-white px-1.5 py-0.5 rounded-full shadow-sm"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + index * 0.15 }}>
                +{20 + index * 15}%
              </motion.div>
            </motion.div>
          ))}
        </div>
        <motion.div className="absolute top-6 right-8"
          initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 1, type: 'spring', stiffness: 200 }}>
          <TrendingUp className="w-14 h-14 text-green-500" strokeWidth={2.5} />
        </motion.div>
        {[...Array(8)].map((_, i) => (
          <motion.div key={i} className="absolute w-2 h-2 bg-blue-400 rounded-full"
            style={{ left: `${20 + i * 10}%`, bottom: `${30 + i * 5}%` }}
            animate={{ y: [-10, -30, -10], opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }} />
        ))}
      </div>
    </div>
  );
}

function MVPAnimation() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative">
        <motion.div className="relative w-36 h-36 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-2xl"
          initial={{ scale: 0 }} animate={{ scale: 1, rotateY: [0, 360] }}
          transition={{ scale: { type: 'spring', stiffness: 200, damping: 15 }, rotateY: { duration: 2, ease: 'easeInOut' } }}
          style={{ transformStyle: 'preserve-3d' }}>
          <div className="absolute inset-0 flex items-center justify-center">
            <Box className="w-18 h-18 text-white" strokeWidth={2} style={{ width: 72, height: 72 }} />
          </div>
        </motion.div>
        {[0, 120, 240].map((angle, i) => (
          <motion.div key={i} className="absolute top-1/2 left-1/2 w-12 h-12"
            style={{ transformOrigin: 'center' }}
            animate={{ rotate: [angle, angle + 360] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}>
            <motion.div className="absolute -top-16 -left-6 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center"
              animate={{ scale: [1, 1.2, 1], boxShadow: ['0 4px 12px rgba(59,130,246,0.3)', '0 8px 24px rgba(59,130,246,0.5)', '0 4px 12px rgba(59,130,246,0.3)'] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}>
              <div className="w-3 h-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full" />
            </motion.div>
          </motion.div>
        ))}
        <motion.div className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          MVP
        </motion.div>
      </div>
    </div>
  );
}

function ResearchAnimation() {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      <div className="relative w-96 h-56">
        {[
          { name: 'A', height: 70, color: 'from-blue-400 to-blue-600' },
          { name: 'B', height: 85, color: 'from-purple-400 to-purple-600' },
          { name: 'You', height: 95, color: 'from-green-400 to-green-600' },
          { name: 'C', height: 60, color: 'from-orange-400 to-orange-600' },
          { name: 'D', height: 75, color: 'from-pink-400 to-pink-600' }
        ].map((bar, index) => (
          <motion.div key={index} className="absolute bottom-8" style={{ left: `${index * 18 + 8}%` }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.1 }}>
            <motion.div className={`w-14 bg-gradient-to-t ${bar.color} rounded-t-xl relative shadow-lg`}
              initial={{ height: 0 }} animate={{ height: `${bar.height * 1.4}px` }}
              transition={{ delay: index * 0.15, type: 'spring', stiffness: 100 }}>
              {bar.name === 'You' && (
                <motion.div className="absolute -top-9 left-1/2 -translate-x-1/2"
                  initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1, type: 'spring' }}>
                  <div className="px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded-full whitespace-nowrap">Winner</div>
                </motion.div>
              )}
            </motion.div>
            <div className="text-center mt-2 text-sm font-semibold text-gray-700">{bar.name}</div>
          </motion.div>
        ))}
        <motion.div className="absolute top-4 right-6"
          animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }} transition={{ duration: 3, repeat: Infinity }}>
          <BarChart3 className="w-14 h-14 text-blue-500" strokeWidth={2} />
        </motion.div>
      </div>
    </div>
  );
}

function UsersAnimation() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative w-96 h-64">
        <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl"
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
          <Users className="w-10 h-10 text-white" strokeWidth={2} />
        </motion.div>
        {[
          { x: -130, y: -60, delay: 0.2, text: 'I need this!' },
          { x: 110, y: -60, delay: 0.4, text: 'Love it!' },
          { x: -110, y: 60, delay: 0.6, text: 'Great idea' },
          { x: 110, y: 60, delay: 0.8, text: 'Want more' }
        ].map((bubble, index) => (
          <motion.div key={index}
            className="absolute top-1/2 left-1/2 bg-white rounded-2xl shadow-lg px-3 py-2 text-sm font-semibold text-gray-700 whitespace-nowrap"
            style={{ x: bubble.x - 40, y: bubble.y - 16 }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, y: [bubble.y - 16, bubble.y - 26, bubble.y - 16] }}
            transition={{ scale: { delay: bubble.delay, type: 'spring' }, opacity: { delay: bubble.delay }, y: { duration: 2, repeat: Infinity, delay: bubble.delay } }}>
            {bubble.text}
          </motion.div>
        ))}
        <svg className="absolute inset-0 w-full h-full">
          <defs>
            <linearGradient id="uGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" /><stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
          {[[-60, -20], [60, -20], [-50, 20], [60, 20]].map(([dx, dy], i) => (
            <motion.line key={i} x1="50%" y1="50%"
              x2={`calc(50% + ${dx}px)`} y2={`calc(50% + ${dy * 1.5}px)`}
              stroke="url(#uGrad)" strokeWidth="1.5" strokeDasharray="5,5"
              initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ delay: 0.2 * i }} />
          ))}
        </svg>
      </div>
    </div>
  );
}

function WinsAnimation() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative w-96 h-64">
        {[-80, -40, 0, 40, 80].map((x, index) => (
          <motion.div key={index} className="absolute top-0 left-1/2" style={{ x }}
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: [0, 200, 200], opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: index * 0.2, times: [0, 0.6, 1] }}>
            <Zap className="w-10 h-10 text-yellow-500 fill-yellow-500" strokeWidth={2} />
          </motion.div>
        ))}
        <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.3 }}>
          <motion.div className="w-28 h-28 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl"
            animate={{ boxShadow: ['0 0 20px rgba(251,191,36,0.5)', '0 0 40px rgba(251,191,36,0.8)', '0 0 20px rgba(251,191,36,0.5)'] }}
            transition={{ duration: 2, repeat: Infinity }}>
            <Zap className="w-14 h-14 text-white fill-white" strokeWidth={2} />
          </motion.div>
        </motion.div>
        {[...Array(8)].map((_, i) => {
          const angle = (i * 45) * Math.PI / 180;
          return (
            <motion.div key={i} className="absolute top-1/2 left-1/2 w-3 h-3"
              style={{ x: Math.cos(angle) * 90, y: Math.sin(angle) * 90 }}
              animate={{ scale: [0, 1.5, 1], rotate: [0, 180, 360] }}
              transition={{ duration: 1, delay: 1 + i * 0.06, repeat: Infinity, repeatDelay: 2 }}>
              <div className="w-3 h-3 bg-yellow-400 rounded-sm rotate-45" />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function FundingAnimation() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative w-full h-56 flex items-center justify-around px-8">
        {[
          { label: 'Bootstrap', sub: 'Full Control', color: 'from-green-400 to-green-600', icon: DollarSign, delay: 0.2 },
          { label: 'Angel Round', sub: 'Balanced Growth', color: 'from-blue-400 to-blue-600', icon: TrendingUp, delay: 0.4 },
          { label: 'Venture Capital', sub: 'Rapid Scale', color: 'from-purple-400 to-purple-600', icon: Zap, delay: 0.6 },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div key={i} className="text-center flex flex-col items-center gap-2"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: item.delay }}>
              <motion.div className={`w-20 h-20 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center shadow-xl`}
                animate={{ y: i === 1 ? [0, -8, 0] : [0, -4, 0] }}
                transition={{ duration: 2 + i * 0.3, repeat: Infinity, ease: 'easeInOut' }}>
                <Icon className="w-10 h-10 text-white" strokeWidth={2} />
              </motion.div>
              <div className="text-sm font-bold text-gray-700">{item.label}</div>
              <div className="text-xs text-gray-500">{item.sub}</div>
            </motion.div>
          );
        })}
        <motion.div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-64 h-2 rounded-full bg-gradient-to-r from-green-400 via-blue-500 to-purple-500"
          initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.8, duration: 0.9 }} />
        {[...Array(5)].map((_, i) => (
          <motion.div key={i} className="absolute bottom-8 w-6 h-6 bg-green-400/60 rounded-full flex items-center justify-center"
            style={{ left: `${20 + i * 15}%` }}
            animate={{ y: [-4, -16, -4], opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}>
            <DollarSign className="w-3 h-3 text-white" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
