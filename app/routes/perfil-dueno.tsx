import { useState } from "react";
import { auth } from "../lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate, Link } from "react-router";
import ProtectedRoute from "../components/ProtectedRoute";


export default function perfilDueno() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("¡Bienvenido de nuevo!");
      navigate("/buscar");
    } catch (error: any) {
      alert("Error al entrar: " + error.message);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["dueno"]}>
      <div>
        <h2>Perfil del usuario</h2>
        <p>En contrucción...</p>
        <p>En contrucción...</p>
        <p>En contrucción...</p>
        <p>En contrucción...</p>
        <p>En contrucción...</p>
        <p>En contrucción...</p>
        <p>En contrucción...</p>
        <p>En contrucción...</p>
        <p>En contrucción...</p>
      </div>
    </ProtectedRoute>
  );
}