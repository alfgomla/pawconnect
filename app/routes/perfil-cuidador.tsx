import { useEffect, useState } from "react";
import { auth, db, storage } from "../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";
import { useNavigate } from "react-router";

export default function PerfilCuidador() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const uid = user?.uid;

  const [loading, setLoading] = useState(true);

  const [descripcion, setDescripcion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [colonia, setColonia] = useState("");
  const [fotoPerfil, setFotoPerfil] = useState("");
  const [codigoPostal, setCodigoPostal] = useState("");
  const [servicios, setServicios] = useState<string[]>([]);
  const [disponibilidad, setDisponibilidad] = useState<any>({}); // Cambia [] por {}
  const [rating, setRating] = useState(0);
  const isComplete = "";

  // checa si el costo es por dia por hora o consultar los costos
  const checaCosto = (costoDia: number, costoHora: number) => {
    if (costoDia > 0) {
      return "Costo: $" + costoDia.toString() + " por día, ";
    }else if (costoHora > 0) {
      return "Costo: $" + costoHora.toString() + " por hora, ";
    } else {
      return "Consultar los costos, ";
    }
  }  

  // 🔥 Cargar datos
  useEffect(() => {
    const fetchData = async () => {
      if (!uid) {
        setLoading(false); // 🔥 IMPORTANTE
        return;
      }
      
      const docRef = doc(db, "perfiles_cuidadores", uid);
      const snap = await getDoc(docRef);
      
            if (snap.exists()) {
                const data = snap.data();
                setDescripcion(data.descripcion || "");
                setTelefono(data.telefono || "");
                setCiudad(data.ciudad || "");
                setFotoPerfil(data.fotoPerfil || "");
                setCodigoPostal(data.codigoPostal || "");
                setServicios(data.servicios || []);
                setRating(data.rating || 0);
                setCodigoPostal(data.codigoPostal || "");
                setColonia(data.colonia || "");
                setDisponibilidad(data.disponibilidad || []);
            }
            setLoading(false);
        };

        fetchData();
    }, [uid]);
   const x="Paseo";
   if (loading) return <p>Cargando...</p>;
              console.log(disponibilidad?.[x]);

  return (
    <ProtectedRoute allowedRoles={["cuidador"]}>
      <div className="max-w-3xl mx-auto p-4">

        {/* HEADER */}
        <div className="bg-white rounded-2xl shadow p-6 text-center relative">
          
          {/* FOTO */}
          <div className="relative inline-block">
            <img
              src={fotoPerfil || "/images/default-user.png"}
              className="w-36 h-36 rounded-full mx-auto object-cover border-4 border-white shadow"/>     
          </div>

          {/* NOMBRE */}
          <h2 className="text-xl font-bold mt-3">{profile.nombre || "Tu nombre"}</h2>
          
        </div>

        {/* DESCRIPCIÓN */}
        <div className="bg-white rounded-2xl shadow p-6 mt-4">
          <h3 className="font-semibold mb-2">Sobre mí</h3>
          <p className="text-gray-500">{descripcion || "Escribe sobre ti..."}</p>
        </div>

        {/* SERVICIOS */}
        <div className="bg-white rounded-2xl shadow p-6 mt-4 text-center">
          <h3 className="font-semibold mb-2">Los servicios con los que contamos:</h3>
          {/*LISTA DE SERVICIOS*/}
          {servicios.map((s, indexServicios) => (
            <div key={indexServicios} className="bg-white rounded-2xl shadow-md p-1 mt-3 border-1 border-blue-400">
              <p className="text-gray-500" >{s}</p>
              {disponibilidad?.[s]?.dias?.map((dia: string, indexDia: number) => (                
                  <span key={indexDia} className="text-gray-500">{dia} </span>
              ))}

              <p className="text-cyan-600 font-medium">
                {checaCosto(disponibilidad?.[s]?.costoPorDia, disponibilidad?.[s]?.costoPorHora)}
                 en un horario de {disponibilidad?.[s]?.horaInicio} a {disponibilidad?.[s]?.horaFin}
              </p>

            </div>
        ))}
        </div>

        <div className="bg-white rounded-2xl shadow p-6 mt-4">
          <h3 className="font-semibold mb-2">Calificacion de los clientes:</h3>
          <p className="text-gray-500">{rating.toFixed(1)}</p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 mt-4">
          <h3 className="font-semibold mb-2">Contactame:</h3>
          <p className="text-gray-500">Celular: {telefono || "Tu teléfono"}</p>
          <p className="text-gray-500">Correo: {user?.email || "Tu correo"}</p>
          <p className="text-gray-500">Código Postal: {codigoPostal || "Tu código postal"}</p>
          <p className="text-gray-500">Ciudad: {ciudad || "Tu ciudad"}</p>
          <p className="text-gray-500">Colonia: {colonia || "Tu colonia"}</p>
        </div>

          {/* BOTÓN */}
          <div className="bg-white rounded-2xl shadow p-6 mt-4 space-y-4">

            {/* EDITAR */}
            <button
              onClick={() => navigate("/editar-cuidador")}
              className="w-full py-3 rounded-xl bg-blue-500 text-white font-semibold hover:bg-blue-600 transition"
            >
              ✏️ Editar perfil
            </button>

            {/* PANEL */}
            <button
              disabled={!isComplete}
              onClick={() => navigate("/dashboard-cuidador")}
              className={`w-full py-3 rounded-xl font-semibold transition
                ${isComplete 
                  ? "bg-green-500 text-white hover:bg-green-600" 
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"}
              `}
            >
              📊 Panel
            </button>

            {!isComplete && (
              <p className="text-sm text-red-500 text-center">
                Completa tu perfil para acceder al panel
              </p>
            )}
          </div>
      </div>
    </ProtectedRoute>
  );
}