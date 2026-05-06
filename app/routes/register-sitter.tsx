import { useState } from "react";
import { auth, db } from "../lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Link, useNavigate } from "react-router";

export default function RegisterSitter() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 1. Creamos el usuario en Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const uid   = user.uid;

      // 2. Guardamos sus datos adicionales en una nueva colección "cuidadores"
      await setDoc(doc(db, "usuarios", uid), {
        nombre: nombre,
        email: email,
        tipo: "cuidador",
        fechaRegistro: serverTimestamp()
      });

      alert("¡Cuenta de cuidador creada con éxito!");
      navigate("/perfil-cuidador");
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        alert("Este correo ya esta registrado. Inicia sesion para continuar.");
        navigate("/login");
        return;
      }

      alert("No pudimos crear tu cuenta. Revisa tus datos e intenta de nuevo.");
    }
  };

  return (
    <div className="container-form">
      <h2>Crea tu cuenta de <span className="text-cyan-500">Cuidador</span> 🐾</h2>
      <p>Regístrate para te contacten como cuidador en Querétaro.</p>
      <form onSubmit={handleRegister} className="card-form">
        <input 
          type="text" 
          placeholder="Tu Nombre" 
          required 
          style={{ textTransform: "uppercase" }}
          onChange={(e) => setNombre(e.target.value.toUpperCase().trim())}
        />
        <input 
          type="email" 
          placeholder="Correo electrónico" 
          required 
          onChange={(e) => setEmail(e.target.value)} 
        />
        <input 
          type="password" 
          placeholder="Contraseña (mínimo 6 caracteres)" 
          required 
          onChange={(e) => setPassword(e.target.value)} 
        />
        <button type="submit" className="btn-user">Registrarme</button>
      </form>
      <p style={{ fontSize: '0.9rem', marginTop: '1rem' }}>
          ¿Tienes macota y buscas cuidador? <Link to="/registro-dueno" style={{ color: '#4f46e5' }}>Regístrate aquí</Link>
        </p>
    </div>
  );
}
