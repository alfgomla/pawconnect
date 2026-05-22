import { useState, useEffect } from "react";
import { auth, db, storage } from "../lib/firebase";
import { doc, getDoc, setDoc, collection, addDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router";
import ProtectedRoute from "../components/ProtectedRoute";

export default function EditarPerfilDueno() {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [colonia, setColonia] = useState("");
  const [loading, setLoading] = useState(false);

  // Cargar datos actuales
  useEffect(() => {
    const cargarDatos = async () => {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, "perfiles_duenos", user.uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          setNombre(data.nombre || "");
          setTelefono(data.telefono || "");
          setColonia(data.colonia || "");
        }
      }
    };
    cargarDatos();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        await setDoc(doc(db, "perfiles_duenos", user.uid), {
          nombre,
          telefono,
          colonia,
          updatedAt: new Date().toISOString()
        }, { merge: true });
        
        alert("Perfil actualizado con éxito");
        navigate("/perfil-dueno");
      }
    } catch (error) {
      alert("Error al guardar: " + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["dueno"]}>
      <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow mt-10">
        <h2 className="text-2xl font-bold mb-6">Editar mi Perfil</h2>
        
        <div className="space-y-4">
          <input 
            className="w-full border p-3 rounded-lg" 
            placeholder="Nombre completo" 
            value={nombre} 
            onChange={(e) => setNombre(e.target.value)} 
          />
          <input 
            className="w-full border p-3 rounded-lg" 
            placeholder="Teléfono" 
            value={telefono} 
            onChange={(e) => setTelefono(e.target.value)} 
          />
          <input 
            className="w-full border p-3 rounded-lg" 
            placeholder="Colonia" 
            value={colonia} 
            onChange={(e) => setColonia(e.target.value)} 
          />
          
          <button 
            onClick={handleSave} 
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold"
          >
            {loading ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </div>
    </ProtectedRoute>
  );
}