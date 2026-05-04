import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router";

interface Props {
  children: React.ReactNode;
  allowedRoles?: string[]; // ["dueno", "cuidador"]
}

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const { user, profile, loading } = useAuth();

  if (loading) return null;

  // ❌ No está logueado
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ❌ No tiene perfil aún
  if (!profile) {
    return <Navigate to="/" replace />;
  }

  // ❌ No tiene el rol permitido
  if (allowedRoles && !allowedRoles.includes(profile.tipo)) {
    return <Navigate to="/" replace />;
  }

  // ✅ Todo bien
  return <>{children}</>;
}