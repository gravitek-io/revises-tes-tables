'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  type LucideIcon,
  TrendingUp,
  TrendingDown,
  MoveRight,
  Trophy,
  Medal,
  Star,
  Target,
  ThumbsUp,
  Dumbbell,
  BadgeCheck,
  Sparkles,
  Footprints,
  Rocket,
  Scale,
  Play,
  Settings,
} from 'lucide-react'
import { GameStorage } from '@/lib/storage'
import { SessionStats } from '@/types'
import PageHeader from '@/components/PageHeader'
import PageLoader from '@/components/PageLoader'
import TableSticker from '@/components/TableSticker'

type Trend = 'up' | 'down' | 'stable'

const TREND_DISPLAY: Record<Trend, { label: string; Icon: LucideIcon; className: string }> = {
  up: { label: 'En hausse', Icon: TrendingUp, className: 'text-success' },
  down: { label: 'En baisse', Icon: TrendingDown, className: 'text-pen' },
  stable: { label: 'Stable', Icon: MoveRight, className: 'text-ink' },
}

/** A "bon point" (the reward card French teachers hand out): icon, color and label. */
interface GoodPoint {
  Icon: LucideIcon
  color: string
  label: string
}

/**
 * Progress page (« Mes progrès »): totals over every session, strongest and
 * weakest tables, the last five sessions and the « bons points » earned.
 */
