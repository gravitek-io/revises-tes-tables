import type { CSSProperties, ReactNode } from "react";

/**
 * A teacher's rubber stamp: a tilted double ring with a word inside, that
 * lands with a short "thump" animation. Used for « Bravo ! » on a right
 * answer and for the performance level on the results page.
 */
type StampTone = "success" | "ink";

const TONE_CLASSES: Record<StampTone, string> = {
  success: "border-success text-success outline-success",
  ink: "border-ink text-ink outline-ink",
};

interface StampProps {
  children: ReactNode;
  tone?: StampTone;
  /** Tilt in degrees; a real stamp is never perfectly straight. */
  rotate?: number;
  className?: string;
}

export default function Stamp({
  children,
  tone = "success",
  rotate = -12,
  className = "",
}: StampProps) {
  const style = { "--stamp-rotate": `${rotate}deg` } as CSSProperties;

  return (
    <div
      style={style}
      className={`grid h-28 w-28 animate-stamp place-items-center rounded-full border-[5px] bg-paper/90 p-2 text-center font-display text-xl leading-tight font-black outline-2 -outline-offset-[11px] outline-solid ${TONE_CLASSES[tone]} ${className}`}
    >
      {children}
    </div>
  );
}
