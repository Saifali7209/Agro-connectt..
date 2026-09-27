import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Brand from "../../components/Brand.jsx";
import useAuth from "../../hooks/useAuth.js";
import { friendlyMessage } from "../../services/api.js";
import { STATES } from "../../legacy/data/demo-data.js";
import { rules } from "../../legacy/js/validation.js";

/**
 * Create account, with role-dependent fields — same three roles and the same
 * field sets as the original register screen.
 *
 * Submitting this form creates an account and nothing else. No token is issued
 * to the browser here, so a successful signup cannot open a protected page; the
 * user is sent to /login to authenticate. Note also that the role chosen here is
 * only a *request*: every guard reads the role the backend returns at sign-in,
 * so a hand-edited form cannot mint an admin.
 */

const ROLE_CHOICES = [
  { value: "farmer", label: "Farmer", hint: "List crops and sell directly" },
  { value: "buyer", label: "Buyer", hint: "Source produce from farms" },
  { value: "expert", label: "Agricultural Expert", hint: "Review AI crop cases" },
];

const ROLE_FIELDS = {
  farmer: [
    { name: "village", label: "Village", required: true },
    { name: "district", label: "District", required: true },
    { name: "state", label: "State", required: true, type: "select", options: STATES },
    { name: "pincode", label: "PIN code", required: true, inputMode: "numeric", maxLength: 6 },
    { name: "farm_size", label: "Farm size (acres)", type: "number", min: 0, step: 0.1 },
    { name: "farming_type", label: "Farming type", type: "select", options: ["Conventional", "Organic", "Mixed", "Natural farming"] },
    { name: "main_crops", label: "Main crops", full: true, placeholder: "Potato, Wheat, Sugarcane" },
  ],
  buyer: [
    { name: "business_name", label: "Business name", required: true },
    { name: "business_type", label: "Business type", type: "select", options: ["Retailer", "Wholesaler", "Processor", "Exporter", "Institution"] },
    { name: "city", label: "City", required: true },
    { name: "state", label: "State", required: true, type: "select", options: STATES },
    { name: "gstin", label: "GSTIN (optional)", full: true },
  ],
  expert: [
    { name: "qualification", label: "Highest qualification", required: true },
    { name: "specialisation", label: "Specialisation", required: true, type: "select", options: ["Plant pathology", "Entomology", "Agronomy", "Soil science", "Horticulture"] },
    { name: "institution", label: "Institution" },
    { name: "experience", label: "Years of experience", type: "number", min: 0, max: 60 },
    { name: "registration_id", label: "Professional registration ID", full: true },
  ],
};

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState("farmer");
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [busy, setBusy] = useState(false);

  const roleFields = useMemo(() => ROLE_FIELDS[role] || [], [role]);

  const onChange = (e) => {
    const { name, type, value, checked } = e.target;
    setValues((v) => ({ ...v, [name]: type === "checkbox" ? checked : value }));
    setErrors((f) => ({ ...f, [name]: undefined }));
  };

  /** Uses the existing validation rules so the messages match the old build. */
  const validate = () => {
    const next = {};
    const req = (k, msg = "This field is required.") => {
      if (!String(values[k] ?? "").trim()) next[k] = msg;
    };

    req("name");
    if (!next.name) next.name = rules.minLength(2)(values.name) || undefined;
    req("phone");
    if (!next.phone) next.phone = rules.phoneIN(values.phone) || undefined;
    req("email");
    if (!next.email) next.email = rules.email(values.email) || undefined;
    req("password");
    if (!next.password) next.password = rules.password(values.password) || undefined;

    if (values.confirm !== values.password) next.confirm = "The passwords do not match.";
    if (!values.terms) next.terms = "Please accept the terms to continue.";

    roleFields.filter((f) => f.required).forEach((f) => req(f.name));
    if (values.pincode && !next.pincode) next.pincode = rules.pincode(values.pincode) || undefined;

    Object.keys(next).forEach((k) => next[k] === undefined && delete next[k]);
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setNotice(null);
    if (!validate()) return;

    setBusy(true);
    try {
      const payload = { role, ...values };
      delete payload.confirm;
      delete payload.terms;

      await register(payload);

      setNotice("Account created. Please sign in to continue.");
      setTimeout(() => navigate("/login", { replace: true, state: { registered: true } }), 900);
    } catch (error) {
      if (error?.status === 422 && error.details && typeof error.details === "object") {
        setErrors(error.details);
        setFormError("Some details need fixing before we can continue.");
      } else if (error?.status === 409) {
        setFormError("An account with these details already exists. Try signing in instead.");
      } else {
        setFormError(friendlyMessage(error));
      }
    } finally {
      setBusy(false);
    }
  };

  const renderField = (f) => (
    <div className={`field${f.full ? " full" : ""}`} key={f.name}>
      <label htmlFor={f.name}>
        {f.label} {f.required && <span className="req">*</span>}
      </label>
      {f.type === "select" ? (
        <select id={f.name} name={f.name} value={values[f.name] ?? ""} onChange={onChange}>
          <option value="">Select {f.label.toLowerCase()}</option>
          {f.options.map((o) => <option key={o}>{o}</option>)}
        </select>
      ) : (
        <input
          id={f.name}
          name={f.name}
          type={f.type || "text"}
          inputMode={f.inputMode}
          maxLength={f.maxLength}
          min={f.min}
          max={f.max}
          step={f.step}
          placeholder={f.placeholder}
          value={values[f.name] ?? ""}
          onChange={onChange}
          aria-invalid={errors[f.name] ? "true" : undefined}
        />
      )}
      {errors[f.name] && <p className="error-text">{errors[f.name]}</p>}
    </div>
  );

  return (
    <div className="auth-wrap">
      <aside className="auth-art">
        <Brand compact />
        <h2>Join Agro Connect</h2>
        <ul>
          <li>✓ Farmers sell directly, with no middleman cut</li>
          <li>✓ Buyers source traceable produce at the source</li>
          <li>✓ Experts support farmers with verified guidance</li>
        </ul>
      </aside>

      <div className="auth-panel">
        <div className="auth-card card">
          <h1>Create your account</h1>

          {notice && <div className="state success" role="status">{notice}</div>}
          {formError && <div className="state error" role="alert">{formError}</div>}

          <form id="register-form" noValidate onSubmit={onSubmit}>
            <fieldset style={{ border: 0, padding: 0, margin: "0 0 var(--sp-4)" }}>
              <legend className="field-label" style={{ marginBottom: 8 }}>
                I am joining as <span className="req">*</span>
              </legend>
              <div className="choice-grid">
                {ROLE_CHOICES.map((c) => (
                  <label className="choice" key={c.value}>
                    <input
                      type="radio"
                      name="role"
                      value={c.value}
                      checked={role === c.value}
                      onChange={() => { setRole(c.value); setErrors({}); }}
                    />
                    <strong>{c.label}</strong>
                    <span>{c.hint}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="form-grid">
              {renderField({ name: "name", label: "Full name", required: true })}
              {renderField({ name: "phone", label: "Mobile number", required: true, type: "tel", inputMode: "numeric" })}
              {renderField({ name: "email", label: "Email", required: true, type: "email", full: true })}

              {roleFields.map(renderField)}

              {renderField({ name: "password", label: "Password", required: true, type: "password" })}
              {renderField({ name: "confirm", label: "Confirm password", required: true, type: "password" })}
            </div>

            <label className="checkline">
              <input type="checkbox" name="terms" checked={Boolean(values.terms)} onChange={onChange} />
              {" "}I agree to the Agro Connect terms and privacy policy.
            </label>
            {errors.terms && <p className="error-text">{errors.terms}</p>}

            <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={busy} style={{ marginTop: "var(--sp-4)" }}>
              {busy ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="text-muted" style={{ marginTop: "var(--sp-4)", fontSize: "var(--fs-sm)" }}>
            Already registered? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
