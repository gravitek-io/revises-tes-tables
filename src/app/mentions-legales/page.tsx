import type { Metadata } from "next";
import type { ReactNode } from "react";
import { type LucideIcon, MapPin, ChartColumn, ShieldCheck } from "lucide-react";
import PageHeader from "@/components/PageHeader";

/**
 * Legal notices (« mentions légales », required by French law, LCEN art. 6):
 * publisher, host, audience measurement and personal data.
 *
 * A server component on purpose: the content is static, needs no localStorage,
 * and is fully rendered in the static export. Publisher details mirror the
 * legal notices of gravitek.io; keep both in sync when the company changes.
 */

export const metadata: Metadata = {
  title: "Mentions légales",
  description:
    "Éditeur, hébergement en France, mesure d'audience sans cookie et absence de collecte de données personnelles.",
  alternates: { canonical: "/mentions-legales" },
};

/** Date shown to readers; update it whenever the content below changes. */
const LAST_UPDATED = "26 novembre 2026";

/** The three commitments summed up at the top of the page. */
const COMMITMENTS: { Icon: LucideIcon; title: string; text: string }[] = [
  {
    Icon: MapPin,
    title: "Hébergée en France",
    text: "L'application et ses statistiques sont hébergées sur des serveurs situés en France.",
  },
  {
    Icon: ChartColumn,
    title: "Statistiques avec Umami",
    text: "Une mesure d'audience anonyme, sans cookie.",
  },
  {
    Icon: ShieldCheck,
    title: "Aucune donnée personnelle",
    text: "Rien n'est collecté ni conservé sur l'enfant ou sa famille.",
  },
];

/** One titled block of the notice. */
function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="font-display text-2xl font-extrabold">{title}</h2>
      {children}
    </section>
  );
}

const linkClassName = "font-bold underline decoration-2 underline-offset-4 hover:text-pen";

export default function LegalNoticePage() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <PageHeader title="Mentions légales" />

      <div className="flex flex-col gap-8 text-lg leading-relaxed">
        <ul className="card flex flex-col gap-4 p-5" aria-label="En bref">
          {COMMITMENTS.map(({ Icon, title, text }) => (
            <li key={title} className="flex gap-4">
              <Icon className="mt-1 h-7 w-7 shrink-0 text-pen" strokeWidth={2.25} aria-hidden />
              <div>
                <p className="font-display text-xl font-extrabold">{title}</p>
                <p className="text-ink-soft">{text}</p>
              </div>
            </li>
          ))}
        </ul>

        <Section title="Éditeur">
          <p>
            L&apos;application « Révise tes tables » est éditée par Gravitek, SASU au capital
            de 500&nbsp;€, immatriculée au RCS de Marseille sous le n°&nbsp;SIREN&nbsp;932&nbsp;137&nbsp;482,
            TVA intracommunautaire FR40932137482.
          </p>
          <p>Siège social&nbsp;: 8 avenue Gabriel Roquelaure, 13011 Marseille, France.</p>
          <p>Directeur de la publication&nbsp;: Thomas Perelle.</p>
          <p>
            Contact&nbsp;:{" "}
            <a href="mailto:contact@gravitek.io" className={linkClassName}>
              contact@gravitek.io
            </a>
          </p>
        </Section>

        <Section title="Hébergement">
          <p>
            L&apos;application est hébergée en France, dans la région de Paris, par Scaleway SAS,
            8 rue de la Ville l&apos;Évêque, 75008 Paris, France (
            <a
              href="https://www.scaleway.com/"
              target="_blank"
              rel="noopener noreferrer"
              className={linkClassName}
            >
              scaleway.com
            </a>
            ).
          </p>
        </Section>

        <Section title="Mesure d'audience">
          <p>
            Pour savoir combien de personnes utilisent l&apos;application et comment l&apos;améliorer,
            nous utilisons{" "}
            <a
              href="https://umami.is"
              target="_blank"
              rel="noopener noreferrer"
              className={linkClassName}
            >
              Umami
            </a>
            , un outil de statistiques respectueux de la vie privée, installé sur un serveur de
            Gravitek situé en France.
          </p>
          <p>
            Umami ne dépose aucun cookie et ne conserve pas l&apos;adresse IP. Il compte les pages
            vues, le site d&apos;où vient le visiteur, le type d&apos;appareil, de navigateur et le
            pays, sans jamais permettre d&apos;identifier une personne. Les réponses données pendant
            le jeu ne lui sont jamais transmises. Ces statistiques ne sont ni vendues ni partagées.
          </p>
          <p>C&apos;est pourquoi aucun bandeau de consentement ne vous est demandé.</p>
        </Section>

        <Section title="Données personnelles">
          <p>
            L&apos;application ne collecte ni ne conserve aucune donnée personnelle&nbsp;: pas de
            compte, pas de nom, pas d&apos;adresse e-mail.
          </p>
          <p>
            Les réglages et les progrès de l&apos;enfant restent uniquement dans le navigateur de
            l&apos;appareil utilisé. Ils ne sont jamais envoyés à Gravitek. Vous pouvez les effacer
            à tout moment depuis les Réglages, avec le bouton « Effacer l&apos;historique ».
          </p>
        </Section>

        <Section title="Propriété intellectuelle">
          <p>
            Le code source de l&apos;application est libre, publié sous licence Apache 2.0 sur{" "}
            <a
              href="https://github.com/Gravitek-io/revises-tes-tables"
              target="_blank"
              rel="noopener noreferrer"
              className={linkClassName}
            >
              GitHub
            </a>
            .
          </p>
        </Section>

        <p className="border-t-2 border-dashed border-rule-strong pt-6 text-base text-ink-soft">
          Dernière mise à jour&nbsp;: {LAST_UPDATED}.
        </p>
      </div>
    </div>
  );
}
