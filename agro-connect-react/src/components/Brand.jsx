import { Link } from "react-router-dom";
import { LogoMark } from "./Icon.jsx";
import { APP_CONFIG } from "../legacy/js/config.js";

/** Same markup and class names as the original brandMarkup(). */
export default function Brand({ compact = false, to = "/" }) {
  return (
    <Link className="brand" to={to} aria-label="Agro Connect home">
      <span className="brand-mark" aria-hidden="true"><LogoMark /></span>
      <span>
        <span className="brand-name">AGRO <span>CONNECT</span></span>
        {!compact && <span className="brand-tag">{APP_CONFIG.TAGLINE}</span>}
      </span>
    </Link>
  );
}
