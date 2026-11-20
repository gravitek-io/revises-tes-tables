import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Top bar shared by the inner pages: a back button to the home page, the page
 * title and an optional slot on the right (e.g. the question counter).
 */
interface PageHeaderProps {
  /** Visible page title; omit it when the page shows its own heading. */
  title?: string;
  /** Accessible name of the back button. */
  backLabel?: string;
  children?: ReactNode;
}

export default function PageHeader({
  title,
  backLabel = "Retour à l'accueil",
  children,
}: PageHeaderProps) {
  return (
    <header className="mb-6 flex items-center gap-3 md:mb-8">
      <Link href="/" className="btn btn-icon" aria-label={backLabel}>
        <ArrowLeft className="h-6 w-6" strokeWidth={2.75} aria-hidden />
      </Link>
      {title && (
        <h1 className="font-display text-3xl font-black md:text-4xl">{title}</h1>
      )}
      {children && (
        <div className="ml-auto flex items-center gap-2">{children}</div>
      )}
    </header>
  );
}
