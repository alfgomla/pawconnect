import { useState } from "react";
import { Search, MapPin, PawPrint } from "lucide-react";
import { useNavigate } from "react-router";

export default function Home() {
  const navigate = useNavigate();
  const [ciudad, setCiudad] = useState("");
  const [servicio, setServicio] = useState("");

  const handleSearch = () => {
    if (!ciudad || !servicio) {
      alert("Por favor selecciona ciudad y servicio");
      return;
    }
    // Enviamos los datos por la URL: /resultados?ciudad=queretaro&servicio=Paseo
    navigate(`/resultados?ciudad=${ciudad}&servicio=${servicio}`);
  };

  return (
    <div className="hero-container">
      <section className="hero-text">
        <h1>El cuidado que tu mascota merece, cerca de ti 🐾</h1>
        <p>Encuentra expertos en tu ciudad para consentir a tu mejor amigo.</p>
      </section>

      <div className="search-box">
        <div className="input-group">
          <MapPin className="icon" />
          <select value={ciudad} onChange={(e) => setCiudad(e.target.value)}>
            <option value="" disabled>¿En qué ciudad?</option>
            <option value="Queretaro">Querétaro</option>
            <option value="San juan del rio">San Juan del Río</option>
            <option value="El Marques">El Marqués</option>
            <option value="Corregidora">Corregidora</option>
            <option value="Juriquilla">Juriquilla</option>
          </select>
        </div>
        
        <div className="input-group">
          <PawPrint className="icon" />
          <select value={servicio} onChange={(e) => setServicio(e.target.value)}>
            <option value="" disabled>¿Qué servicio buscas?</option>
            <option value="Paseo">Paseo</option>
            <option value="Estética">Estética</option>
            <option value="Adiestramiento">Adiestramiento</option>
            <option value="Alojamiento">Alojamiento</option>
            <option value="Veterinario">Veterinario</option>
            <option value="Cremación">Cremación</option>
          </select>
        </div>

        <button className="btn-search" onClick={handleSearch}>
          <Search size={20} /> Buscar
        </button>
      </div>
    </div>
  );
}