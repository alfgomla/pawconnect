import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { doc, getDoc } from "firebase/firestore";
import { ArrowLeft, Mail, MapPin, Phone, Star } from "lucide-react";
import { db } from "../lib/firebase";
import ProtectedRoute from "../components/ProtectedRoute";

type PerfilCuidador = {
  nombre?: string;
  descripcion?: string;
  telefono?: string;
  ciudad?: string;
  colonia?: string;
  codigoPostal?: string;
  fotoPerfil?: string;
  rating?: number;
  servicios?: string[];
  email?: string;
};

export default function VerCuidador() {
  const { id } = useParams();
  const [perfil, setPerfil] = useState<PerfilCuidador | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
          email: usuarioData.email,
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

  if (loading) {
    return (
      <ProtectedRoute>
        <p className="text-center mt-8">Cargando perfil...</p>
      </ProtectedRoute>
    );
  }

  if (error || !perfil) {
    return (
      <ProtectedRoute>
      <div className="max-w-3xl mx-auto px-4 py-8 text-center">
        <p>{error || "No encontramos este perfil."}</p>
        <Link to="/buscar" className="btn-user inline-flex mt-6" style={{ textDecoration: "none" }}>
          Volver a buscar
        </Link>
      </div>
      </ProtectedRoute>
    );
  }

  const ubicacionTexto = [
    perfil.colonia  ? `colonia ${perfil.colonia}` : "",
    perfil.ciudad || "",
    "Mexico",
  ]
    .filter(Boolean)
    .join(", ");
  const mapsUrl = `https://www.google.com/maps?q=${encodeURIComponent(ubicacionTexto)}&output=embed`;

  return (
    <ProtectedRoute>
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
        <h2 className="text-xl font-bold mt-3">{perfil.nombre || "Cuidador Pakal Pets"}</h2>
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
        <h3 className="font-semibold mb-3">Servicios</h3>
        {perfil.servicios && perfil.servicios.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {perfil.servicios.map((servicio) => (
              <span
                key={servicio}
                className="px-3 py-2 rounded-xl bg-gray-100 text-gray-600 text-sm font-semibold"
              >
                {servicio}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No hay servicios publicados.</p>
        )}
      </section>

      <section className="bg-white rounded-2xl shadow p-6 mt-4">
        <h3 className="font-semibold mb-3">Ubicacion</h3>
        <p className="text-gray-500 flex items-center gap-2">
          <MapPin size={18} />
          CP {perfil.codigoPostal || "Sin codigo postal"}
          {perfil.ciudad ? `, ${perfil.ciudad}` : ""}
          {perfil.colonia ? `, ${perfil.colonia}` : ""}
        </p>
        {perfil.codigoPostal && (
          <div
            style={{
              width: "100%",
              aspectRatio: "1 / 1",
              borderRadius: "16px",
              overflow: "hidden",
              marginTop: "1rem",
              border: "1px solid #e5e7eb",
              background: "#f3f4f6",
            }}
          >
            <iframe
              title={`Mapa de ${ubicacionTexto}`}
              src={mapsUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              style={{
                width: "100%",
                height: "100%",
                border: 0,
              }}
            />
          </div>
        )}
      </section>

      <section className="bg-white rounded-2xl shadow p-6 mt-4">
        <h3 className="font-semibold mb-3">Contacto</h3>
        <div className="grid gap-3">
          {perfil.telefono && (
            <a
              href={`tel:${perfil.telefono}`}
              className="btn-sitter"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                textDecoration: "none",
              }}
            >
              <Phone size={18} /> Llamar
            </a>
          )}
          {perfil.email && (
            <a
              href={`mailto:${perfil.email}`}
              className="btn-user"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                textDecoration: "none",
              }}
            >
              <Mail size={18} /> Enviar correo
            </a>
          )}
        </div>
        
      </section>
      
    </div>
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link
        to="/buscar"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          color: "#4f46e5",
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        <ArrowLeft size={18} /> Volver a buscar
      </Link>
    </div>
    </ProtectedRoute>
  );
}
