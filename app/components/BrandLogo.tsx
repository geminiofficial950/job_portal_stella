export default function BrandLogo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="255 153 585 98"
      role="img"
      aria-label="Gemini Jobs"
      className={`brand-logo ${className}`}
    >
      <image href="/gemini-black-logo.png" width="1200" height="413" />
    </svg>
  );
}
