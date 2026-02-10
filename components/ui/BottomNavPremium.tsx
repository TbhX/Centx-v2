'use client'
import { motion } from 'framer-motion'

type AppView = 'cosmos' | 'feed' | 'profile'

interface Props {
  activeView: AppView
  onViewChange: (view: AppView) => void
  onCreateClick: () => void
}

export default function BottomNavPremium({ activeView, onViewChange, onCreateClick }: Props) {
  const navItems = [
    { id: 'feed' as const, icon: '🏠', label: 'Feed' },
    { id: 'cosmos' as const, icon: '🌌', label: 'Cosmos' },
    { id: 'profile' as const, icon: '👤', label: 'Profile' },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
      {/* Glassmorphism Background */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-2xl border-t border-white/10" />
      
      {/* Gradient Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cosmic-primary to-transparent opacity-50" />

      <div className="relative max-w-screen-xl mx-auto px-6 py-3">
        <div className="flex items-center justify-around">
          {navItems.map((item, index) => {
            const isActive = activeView === item.id
            
            // Insert Create button in the middle
            if (index === 1) {
              return (
                <div key="nav-group" className="flex items-center gap-6">
                  <NavButton item={item} isActive={isActive} onClick={() => onViewChange(item.id as AppView)} />
                  
                  {/* Create Button */}
                  <motion.button
                    onClick={onCreateClick}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="relative -mt-8"
                  >
                    <div className="absolute inset-0 bg-gradient-cosmic blur-xl opacity-50" />
                    <div className="relative w-16 h-16 rounded-2xl bg-gradient-cosmic flex items-center justify-center shadow-cosmic">
                      <motion.span
                        animate={{ rotate: [0, 180, 360] }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="text-3xl"
                      >
                        ✨
                      </motion.span>
                    </div>
                  </motion.button>
                </div>
              )
            }
            
            if (index === 1) return null // Skip second item as it's handled above
            
            return <NavButton key={item.id} item={item} isActive={isActive} onClick={() => onViewChange(item.id as AppView)} />
          })}
        </div>
      </div>
    </div>
  )
}

function NavButton({ item, isActive, onClick }: any) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="relative flex flex-col items-center gap-1 py-2 px-6"
    >
      <div className={`relative transition-all duration-300 ${isActive ? 'scale-110' : ''}`}>
        <span className="text-2xl filter drop-shadow-lg">{item.icon}</span>
        {isActive && (
          <motion.div
            layoutId="activeIndicator"
            className="absolute -inset-2 bg-gradient-cosmic opacity-20 rounded-xl blur-sm"
          />
        )}
      </div>
      <span className={`text-xs font-semibold transition-all duration-300 ${
        isActive ? 'text-cosmic-primary' : 'text-white/50'
      }`}>
        {item.label}
      </span>
    </motion.button>
  )
}
