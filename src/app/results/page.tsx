'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Home, RotateCcw, Check, type LucideIcon, Trophy, Star, Dumbbell, Sprout } from 'lucide-react'
import { GameEngine } from '@/lib/game'
import { pluralize } from '@/lib/format'
import { GameSession, Question } from '@/types'
import GradeCircle from '@/components/GradeCircle'
import PageLoader from '@/components/PageLoader'
import Stamp from '@/components/Stamp'
import TableSticker from '@/components/TableSticker'

/** Performance level stamped next to the grade (same tiers as the encouragement messages). */
function performanceLevel(percentage: number): { label: string; Icon: LucideIcon; tone: 'success' | 'ink' } {
  if (percentage >= 90) return { label: 'Champion', Icon: Trophy, tone: 'success' }
  if (percentage >= 70) return { label: 'Très bien', Icon: Star, tone: 'success' }
  if (percentage >= 50) return { label: 'Pas mal', Icon: Dumbbell, tone: 'ink' }
  return { label: 'Continue', Icon: Sprout, tone: 'ink' }
}

/**
 * Results page: the grade as a teacher would write it, the encouragement
 * message, per-table results and the answers to review. The session arrives
 * in the `session` query parameter (static export: no server to fetch it from).
 */
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
    return <PageLoader />
  }

  const { correct, incorrect, percentage, weakestTable } = GameEngine.calculateScore(session.questions)
  const encouragement = GameEngine.getEncouragementMessage(percentage, weakestTable)
  const level = performanceLevel(percentage)

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

  const mistakes = session.questions.filter(q => !q.isCorrect)

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 pt-2">
      {/* Grade: the page's one big moment (circle drawn, then the stamp lands). */}
      <header className="text-center">
        <h1 className="font-display text-4xl font-black md:text-5xl">Session terminée&nbsp;!</h1>
        <div className="relative mt-6 inline-flex items-center">
          <GradeCircle correct={correct} total={session.questions.length} />
          <Stamp
            tone={level.tone}
            rotate={10}
            className="absolute -right-24 -top-6 h-24 w-24 text-base [animation-delay:0.8s] md:-right-32 md:h-28 md:w-28 md:text-lg"
          >
            <span className="flex flex-col items-center">
              <level.Icon className="h-6 w-6" strokeWidth={2.5} aria-hidden />
              {level.label}
            </span>
          </Stamp>
        </div>
        <p className="mx-auto mt-6 max-w-[34ch] font-hand text-xl leading-relaxed text-balance md:text-2xl">
          {encouragement.message}
        </p>
      </header>

      <dl className="card grid grid-cols-1 divide-y-2 divide-dashed divide-rule-strong px-5 sm:grid-cols-3 sm:divide-x-2 sm:divide-y-0 sm:py-2">
        <div className="flex items-baseline gap-3 py-3 sm:flex-col sm:items-center sm:gap-0">
          <dt className="order-2">{correct >= 2 ? 'bonnes réponses' : 'bonne réponse'}</dt>
          <dd className="order-1 min-w-14 font-display text-4xl font-black text-success">{correct}</dd>
        </div>
        <div className="flex items-baseline gap-3 py-3 sm:flex-col sm:items-center sm:gap-0">
          <dt className="order-2">{incorrect >= 2 ? 'erreurs' : 'erreur'}</dt>
          <dd className="order-1 min-w-14 font-display text-4xl font-black text-pen">{incorrect}</dd>
        </div>
        <div className="flex items-baseline gap-3 py-3 sm:flex-col sm:items-center sm:gap-0">
          <dt className="order-2">par question en moyenne</dt>
          <dd className="order-1 min-w-14 font-display text-4xl font-black">{Math.round(averageTime)} s</dd>
        </div>
      </dl>

      <section aria-labelledby="tables-detail">
        <h2 id="tables-detail" className="mb-3 font-display text-2xl font-extrabold">
          Tes tables
        </h2>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {Object.entries(tableStats)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .map(([table, stats]) => {
              const tableNumber = parseInt(table)
              const isPerfect = stats.correct === stats.total
              const isWeak = tableNumber === weakestTable

              return (
                <li
                  key={table}
                  className={`flex items-center gap-3 rounded-2xl border-[3px] bg-paper p-3 ${
                    isWeak ? 'border-pen' : 'border-ink'
                  }`}
                >
                  <TableSticker table={tableNumber} decorative />
                  <div className="flex-1">
                    <p className="font-display text-lg font-extrabold">Table de {table}</p>
                    <p className={isWeak ? 'font-bold text-pen' : 'text-ink-soft'}>
                      {isWeak ? 'À réviser' : `${Math.round((stats.correct / stats.total) * 100)} % de réussite`}
                    </p>
                  </div>
                  <p className="flex items-center gap-1 font-display text-xl font-black">
                    {isPerfect && <Check className="h-5 w-5 text-success" strokeWidth={3.5} aria-hidden />}
                    {stats.correct}/{stats.total}
                  </p>
                </li>
              )
            })}
        </ul>
      </section>

      {incorrect > 0 && (
        <section className="card p-5" aria-labelledby="mistakes">
          <h2 id="mistakes" className="mb-1 font-display text-2xl font-extrabold">
            Tes erreurs à revoir
          </h2>
          <p className="mb-4 text-ink-soft">
            {pluralize(mistakes.length, 'calcul corrigé', 'calculs corrigés')} au stylo rouge.
          </p>
          <ul className="grid grid-cols-1 gap-x-6 gap-y-3 md:grid-cols-2">
            {mistakes.map((q) => (
              <li key={q.id} className="flex items-baseline gap-3 font-display text-2xl font-black">
                <span>
                  {q.multiplicand} × {q.multiplier} =
                </span>
                {q.userAnswer !== undefined && !Number.isNaN(q.userAnswer) && (
                  <span className="text-ink-soft line-through decoration-pen decoration-[3px]">
                    <span className="sr-only">tu avais répondu </span>
                    {q.userAnswer}
                  </span>
                )}
                <span className="font-hand text-3xl font-normal text-pen">
                  <span className="sr-only">, la bonne réponse est </span>
                  {q.answer}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <nav className="grid grid-cols-1 gap-4 md:grid-cols-2" aria-label="Et maintenant ?">
        <Link href="/game" className="btn btn-primary btn-lg">
          <RotateCcw className="h-6 w-6" strokeWidth={2.75} aria-hidden />
          Rejouer
        </Link>
        <Link href="/" className="btn btn-lg">
          <Home className="h-6 w-6" strokeWidth={2.75} aria-hidden />
          Accueil
        </Link>
      </nav>

      <footer className="text-center text-sm text-ink-soft">
        <p>
          Session du{' '}
          {new Date(session.date).toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
        {session.duration ? <p>Durée : {GameEngine.formatTime(session.duration)}</p> : null}
      </footer>
    </div>
  )
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <ResultsContent />
    </Suspense>
  )
}
