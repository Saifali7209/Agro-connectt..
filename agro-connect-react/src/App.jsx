import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";

/**
 * AuthProvider sits above the router so the session is resolved once, and every
 * guard in the tree reads the same answer.
 */
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
