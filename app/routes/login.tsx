import { useState } from "react";
import { auth } from "../lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate, Link } from "react-router";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

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
      <h2>Iniciar Sesión 🐾</h2>
      <p>Entra para contactar a tus cuidadores favoritos.</p>
      <form onSubmit={handleLogin} className="card-form">
        <input 
          type="email" 
          placeholder="Correo electrónico" 
          required 
          onChange={(e) => setEmail(e.target.value)} 
        />
        <input 
          type="password" 
          placeholder="Contraseña" 
          required 
          onChange={(e) => setPassword(e.target.value)} 
        />
        <button type="submit" className="btn-user">Entrar</button>
        
        <p style={{ fontSize: '0.9rem', marginTop: '1rem' }}>
          ¿No tienes cuenta? <Link to="/registro-usuario" style={{ color: '#4f46e5' }}>Regístrate aquí</Link>
        </p>
      </form>
    </div>
  );
}