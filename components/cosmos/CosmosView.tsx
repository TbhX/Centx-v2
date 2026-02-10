'use client'
import { useRef, useEffect, useState } from 'react'

export default function CosmosView({ posts }: { posts: any[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hoveredPost, setHoveredPost] = useState<any>(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const stars = posts.map((post, index) => {
      const likes = post.likesCount || 0
      const size = Math.min(4 + Math.sqrt(likes) * 2.5, 35)
      const angle = index * 137.5 * (Math.PI / 180)
      const radius = Math.sqrt(index + 1) * 35
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2

      return {
        post,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        size,
        brightness: Math.min(0.4 + likes * 0.015, 1),
        hue: 160 + (likes * 2) % 60,
        pulse: Math.random() * Math.PI * 2,
      }
    })

    let animationId: number

    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const time = Date.now() * 0.0008

      // Connections
      ctx.strokeStyle = 'rgba(0, 255, 136, 0.04)'
      ctx.lineWidth = 1
      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < Math.min(i + 5, stars.length); j++) {
          const star1 = stars[i]
          const star2 = stars[j]
          const distance = Math.sqrt((star1.x - star2.x) ** 2 + (star1.y - star2.y) ** 2)
          if (distance < 180) {
            ctx.globalAlpha = 1 - (distance / 180)
            ctx.beginPath()
            ctx.moveTo(star1.x, star1.y)
            ctx.lineTo(star2.x, star2.y)
            ctx.stroke()
          }
        }
      }
      ctx.globalAlpha = 1

      // Stars
      stars.forEach((star) => {
        const pulse = Math.sin(time + star.pulse) * 0.3 + 0.7
        const glowSize = star.size * 4

        // Glow
        const gradient = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, glowSize)
        gradient.addColorStop(0, `hsla(${star.hue}, 100%, 70%, ${star.brightness * pulse * 0.4})`)
        gradient.addColorStop(1, 'rgba(0, 255, 136, 0)')
        ctx.fillStyle = gradient
        ctx.fillRect(star.x - glowSize, star.y - glowSize, glowSize * 2, glowSize * 2)

        // Core
        ctx.fillStyle = `hsla(${star.hue}, 100%, 90%, ${star.brightness * pulse})`
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        ctx.fill()

        // Hover effect
        if (hoveredPost?.id === star.post.id) {
          ctx.strokeStyle = 'rgba(0, 255, 136, 0.9)'
          ctx.lineWidth = 3
          ctx.beginPath()
          ctx.arc(star.x, star.y, star.size + 8, 0, Math.PI * 2)
          ctx.stroke()
        }
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      let found = null
      for (const star of stars) {
        const distance = Math.sqrt((x - star.x) ** 2 + (y - star.y) ** 2)
        if (distance < star.size + 8) {
          found = star.post
          setTooltipPos({ x: e.clientX, y: e.clientY })
          break
        }
      }
      setHoveredPost(found)
    }

    canvas.addEventListener('mousemove', handleMouseMove)

    return () => {
      cancelAnimationFrame(animationId)
      canvas.removeEventListener('mousemove', handleMouseMove)
    }
  }, [posts, hoveredPost])

  return (
    <div className="fixed inset-0 bg-black">
      <canvas ref={canvasRef} className="w-full h-full" />
      {hoveredPost && (
        <div
          className="fixed z-50 bg-zinc-900/95 backdrop-blur-xl border border-green-400 rounded-2xl p-4 max-w-xs pointer-events-none"
          style={{ left: tooltipPos.x + 15, top: tooltipPos.y + 15 }}
        >
          <div className="font-semibold text-green-400 mb-1">@{hoveredPost.username}</div>
          <div className="text-sm text-gray-300 mb-2 line-clamp-2">{hoveredPost.content}</div>
          <div className="text-xs text-gray-500">❤️ {hoveredPost.likesCount || 0} likes</div>
        </div>
      )}
    </div>
  )
}
