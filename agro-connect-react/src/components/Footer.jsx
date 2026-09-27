import { Link } from "react-router-dom";
import Brand from "./Brand.jsx";
import { APP_CONFIG } from "../legacy/js/config.js";

/** Same four-column footer as renderPublicFooter(), now with router links. */
export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <Brand />
            <p
              className="text-muted"
              style={{ marginTop: 12, maxWidth: "38ch", fontSize: "var(--fs-sm)", color: "rgba(242,247,243,.7)" }}
            >
              A direct farmer-to-buyer agricultural marketplace with AI-assisted crop health
              support for Indian growers.
            </p>
          </div>

          <div>
            <h5>Marketplace</h5>
            <ul>
              <li><Link to="/marketplace">Browse crops</Link></li>
              <li><Link to="/farmers">Find farmers</Link></li>
              <li><Link to="/buyer/find-crops">Buyer console</Link></li>
              <li><Link to="/farmer/add-crop">List a crop</Link></li>
            </ul>
          </div>

          <div>
            <h5>Intelligence</h5>
            <ul>
              <li><Link to="/ai-crop-doctor">AI Crop Doctor</Link></li>
              <li><Link to="/farmer/demand-forecasting">Demand forecasting</Link></li>
              <li><Link to="/farmer/crop-health">Crop health</Link></li>
              <li><Link to="/farmer/price-intelligence">Price intelligence</Link></li>
              <li><Link to="/farmer/weather">Weather</Link></li>
            </ul>
          </div>

          <div>
            <h5>Company</h5>
            <ul>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/faq">FAQ</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/expert/dashboard">Expert console</Link></li>
              <li><Link to="/admin/dashboard">Admin console</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Agro Connect. {APP_CONFIG.TAGLINE}</span>
          <span>React build — connects to the Agro Connect API.</span>
        </div>
      </div>
    </footer>
  );
}
