/**
 * The icon set from the original navigation.js, converted to JSX so no SVG is
 * injected as raw HTML. Same viewBox, stroke weight and paths — the chrome is
 * pixel-identical to the pre-migration build.
 */
const PATHS = {
  home: <path d="M3 10.5 12 4l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
  shop: <><path d="M4 8h16l-1 11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></>,
  leaf: <><path d="M4 20c0-8 6-14 16-14 0 10-6 15-14 14" /><path d="M4 20c4-3 7-6 10-10" /></>,
  box: <><path d="M3 8 12 3l9 5v8l-9 5-9-5z" /><path d="M3 8l9 5 9-5M12 13v8" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /></>,
  chart: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
  chat: <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.5A8 8 0 1 1 21 12z" />,
  bell: <><path d="M18 15V10a6 6 0 1 0-12 0v5l-2 3h16z" /><path d="M10 21h4" /></>,
  robot: <><rect x="4" y="7" width="16" height="12" rx="3" /><path d="M12 3v4M9 13h.01M15 13h.01" /></>,
  heart: <path d="M12 20s-7-4.4-7-9.2A3.9 3.9 0 0 1 12 8a3.9 3.9 0 0 1 7 2.8C19 15.6 12 20 12 20z" />,
  cloud: <path d="M7 18a4 4 0 0 1 .6-8 5.5 5.5 0 0 1 10.6 1.4A3.5 3.5 0 0 1 17.5 18z" />,
  tag: <><path d="M3 12V4h8l9 9-8 8z" /><circle cx="7.5" cy="7.5" r="1.4" /></>,
  gear: <><circle cx="12" cy="12" r="3.2" /><path d="M4 12h2m12 0h2M12 4v2m0 12v2M6.3 6.3l1.4 1.4m8.6 8.6 1.4 1.4m0-11.4-1.4 1.4M7.7 16.3l-1.4 1.4" /></>,
  shield: <path d="M12 3l8 3v6c0 5-3.4 8-8 9-4.6-1-8-4-8-9V6z" />,
  book: <><path d="M4 4h9a3 3 0 0 1 3 3v13a3 3 0 0 0-3-3H4z" /><path d="M20 4h-1a3 3 0 0 0-3 3v13a3 3 0 0 1 3-3h1z" /></>,
  list: <path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" />,
  cpu: <><rect x="7" y="7" width="10" height="10" rx="2" /><path d="M4 10h3M4 14h3m10-4h3m-3 4h3M10 4v3m4-3v3m-4 10v3m4-3v3" /></>,
  file: <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /></>,
  star: <path d="m12 4 2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.6-4.8 2.6.9-5.4L4.2 9.7l5.4-.8z" />,
  trendingUp: <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></>,
  mapPin: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></>,
};

export default function Icon({ name, ...rest }) {
  const body = PATHS[name];
  if (!body) return null;
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true" {...rest}>
      {body}
    </svg>
  );
}

/** The brand mark keeps its own stroke settings, exactly as before. */
export function LogoMark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M12 21c0-6 3.5-10 9-11-1 6-4.5 9.5-9 10z" />
      <path d="M12 21C12 15 8.5 11 3 10c1 6 4.5 9.5 9 10z" />
      <circle cx="12" cy="5" r="2.2" />
      <path d="M12 7.2V12" />
    </svg>
  );
}
