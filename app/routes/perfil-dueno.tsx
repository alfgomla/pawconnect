import { useEffect, useState } from "react";
import { auth, db } from "../lib/firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";
import { useNavigate } from "react-router";

export default function PerfilDueno() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [data, setData] = useState<any>(null);
  const [mascotas, setMascotas] = useState<any[]>([]);
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [colonia, setColonia] = useState("");
  const [fotoPerfil, setFotoPerfil] = useState("");

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      // 1. Obtener perfil
      const docRef = doc(db, "perfiles_duenos", user.uid);
      console.log("Obteniendo perfil para UID:", user.uid);
      console.log("DocRef:", docRef.path);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const duenoData = snap.data();
          setNombre(duenoData.nombre || "");
          setTelefono(duenoData.telefono || "");
          setColonia(duenoData.colonia || "");
          setFotoPerfil(duenoData.fotoPerfil || "");

        // 2. Obtener mascotas relacionadas
        if (duenoData.mascotasIds?.length > 0) {
          const q = query(collection(db, "mascotas"), where("id", "in", duenoData.mascotasIds));
          const querySnapshot = await getDocs(q);
          setMascotas(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }
      }
    };
    fetchData();
  }, [user]);

  return (
    <ProtectedRoute allowedRoles={["dueno"]}>
      <div className="max-w-3xl mx-auto p-4">
        {/* HEADER */}
        <div className="bg-white rounded-2xl shadow p-6 text-center">
          <img src={fotoPerfil || "./mascota_default.webp"} className="w-32 h-32 rounded-full mx-auto object-cover" />
          <h2 className="text-2xl font-bold mt-3">{nombre || profile?.nombre}</h2>
          <p className="text-gray-500">Colonia: {colonia || "No especificada"}</p>
          <p className="text-gray-500">Teléfono: {telefono || "XXXXXXXXXX"}</p>
        </div>

        {/* MASCOTAS */}
        <div className="bg-white rounded-2xl shadow p-6 mt-4">
          <h3 className="font-semibold mb-4">Mis Mascotas</h3>
          {mascotas.map((m) => (
            <div key={m.id} className="flex items-center gap-4 border-b pb-4 mb-4">
              <img src={m.fotoMascota} className="w-16 h-16 rounded-full object-cover" />
              <div>
                <p className="font-bold">{m.nombre}</p>
                <p className="text-sm text-gray-500">Tamaño: {m.tamano.toUpperCase()}</p>
              </div>
            </div>
          ))}
        </div>

        {/* BOTONES */}
        <div className="flex gap-4 mt-6">
          <button onClick={() => navigate("/editar-dueno")} className="flex-1 py-3 bg-blue-500 text-white rounded-xl">Editar Perfil</button>
          <button onClick={() => navigate("/alta-mascota")} className="flex-1 py-3 bg-blue-500 text-white rounded-xl">Agregar mascota</button>
          <button onClick={() => navigate("/buscar")} className="flex-1 py-3 bg-cyan-500 text-white rounded-xl">Buscar Cuidadores</button>
        </div>
      </div>
    </ProtectedRoute>
  );
}