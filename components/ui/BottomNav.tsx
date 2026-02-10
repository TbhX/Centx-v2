'use client'

type AppView = 'cosmos' | 'feed' | 'profile'

interface Props {
  activeView: AppView
  onViewChange: (view: AppView) => void
  onCreateClick: () => void
}

export default function BottomNav({ activeView, onViewChange, onCreateClick }: Props) {
  const navItems = [
    { id: 'feed' as const, icon: '🏠', label: 'Feed', isSpecial: false },
    { id: 'cosmos' as const, icon: '🌌', label: 'Cosmos', isSpecial: false },
    { id: 'create' as const, icon: '✨', label: 'Create', isSpecial: true },
    { id: 'profile' as const, icon: '👤', label: 'Profile', isSpecial: false },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
      <div className="bg-black/95 backdrop-blur-2xl border-t border-zinc-800">
        <div className="max-w-lg mx-auto px-4 py-2 flex items-center justify-around">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => item.isSpecial ? onCreateClick() : onViewChange(item.id as AppView)}
              className={`relative flex flex-col items-center gap-1 py-2 px-4 rounded-2xl transition-all active:scale-95 ${
                item.isSpecial
                  ? 'bg-gradient-to-r from-green-400 to-cyan-400 -mt-8 shadow-2xl shadow-green-400/50'
                  : activeView === item.id
                  ? 'bg-zinc-800'
                  : 'hover:bg-zinc-900'
              }`}
            >
              <span className={`text-2xl ${item.isSpecial ? 'animate-bounce-slow' : ''}`}>
                {item.icon}
              </span>
              <span className={`text-xs font-semibold ${
                item.isSpecial 
                  ? 'text-black' 
                  : activeView === item.id 
                  ? 'text-green-400' 
                  : 'text-gray-500'
              }`}>
                {item.label}
              </span>
              
              {activeView === item.id && !item.isSpecial && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-green-400 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
