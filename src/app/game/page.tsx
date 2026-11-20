"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Flame, ThumbsUp, Target } from "lucide-react";
import { GameStorage } from "@/lib/storage";
import { GameEngine } from "@/lib/game";
import { Question, GameSession, GameSettings } from "@/types";
import PageHeader from "@/components/PageHeader";
import PageLoader from "@/components/PageLoader";
import Stamp from "@/components/Stamp";
import TableSticker from "@/components/TableSticker";

/** How long the feedback stays on screen before the next question, in ms. */
const FEEDBACK_DELAY_CORRECT = 1500;
const FEEDBACK_DELAY_WRONG = 2500;

/**
 * Game page: one question at a time. A right answer gets the teacher's
 * « Bravo ! » stamp; a wrong one is crossed out in red pen with the right
 * answer written next to it. At the end the session is saved and the child
 * is sent to the results page.
 */
export default function GamePage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [settings, setSettings] = useState<GameSettings | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [sessionStartTime, setSessionStartTime] = useState<number>(0);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const gameSettings = GameStorage.getSettings();
    setSettings(gameSettings);

    const generatedQuestions = GameEngine.generateQuestions(gameSettings);
    setQuestions(generatedQuestions);

    setSessionStartTime(Date.now());
    setQuestionStartTime(Date.now());
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoaded, currentQuestionIndex]);

  const currentQuestion = questions[currentQuestionIndex];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentQuestion || userAnswer.trim() === "" || showFeedback) return;

    const answerTime = Math.round((Date.now() - questionStartTime) / 1000);
    const userNum = parseInt(userAnswer);
    const correct = userNum === currentQuestion.answer;

    // Update question with user response
    const updatedQuestions = [...questions];
    updatedQuestions[currentQuestionIndex] = {
      ...currentQuestion,
      userAnswer: userNum,
      isCorrect: correct,
      timeToAnswer: answerTime,
    };
    setQuestions(updatedQuestions);

    // Show feedback on the question card
    setIsCorrect(correct);
    setShowFeedback(true);
    setStreak((prev) => (correct ? prev + 1 : 0));

    // Move to next question after feedback
    setTimeout(
      () => {
        setShowFeedback(false);

        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex((prev) => prev + 1);
          setUserAnswer("");
          setQuestionStartTime(Date.now());
        } else {
          // Game finished, save session and redirect
          finishGame(updatedQuestions);
        }
      },
      correct ? FEEDBACK_DELAY_CORRECT : FEEDBACK_DELAY_WRONG
    );
  };

  const finishGame = (finalQuestions: Question[]) => {
    if (!settings) return;

    const sessionEndTime = Date.now();
    const { correct, incorrect } = GameEngine.calculateScore(finalQuestions);

    const session: GameSession = {
      id: `session-${sessionEndTime}`,
      date: new Date().toISOString(),
      settings,
      questions: finalQuestions,
      correctAnswers: correct,
      incorrectAnswers: incorrect,
      completedAt: new Date().toISOString(),
      duration: Math.round((sessionEndTime - sessionStartTime) / 1000),
    };

    GameStorage.saveSession(session);

    // Navigate to results with session data
    const sessionData = encodeURIComponent(JSON.stringify(session));
    router.push(`/results?session=${sessionData}`);
  };

  if (!isLoaded || !currentQuestion) {
    return <PageLoader label="Préparation de ta session…" />;
  }

  const answered = questions.slice(0, currentQuestionIndex);
  const correctSoFar = answered.filter((q) => q.isCorrect).length;
  const wrongSoFar = answered.filter((q) => q.isCorrect === false).length;
  const successRate =
    currentQuestionIndex > 0 ? Math.round((correctSoFar / currentQuestionIndex) * 100) : 0;
  const isWrongFeedback = showFeedback && !isCorrect;

  return (
    <div className="mx-auto w-full max-w-xl">
      <PageHeader backLabel="Quitter la session et revenir à l'accueil">
        {streak > 0 && (
          <span key={streak} className="chip animate-pop bg-flame" aria-label={`${streak} bonnes réponses d'affilée`}>
            <Flame className="h-4 w-4 fill-highlight text-pen" strokeWidth={2.5} aria-hidden />
            {streak}
          </span>
        )}
        <span className="chip" aria-label={`Question ${currentQuestionIndex + 1} sur ${questions.length}`}>
          {currentQuestionIndex + 1} / {questions.length}
        </span>
      </PageHeader>

      {/* Progress: one dot per question, green when right, red when wrong. */}
      <ol className="mb-6 flex flex-wrap gap-1.5" aria-label="Progression de la session">
        {questions.map((q, index) => {
          const state =
            index < currentQuestionIndex || (index === currentQuestionIndex && showFeedback)
              ? q.isCorrect
                ? "bg-success border-success"
                : "bg-pen border-pen"
              : index === currentQuestionIndex
                ? "bg-highlight border-ink"
                : "bg-paper border-ink-soft";
          return (
            <li
              key={q.id}
              className={`h-4 w-4 rounded-full border-2 transition-colors ${state}`}
              aria-hidden
            />
          );
        })}
      </ol>

      <section
        className={`card px-5 pt-8 pb-6 text-center md:px-8 ${isWrongFeedback ? "animate-shake" : ""}`}
        aria-labelledby="question"
      >
        {showFeedback && isCorrect && (
          <Stamp className="absolute -top-6 -right-3 md:-right-8">Bravo&nbsp;!</Stamp>
        )}

        <TableSticker table={currentQuestion.multiplicand} size="sm" className="mb-2" />
        <h1
          id="question"
          key={currentQuestion.id}
          className="animate-pop font-display text-7xl leading-none font-black md:text-8xl"
        >
          {currentQuestion.multiplicand} × {currentQuestion.multiplier}
          <span className="sr-only"> égale combien ?</span>
        </h1>

        <form onSubmit={handleSubmit} className="mt-7 flex items-center justify-center gap-3">
          <div className="relative">
            <label htmlFor="answer" className="sr-only">
              Ta réponse
            </label>
            <input
              id="answer"
              ref={inputRef}
              type="number"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="off"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              className={`h-18 w-32 rounded-2xl border-[3px] bg-paper text-center font-display text-5xl font-black outline-none placeholder:text-rule-strong focus:border-focus disabled:opacity-100 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none ${
                showFeedback ? (isCorrect ? "border-success text-success" : "border-pen") : "border-ink"
              }`}
              placeholder="?"
              disabled={showFeedback}
              autoFocus
            />
            {/* Red-pen line crossing out a wrong answer. */}
            {isWrongFeedback && (
              <span
                className="absolute top-1/2 left-3 right-3 h-1.5 origin-left -rotate-6 animate-strike rounded-full bg-pen"
                aria-hidden
              />
            )}
          </div>

          {isWrongFeedback ? (
            <p className="w-32 font-hand text-5xl text-pen" aria-hidden>
              {currentQuestion.answer}
            </p>
          ) : (
            <button
              type="submit"
              disabled={!userAnswer.trim() || showFeedback}
              className="btn btn-primary h-18 w-32 text-xl"
            >
              Valider
            </button>
          )}
        </form>

        {/* Announces the outcome to screen readers. */}
        <p className="sr-only" aria-live="assertive">
          {showFeedback &&
            (isCorrect ? "Bravo, c'est juste !" : `Pas tout à fait : la réponse était ${currentQuestion.answer}.`)}
        </p>

        <p className="mt-5 min-h-6 text-ink-soft">
          {isWrongFeedback ? (
            <>
              Pas grave : retiens bien{" "}
              <strong className="text-ink">
                {currentQuestion.multiplicand} × {currentQuestion.multiplier} = {currentQuestion.answer}
              </strong>
            </>
          ) : (
            <span className="hidden sm:inline">Appuie sur Entrée pour valider ta réponse</span>
          )}
        </p>
      </section>

      <dl className="mt-6 grid grid-cols-3 divide-x-2 divide-dashed divide-rule-strong rounded-[1.375rem] border-[3px] border-ink bg-paper py-3 text-center">
        <div className="flex flex-col">
          <dt className="order-2 text-sm text-ink-soft">Bonnes</dt>
          <dd className="order-1 font-display text-2xl font-black text-success">{correctSoFar}</dd>
        </div>
        <div className="flex flex-col">
          <dt className="order-2 text-sm text-ink-soft">Erreurs</dt>
          <dd className="order-1 font-display text-2xl font-black text-pen">{wrongSoFar}</dd>
        </div>
        <div className="flex flex-col">
          <dt className="order-2 text-sm text-ink-soft">Réussite</dt>
          <dd className="order-1 font-display text-2xl font-black">{successRate} %</dd>
        </div>
      </dl>

      <p className="mt-5 flex items-center justify-center gap-2 font-bold">
        {streak >= 3 && (
          <>
            <Flame className="h-5 w-5 fill-highlight text-pen" aria-hidden />
            {streak} bonnes réponses d&apos;affilée ! Tu es en feu !
          </>
        )}
        {streak < 3 && streak > 0 && (
          <>
            <ThumbsUp className="h-5 w-5 text-success" aria-hidden />
            Continue comme ça !
          </>
        )}
        {streak === 0 && (
          <>
            <Target className="h-5 w-5 text-pen" aria-hidden />
            Concentre-toi bien !
          </>
        )}
      </p>
    </div>
  );
}
