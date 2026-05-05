import { useEffect, useState } from "react";
import { auth, db, storage } from "../lib/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "../context/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";
import { useNavigate } from "react-router";

export default function PerfilCuidador() {
  const { user } = useAuth();
  const uid = user?.uid;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [fotoPerfil, setFotoPerfil] = useState("");
  const [codigoPostal, setCodigoPostal] = useState("");
  const [servicios, setServicios] = useState<string[]>([]);
  const [rating, setRating] = useState(0);

  const handleCheckboxChange = (servicio: string) => {
    setServicios(prev => 
      prev.includes(servicio) ? prev.filter(s => s !== servicio) : [...prev, servicio]
    );
  };

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
                setServicios(data.servicios || []);
                setRating(data.rating || 0);
            }
            setLoading(false);
        };

        fetchData();
    }, [uid]);

  // 🔥 Subir imagen
  const handleUpload = async (file: File) => {
    if (!uid) return;

    const storageRef = ref(storage, `users/${uid}/profile.jpg`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    setFotoPerfil(url);
  };

  // 🔥 Guardar perfil
  const handleSave = async () => {
        if (!uid) return;

        const perfilData = {
        nombre,
        descripcion,
        telefono,
        ciudad,
        fotoPerfil,
        codigoPostal,
        servicios,
        rating
        };

        await setDoc(doc(db, "perfiles_cuidadores", uid), perfilData);

        alert("Perfil actualizado");
        navigate("/perfil-cuidador");
    };

  if (loading) return <p>Cargando...</p>;

  return (
    <ProtectedRoute allowedRoles={["cuidador"]}>
        <div className="max-w-3xl mx-auto p-4">
            {/* HEADER */}        
            <div className="bg-white rounded-2xl shadow p-6 mt-4">
                <div className="flex flex-col items-center space-y-3">
                    {/* FOTO */}
                    <img
                        src={fotoPerfil || "/images/default-user.png"}
                        className="w-28 h-28 rounded-full object-cover border-4 border-gray-100 shadow"
                    />
                    <label className="text-sm text-blue-500 cursor-pointer hover:underline">
                        Cambiar foto
                        <input
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                            if (e.target.files?.[0]) {
                            handleUpload(e.target.files[0]);
                            }
                        }}
                        />
                    </label>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow p-6 mt-4">
                <h3 className="font-semibold mb-2">Datos de contacto:</h3>

                {/* NOMBRE  */}
                <h3 className="font-semibold mb-2">Nombre</h3>
                <input className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                />

                {/* ciudad */}
                <h3 className="font-semibold mb-2">Ciudad</h3>
                <select className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                 value={ciudad} required onChange={e => setCiudad(e.target.value)}>
                    <option value="Queretaro">Querétaro</option>
                    <option value="San Juan del Rio">San Juan del Río</option>
                    <option value="El Marques">El Marqués</option>
                    <option value="Corregidora">Corregidora</option>
                    <option value="Juriquilla">Juriquilla</option>
                </select>

                {/* codigo postal */}
                <h3 className="font-semibold mb-2">Codigo Postal</h3>
                <input className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Código Postal"
                value={codigoPostal}
                onChange={(e) => setCodigoPostal(e.target.value)}
                />

                {/* telefono */}
                <h3 className="font-semibold mb-2">Contacto</h3>
                <input className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Teléfono"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                />
            </div>

            {/* DESCRIPCIÓN */}
            <div className="bg-white rounded-2xl shadow p-6 mt-4">
                <h3 className="font-semibold mb-2">Sobre mí</h3>
                <textarea
                className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Describe tus servicios..."
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                />
            </div>
            
            {/* SERVICIOS */}
            <div className="bg-white rounded-2xl shadow p-6 mt-4">
                <div style={{ textAlign: 'left', margin: '10px 0' }}>
                    <p style={{ fontWeight: 'bold' }}>Servicios que ofreces:</p>
                    
                    <div className="grid grid-cols-2 gap-3 mt-3">
  {['Paseo', 'Estética', 'Adiestramiento', 'Alojamiento', 'Veterinario', 'Cremación'].map(s => {
    const activo = servicios.includes(s);

    return (
      <button
        key={s}
        type="button"
        onClick={() => handleCheckboxChange(s)}
        className={`p-3 rounded-xl border text-sm transition
          ${activo 
            ? "bg-blue-500 text-white border-blue-500" 
            : "bg-gray-100 hover:bg-gray-200"}
        `}
      >
        {s}
      </button>
    );
  })}
</div>
                </div>
            </div>

            {/* BOTÓN */}
            <button
                onClick={handleSave}
                className="btn-user w-full mt-6"
            >
                Guardar cambios
            </button>

        </div>
    </ProtectedRoute>
  );
}