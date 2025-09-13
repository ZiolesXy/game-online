import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { AuthContainer } from "../components/auth/AuthContainer";
import { AuthCallback } from "../components/auth/AuthCallback";

export function AuthRoutes() {
  const { user } = useAuth();
  const location = useLocation();

  // Detect special case: Google account unregistered -> force show Auth page
  let params = new URLSearchParams(location.search);
  if (![...params.keys()].length && typeof (location as any).hash === 'string') {
    const hashStr = ((location as any).hash as string) || '';
    const qIndex = hashStr.indexOf('?');
    if (qIndex >= 0) {
      params = new URLSearchParams(hashStr.slice(qIndex));
    }
  }
  const flag = params.get('google_unregistered');
  const navState = (location as any).state as { googleUnregistered?: boolean } | null;
  let forceAuth = flag === '1' || !!navState?.googleUnregistered;
  
  if (!forceAuth) {
    try {
      const stored = localStorage.getItem('google_unregistered');
      if (stored === '1') {
        forceAuth = true;
        localStorage.removeItem('google_unregistered');
      }
    } catch {}
  }

  // If user is authenticated and not forced to auth, redirect to home
  if (user && !forceAuth) {
    return <Navigate to="/" replace />;
  }

  return (
    <Routes>
      <Route index element={<AuthContainer />} />
      <Route path="login" element={<AuthContainer />} />
      <Route path="register" element={<AuthContainer />} />
      <Route path="callback" element={<AuthCallback />} />
      <Route path="reset-password" element={<AuthContainer />} />
      <Route path="complete-profile" element={<AuthContainer />} />
      <Route path="*" element={<Navigate to="/auth" replace />} />
    </Routes>
  );
}
