"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Save, RotateCcw, Trash2, Check } from "lucide-react";
import { toast } from "react-toastify";
import { GameStorage } from "@/lib/storage";
import { describeTables, pluralize } from "@/lib/format";
import { GameSettings } from "@/types";
import PageHeader from "@/components/PageHeader";
import PageLoader from "@/components/PageLoader";
import { tableColor } from "@/components/TableSticker";

const AVAILABLE_TABLES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const QUESTION_OPTIONS = [5, 10, 15, 20, 25, 30];

/**
 * Settings page (« Réglages »): number of questions per session and the
 * tables to practise. Changes are kept in the page until the child presses
 * « Enregistrer », which writes them to localStorage.
 */
export default function ConfigPage() {
  const [settings, setSettings] = useState<GameSettings>({
    numberOfQuestions: 10,
    selectedTables: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const currentSettings = GameStorage.getSettings();
    setSettings(currentSettings);
    setIsLoaded(true);
  }, []);

  const handleTableToggle = (table: number) => {
    const newSelectedTables = settings.selectedTables.includes(table)
      ? settings.selectedTables.filter((t) => t !== table)
      : [...settings.selectedTables, table].sort((a, b) => a - b);

    if (newSelectedTables.length === 0) {
      toast.error("Tu dois sélectionner au moins une table !");
      return;
    }

    setSettings((prev) => ({
      ...prev,
      selectedTables: newSelectedTables,
    }));
    setHasChanges(true);
  };

  const handleQuestionCountChange = (count: number) => {
    setSettings((prev) => ({
      ...prev,
      numberOfQuestions: count,
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    GameStorage.saveSettings(settings);
    setHasChanges(false);
    toast.success("Réglages enregistrés !");
  };

  const handleReset = () => {
    const defaultSettings = {
      numberOfQuestions: 10,
      selectedTables: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    };
    setSettings(defaultSettings);
    setHasChanges(true);
    toast.info("Réglages réinitialisés : pense à enregistrer.");
  };

  const handleClearHistory = () => {
    if (
      window.confirm(
        "Es-tu sûr de vouloir effacer tout l'historique ? Cette action est irréversible."
      )
    ) {
      GameStorage.clearAllData();
      toast.success("Historique effacé !");
      // Reload settings after clearing
      const newSettings = GameStorage.getSettings();
      setSettings(newSettings);
      setHasChanges(false);
    }
  };

  if (!isLoaded) {
    return <PageLoader />;
  }

  const selectedCount = settings.selectedTables.length;

  return (
    <div className="mx-auto w-full max-w-3xl pb-28">
      <PageHeader title="Réglages" />

      <div className="flex flex-col gap-6">
        <section className="card p-5 md:p-6" aria-labelledby="question-count">
          <h2 id="question-count" className="mb-4 font-display text-xl font-extrabold">
            Nombre de questions par session
          </h2>
          <div className="grid grid-cols-3 gap-3 md:grid-cols-6" role="radiogroup" aria-labelledby="question-count">
            {QUESTION_OPTIONS.map((count) => {
              const isSelected = settings.numberOfQuestions === count;
              return (
                <button
                  key={count}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => handleQuestionCountChange(count)}
                  className={`btn text-xl ${isSelected ? "btn-primary" : ""}`}
                >
                  {count}
                </button>
              );
            })}
          </div>
        </section>

        <section className="card p-5 md:p-6" aria-labelledby="tables">
          <h2 id="tables" className="font-display text-xl font-extrabold">
            Tables à réviser
          </h2>
          <p className="mb-5 text-ink-soft" aria-live="polite">
            {selectedCount} {selectedCount > 1 ? "tables sélectionnées" : "table sélectionnée"}
          </p>
          {/* Each table is a sticker: colored and ticked when selected, a dashed outline otherwise. */}
          <div className="grid grid-cols-5 justify-items-center gap-x-2 gap-y-4">
            {AVAILABLE_TABLES.map((table) => {
              const isSelected = settings.selectedTables.includes(table);
              return (
                <button
                  key={table}
                  type="button"
                  aria-pressed={isSelected}
                  aria-label={`Table de ${table}`}
                  onClick={() => handleTableToggle(table)}
                  style={isSelected ? { backgroundColor: tableColor(table) } : undefined}
                  className={`relative grid h-14 w-14 place-items-center rounded-full font-display text-xl font-black transition-transform md:h-16 md:w-16 md:text-2xl ${
                    isSelected
                      ? "animate-pop text-ink shadow-[inset_0_-4px_0_rgb(0_0_0/0.14)]"
                      : "border-[3px] border-dashed border-ink-soft bg-paper text-ink-soft"
                  }`}
                >
                  {table}
                  {isSelected && (
                    <span
                      className="absolute -top-1 -right-1 grid h-6 w-6 place-items-center rounded-full border-2 border-paper bg-ink text-paper"
                      aria-hidden
                    >
                      <Check className="h-3.5 w-3.5" strokeWidth={4} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-[1.375rem] border-[3px] border-dashed border-ink-soft bg-paper p-5 md:p-6" aria-labelledby="preview">
          <h2 id="preview" className="mb-2 font-display text-xl font-extrabold">
            Aperçu de ta session
          </h2>
          <p className="text-lg">
            {pluralize(settings.numberOfQuestions, "question", "questions")} sur{" "}
            {describeTables(settings.selectedTables)}.
          </p>
          <p className="mt-1 text-ink-soft">
            Les questions sont mélangées au hasard entre toutes les tables choisies.
          </p>
        </section>

        <div className="grid gap-4 md:grid-cols-2">
          <button type="button" onClick={handleReset} className="btn">
            <RotateCcw className="h-5 w-5" strokeWidth={2.5} aria-hidden />
            Réinitialiser
          </button>
          <button type="button" onClick={handleClearHistory} className="btn btn-danger">
            <Trash2 className="h-5 w-5" strokeWidth={2.5} aria-hidden />
            Effacer l&apos;historique
          </button>
        </div>

        <Link
          href="/"
          className="mx-auto font-bold underline decoration-2 underline-offset-4 hover:text-pen"
        >
          Retour à l&apos;accueil
        </Link>
      </div>

      {/* Save bar: appears only with unsaved changes, always within thumb reach. */}
      {hasChanges && (
        <div className="fixed inset-x-0 bottom-0 z-10 border-t-[3px] border-ink bg-paper/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
            <p className="hidden font-bold text-ink-soft sm:block">
              Tes réglages ne sont pas encore enregistrés.
            </p>
            <button
              type="button"
              onClick={handleSave}
              className="btn btn-primary w-full animate-pop sm:w-auto"
            >
              <Save className="h-5 w-5" strokeWidth={2.5} aria-hidden />
              Enregistrer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
