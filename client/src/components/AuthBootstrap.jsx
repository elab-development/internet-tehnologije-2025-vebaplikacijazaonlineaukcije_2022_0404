import { useEffect, useRef } from 'react';
import { useAuthStore } from '../stores/auth.store';

export default function AuthBootstrap({ children }) {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const me = useAuthStore((s) => s.me);
  const loading = useAuthStore((s) => s.loading);

  const ran = useRef(false);

  console.log(user);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    if (token && !user) {
      me();
    }
  }, [token, user, me]);

  if (token && !user && loading) {
    return <div style={{ padding: 24 }}>Loading...</div>;
  }

  return children;
}
