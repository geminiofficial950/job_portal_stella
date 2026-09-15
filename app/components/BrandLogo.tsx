export default function BrandLogo({
  className = "",
  onDark = false,
}: {
  className?: string;
  /** Use white “JOBS” mark for dark surfaces */
  onDark?: boolean;
}) {
  return (
    <svg
      viewBox="255 153 585 98"
      role="img"
      aria-label="Gemini Jobs"
      className={`brand-logo ${className}`}
      data-on-dark={onDark ? "true" : undefined}
    >
      <image
        className="brand-logo__light"
        href="/gemini-black-logo.png"
        width="1200"
        height="413"
        style={onDark ? { opacity: 0 } : undefined}
      />
      <image
        className="brand-logo__dark"
        href="/gemini-logo-on-dark.png"
        width="1200"
        height="413"
        style={onDark ? { opacity: 1 } : undefined}
      />
    </svg>
  );
}
