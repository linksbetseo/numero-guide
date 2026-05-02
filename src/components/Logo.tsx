export function LogoMark({ size = 36, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      {/* Outer circle */}
      <circle cx="18" cy="18" r="17" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />

      {/* Spiral / labyrinth — concentric arcs suggesting Ariadne's thread */}
      {/* Outer arc — almost full circle, opens bottom-right */}
      <path
        d="M18 4 A14 14 0 1 1 29.9 24"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
      {/* Middle arc */}
      <path
        d="M18 8.5 A9.5 9.5 0 1 1 26.2 24"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
      {/* Inner arc */}
      <path
        d="M18 13 A5 5 0 1 1 22.2 21.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />

      {/* Thread connecting arcs — the "kłębek" */}
      <path
        d="M29.9 24 C31 26, 30 29, 27 30 L22.2 21.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />

      {/* Center dot */}
      <circle cx="18" cy="18" r="1.8" fill="currentColor" />
    </svg>
  );
}

export function LogoFull({
  size = 36,
  variant = "auto",
}: {
  size?: number;
  variant?: "dark" | "light" | "auto";
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        fontWeight: 800,
        fontSize: size * 0.47,
        letterSpacing: "-0.01em",
        lineHeight: 1,
      }}
    >
      <span
        style={{
          display: "grid",
          width: size,
          height: size,
          placeItems: "center",
          borderRadius: "50%",
          background:
            variant === "light"
              ? "rgba(255,255,255,0.15)"
              : variant === "dark"
                ? "var(--teal)"
                : "var(--teal)",
          border:
            variant === "light" ? "1px solid rgba(255,255,255,0.35)" : "none",
          color: "#fff",
          flexShrink: 0,
        }}
      >
        <LogoMark size={Math.round(size * 0.64)} />
      </span>
      <span>Luminaria</span>
    </span>
  );
}
