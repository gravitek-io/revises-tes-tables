"use client";


import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Zap } from "lucide-react";
import { toast } from "react-toastify";
import { GameStorage } from "@/lib/storage";
import { GameEngine } from "@/lib/game";
import { Question, GameSession, GameSettings } from "@/types";

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
  const progress =
    questions.length > 0
      ? ((currentQuestionIndex + 1) / questions.length) * 100
      : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentQuestion || userAnswer.trim() === "") return;

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

    // Show feedback
    setIsCorrect(correct);
    setShowFeedback(true);

    // Update streak
    if (correct) {
      setStreak((prev) => prev + 1);
      toast.success("Bravo ! 🎉", {
        autoClose: 1000,
        hideProgressBar: true,
      });
    } else {
      setStreak(0);
      toast.error(`Oups! La réponse était ${currentQuestion.answer}`, {
        autoClose: 2000,
      });
    }

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
      correct ? 1500 : 2500
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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mx-auto mb-4"></div>
          <p className="text-white/80">Préparation de ta session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/">
            <button className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl text-white transition-all duration-300 transform hover:scale-105">
              <ArrowLeft className="h-6 w-6" />
            </button>
          </Link>

          <div className="flex items-center space-x-4 text-white">
            {streak > 0 && (
              <div className="bg-gradient-to-r from-orange-400 to-red-500 px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
                <Zap className="h-4 w-4" />
                <span>{streak}</span>
              </div>
            )}
            <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl font-semibold">
              {currentQuestionIndex + 1} / {questions.length}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="bg-white/10 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-green-400 to-blue-500 h-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 mb-8 text-center relative overflow-hidden">
          {showFeedback && (
            <div
              className={`absolute inset-0 flex items-end justify-center ${
                isCorrect ? "bg-green-500/90" : "bg-red-500/90"
              } backdrop-blur-sm transition-all duration-300`}
            >
              <div className="text-center">
                {isCorrect ? (
                  <>
                    <p className="text-2xl font-bold text-white">Excellent !</p>
                  </>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-white">
                      La réponse était {currentQuestion.answer}
                    </p>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="text-6xl md:text-7xl font-bold text-white mb-8 bounce-in">
            {currentQuestion.multiplicand} × {currentQuestion.multiplier} = ?
          </div>

          <form onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="number"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              className="w-32 h-16 text-3xl text-center bg-white/20 backdrop-blur-sm border-2 border-white/30 focus:border-white/60 rounded-xl text-white placeholder-white/50 outline-none transition-all duration-300"
              placeholder="?"
              disabled={showFeedback}
              autoFocus
            />

            <button
              type="submit"
              disabled={!userAnswer.trim() || showFeedback}
              className="ml-4 bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
            >
              Valider
            </button>
          </form>

          <div className="mt-6 text-white/60 text-sm">
            Appuies sur Entrée pour valider ta réponse
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="text-green-300 text-2xl font-bold">
              {
                questions
                  .slice(0, currentQuestionIndex)
                  .filter((q) => q.isCorrect).length
              }
            </div>
            <div className="text-white/70 text-sm">Bonnes</div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="text-red-300 text-2xl font-bold">
              {
                questions
                  .slice(0, currentQuestionIndex)
                  .filter((q) => q.isCorrect === false).length
              }
            </div>
            <div className="text-white/70 text-sm">Mauvaises</div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="text-blue-300 text-2xl font-bold">
              {currentQuestionIndex > 0
                ? Math.round(
                    (questions
                      .slice(0, currentQuestionIndex)
                      .filter((q) => q.isCorrect).length /
                      currentQuestionIndex) *
                      100
                  )
                : 0}
              %
            </div>
            <div className="text-white/70 text-sm">Réussite</div>
          </div>
        </div>

        {/* Encouragement */}
        <div className="mt-6 text-center">
          <p className="text-white/80 text-sm">
            {streak >= 3 &&
              `🔥 ${streak} bonnes réponses d'affilée ! Tu es en feu !`}
            {streak < 3 && streak > 0 && `Continues comme ça ! 💪`}
            {streak === 0 && `Concentres-toi bien ! 🎯`}
          </p>
        </div>
      </div>
    </div>
  );
}
