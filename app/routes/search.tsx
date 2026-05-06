import { useState } from "react";
import { Search, MapPin, PawPrint } from "lucide-react";
import { useNavigate } from "react-router";
import ProtectedRoute from "../components/ProtectedRoute";

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
  const [codigoPostal, setCodigoPostal] = useState("");
  const [servicio, setServicio] = useState("");

  const handleSearch = () => {
    const cp = codigoPostal.trim();

    if (!cp || !servicio) {
      alert("Por favor ingresa tu código postal y selecciona un servicio");
      return;
    }

    navigate(
      `/resultados?codigoPostal=${encodeURIComponent(cp)}&servicio=${encodeURIComponent(servicio)}`
    );
  };

  return (
    <ProtectedRoute allowedRoles={["dueno"]}>
      <div className="hero-container">
        <section className="hero-text">
          <h1>El cuidado que tu mascota merece, cerca de ti</h1>
          <p>Encuentra expertos cerca de tu código postal para consentir a tu mejor amigo.</p>
        </section>

        <div className="search-box">
          <div className="input-group">
            <MapPin className="icon" />
            <input
              type="text"
              inputMode="numeric"
              maxLength={5}
              placeholder="Código postal"
              value={codigoPostal}
              onChange={(e) => setCodigoPostal(e.target.value.replace(/\D/g, ""))}
            />
          </div>

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
    </ProtectedRoute>
  );
}
