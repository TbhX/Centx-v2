'use client'
import { useEffect, useState } from 'react'

export default function Toast({ message, type = 'success', onClose }: { message: string; type?: 'success' | 'error'; onClose: () => void }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    setShow(true)
    const timer = setTimeout(() => {
      setShow(false)
      setTimeout(onClose, 300)
    }, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      <div className={`px-6 py-3 rounded-full font-semibold shadow-2xl ${type === 'success' ? 'bg-green-400 text-black' : 'bg-red-500 text-white'}`}>
        {message}
      </div>
    </div>
  )
}
