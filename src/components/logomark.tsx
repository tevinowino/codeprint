/**
 * CODEPRINT's mark, "Cursor C": a square C frame whose open side holds a text
 * cursor — code, mid-thought. Geometry is the master `symbol.svg` from the logo
 * kit; for rendering below ~32px the kit ships a heavier cut (`symbol-small`),
 * which the favicon uses. Filled with currentColor so callers pick the ink.
 */
const FRAME_PATH = "M40 40H216V100H184V72H72V184H184V156H216V216H40Z";
const CURSOR_PATH = "M112 100H140V156H112Z";

export function Logomark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="40 40 176 176"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d={FRAME_PATH} />
      <path d={CURSOR_PATH} />
    </svg>
  );
}
