import { useState } from "react";
import { auth } from "../lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate, Link } from "react-router";

export default function Login() {
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
    <div className="container-form">
      <h2>Prueba🐾</h2>
      <p>Entra para contactar a tus cuidadores favoritos.</p>
      
    </div>
  );
}