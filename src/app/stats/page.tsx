'use client'


import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, BarChart3, Calendar, Target, TrendingUp, Award, Clock } from 'lucide-react'
import { GameStorage } from '@/lib/storage'
import { SessionStats } from '@/types'

export default function StatsPage() {
  const [stats, setStats] = useState<SessionStats | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setStats(GameStorage.getStats())
    setIsLoaded(true)
  }, [])

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
      </div>
    )
  }

  if (!stats || stats.totalSessions === 0) {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <Link href="/">
              <button className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-xs rounded-xl text-white transition-all duration-300 transform hover:scale-105">
                <ArrowLeft className="h-6 w-6" />
              </button>
            </Link>
            <h1 className="text-3xl font-bold text-white">Statistiques</h1>
            <div className="w-10" />
          </div>

          <div className="text-center py-20">
            <div className="text-8xl mb-8">📊</div>
            <h2 className="text-2xl font-bold text-white mb-4">Aucune statistique disponible</h2>
            <p className="text-white/80 mb-8">Joue quelques sessions pour voir tes progrès !</p>
            <Link href="/game">
              <button className="bg-linear-to-r/srgb from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105">
                Commencer à jouer
              </button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Calculate additional stats
  const averageQuestionsPerSession = stats.totalQuestions / stats.totalSessions
  const successRate = (stats.totalCorrectAnswers / stats.totalQuestions) * 100

  // Calculate performance trend (compare last 5 vs previous 5 sessions)
  const recentSessions = stats.recentSessions.slice(0, 5)
  const previousSessions = stats.recentSessions.slice(5, 10)
  
  let trend = 'stable'
  if (recentSessions.length >= 3 && previousSessions.length >= 3) {
    const recentAverage = recentSessions.reduce((sum, s) => sum + (s.correctAnswers / s.questions.length), 0) / recentSessions.length
    const previousAverage = previousSessions.reduce((sum, s) => sum + (s.correctAnswers / s.questions.length), 0) / previousSessions.length
    
    if (recentAverage > previousAverage + 0.1) trend = 'up'
    else if (recentAverage < previousAverage - 0.1) trend = 'down'
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/">
            <button className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-xs rounded-xl text-white transition-all duration-300 transform hover:scale-105">
              <ArrowLeft className="h-6 w-6" />
            </button>
          </Link>
          <div className="flex items-center space-x-3">
            <BarChart3 className="h-8 w-8 text-white" />
            <h1 className="text-3xl font-bold text-white">Tes Statistiques</h1>
          </div>
          <div className="w-10" />
        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-500/20 backdrop-blur-xs rounded-xl p-6 text-center bounce-in">
            <Calendar className="h-8 w-8 text-blue-300 mx-auto mb-2" />
            <div className="text-3xl font-bold text-white mb-1">{stats.totalSessions}</div>
            <div className="text-white/80 text-sm">Sessions jouées</div>
          </div>
          
          <div className="bg-green-500/20 backdrop-blur-xs rounded-xl p-6 text-center bounce-in">
            <Target className="h-8 w-8 text-green-300 mx-auto mb-2" />
            <div className="text-3xl font-bold text-white mb-1">{Math.round(successRate)}%</div>
            <div className="text-white/80 text-sm">Taux de réussite</div>
          </div>
          
          <div className="bg-yellow-500/20 backdrop-blur-xs rounded-xl p-6 text-center bounce-in">
            <Award className="h-8 w-8 text-yellow-300 mx-auto mb-2" />
            <div className="text-3xl font-bold text-white mb-1">{stats.totalCorrectAnswers}</div>
            <div className="text-white/80 text-sm">Bonnes réponses</div>
          </div>
          
          <div className="bg-purple-500/20 backdrop-blur-xs rounded-xl p-6 text-center bounce-in">
            <TrendingUp className={`h-8 w-8 mx-auto mb-2 ${
              trend === 'up' ? 'text-green-300' : 
              trend === 'down' ? 'text-red-300' : 
              'text-purple-300'
            }`} />
            <div className="text-3xl font-bold text-white mb-1">
              {trend === 'up' ? '📈' : trend === 'down' ? '📉' : '➡️'}
            </div>
            <div className="text-white/80 text-sm">Tendance</div>
          </div>
        </div>

        {/* Performance Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Tables Performance */}
          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-6 slide-up">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <Target className="h-6 w-6 mr-2" />
              Performance par table
            </h2>
            
            <div className="space-y-3">
              {stats.strongestTable && (
                <div className="flex items-center justify-between p-3 bg-green-500/20 rounded-lg">
                  <span className="text-white font-medium">Table la plus forte</span>
                  <span className="text-green-300 font-bold">× {stats.strongestTable}</span>
                </div>
              )}
              
              {stats.weakestTable && (
                <div className="flex items-center justify-between p-3 bg-red-500/20 rounded-lg">
                  <span className="text-white font-medium">Table à améliorer</span>
                  <span className="text-red-300 font-bold">× {stats.weakestTable}</span>
                </div>
              )}
              
              <div className="flex items-center justify-between p-3 bg-blue-500/20 rounded-lg">
                <span className="text-white font-medium">Questions par session</span>
                <span className="text-blue-300 font-bold">{Math.round(averageQuestionsPerSession)}</span>
              </div>
            </div>
          </div>

          {/* Recent Progress */}
          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-6 slide-up">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <Clock className="h-6 w-6 mr-2" />
              Progrès récents
            </h2>
            
            <div className="space-y-3">
              {stats.recentSessions.slice(0, 5).map((session, index) => (
                <div key={session.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div>
                    <div className="text-white font-medium">
                      Session #{stats.totalSessions - index}
                    </div>
                    <div className="text-white/60 text-xs">
                      {new Date(session.date).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${
                      (session.correctAnswers / session.questions.length) >= 0.8 ? 'text-green-300' :
                      (session.correctAnswers / session.questions.length) >= 0.6 ? 'text-yellow-300' :
                      'text-red-300'
                    }`}>
                      {Math.round((session.correctAnswers / session.questions.length) * 100)}%
                    </div>
                    <div className="text-white/60 text-xs">
                      {session.correctAnswers}/{session.questions.length}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-linear-to-r/srgb from-purple-400/20 to-pink-400/20 backdrop-blur-xs rounded-2xl p-6 mb-8 bounce-in">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center">
            <Award className="h-6 w-6 mr-2" />
            Tes accomplissements
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl mb-2">
                {stats.totalSessions >= 10 ? '🏆' : stats.totalSessions >= 5 ? '🥇' : '🌟'}
              </div>
              <div className="text-white/80 text-sm">
                {stats.totalSessions >= 10 ? 'Joueur régulier' : 
                 stats.totalSessions >= 5 ? 'Bon élève' : 'Débutant'}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl mb-2">
                {successRate >= 90 ? '🎯' : successRate >= 70 ? '🎪' : '💪'}
              </div>
              <div className="text-white/80 text-sm">
                {successRate >= 90 ? 'Expert' : 
                 successRate >= 70 ? 'Bon niveau' : 'En progrès'}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl mb-2">
                {stats.totalCorrectAnswers >= 100 ? '💯' : stats.totalCorrectAnswers >= 50 ? '🌟' : '🎈'}
              </div>
              <div className="text-white/80 text-sm">
                {stats.totalCorrectAnswers >= 100 ? 'Centurion' : 
                 stats.totalCorrectAnswers >= 50 ? 'Cinquantenaire' : 'Débutant'}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl mb-2">
                {trend === 'up' ? '🚀' : trend === 'stable' ? '⚖️' : '📈'}
              </div>
              <div className="text-white/80 text-sm">
                {trend === 'up' ? 'En progression' : 
                 trend === 'stable' ? 'Stable' : 'À améliorer'}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="text-center">
          <Link href="/game">
            <button className="bg-linear-to-r/srgb from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 mr-4">
              Continuer à jouer
            </button>
          </Link>
          
          <Link href="/config">
            <button className="bg-white/10 hover:bg-white/20 backdrop-blur-xs text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105">
              Modifier la configuration
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}