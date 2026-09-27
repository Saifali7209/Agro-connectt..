/**
 * Shown while the session is being verified. It occupies the viewport so no
 * protected content can appear underneath it during the check.
 */
export default function FullPageLoader({ label = "Loading…" }) {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        gap: "var(--sp-3)",
        background: "var(--color-bg, #f6f8f6)",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div className="spinner" aria-hidden="true" />
        <p className="text-muted" style={{ marginTop: "var(--sp-3)" }}>{label}</p>
      </div>
    </div>
  );
}
