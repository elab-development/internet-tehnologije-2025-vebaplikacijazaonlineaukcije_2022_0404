import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';

export default function GuestOnly() {
  const token = useAuthStore((s) => s.token);
  const location = useLocation();

  if (token) {
    const redirectTo = location.state?.from?.pathname || '/';
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}
