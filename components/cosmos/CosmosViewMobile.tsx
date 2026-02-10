'use client'
import { useEffect, useRef, useState } from 'react'

interface Star {
  post: any
  x: number
  y: number
  size: number
  hue: number
  brightness: number
  pulsePhase: number
}

export default function CosmosViewMobile({ posts, onPostClick }: { posts: any[]; onPostClick: (post: any) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stars, setStars] = useState<Star[]>([])
  const [hoveredStar, setHoveredStar] = useState<Star | null>(null)
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const animationRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    return () => window.removeEventListener('resize', resizeCanvas)
  }, [])

  useEffect(() => {
    if (posts.length === 0) return

    const newStars: Star[] = posts.map((post, i) => {
      const angle = i * 137.5 * (Math.PI / 180)
      const radius = Math.sqrt(i + 1) * 40
      const likesCount = post.likesCount || 0
      const reactionsCount = post.reactionsCount || 0
      const totalEngagement = likesCount + reactionsCount

      return {
        post,
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        size: Math.min(4 + Math.sqrt(totalEngagement) * 3, 40),
        hue: 160 + (totalEngagement * 2) % 60,
        brightness: Math.min(0.4 + totalEngagement * 0.02, 1),
        pulsePhase: Math.random() * Math.PI * 2
      }
    })

    setStars(newStars)
  }, [posts])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let frame = 0

    const draw = () => {
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.save()
      ctx.translate(canvas.width / 2 + offset.x, canvas.height / 2 + offset.y)
      ctx.scale(scale, scale)

      // Draw connections
      ctx.strokeStyle = 'rgba(0, 255, 136, 0.1)'
      ctx.lineWidth = 1
      stars.forEach((star1, i) => {
        stars.slice(i + 1).forEach(star2 => {
          const dx = star2.x - star1.x
          const dy = star2.y - star1.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 200) {
            ctx.globalAlpha = (1 - dist / 200) * 0.3
            ctx.beginPath()
            ctx.moveTo(star1.x, star1.y)
            ctx.lineTo(star2.x, star2.y)
            ctx.stroke()
          }
        })
      })
      ctx.globalAlpha = 1

      // Draw stars
      stars.forEach((star) => {
        const pulse = Math.sin(frame * 0.05 + star.pulsePhase) * 0.2 + 1
        const size = star.size * pulse

        // Glow
        const gradient = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, size * 2)
        gradient.addColorStop(0, `hsla(${star.hue}, 100%, ${star.brightness * 70}%, ${star.brightness})`)
        gradient.addColorStop(0.5, `hsla(${star.hue}, 100%, 50%, ${star.brightness * 0.3})`)
        gradient.addColorStop(1, 'transparent')
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(star.x, star.y, size * 2, 0, Math.PI * 2)
        ctx.fill()

        // Core
        ctx.fillStyle = `hsl(${star.hue}, 100%, ${star.brightness * 80}%)`
        ctx.beginPath()
        ctx.arc(star.x, star.y, size, 0, Math.PI * 2)
        ctx.fill()

        // Hover ring
        if (hoveredStar === star) {
          ctx.strokeStyle = '#00ff88'
          ctx.lineWidth = 3
          ctx.beginPath()
          ctx.arc(star.x, star.y, size + 8, 0, Math.PI * 2)
          ctx.stroke()
        }
      })

      ctx.restore()

      // Tooltip
      if (hoveredStar) {
        const post = hoveredStar.post
        ctx.fillStyle = 'rgba(0, 0, 0, 0.95)'
        ctx.strokeStyle = '#00ff88'
        ctx.lineWidth = 2

        const tooltipWidth = 280
        const tooltipHeight = 120
        const tooltipX = (canvas.width - tooltipWidth) / 2
        const tooltipY = canvas.height - tooltipHeight - 120

        ctx.beginPath()
        ctx.roundRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight, 20)
        ctx.fill()
        ctx.stroke()

        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 18px sans-serif'
        ctx.fillText(`@${post.username}`, tooltipX + 20, tooltipY + 35)

        ctx.font = '14px sans-serif'
        ctx.fillStyle = '#aaaaaa'
        const preview = post.content.substring(0, 60) + (post.content.length > 60 ? '...' : '')
        ctx.fillText(preview, tooltipX + 20, tooltipY + 60)

        ctx.fillStyle = '#00ff88'
        ctx.font = 'bold 16px sans-serif'
        ctx.fillText(`❤️ ${post.likesCount || 0}   ✨ ${post.reactionsCount || 0}`, tooltipX + 20, tooltipY + 90)
      }

      frame++
      animationRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [stars, hoveredStar, scale, offset])

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left - canvas.width / 2 - offset.x) / scale
    const y = (e.clientY - rect.top - canvas.height / 2 - offset.y) / scale

    const clicked = stars.find(star => {
      const dx = x - star.x
      const dy = y - star.y
      return Math.sqrt(dx * dx + dy * dy) < star.size + 10
    })

    if (clicked) {
      onPostClick(clicked.post)
    }
  }

  const handleCanvasMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left - canvas.width / 2 - offset.x) / scale
    const y = (e.clientY - rect.top - canvas.height / 2 - offset.y) / scale

    const hovered = stars.find(star => {
      const dx = x - star.x
      const dy = y - star.y
      return Math.sqrt(dx * dx + dy * dy) < star.size + 10
    })

    setHoveredStar(hovered || null)
  }

  // Pinch zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setScale(prev => Math.max(0.5, Math.min(3, prev * delta)))
  }

  return (
    <div className="fixed inset-0 bg-black">
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMove}
        onWheel={handleWheel}
        className="cursor-pointer touch-none"
      />

      {/* Zoom Controls */}
      <div className="fixed bottom-32 right-4 flex flex-col gap-2 z-50">
        <button
          onClick={() => setScale(prev => Math.min(3, prev * 1.2))}
          className="w-12 h-12 bg-zinc-900/90 backdrop-blur-xl border-2 border-zinc-700 rounded-full flex items-center justify-center text-white font-bold text-xl hover:border-green-400 transition-all active:scale-95"
        >
          +
        </button>
        <button
          onClick={() => setScale(prev => Math.max(0.5, prev * 0.8))}
          className="w-12 h-12 bg-zinc-900/90 backdrop-blur-xl border-2 border-zinc-700 rounded-full flex items-center justify-center text-white font-bold text-xl hover:border-green-400 transition-all active:scale-95"
        >
          −
        </button>
      </div>

      {/* Info */}
      <div className="fixed top-28 left-4 right-4 bg-zinc-900/80 backdrop-blur-xl border border-zinc-700 rounded-2xl p-4 text-center">
        <div className="text-sm text-gray-300 mb-1">🌌 Cosmos Mode</div>
   
cd ~/centxt-nextjs

# ============================================================
# 4. BOTTOM NAVIGATION ULTRA-SMOOTH
# ============================================================

cat > components/ui/BottomNav.tsx << 'EOF'
'use client'

type View = 'cosmos' | 'feed' | 'create' | 'profile'

interface Props {
  activeView: View
  onViewChange: (view: View) => void
  onCreateClick: () => void
}

export default function BottomNav({ activeView, onViewChange, onCreateClick }: Props) {
  const navItems = [
    { id: 'feed' as View, icon: '🏠', label: 'Feed' },
    { id: 'cosmos' as View, icon: '🌌', label: 'Cosmos' },
    { id: 'create' as View, icon: '✨', label: 'Create', isSpecial: true },
    { id: 'profile' as View, icon: '👤', label: 'Profile' },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
      <div className="bg-black/95 backdrop-blur-2xl border-t border-zinc-800">
        <div className="max-w-lg mx-auto px-4 py-2 flex items-center justify-around">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => item.id === 'create' ? onCreateClick() : onViewChange(item.id)}
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
