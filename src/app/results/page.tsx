'use client'


import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Home, RotateCcw, Target, TrendingUp, Frown, Smile } from 'lucide-react'
import { GameEngine } from '@/lib/game'
import { GameSession, Question } from '@/types'

function ResultsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [session, setSession] = useState<GameSession | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const sessionData = searchParams.get('session')
    if (sessionData) {
      try {
        const parsedSession = JSON.parse(decodeURIComponent(sessionData))
        setSession(parsedSession)
      } catch (error) {
        console.error('Error parsing session data:', error)
        router.push('/')
        return
      }
    } else {
      router.push('/')
      return
    }
    setIsLoaded(true)
  }, [searchParams, router])

  if (!isLoaded || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
      </div>
    )
  }

  const { correct, incorrect, percentage, weakestTable } = GameEngine.calculateScore(session.questions)
  const encouragement = GameEngine.getEncouragementMessage(percentage, weakestTable)
  
  const averageTime = session.questions.reduce((sum, q) => sum + (q.timeToAnswer || 0), 0) / session.questions.length

  // Group questions by table for detailed analysis
  const tableStats: Record<number, { correct: number; total: number; questions: Question[] }> = {}
  session.questions.forEach(q => {
    if (!tableStats[q.multiplicand]) {
      tableStats[q.multiplicand] = { correct: 0, total: 0, questions: [] }
    }
    tableStats[q.multiplicand].total++
    tableStats[q.multiplicand].questions.push(q)
    if (q.isCorrect) {
      tableStats[q.multiplicand].correct++
    }
  })

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with Encouragement */}
        <div className="text-center mb-8">
          <div className="text-8xl mb-4 bounce-in">
            {encouragement.emoji}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 slide-up">
            Session terminée !
          </h1>
          <div className="bg-gradient-to-r from-purple-400/20 to-pink-400/20 backdrop-blur-sm rounded-2xl p-6 slide-up">
            <p className="text-xl text-white text-balance">
              {encouragement.message}
            </p>
          </div>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-green-500/20 backdrop-blur-sm rounded-xl p-6 text-center bounce-in">
            <div className="text-3xl font-bold text-green-300 mb-2">{correct}</div>
            <div className="text-white/80 text-sm">Bonnes réponses</div>
          </div>
          
          <div className="bg-red-500/20 backdrop-blur-sm rounded-xl p-6 text-center bounce-in">
            <div className="text-3xl font-bold text-red-300 mb-2">{incorrect}</div>
            <div className="text-white/80 text-sm">Erreurs</div>
          </div>
          
          <div className="bg-blue-500/20 backdrop-blur-sm rounded-xl p-6 text-center bounce-in">
            <div className="text-3xl font-bold text-blue-300 mb-2">{percentage}%</div>
            <div className="text-white/80 text-sm">Score</div>
          </div>
          
          <div className="bg-yellow-500/20 backdrop-blur-sm rounded-xl p-6 text-center bounce-in">
            <div className="text-3xl font-bold text-yellow-300 mb-2">{Math.round(averageTime)}s</div>
            <div className="text-white/80 text-sm">Temps moyen</div>
          </div>
        </div>

        {/* Performance Badge */}
        <div className="mb-8 flex justify-center">
          <div className={`px-8 py-4 rounded-2xl font-bold text-xl ${
            percentage >= 90 ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' :
            percentage >= 70 ? 'bg-gradient-to-r from-green-400 to-blue-500 text-white' :
            percentage >= 50 ? 'bg-gradient-to-r from-blue-400 to-purple-500 text-white' :
            'bg-gradient-to-r from-purple-400 to-pink-500 text-white'
          } wiggle`}>
            {percentage >= 90 ? '🏆 Champion' :
             percentage >= 70 ? '⭐ Très bien' :
             percentage >= 50 ? '💪 Pas mal' :
             '🌱 Continue'}
          </div>
        </div>

        {/* Detailed Analysis */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 slide-up">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <TrendingUp className="h-6 w-6 mr-2" />
            Analyse détaillée par table
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(tableStats)
              .sort(([a], [b]) => parseInt(a) - parseInt(b))
              .map(([table, stats]) => {
                const rate = (stats.correct / stats.total) * 100
                const isWeak = parseInt(table) === weakestTable
                
                return (
                  <div key={table} className={`p-4 rounded-xl ${
                    rate >= 80 ? 'bg-green-500/20' :
                    rate >= 60 ? 'bg-yellow-500/20' :
                    'bg-red-500/20'
                  } ${isWeak ? 'ring-2 ring-red-400' : ''}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-white">Table × {table}</h3>
                      {rate >= 80 ? <Smile className="h-5 w-5 text-green-400" /> : 
                       rate < 60 ? <Frown className="h-5 w-5 text-red-400" /> : 
                       <Target className="h-5 w-5 text-yellow-400" />}
                    </div>
                    <div className="text-2xl font-bold text-white mb-1">
                      {stats.correct} / {stats.total}
                    </div>
                    <div className="text-sm text-white/70">
                      {Math.round(rate)}% de réussite
                    </div>
                    {isWeak && (
                      <div className="text-xs text-red-300 mt-2">
                        💡 Table à réviser
                      </div>
                    )}
                  </div>
                )
              })}
          </div>
        </div>

        {/* Quick Review */}
        {incorrect > 0 && (
          <div className="bg-red-500/10 backdrop-blur-sm rounded-2xl p-6 mb-8 slide-up">
            <h3 className="text-xl font-bold text-white mb-4">Révision rapide des erreurs</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {session.questions
                .filter(q => !q.isCorrect)
                .map((q, index) => (
                  <div key={index} className="bg-white/10 rounded-lg p-3 text-center">
                    <span className="text-white font-medium">
                      {q.multiplicand} × {q.multiplier} = {q.answer}
                    </span>
                    {q.userAnswer && (
                      <span className="text-red-300 text-sm block">
                        Tu avais répondu: {q.userAnswer}
                      </span>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Link href="/game">
            <button className="w-full bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2">
              <RotateCcw className="h-6 w-6" />
              <span>Rejouer</span>
            </button>
          </Link>

          <Link href="/">
            <button className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2">
              <Home className="h-6 w-6" />
              <span>Accueil</span>
            </button>
          </Link>
        </div>

        {/* Session Info */}
        <div className="text-center text-white/60 text-sm">
          <p>Session du {new Date(session.date).toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
          {session.duration && (
            <p>Durée: {GameEngine.formatTime(session.duration)}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  )
}