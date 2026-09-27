import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Brand from "../../components/Brand.jsx";
import useAuth from "../../hooks/useAuth.js";
import { ROLE_HOME } from "../../services/session.js";
import { authAPI, friendlyMessage } from "../../services/api.js";

/**
 * Sign in. Authentication is performed entirely by the backend — this screen
 * submits credentials and reacts to the answer. It never grants access itself
 * and never writes an "isLoggedIn" flag anywhere.
 */
export default function Login() {
  const { login, loginWithOtp, sessionError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [values, setValues] = useState({ identifier: "", password: "", remember: false });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [busy, setBusy] = useState(false);

  const [otpOpen, setOtpOpen] = useState(false);
  const [otp, setOtp] = useState({ phone: "", code: "" });
  const [otpNote, setOtpNote] = useState(null);
  const [otpBusy, setOtpBusy] = useState(false);

  /** Where to land: the page they were blocked from, else their role's home. */
  const goAfterLogin = (user) => {
    const intended = location.state?.from;
    navigate(intended || ROLE_HOME[user?.role] || "/", { replace: true });
  };

  const onChange = (e) => {
    const { name, type, value, checked } = e.target;
    setValues((v) => ({ ...v, [name]: type === "checkbox" ? checked : value }));
    setFieldErrors((f) => ({ ...f, [name]: undefined }));
  };

  const validate = () => {
    const errors = {};
    if (!values.identifier.trim()) errors.identifier = "This field is required.";
    if (!values.password) errors.password = "This field is required.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    if (!validate()) return;

    setBusy(true);
    try {
      const user = await login({
        identifier: values.identifier.trim(),
        password: values.password,
        remember: values.remember,
      });
      goAfterLogin(user);
    } catch (error) {
      if (error?.status === 422 && error.details && typeof error.details === "object") {
        setFieldErrors(error.details);
        setFormError("Some details need fixing before we can continue.");
      } else if (error?.status === 401) {
        setFormError("Those sign-in details weren't recognised.");
      } else if (error?.status === 403) {
        setFormError("This account is not permitted to sign in. Please contact support.");
      } else {
        setFormError(friendlyMessage(error));
      }
    } finally {
      setBusy(false);
    }
  };

  const sendOtp = async () => {
    setOtpNote(null);
    if (!/^[6-9]\d{9}$/.test(otp.phone.trim())) {
      setOtpNote({ type: "error", text: "Enter a valid 10-digit Indian mobile number." });
      return;
    }
    setOtpBusy(true);
    try {
      await authAPI.requestOtp(otp.phone.trim());
      setOtpNote({ type: "success", text: "If that number is registered, a code has been sent." });
    } catch (error) {
      setOtpNote({ type: "error", text: friendlyMessage(error) });
    } finally {
      setOtpBusy(false);
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    setOtpNote(null);
    if (!/^\d{6}$/.test(otp.code.trim())) {
      setOtpNote({ type: "error", text: "Enter the 6-digit code." });
      return;
    }
    setOtpBusy(true);
    try {
      const user = await loginWithOtp(otp.phone.trim(), otp.code.trim());
      goAfterLogin(user);
    } catch (error) {
      setOtpNote({ type: "error", text: error?.status === 401 ? "That code could not be verified." : friendlyMessage(error) });
    } finally {
      setOtpBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <aside className="auth-art">
        <Brand compact />
        <h2>Welcome back to Agro Connect</h2>
        <ul>
          <li>✓ Manage listings, prices and orders in one place</li>
          <li>✓ Talk to buyers and farmers directly</li>
          <li>✓ Use the AI Crop Doctor for crop health support</li>
        </ul>
      </aside>

      <div className="auth-panel">
        <div className="auth-card card">
          <h1>Sign in</h1>
          <p className="text-muted">Use the mobile number or email registered with Agro Connect.</p>

          {location.state?.from && !formError && (
            <div className="state info" role="status" style={{ marginTop: "var(--sp-3)" }}>
              Please sign in to continue to <strong>{location.state.from}</strong>.
            </div>
          )}

          {sessionError && !formError && (
            <div className="state error" role="alert" style={{ marginTop: "var(--sp-3)" }}>
              {friendlyMessage(sessionError)}
            </div>
          )}

          {formError && (
            <div className="state error" role="alert" style={{ marginTop: "var(--sp-3)" }}>
              {formError}
            </div>
          )}

          <form id="login-form" noValidate onSubmit={onSubmit} style={{ marginTop: "var(--sp-4)" }}>
            <div className="field">
              <label htmlFor="identifier">Mobile number or email <span className="req">*</span></label>
              <input
                id="identifier" name="identifier" type="text" autoComplete="username"
                value={values.identifier} onChange={onChange}
                aria-invalid={fieldErrors.identifier ? "true" : undefined}
                aria-describedby={fieldErrors.identifier ? "identifier-error" : undefined}
              />
              {fieldErrors.identifier && <p className="error-text" id="identifier-error">{fieldErrors.identifier}</p>}
            </div>

            <div className="field">
              <label htmlFor="password">Password <span className="req">*</span></label>
              <input
                id="password" name="password" type="password" autoComplete="current-password"
                value={values.password} onChange={onChange}
                aria-invalid={fieldErrors.password ? "true" : undefined}
                aria-describedby={fieldErrors.password ? "password-error" : undefined}
              />
              {fieldErrors.password && <p className="error-text" id="password-error">{fieldErrors.password}</p>}
            </div>

            <div className="row-between">
              <label className="checkline">
                <input type="checkbox" name="remember" checked={values.remember} onChange={onChange} />
                {" "}Keep me signed in
              </label>
              <Link to="/forgot-password">Forgot password?</Link>
            </div>

            <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={busy} style={{ marginTop: "var(--sp-4)" }}>
              {busy ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <hr className="divider" />

          <button className="btn btn-outline btn-block" type="button" onClick={() => setOtpOpen((o) => !o)} aria-expanded={otpOpen}>
            Sign in with a one-time code
          </button>

          {otpOpen && (
            <div id="otp-box" style={{ marginTop: "var(--sp-4)" }}>
              {otpNote && (
                <div className={`state ${otpNote.type === "error" ? "error" : "info"}`} role="status">
                  {otpNote.text}
                </div>
              )}
              <form id="otp-form" noValidate onSubmit={verifyOtp}>
                <div className="field">
                  <label htmlFor="phone">Mobile number</label>
                  <input
                    id="phone" name="phone" type="tel" inputMode="numeric" autoComplete="tel"
                    value={otp.phone} onChange={(e) => setOtp((o) => ({ ...o, phone: e.target.value }))}
                  />
                </div>
                <div className="field">
                  <label htmlFor="code">6-digit code</label>
                  <input
                    id="code" name="code" type="text" inputMode="numeric" maxLength={6} autoComplete="one-time-code"
                    value={otp.code} onChange={(e) => setOtp((o) => ({ ...o, code: e.target.value }))}
                  />
                </div>
                <div className="btn-group">
                  <button className="btn btn-outline" type="button" onClick={sendOtp} disabled={otpBusy}>
                    {otpBusy ? "Sending…" : "Send code"}
                  </button>
                  <button className="btn btn-primary" type="submit" disabled={otpBusy}>
                    Verify and sign in
                  </button>
                </div>
              </form>
            </div>
          )}

          <p className="text-muted" style={{ marginTop: "var(--sp-4)", fontSize: "var(--fs-sm)" }}>
            New to Agro Connect? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
