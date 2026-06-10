import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

// Blocks access to private pages when there is no token.
export default function ProtectedRoute({ children }) {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return children;
}
