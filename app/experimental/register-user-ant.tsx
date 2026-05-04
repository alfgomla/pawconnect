import { useState } from "react";
import { auth, db } from "../lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router";

export default function RegisterUser() {
  const [email, setEmail] = useState("");
  const [codigoPostal, setCodigoPostal] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 1. Creamos el usuario en Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Guardamos sus datos adicionales en una nueva colección "duenos"
      await setDoc(doc(db, "usuarios", user.uid), {
        nombre: nombre,
        email: email,
        codigoPostal: codigoPostal,
        tipo: "dueno",
        fechaRegistro: new Date().toLocaleDateString()
      });

      alert("¡Cuenta de dueño creada con éxito!");
      navigate("/buscar");
    } catch (error: any) {
      alert("Error al registrarse: " + error.message);
    }
  };

  return (
    <div className="container-form">
      <h2>Crea tu cuenta de Dueño 🐾</h2>
      <p>Regístrate para contactar a los mejores cuidadores de Querétaro.</p>
      <form onSubmit={handleRegister} className="card-form">
        <input 
          type="text" 
          placeholder="Tu Nombre" 
          required 
          onChange={(e) => setNombre(e.target.value)} 
        />
        <input 
          type="email" 
          placeholder="Correo electrónico" 
          required 
          onChange={(e) => setEmail(e.target.value)} 
        />
        <input 
          type="text" 
          placeholder="Código Postal" 
          required 
          onChange={(e) => setCodigoPostal(e.target.value)} 
        />
        <input 
          type="password" 
          placeholder="Contraseña (mínimo 6 caracteres)" 
          required 
          onChange={(e) => setPassword(e.target.value)} 
        />
        <button type="submit" className="btn-user">Registrarme</button>
      </form>
    </div>
  );
}