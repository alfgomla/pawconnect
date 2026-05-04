import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase";
import { db } from "../lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { useNavigate } from "react-router";

export default function RegisterSitter() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [nombre, setNombre] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [telefono, setTelefono] = useState("");
  const [codigoPostal, setCodigoPostal] = useState("");
  const [servicios, setServicios] = useState<string[]>([]);
  


  const handleCheckboxChange = (servicio: string) => {
    setServicios(prev => 
      prev.includes(servicio) ? prev.filter(s => s !== servicio) : [...prev, servicio]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await addDoc(collection(db, "usuarios"), {
        nombre,
        ciudad,
        telefono,
        codigoPostal,
        servicios,
        tipo: "cuidador",
        fechaRegistro: new Date().toLocaleDateString(),
        correo: email,
        password: password,
        rating: 5.0
      });
      alert("¡Felicidades! Ya estás registrado como cuidador.");
      navigate("/");
    } catch (error) {
      alert("Error al guardar: " + error);
    }
  };

  return (
    <div className="container-form">
      <h2>Únete como Cuidador 🐾</h2>
      <form onSubmit={handleSubmit} className="card-form">
        <input placeholder="Tu nombre" required onChange={e => setNombre(e.target.value)} />
        <input type="email" placeholder="Correo electrónico" required onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Contraseña" required onChange={(e) => setPassword(e.target.value)} />
        <select required onChange={e => setCiudad(e.target.value)}>
          <option value="">¿En qué ciudad estás?</option>
          <option value="Queretaro">Querétaro</option>
          <option value="San Juan del Rio">San Juan del Río</option>
          <option value="El Marques">El Marqués</option>
          <option value="Corregidora">Corregidora</option>
          <option value="Juriquilla">Juriquilla</option>
        </select>
        <input placeholder="Código Postal" required onChange={e => setCodigoPostal(e.target.value)} />

        <input placeholder="Teléfono" type="tel" required onChange={e => setTelefono(e.target.value)} />

        <div style={{ textAlign: 'left', margin: '10px 0' }}>
          <p style={{ fontWeight: 'bold' }}>Servicios que ofreces:</p>
          {['Paseo', 'Estética', 'Adiestramiento', 'Alojamiento', 'Veterinario', 'Cremación'].map(s => (
            <label key={s} style={{ display: 'block', marginBottom: '5px' }}>
              <input type="checkbox" onChange={() => handleCheckboxChange(s)} /> {s}
            </label>
          ))}
        </div>

        <button type="submit" className="btn-search">Completar Registro</button>
      </form>
    </div>
  );
}
