'use client'
import { useState } from 'react'
import { useUserStore } from '@/store/userStore'

export default function Stories() {
  const { user } = useUserStore()
  const [showCreate, setShowCreate] = useState(false)

  const stories = [
    { id: 1, username: 'You', hasStory: false, isUser: true },
    { id: 2, username: 'Realzen', hasStory: true },
    { id: 3, username: 'Oui', hasStory: true },
    { id: 4, username: 'Tamsir', hasStory: true },
  ]

  return (
    <div className="flex gap-3 overflow-x-auto px-4 py-3 hide-scrollbar">
      {stories.map((story) => (
        <button
          key={story.id}
          onClick={() => story.isUser ? setShowCreate(true) : null}
          className="flex-shrink-0 flex flex-col items-center gap-2 group"
        >
          <div className={`relative ${story.hasStory ? 'p-[3px] bg-gradient-to-tr from-green-400 via-cyan-400 to-purple-400 rounded-full' : ''}`}>
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-cyan-400 flex items-center justify-center text-xl font-bold group-hover:scale-110 transition-all">
              {story.username[0].toUpperCase()}
            </div>
            {story.isUser && (
              <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-400 rounded-full border-2 border-black flex items-center justify-center text-xs font-bold">
                +
              </div>
            )}
          </div>
          <span className="text-xs text-gray-300 font-medium">{story.isUser ? 'Toi' : story.username}</span>
        </button>
      ))}
    </div>
  )
}
