import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router";

interface Props {
  children: React.ReactNode;
  allowedRoles?: string[];
  requireCompleteProfile?: boolean;
}

export default function ProtectedRoute({
  children,
  allowedRoles,
  requireCompleteProfile
}: Props) {
  const { user, profile, loading } = useAuth();

  if (loading) return null;

  // ❌ No login
  if (!user) return <Navigate to="/login" replace />;

  // ❌ Sin perfil base
  if (!profile) return <Navigate to="/" replace />;

  // ❌ Rol incorrecto
  if (allowedRoles && !allowedRoles.includes(profile.tipo)) {
    return <Navigate to="/" replace />;
  }

  // 🔥 VALIDACIÓN CLAVE
  if (
    requireCompleteProfile &&
    profile.tipo === "cuidador" &&
    !profile.completo
  ) {
    return <Navigate to="/perfil" replace />;
  }

  return <>{children}</>;
}