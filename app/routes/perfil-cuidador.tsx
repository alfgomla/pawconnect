import { useEffect, useState } from "react";
import { auth, db, storage } from "../lib/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "../context/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";
import { useNavigate } from "react-router";

export default function PerfilCuidador() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const uid = user?.uid;

  const [loading, setLoading] = useState(true);

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [fotoPerfil, setFotoPerfil] = useState("");
  const [codigoPostal, setCodigoPostal] = useState("");
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

            if (snap.exists()) {
                const data = snap.data();
                setNombre(data.nombre || "");
                setDescripcion(data.descripcion || "");
                setTelefono(data.telefono || "");
                setCiudad(data.ciudad || "");
                setFotoPerfil(data.fotoPerfil || "");
                setCodigoPostal(data.codigoPostal || "");
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
              className="w-28 h-28 rounded-full mx-auto object-cover border-4 border-white shadow"/>     
          </div>

          {/* NOMBRE */}
          <h2 className="text-xl font-bold mt-3">{nombre || "Tu nombre"}</h2>
          {/* ciudad */}    
          <p className="text-gray-500">{ciudad || "Tu ciudad"}</p>

        </div>

        {/* DESCRIPCIÓN */}
        <div className="bg-white rounded-2xl shadow p-6 mt-4">
          <h3 className="font-semibold mb-2">Sobre mí</h3>
          <p className="text-gray-500">{descripcion || "Escribe sobre ti..."}</p>
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