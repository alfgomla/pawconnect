import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useNavigate } from "react-router";
import { db, storage } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";

export default function AltaMascota() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [nombre, setNombre] = useState("");
  const [tipoMascota, setTipoMascota] = useState("");
  const [raza, setRaza] = useState("");
  const [peso, setPeso] = useState("");
  const [estatura, setEstatura] = useState("");
  const [cartillaVacunacion, setCartillaVacunacion] = useState(false);
  const [observaciones, setObservaciones] = useState("");
  const [fotoMascota, setFotoMascota] = useState<File | null>(null);
  const [previewFoto, setPreviewFoto] = useState("");
  const [guardando, setGuardando] = useState(false);

  const handleFotoChange = (file?: File) => {
    if (!file) return;

    setFotoMascota(file);
    setPreviewFoto(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert("Necesitas iniciar sesion para registrar una mascota.");
      navigate("/login");
      return;
    }

    const pesoNumero = Number(peso);
    const estaturaNumero = Number(estatura);

    if (!Number.isFinite(pesoNumero) || !Number.isFinite(estaturaNumero)) {
      alert("Peso y estatura deben ser numeros validos.");
      return;
    }

    setGuardando(true);

    try {
      let fotoMascotaUrl = "";

      if (fotoMascota) {
        const storageRef = ref(storage, `mascotas/${user.uid}/${Date.now()}-${fotoMascota.name}`);
        await uploadBytes(storageRef, fotoMascota);
        fotoMascotaUrl = await getDownloadURL(storageRef);
      }

      await addDoc(collection(db, "mascotas"), {
        nombre: nombre.trim(),
        tipoMascota: tipoMascota.trim(),
        raza: raza.trim(),
        peso: pesoNumero,
        estatura: estaturaNumero,
        cartillaVacunacion,
        observaciones: observaciones.trim(),
        fotoMascota: fotoMascotaUrl,
        id: user.uid,
        fechaRegistro: serverTimestamp(),
      });

      alert("Mascota registrada con exito.");
      navigate("/perfil-dueno");
    } catch (error) {
      console.error("Error registrando mascota:", error);
      alert("No pudimos registrar la mascota. Intenta de nuevo.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["dueno"]}>
      <div className="container-form">
        <h2>
          Alta de <span className="text-cyan-500">Mascota</span>
        </h2>
        <p>Registra los datos de tu mascota para solicitar servicios.</p>

        <form onSubmit={handleSubmit} className="card-form">
          <div className="flex flex-col items-center gap-3">
            <img
              src={previewFoto || "./mascota_default.webp"}
              className="w-28 h-28 rounded-full object-cover border-4 border-gray-100 shadow"
            />
            <label className="text-sm text-blue-500 cursor-pointer hover:underline">
              Agregar foto
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFotoChange(e.target.files?.[0])}
              />
            </label>
          </div>

          <input
            type="text"
            placeholder="Nombre"
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />

          <input
            type="text"
            placeholder="Tipo de mascota"
            required
            value={tipoMascota}
            onChange={(e) => setTipoMascota(e.target.value)}
          />

          <input
            type="text"
            placeholder="Raza"
            required
            value={raza}
            onChange={(e) => setRaza(e.target.value)}
          />

          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="Peso"
            required
            value={peso}
            onChange={(e) => setPeso(e.target.value)}
          />

          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="Estatura"
            required
            value={estatura}
            onChange={(e) => setEstatura(e.target.value)}
          />

          <label className="flex items-center gap-3 text-gray-600">
            <input
              type="checkbox"
              checked={cartillaVacunacion}
              onChange={(e) => setCartillaVacunacion(e.target.checked)}
            />
            Cartilla de vacunacion
          </label>

          <textarea
            placeholder="Observaciones"
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
          />

          <button type="submit" className="btn-user" disabled={guardando}>
            {guardando ? "Guardando..." : "Registrar mascota"}
          </button>
        </form>
      </div>
    </ProtectedRoute>
  );
}
