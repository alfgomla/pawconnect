import { useEffect, useState } from "react";
import { auth, db, storage } from "../lib/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "../context/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";

export default function PerfilCuidador() {
  const { user } = useAuth();
  const uid = user?.uid;

  const [loading, setLoading] = useState(true);

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [fotoPerfil, setFotoPerfil] = useState("");

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
    };

    await setDoc(doc(db, "perfiles_cuidadores", uid), perfilData);

    // 🔥 validar si está completo
    const completo =
      nombre && descripcion && telefono && ciudad && fotoPerfil;

    await updateDoc(doc(db, "usuarios", uid), {
      completo: !!completo,
    });

    alert("Perfil actualizado");
  };

  if (loading) return <p>Cargando...</p>;

  return (
    <ProtectedRoute allowedRoles={["cuidador"]}>
      <div className="max-w-3xl mx-auto p-4">

      {/* HEADER */}
      <div className="bg-white rounded-2xl shadow p-6 text-center">
        
        {/* FOTO */}
        <div className="relative">
          <img
            src={fotoPerfil || "/images/default-user.png"}
            className="w-28 h-28 rounded-full mx-auto object-cover border-4 border-white shadow"
          />

          <input
            type="file"
            className="mt-2"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                handleUpload(e.target.files[0]);
              }
            }}
          />
        </div>

        {/* NOMBRE */}
        <h2 className="text-xl font-bold mt-3">{nombre || "Tu nombre"}</h2>
        <p className="text-gray-500">{ciudad || "Tu ciudad"}</p>

      </div>

      {/* DESCRIPCIÓN */}
      <div className="bg-white rounded-2xl shadow p-6 mt-4">
        <h3 className="font-semibold mb-2">Sobre mí</h3>
        <textarea
          className="w-full border p-2 rounded"
          placeholder="Describe tus servicios..."
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />
      </div>

      {/* CONTACTO */}
      <div className="bg-white rounded-2xl shadow p-6 mt-4">
        <h3 className="font-semibold mb-2">Contacto</h3>
        <input
          className="w-full border p-2 rounded"
          placeholder="Teléfono"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
        />
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