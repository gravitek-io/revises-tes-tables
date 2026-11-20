import type { CSSProperties } from "react";

/**
 * A round colored sticker (gommette) showing a table number.
 *
 * Each multiplication table has its own color (--color-table-1 to 10 in
 * globals.css), so a child recognises "the purple table" from one screen to
 * the next. The number is always dark ink, readable on every color.
 */
type StickerSize = "sm" | "md" | "lg";

const SIZE_CLASSES: Record<StickerSize, string> = {
  sm: "h-8 w-8 text-sm",
  md: "h-11 w-11 text-lg",
  lg: "h-14 w-14 text-xl",
};

interface TableStickerProps {
  table: number;
  size?: StickerSize;
  /** Extra classes, e.g. an animation or a margin. */
  className?: string;
  /** Hide from assistive technologies when the table is already spelled out nearby. */
  decorative?: boolean;
}

/** CSS color of a table's sticker; tables outside 1-10 fall back to the highlighter. */
export function tableColor(table: number): string {
  return table >= 1 && table <= 10
    ? `var(--color-table-${table})`
    : "var(--color-highlight)";
}

export default function TableSticker({
  table,
  size = "md",
  className = "",
  decorative = false,
}: TableStickerProps) {
  const style: CSSProperties = { backgroundColor: tableColor(table) };

  return (
    <span
      style={style}
      className={`inline-grid shrink-0 place-items-center rounded-full font-display font-extrabold text-ink shadow-[inset_0_-3px_0_rgb(0_0_0/0.14)] ${SIZE_CLASSES[size]} ${className}`}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : `Table de ${table}`}
      role={decorative ? undefined : "img"}
    >
      {table}
    </span>
  );
}
