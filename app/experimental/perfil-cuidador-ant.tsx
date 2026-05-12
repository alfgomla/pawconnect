import { useEffect, useState } from "react";
import { auth, db, storage } from "../lib/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "../context/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";
import { useNavigate } from "react-router";

const serviciosDisponibles = [
  "Paseo",
  "Estética",
  "Adiestramiento",
  "Alojamiento",
  "Veterinario",
  "Cremación",
];

const diasDisponibles = [
  "Lunes",
  "Martes",
  "Miercoles",
  "Jueves",
  "Viernes",
  "Sabado",
  "Domingo",
];

export default function PerfilCuidador() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const uid = user?.uid;

  // const [nombre, setNombre] = useState("");

  const [loading, setLoading] = useState(true);

  const [descripcion, setDescripcion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [colonia, setColonia] = useState("");
  const [fotoPerfil, setFotoPerfil] = useState("");
  const [codigoPostal, setCodigoPostal] = useState("");
   const [servicios, setServicios] = useState<string[]>([]);
  const [rating, setRating] = useState(0);
  const isComplete = "";

  // 🔥 Cargar datos
  useEffect(() => {
    const fetchData = async () => {
      if (!uid) {
        setLoading(false); // 🔥 IMPORTANTE
        return;
      }
      
      const docRef = doc(db, "perfiles_cuidadores", uid);
      const snap = await getDoc(docRef);
      
      console.log(user);
            if (snap.exists()) {
                const data = snap.data();
                // setNombre(data.nombre || "");
                setDescripcion(data.descripcion || "");
                setTelefono(data.telefono || "");
                setCiudad(data.ciudad || "");
                setFotoPerfil(data.fotoPerfil || "");
                setCodigoPostal(data.codigoPostal || "");
                setServicios(data.servicios || []);
                setRating(data.rating || 0);
                setCodigoPostal(data.codigoPostal || "");
                setColonia(data.colonia || "");
            }
            setLoading(false);
        };

        fetchData();
    }, [uid]);

   if (loading) return <p>Cargando...</p>;

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
        <div className="bg-white rounded-2xl shadow p-6 mt-4">
          <h3 className="font-semibold mb-2">Los servicios con los que contamos:</h3>
          {/* <p className="text-gray-500">{servicios[0]}</p>
          <p className="text-gray-500">{servicios[1]}</p>
          <p className="text-gray-500">{servicios[2]}</p>
          <p className="text-gray-500">{servicios[3]}</p>
          <p className="text-gray-500">{servicios[4]}</p>
          <p className="text-gray-500">{servicios[5]}</p> */}
          {serviciosDisponibles.map(s => {
            const activo = servicios.includes(s);
            return (
              <button key={s} type="button" onClick={() => handleCheckboxChange(s)} 
                className={`${activo ? "btn-user" : "btn-sitter"}`}>
                {s}
              </button>
            );
          })}
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