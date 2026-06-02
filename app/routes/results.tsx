import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { db } from "../lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { ArrowLeft, Star, BookUser } from "lucide-react";

type CuidadorResultado = {
  id: string;
  nombre?: string;
  descripcion?: string;
  telefono?: string;
  ciudad?: string;
  codigoPostal?: string;
  fotoPerfil?: string;
  rating?: number;
  servicios?: string[];
  email?: string;
  colonia?: string;
  codigo?: string;
};

const obtenerPrimerNombre = (nombre?: string) => {
  return nombre?.trim().split(/\s+/)[0] || "Cuidador";
};

export default function Results() {
  const [searchParams] = useSearchParams();
  const [cuidadores, setCuidadores] = useState<CuidadorResultado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const servicioBusqueda = searchParams.get("servicio") || "";

  useEffect(() => {
    const fetchCuidadores = async () => {
      if (!servicioBusqueda) {
        setCuidadores([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const cuidadoresQuery = query(
          collection(db, "perfiles_cuidadores"),
          where("servicios", "array-contains", servicioBusqueda),
          where("codigo", "==", "completo")
        );

        const querySnapshot = await getDocs(cuidadoresQuery);

        const docs = await Promise.all(
          querySnapshot.docs.map(async (perfilDoc) => {
            const perfilData = perfilDoc.data();

            return {
              id: perfilDoc.id,
              ...perfilData,
              nombre: obtenerPrimerNombre(perfilData.nombre),
              colonia: perfilData.colonia,
            } as CuidadorResultado;
          })
        );

        setCuidadores(docs);
      } catch (error) {
        console.error("Error buscando cuidadores:", error);
        setError("No pudimos completar la busqueda. Intenta de nuevo en unos segundos.");
      } finally {
        setLoading(false);
      }
    };

    fetchCuidadores();
  }, [servicioBusqueda]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <section className="hero-text">
        <h2 style={{ padding: "2rem 0 0 0", textAlign: "center" }}>
          Resultados para {servicioBusqueda || "servicio"}
        </h2>
      </section>

      {loading && <p className="text-center mt-8">Buscando a los mejores cuidadores...</p>}

      {!loading && error && <p className="text-center mt-8 text-red-500">{error}</p>}

      {!loading && !error && (
        <div className="grid gap-4 mt-8">
          {cuidadores.length > 0 ? (
            cuidadores.map((cuidador) => (
              <article
                key={cuidador.id}
                className="card-form"
                style={{
                  display: "flex",
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: "1rem",
                  alignItems: "center",
                }}
              >

                <img
                  src={cuidador.fotoPerfil || "/images/default-user.png"}
                  alt={obtenerPrimerNombre(cuidador.nombre) || "Cuidador"}
                  style={{
                    width: "76px",
                    height: "76px",
                    borderRadius: "999px",
                    objectFit: "cover",
                  }}
                />

                <div style={{ flex: "1 1 240px", minWidth: 0 }}>
                  <h3 style={{ color: "#4f46e5", fontWeight: "600", margin: 0 }}>{obtenerPrimerNombre(cuidador.nombre)}</h3>
                  <p style={{ color: "var(--pakal-cyan)", fontSize: "0.95rem", margin: "0.5rem 0" }}>{cuidador.colonia || "Tu colonia"}</p>
                  {cuidador.descripcion && (
                    <p style={{ color: "#555", fontSize: "0.95rem", margin: "0.5rem 0" }}>
                      {cuidador.descripcion}
                    </p>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: "5px", marginTop: "5px" }}>
                    <Star size={16} fill="#fbbf24" color="#fbbf24" />
                    <span>{Number(cuidador.rating || 0).toFixed(1)}</span>
                  </div>
                </div>

                <div className="result-profile-action">
                  <Link
                      to={`/ver-cuidador/${cuidador.id}?servicio=${encodeURIComponent(servicioBusqueda)}`}
                      className="btn-sitter result-profile-button"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "5px",
                        textDecoration: "none",
                      }}
                    >
                      <BookUser size={25} /> Ver perfil
                  </Link>
                </div>
              </article>
            ))
          ) : (
            <p className="text-center">No se encontraron cuidadores para esta busqueda.</p>
          )}
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: "2rem",
          paddingBottom: "2rem",
        }}
      >
        <Link
          to="/buscar"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            textDecoration: "none",
            color: "#4f46e5",
            fontWeight: "600",
            fontSize: "1.1rem",
          }}
        >
          Nueva busqueda <ArrowLeft size={18} />
        </Link>
      </div>
    </div>
  );
}
