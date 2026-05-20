import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import { doc, getDoc } from "firebase/firestore";
import { ArrowLeft, CalendarDays, Clock, Star } from "lucide-react";
import { db } from "../lib/firebase";


type DisponibilidadServicio = {
  dias?: string[];
  horaInicio?: string;
  horaFin?: string;
  costoPorHora?: number;
  costoPorDia?: number;
};

type PerfilCuidador = {
  nombre?: string;
  descripcion?: string;
  colonia?: string;
  fotoPerfil?: string;
  rating?: number;
  servicios?: string[];
  disponibilidad?: Record<string, DisponibilidadServicio>;
};

const formatoCosto = (servicio: string, disponibilidad?: DisponibilidadServicio) => {
  if (servicio === "Paseo" && disponibilidad?.costoPorHora) {
    return `$${disponibilidad.costoPorHora} por hora`;
  }

  if (servicio === "Alojamiento" && disponibilidad?.costoPorDia) {
    return `$${disponibilidad.costoPorDia} por dia`;
  }

  return "Costo por confirmar";
};

const obtenerPrimerNombre = (nombre?: string) => {
  return nombre?.trim().split(/\s+/)[0] || "Cuidador";
};

export default function VerCuidador() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const servicioSeleccionado = searchParams.get("servicio") || "";

  const [perfil, setPerfil] = useState<PerfilCuidador | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fechaServicio, setFechaServicio] = useState("");
  const [horaServicio, setHoraServicio] = useState("");
  const [fechaLlegada, setFechaLlegada] = useState("");
  const [horaLlegada, setHoraLlegada] = useState("");
  const [fechaSalida, setFechaSalida] = useState("");
  const [horaSalida, setHoraSalida] = useState("");
  const [comentarios, setComentarios] = useState("");

  useEffect(() => {
    const fetchPerfil = async () => {
      if (!id) {
        setError("No encontramos el perfil solicitado.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const perfilSnap = await getDoc(doc(db, "perfiles_cuidadores", id));

        if (!perfilSnap.exists()) {
          setPerfil(null);
          setError("Este perfil de cuidador no existe o ya no esta disponible.");
          return;
        }

        const perfilData = perfilSnap.data();
        const usuarioSnap = await getDoc(doc(db, "usuarios", id));
        const usuarioData = usuarioSnap.exists() ? usuarioSnap.data() : {};

        setPerfil({
          ...perfilData,
          nombre: perfilData.nombre || usuarioData.nombre,
          colonia: perfilData.colonia || usuarioData.colonia,
        } as PerfilCuidador);
      } catch (error) {
        console.error("Error cargando perfil de cuidador:", error);
        setError("No pudimos cargar este perfil. Intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    };

    fetchPerfil();
  }, [id]);

  const handleApartarServicio = () => {
    if (!servicioSeleccionado) {
      alert("Regresa a la busqueda y selecciona un servicio.");
      return;
    }

    if (servicioSeleccionado === "Alojamiento") {
      if (!fechaLlegada || !horaLlegada || !fechaSalida || !horaSalida) {
        alert("Selecciona dia y hora de llegada, y dia y hora de salida.");
        return;
      }

      alert("Solicitud de alojamiento preparada. El siguiente paso sera guardar la reserva.");
      return;
    }

    if (!fechaServicio || !horaServicio) {
      alert("Selecciona el dia y la hora del servicio.");
      return;
    }

    alert("Solicitud de servicio preparada. El siguiente paso sera guardar la reserva.");
  };

  if (loading) {
    return (
        <p className="text-center mt-8">Cargando perfil...</p>
    );
  }

  if (error || !perfil) {
    return (
        <div className="max-w-3xl mx-auto px-4 py-8 text-center">
          <p>{error || "No encontramos este perfil."}</p>
          <Link to="/buscar" className="btn-user inline-flex mt-6" style={{ textDecoration: "none" }}>
            Volver a buscar
          </Link>
        </div>
    );
  }

  const servicioDisponible = servicioSeleccionado && perfil.servicios?.includes(servicioSeleccionado);
  const disponibilidadServicio = servicioSeleccionado
    ? perfil.disponibilidad?.[servicioSeleccionado]
    : undefined;
  const dias = disponibilidadServicio?.dias || [];

  return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link
          to="/buscar"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            color: "#4f46e5",
            fontWeight: 600,
            textDecoration: "none",
            marginBottom: "1rem",
          }}
        >
          <ArrowLeft size={18} /> Volver a buscar
        </Link>

        <section className="bg-white rounded-2xl shadow p-6 text-center">
          <img
            src={perfil.fotoPerfil || "/images/default-user.png"}
            alt={perfil.nombre || "Cuidador Pakal Pets"}
            className="w-36 h-36 rounded-full mx-auto object-cover border-4 border-white shadow"
          />
          <h2 className="text-xl font-bold mt-3">{obtenerPrimerNombre(perfil.nombre)}</h2>
          <p className="text-gray-500">{perfil.colonia || "Zona por confirmar"}</p>
          <div className="flex items-center justify-center gap-2 mt-2 text-gray-600">
            <Star size={18} fill="#fbbf24" color="#fbbf24" />
            <span>{Number(perfil.rating || 0).toFixed(1)} de 5</span>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow p-6 mt-4">
          <h3 className="font-semibold mb-2">Sobre mi</h3>
          <p className="text-gray-500">{perfil.descripcion || "Este cuidador aun no agrego una descripcion."}</p>
        </section>

        <section className="bg-white rounded-2xl shadow p-6 mt-4">
          <h3 className="font-semibold mb-3">Servicio seleccionado</h3>

          {servicioSeleccionado ? (
            <div className="border border-gray-200 rounded-xl p-4">
              <p className="text-lg font-semibold text-cyan-600">{servicioSeleccionado}</p>
              {!servicioDisponible && (
                <p className="text-sm text-red-500 mt-2">
                  Este cuidador ya no tiene activo este servicio.
                </p>
              )}

              <div className="grid gap-2 mt-4 text-gray-600">
                <p>{formatoCosto(servicioSeleccionado, disponibilidadServicio)}</p>
                <p className="flex items-center gap-2">
                  <CalendarDays size={18} />
                  {dias.length > 0 ? dias.join(", ") : "Dias por confirmar"}
                </p>
                <p className="flex items-center gap-2">
                  <Clock size={18} />
                  {disponibilidadServicio?.horaInicio && disponibilidadServicio?.horaFin
                    ? `${disponibilidadServicio.horaInicio} a ${disponibilidadServicio.horaFin}`
                    : "Horario por confirmar"}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No hay servicio seleccionado. Vuelve a la busqueda.</p>
          )}
        </section>

        <section className="bg-white rounded-2xl shadow p-6 mt-4">
          <h3 className="font-semibold mb-3">Apartar servicio</h3>

          {servicioSeleccionado === "Alojamiento" ? (
            <div className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <h3 className="font-semibold mb-2">Dia de llegada</h3>
                  <input
                    type="date"
                    className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={fechaLlegada}
                    onChange={(e) => setFechaLlegada(e.target.value)}
                  />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Hora de llegada</h3>
                  <input
                    type="time"
                    className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={horaLlegada}
                    onChange={(e) => setHoraLlegada(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <h3 className="font-semibold mb-2">Dia de salida</h3>
                  <input
                    type="date"
                    className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={fechaSalida}
                    onChange={(e) => setFechaSalida(e.target.value)}
                  />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Hora de salida</h3>
                  <input
                    type="time"
                    className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={horaSalida}
                    onChange={(e) => setHoraSalida(e.target.value)}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <h3 className="font-semibold mb-2">Dia del servicio</h3>
                <input
                  type="date"
                  className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={fechaServicio}
                  onChange={(e) => setFechaServicio(e.target.value)}
                />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Hora del servicio</h3>
                <input
                  type="time"
                  className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={horaServicio}
                  onChange={(e) => setHoraServicio(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="mt-4">
            <h3 className="font-semibold mb-2">Comentarios</h3>
            <textarea
              className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Agrega detalles importantes para el cuidador..."
              maxLength={250}
              value={comentarios}
              onChange={(e) => setComentarios(e.target.value)}
            />
            <p className="text-sm text-gray-500 text-right">{comentarios.length}/250</p>
          </div>

          <button type="button" onClick={handleApartarServicio} className="btn-user w-full mt-6">
            Apartar servicio
          </button>
        </section>
      </div>
  );
}
