/**
 * The session grade as a teacher writes it: « 8/10 » in cursive red pen,
 * circled by hand. The circle is an SVG path drawn by the `draw` animation.
 */
interface GradeCircleProps {
  correct: number;
  total: number;
}

export default function GradeCircle({ correct, total }: GradeCircleProps) {
  return (
    <p className="relative inline-block px-8 py-3">
      <span className="sr-only">
        Note : {correct} sur {total}
      </span>
      <span
        className="font-hand text-6xl text-pen md:text-7xl"
        aria-hidden
      >
        {correct}/{total}
      </span>
      <svg
        className="pointer-events-none absolute -inset-x-3 -inset-y-2 h-[calc(100%+1rem)] w-[calc(100%+1.5rem)]"
        viewBox="0 0 200 90"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          d="M34 16 C 84 -4, 186 6, 191 44 C 196 82, 60 92, 17 64 C -6 46, 18 22, 74 11"
          pathLength={1}
          strokeDasharray={1}
          className="animate-draw"
          fill="none"
          stroke="var(--color-pen)"
          strokeWidth={4}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </p>
  );
}
