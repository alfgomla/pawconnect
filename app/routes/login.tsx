import { useState } from "react";
import { auth, db } from "../lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate, Link } from "react-router";
import { doc, getDoc } from "firebase/firestore";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();


    try {

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 🔥 obtener datos del usuario
      const docRef = doc(db, "usuarios", user.uid);
      const docSnap = await getDoc(docRef);      


      if (docSnap.exists()) {
      const data = docSnap.data();

      // redirección por tipo
      if (data.tipo === "dueno") {
        navigate("/perfil-dueno");
      } else if (data.tipo === "cuidador") {
        navigate("/perfil-cuidador");
      } else {
        navigate("/");
      }
    } else {
      alert("No se encontró el perfil del usuario");
    }


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
          ¿No tienes cuenta? <Link to="/registro-dueno" style={{ color: '#4f46e5' }}>Regístrate aquí</Link>
        </p>
      </form>
    </div>
  );
}