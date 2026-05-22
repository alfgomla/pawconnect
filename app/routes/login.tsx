import { useState } from "react";
import { auth, db } from "../lib/firebase";
import { sendPasswordResetEmail, signInWithEmailAndPassword } from "firebase/auth";
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

  const handlePasswordReset = async () => {
    const correo = email.trim() || prompt("Escribe el correo de tu cuenta")?.trim();

    if (!correo) {
      alert("Necesitamos tu correo para enviarte la recuperacion de contraseña.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, correo);
      alert("Te enviamos un correo para restablecer tu contraseña. Revisa tu bandeja de entrada. no olvides revisar la carpeta de spam.");
    } catch (error: any) {
      if (error.code === "auth/user-not-found") {
        alert("No encontramos una cuenta registrada con ese correo.");
        return;
      }

      if (error.code === "auth/invalid-email") {
        alert("El correo no tiene un formato valido.");
        return;
      }

      alert("No pudimos enviar el correo de recuperacion. Intenta de nuevo.");
    }
  };

  return (
    <div className="container-form">
      <h2>Iniciar Sesión 🐾</h2>
      <p>para entrar a la aplicación.</p>
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
        <button
          type="button"
          onClick={handlePasswordReset}
          style={{
            alignSelf: "flex-end",
            background: "transparent",
            border: "none",
            color: "#4f46e5",
            cursor: "pointer",
            fontSize: "0.9rem",
            fontWeight: 600,
            padding: 0,
          }}
        >
          Olvide mi contraseña
        </button>
        <button type="submit" className="btn-user">Entrar</button>
        
        <p style={{ fontSize: '0.9rem', marginTop: '1rem' }}>
          ¿No tienes cuenta? <Link to="/registro-dueno" style={{ color: '#4f46e5' }}>Regístrate aquí</Link>
        </p>
      </form>
    </div>
  );
}
