"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Play, Settings, TrendingUp, Building2, Mail, PartyPopper, FileText } from "lucide-react";
import { GameStorage } from "@/lib/storage";
import { describeTables, pluralize } from "@/lib/format";
import { GameSettings, SessionStats } from "@/types";
import PageLoader from "@/components/PageLoader";
import TableSticker from "@/components/TableSticker";

/**
 * Home page: the main call to action (start a session), a reminder of the
 * current settings, links to settings and progress, and a summary of past
 * sessions once the child has played.
 */
export default function HomePage() {
  const [settings, setSettings] = useState<GameSettings | null>(null);
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setSettings(GameStorage.getSettings());
    setStats(GameStorage.getStats());
    setIsLoaded(true);
  }, []);

  if (!isLoaded) {
    return <PageLoader />;
  }

  const hasPlayed = Boolean(stats && stats.totalSessions > 0);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6 pt-4 md:pt-12">
      <header>
        {/* « 7 × 8 » spelled with stickers: the app's signature in one glance. */}
        <div className="mb-4 flex gap-1.5" aria-hidden>
          <TableSticker table={7} size="sm" decorative />
          <span className="inline-grid h-8 w-8 place-items-center rounded-full bg-highlight font-display font-black">
            ×
          </span>
          <TableSticker table={8} size="sm" decorative />
        </div>
        <h1 className="font-display text-4xl leading-[1.05] font-black text-balance sm:text-5xl md:text-6xl">
          Révise tes tables de multiplication&nbsp;!
        </h1>
        {settings && (
          <p className="mt-4 text-lg text-ink-soft">
            {pluralize(settings.numberOfQuestions, "question", "questions")} sur{" "}
            {describeTables(settings.selectedTables)}.
          </p>
        )}
      </header>

      <nav className="flex flex-col gap-4" aria-label="Actions principales">
        <Link href="/game" className="btn btn-primary btn-lg">
          <Play className="h-7 w-7 fill-ink" strokeWidth={2.5} aria-hidden />
          Commencer à jouer
        </Link>
        <div className="grid grid-cols-2 gap-3">
          <Link href="/config" className="btn">
            <Settings className="h-5 w-5 shrink-0" strokeWidth={2.5} aria-hidden />
            Réglages
          </Link>
          <Link href="/stats" className="btn">
            <TrendingUp className="h-5 w-5 shrink-0" strokeWidth={2.5} aria-hidden />
            Mes progrès
          </Link>
        </div>
      </nav>

      {hasPlayed && stats ? (
        <section className="card mt-4 p-5" aria-labelledby="recent-progress">
          {/* A strip of tape holding the sheet on the notebook. */}
          <span
            className="absolute -top-3.5 left-1/2 h-6 w-24 -translate-x-1/2 -rotate-3 rounded-sm bg-highlight/80"
            aria-hidden
          />
          <h2 id="recent-progress" className="mb-4 font-display text-xl font-extrabold">
            Tes derniers progrès
          </h2>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-4">
            <div className="flex flex-col-reverse">
              <dt className="text-ink-soft">{stats.totalSessions >= 2 ? "sessions" : "session"}</dt>
              <dd className="font-display text-3xl font-black">{stats.totalSessions}</dd>
            </div>
            <div className="flex flex-col-reverse">
              <dt className="text-ink-soft">de réussite en moyenne</dt>
              <dd className="font-display text-3xl font-black">
                {Math.round(stats.averageScore)} %
              </dd>
            </div>
            <div className="flex flex-col-reverse">
              <dt className="text-ink-soft">
                {stats.totalCorrectAnswers >= 2 ? "bonnes réponses" : "bonne réponse"}
              </dt>
              <dd className="font-display text-3xl font-black text-success">
                {stats.totalCorrectAnswers}
              </dd>
            </div>
            {stats.strongestTable && (
              <div className="flex items-center gap-3">
                <dt className="order-2 leading-snug text-ink-soft">ta table la plus forte</dt>
                <dd className="order-1">
                  <TableSticker table={stats.strongestTable} />
                </dd>
              </div>
            )}
          </dl>
        </section>
      ) : (
        <section className="card mt-2 flex gap-4 p-5" aria-labelledby="first-visit">
          <PartyPopper className="h-8 w-8 shrink-0 text-pen" strokeWidth={2.25} aria-hidden />
          <div>
            <h2 id="first-visit" className="font-display text-xl font-extrabold">
              Première visite&nbsp;?
            </h2>
            <p className="mt-1 text-ink-soft">
              Choisis tes tables dans les réglages, puis lance ta première session !
            </p>
          </div>
        </section>
      )}

      {hasPlayed && (
        <p className="text-center font-hand text-lg text-ink-soft">
          Bon retour ! Prêt pour une nouvelle session ?
        </p>
      )}

      <footer className="mt-10 border-t-2 border-dashed border-rule-strong pt-6 text-center">
        <p className="font-display font-extrabold">Application développée par Gravitek</p>
        <p className="mt-1 text-sm text-ink-soft">
          Outil éducatif gratuit et open source pour apprendre les mathématiques
        </p>
        <div className="mt-4 flex flex-col items-center justify-center gap-3 text-sm font-bold sm:flex-row sm:gap-6">
          <a
            href="https://gravitek.io"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 underline decoration-2 underline-offset-4 hover:text-pen"
          >
            <Building2 className="h-4 w-4" aria-hidden />
            Découvrir Gravitek
          </a>
          <a
            href="mailto:hello@gravitek.io"
            className="inline-flex items-center gap-1.5 underline decoration-2 underline-offset-4 hover:text-pen"
          >
            <Mail className="h-4 w-4" aria-hidden />
            Nous contacter
          </a>
          <Link
            href="/mentions-legales"
            className="inline-flex items-center gap-1.5 underline decoration-2 underline-offset-4 hover:text-pen"
          >
            <FileText className="h-4 w-4" aria-hidden />
            Mentions légales
          </Link>
        </div>
      </footer>
    </div>
  );
}