export default function StatsPage() {
  const [stats, setStats] = useState<SessionStats | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setStats(GameStorage.getStats())
    setIsLoaded(true)
  }, [])

  if (!isLoaded) {
    return <PageLoader />
  }

  if (!stats || stats.totalSessions === 0) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <PageHeader title="Mes progrès" />
        <div className="card mx-auto mt-10 max-w-md px-6 py-10 text-center">
          <div className="mb-6 flex justify-center gap-2" aria-hidden>
            <TableSticker table={2} decorative />
            <TableSticker table={5} decorative />
            <TableSticker table={9} decorative />
          </div>
          <h2 className="mb-2 font-display text-2xl font-extrabold">Pas encore de progrès à afficher</h2>
          <p className="mb-8 text-ink-soft">Joue ta première session : tes progrès apparaîtront ici.</p>
          <Link href="/game" className="btn btn-primary btn-lg w-full">
            <Play className="h-6 w-6 fill-ink" strokeWidth={2.5} aria-hidden />
            Commencer à jouer
          </Link>
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

  let trend: Trend = 'stable'
  if (recentSessions.length >= 3 && previousSessions.length >= 3) {
    const recentAverage = recentSessions.reduce((sum, s) => sum + (s.correctAnswers / s.questions.length), 0) / recentSessions.length
    const previousAverage = previousSessions.reduce((sum, s) => sum + (s.correctAnswers / s.questions.length), 0) / previousSessions.length

    if (recentAverage > previousAverage + 0.1) trend = 'up'
    else if (recentAverage < previousAverage - 0.1) trend = 'down'
  }
  const trendDisplay = TREND_DISPLAY[trend]

  const goodPoints: GoodPoint[] = [
    stats.totalSessions >= 10
      ? { Icon: Trophy, color: 'var(--color-table-3)', label: 'Joueur régulier' }
      : stats.totalSessions >= 5
        ? { Icon: Medal, color: 'var(--color-table-2)', label: 'Bon élève' }
        : { Icon: Star, color: 'var(--color-table-6)', label: 'Débutant' },
    successRate >= 90
      ? { Icon: Target, color: 'var(--color-table-1)', label: 'Expert' }
      : successRate >= 70
        ? { Icon: ThumbsUp, color: 'var(--color-table-4)', label: 'Bon niveau' }
        : { Icon: Dumbbell, color: 'var(--color-table-7)', label: 'En progrès' },
    stats.totalCorrectAnswers >= 100
      ? { Icon: BadgeCheck, color: 'var(--color-table-5)', label: '100 bonnes réponses' }
      : stats.totalCorrectAnswers >= 50
        ? { Icon: Sparkles, color: 'var(--color-table-9)', label: '50 bonnes réponses' }
        : { Icon: Footprints, color: 'var(--color-table-10)', label: 'Premiers pas' },
    trend === 'up'
      ? { Icon: Rocket, color: 'var(--color-table-8)', label: 'En progression' }
      : trend === 'stable'
        ? { Icon: Scale, color: 'var(--color-table-6)', label: 'Stable' }
        : { Icon: TrendingUp, color: 'var(--color-table-2)', label: 'À améliorer' },
  ]

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <PageHeader title="Mes progrès" />

      <dl className="card grid grid-cols-2 px-2 py-2 md:grid-cols-4">
        {[
          { label: stats.totalSessions >= 2 ? 'sessions jouées' : 'session jouée', value: stats.totalSessions, className: '' },
          { label: 'de réussite', value: `${Math.round(successRate)} %`, className: '' },
          { label: stats.totalCorrectAnswers >= 2 ? 'bonnes réponses' : 'bonne réponse', value: stats.totalCorrectAnswers, className: 'text-success' },
        ].map((item) => (
          <div key={item.label} className="flex flex-col items-center px-2 py-4 text-center">
            <dt className="order-2 text-ink-soft">{item.label}</dt>
            <dd className={`order-1 font-display text-4xl font-black ${item.className}`}>{item.value}</dd>
          </div>
        ))}
        <div className="flex flex-col items-center px-2 py-4 text-center">
          <dt className="order-2 text-ink-soft">tendance</dt>
          <dd className={`order-1 flex items-center gap-1.5 font-display text-2xl font-black md:min-h-10 ${trendDisplay.className}`}>
            <trendDisplay.Icon className="h-7 w-7" strokeWidth={3} aria-hidden />
            {trendDisplay.label}
          </dd>
        </div>
      </dl>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="card p-5" aria-labelledby="tables-performance">
          <h2 id="tables-performance" className="mb-4 font-display text-xl font-extrabold">
            Tes tables
          </h2>
          <ul className="flex flex-col divide-y-2 divide-dashed divide-rule-strong">
            {stats.strongestTable && (
              <li className="flex items-center gap-3 py-3">
                <TableSticker table={stats.strongestTable} decorative />
                <span className="flex-1">Ta table la plus forte</span>
                <span className="font-display text-xl font-black text-success">× {stats.strongestTable}</span>
              </li>
            )}
            {stats.weakestTable && (
              <li className="flex items-center gap-3 py-3">
                <TableSticker table={stats.weakestTable} decorative />
                <span className="flex-1">Ta table à réviser</span>
                <span className="font-display text-xl font-black text-pen">× {stats.weakestTable}</span>
              </li>
            )}
            <li className="flex items-center gap-3 py-3">
              <span className="flex-1">Questions par session, en moyenne</span>
              <span className="font-display text-xl font-black">{Math.round(averageQuestionsPerSession)}</span>
            </li>
          </ul>
        </section>

        <section className="card p-5" aria-labelledby="recent-sessions">
          <h2 id="recent-sessions" className="mb-4 font-display text-xl font-extrabold">
            Tes dernières sessions
          </h2>
          <ol className="flex flex-col divide-y-2 divide-dashed divide-rule-strong">
            {recentSessions.map((session, index) => {
              const rate = session.correctAnswers / session.questions.length
              const gradeColor = rate >= 0.8 ? 'text-success' : rate >= 0.6 ? 'text-ink' : 'text-pen'
              return (
                <li key={session.id} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <p className="font-bold">Session n° {stats.totalSessions - index}</p>
                    <p className="text-sm text-ink-soft">
                      {new Date(session.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                  </div>
                  <p className={`font-hand text-2xl ${gradeColor}`}>
                    {session.correctAnswers}/{session.questions.length}
                  </p>
                </li>
              )
            })}
          </ol>
        </section>
      </div>

      <section aria-labelledby="good-points">
        <h2 id="good-points" className="mb-3 font-display text-2xl font-extrabold">
          Tes bons points
        </h2>
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {goodPoints.map(({ Icon, color, label }, index) => (
            <li
              key={label}
              className={`flex flex-col items-center gap-2 rounded-2xl border-[3px] border-ink bg-paper px-3 py-4 text-center ${
                index % 2 === 0 ? '-rotate-1' : 'rotate-1'
              }`}
            >
              <span
                className="grid h-14 w-14 place-items-center rounded-full text-ink shadow-[inset_0_-3px_0_rgb(0_0_0/0.14)]"
                style={{ backgroundColor: color }}
                aria-hidden
              >
                <Icon className="h-7 w-7" strokeWidth={2.5} />
              </span>
              <span className="font-display font-extrabold leading-tight">{label}</span>
            </li>
          ))}
        </ul>
      </section>

      <nav className="grid grid-cols-1 gap-4 md:grid-cols-2" aria-label="Et maintenant ?">
        <Link href="/game" className="btn btn-primary btn-lg">
          <Play className="h-6 w-6 fill-ink" strokeWidth={2.5} aria-hidden />
          Continuer à jouer
        </Link>
        <Link href="/config" className="btn btn-lg">
          <Settings className="h-6 w-6" strokeWidth={2.5} aria-hidden />
          Modifier les réglages
        </Link>
      </nav>
    </div>
  )
}
