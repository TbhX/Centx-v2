'use client'
import { useState, useEffect } from 'react'
import { useUserStore } from '@/store/userStore'
import { listenToNotifications, markNotificationRead, markAllNotificationsRead } from '@/lib/firebase/services'

export default function Notifications({ onClose }: { onClose: () => void }) {
  const { user } = useUserStore()
  const [notifs, setNotifs] = useState<any[]>([])

  useEffect(() => {
    if (!user) return
    const unsubscribe = listenToNotifications(user.uid, (newNotifs) => setNotifs(newNotifs))
    return () => unsubscribe()
  }, [user])

  const handleMarkAllRead = async () => {
    if (!user) return
    await markAllNotificationsRead(user.uid)
  }

  const handleNotifClick = async (notif: any) => {
    if (!notif.read) await markNotificationRead(notif.id)
  }

  const unreadCount = notifs.filter(n => !n.read).length

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-6 bg-black/95 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 max-w-md w-full mt-20 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Notifications</h2>
            {unreadCount > 0 && <p className="text-sm text-gray-400">{unreadCount} unread</p>}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">×</button>
        </div>

        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="text-sm text-green-400 hover:text-green-300 mb-4">Mark all as read</button>
        )}

        <div className="space-y-2">
          {notifs.length === 0 ? (
            <div className="text-center py-10 text-gray-400">No notifications yet</div>
          ) : (
            notifs.map((notif) => (
              <div key={notif.id} onClick={() => handleNotifClick(notif)} className={`p-4 rounded-xl border cursor-pointer transition-all ${notif.read ? 'bg-zinc-800/50 border-zinc-700' : 'bg-green-400/10 border-green-400/30'}`}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-cyan-400 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {notif.fromUsername[0].toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-semibold">@{notif.fromUsername}</span>
                      {notif.type === 'like' && ' liked your post'}
                      {notif.type === 'follow' && ' started following you'}
                      {notif.type === 'comment' && ' commented on your post'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">just now</p>
                  </div>
                  {!notif.read && <div className="w-2 h-2 bg-green-400 rounded-full"></div>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
