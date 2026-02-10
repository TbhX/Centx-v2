'use client'
import { useState } from 'react'
import { useUserStore } from '@/store/userStore'
import { requestCashOut } from '@/lib/firebase/services'
import { LIKES_TO_EUR, MIN_CASHOUT_LIKES } from '@/types'

export default function EarningsDashboard({ onClose }: { onClose: () => void }) {
  const { user } = useUserStore()
  const [loading, setLoading] = useState(false)
  const [showWarning, setShowWarning] = useState(false)

  if (!user) return null

  const earningsBalance = user.earningsBalance || 0
  const earningsEur = (earningsBalance / LIKES_TO_EUR).toFixed(2)
  const canCashOut = earningsBalance >= MIN_CASHOUT_LIKES
  const hasCashedOut = user.hasCashedOut || false

  const handleCashOut = async () => {
    if (!canCashOut || loading) return
    if (!showWarning) {
      setShowWarning(true)
      return
    }
    setLoading(true)
    try {
      await requestCashOut(user.uid, user.username)
      alert(`✅ Cash out demandé! ${earningsEur}€ en cours de traitement.\n\n⚠️ ATTENTION: Tous vos futurs gains iront maintenant à CENTxt!`)
      onClose()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/95 backdrop-blur-sm animate-fadeIn">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">💰 Mes Gains</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl transition-all hover:rotate-90 duration-300">×</button>
        </div>
        <div className="bg-gradient-to-br from-green-400/20 to-cyan-400/20 border-2 border-green-400 rounded-2xl p-6 mb-6">
          <div className="text-sm text-gray-300 mb-2">Balance disponible</div>
          <div className="text-5xl font-bold text-white mb-2">{earningsBalance.toFixed(1)} ❤️</div>
          <div className="text-2xl font-bold text-green-400">{earningsEur}€</div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-zinc-800 rounded-xl p-4">
            <div className="text-xs text-gray-400 mb-1">Total gagné</div>
            <div className="text-xl font-bold text-green-400">{(user.totalEarned || 0).toFixed(1)} ❤️</div>
          </div>
          <div className="bg-zinc-800 rounded-xl p-4">
            <div className="text-xs text-gray-400 mb-1">Total retiré</div>
            <div className="text-xl font-bold text-cyan-400">{user.totalCashedOut || 0}€</div>
          </div>
        </div>
        {hasCashedOut && (
          <div className="bg-red-500/20 border border-red-500 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="text-2xl">⚠️</div>
              <div className="flex-1">
                <div className="font-bold text-red-400 mb-1">Mode Retraité</div>
                <div className="text-sm text-gray-300">Vous avez déjà cash out. Tous vos futurs gains vont à CENTxt (100%).</div>
              </div>
            </div>
          </div>
        )}
        {showWarning && !hasCashedOut && (
          <div className="bg-yellow-500/20 border border-yellow-500 rounded-xl p-4 mb-6 animate-pulse">
            <div className="flex items-start gap-3">
              <div className="text-2xl">⚠️</div>
              <div className="flex-1">
                <div className="font-bold text-yellow-400 mb-2">ATTENTION - ACTION DÉFINITIVE!</div>
                <div className="text-sm text-gray-300 space-y-2">
                  <p>• Une fois le cash out effectué, <strong>TOUS vos futurs gains</strong> iront à CENTxt à 100%</p>
                  <p>• Vous ne pourrez <strong>PLUS JAMAIS</strong> retirer de l'argent</p>
                  <p>• Cette action est <strong>IRRÉVERSIBLE</strong></p>
                </div>
              </div>
            </div>
          </div>
        )}
        {!hasCashedOut && (
          <>
            {!canCashOut && (
              <div className="text-center text-gray-400 text-sm mb-4">
                Minimum {MIN_CASHOUT_LIKES} ❤️ ({MIN_CASHOUT_LIKES / LIKES_TO_EUR}€) requis pour retirer
              </div>
            )}
            <button onClick={handleCashOut} disabled={!canCashOut || loading} className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${canCashOut ? showWarning ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' : 'bg-green-400 hover:bg-green-500 text-black' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}>
              {loading ? 'Traitement...' : showWarning ? `⚠️ CONFIRMER LE CASH OUT ${earningsEur}€` : `💸 Retirer ${earningsEur}€`}
            </button>
            {showWarning && (
              <button onClick={() => setShowWarning(false)} className="w-full mt-3 py-3 rounded-xl font-semibold text-gray-400 hover:text-white transition-all">
                Annuler
              </button>
            )}
          </>
        )}
        <div className="mt-6 p-4 bg-zinc-800/50 rounded-xl">
          <div className="text-xs text-gray-400 space-y-2">
            <p>💡 <strong>Comment ça marche?</strong></p>
            <p>• Avant cash out: tu reçois 90% des likes (10% pour CENTxt)</p>
            <p>• Après cash out: 0% pour toi, 100% pour CENTxt</p>
            <p>• Plus tu attends, plus tu gagnes... mais le risque augmente!</p>
          </div>
        </div>
      </div>
    </div>
  )
}
