import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { db } from "../lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { Star, Phone, ArrowRight } from "lucide-react";
import { ArrowLeft } from "lucide-react"; // Opcional: para un icono de flecha

export default function Results() {
  const [searchParams] = useSearchParams();
  const [cuidadores, setCuidadores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const ciudadBusqueda = searchParams.get("ciudad");
  const servicioBusqueda = searchParams.get("servicio");

  useEffect(() => {
    const fetchCuidadores = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, "cuidadores"),
          where("ciudad", "==", ciudadBusqueda),
          where("servicios", "array-contains", servicioBusqueda)
        );

        const querySnapshot = await getDocs(q);
        const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCuidadores(docs);
      } catch (error) {
        console.error("Error buscando:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCuidadores();
  }, [ciudadBusqueda, servicioBusqueda]);

  return (
    <div>
      
      {/* <h1 style={{ textTransform: 'capitalize' }} className="hero-text">
        Resultados para {servicioBusqueda} en {ciudadBusqueda} 🐾
      </h1> */}

      <section className="hero-text" >
        <h2 style={{ padding: '2rem 0 0 0', textAlign: 'center' }}>Resultados para {servicioBusqueda} en {ciudadBusqueda} 🐾</h2>
      </section>
      
      {loading ? <p>Buscando a los mejores cuidadores...</p> : (
        <div style={{ display: 'grid', gap: '1rem', marginTop: '2rem' }}>
          {cuidadores.length > 0 ? cuidadores.map(c => (
            <div key={c.id} className="card-form" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0 }}>{c.nombre}</h3>
                <p style={{ color: '#666', fontSize: '0.9rem' }}>📍 {c.ciudad}</p>
                <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                  <Star size={16} fill="#fbbf24" color="#fbbf24" />
                  <span>{c.rating}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <a href={`tel:${c.telefono}`} className="btn-sitter" style={{ display: 'flex', alignItems: 'center', gap: '5px', textDecoration: 'none' }}>
                  <Phone size={16} /> Contactar
                </a>
              </div>
            </div>
          )) : <p>No se encontraron cuidadores para esta búsqueda.</p>}
        </div>
        
      )}
            {/* ... después del mapeo de cuidadores */}

      <div style={{ 
        display: 'flex', 
        justifyContent: 'flex-end', // Esto lo justifica a la derecha
        marginTop: '2rem',
        paddingBottom: '2rem' 
      }}>
        <Link to="/buscar" style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '8px', 
          textDecoration: 'none', 
          color: '#4f46e5',
          fontWeight: '600',
          fontSize: '1.1rem' 
        }}>
          Nueva búsqueda <ArrowLeft size={18} /> 
        </Link>
      </div>
    </div>
  );
}
