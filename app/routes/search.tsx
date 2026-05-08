import { useState } from "react";
import { PawPrint, Search } from "lucide-react";
import { useNavigate } from "react-router";

const serviciosDisponibles = [
  "Paseo",
  "Estética",
  "Adiestramiento",
  "Alojamiento",
  "Veterinario",
  "Cremación",
];

export default function SearchPage() {
  const navigate = useNavigate();
  const [servicio, setServicio] = useState("");

  const handleSearch = () => {
    if (!servicio) {
      alert("Por favor selecciona un servicio");
      return;
    }

    navigate(`/resultados?servicio=${encodeURIComponent(servicio)}`);
  };

  return (
    <div className="hero-container">
      <section className="hero-text">
        <h1>El cuidado que tu mascota merece, cerca de ti</h1>
        <p>Elige el servicio que necesita tu mascota y encuentra cuidadores disponibles.</p>
      </section>

      <div className="search-box">
        <div className="input-group">
          <PawPrint className="icon" />
          <select value={servicio} onChange={(e) => setServicio(e.target.value)}>
            <option value="" disabled>
              ¿Qué servicio buscas?
            </option>
            {serviciosDisponibles.map((servicio) => (
              <option key={servicio} value={servicio}>
                {servicio}
              </option>
            ))}
          </select>
        </div>

        <button className="btn-search" onClick={handleSearch}>
          <Search size={20} /> Buscar
        </button>
      </div>
    </div>
  );
}
