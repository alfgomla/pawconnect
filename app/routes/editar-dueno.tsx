import { useEffect, useState } from "react";
import { collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useNavigate } from "react-router";
import { db, storage } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";

type MascotaEditable = {
  docId: string;
  nombre: string;
  tipoMascota: string;
  raza: string;
  peso: string;
  estatura: string;
  cartillaVacunacion: boolean;
  observaciones: string;
  fotoMascota: string;
  nuevaFoto?: File;
  previewFoto?: string;
};

export default function EditarPerfilDueno() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [colonia, setColonia] = useState("");
  const [fotoPerfil, setFotoPerfil] = useState("");
  const [nuevaFotoPerfil, setNuevaFotoPerfil] = useState<File | null>(null);
  const [previewFotoPerfil, setPreviewFotoPerfil] = useState("");
  const [mascotas, setMascotas] = useState<MascotaEditable[]>([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const cargarDatos = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      const perfilRef = doc(db, "perfiles_duenos", user.uid);
      const perfilSnap = await getDoc(perfilRef);

      if (perfilSnap.exists()) {
        const data = perfilSnap.data();
        setNombre(data.nombre || profile?.nombre || "");
        setTelefono(data.telefono || "");
        setColonia(data.colonia || "");
        setFotoPerfil(data.fotoPerfil || "");
      } else {
        setNombre(profile?.nombre || "");
      }

      const mascotasQuery = query(collection(db, "mascotas"), where("id", "==", user.uid));
      const mascotasSnap = await getDocs(mascotasQuery);

      setMascotas(
        mascotasSnap.docs.map((mascotaDoc) => {
          const data = mascotaDoc.data();

          return {
            docId: mascotaDoc.id,
            nombre: data.nombre || "",
            tipoMascota: data.tipoMascota || "",
            raza: data.raza || "",
            peso: data.peso?.toString() || "",
            estatura: data.estatura?.toString() || "",
            cartillaVacunacion: Boolean(data.cartillaVacunacion),
            observaciones: data.observaciones || "",
            fotoMascota: data.fotoMascota || "",
          };
        })
      );

      setLoading(false);
    };

    cargarDatos();
  }, [user, profile]);

  const actualizarMascota = (docId: string, cambios: Partial<MascotaEditable>) => {
    setMascotas((prev) =>
      prev.map((mascota) =>
        mascota.docId === docId
          ? {
              ...mascota,
              ...cambios,
            }
          : mascota
      )
    );
  };

  const handleFotoMascota = (docId: string, file?: File) => {
    if (!file) return;

    actualizarMascota(docId, {
      nuevaFoto: file,
      previewFoto: URL.createObjectURL(file),
    });
  };

  const handleFotoPerfil = (file?: File) => {
    if (!file) return;

    setNuevaFotoPerfil(file);
    setPreviewFotoPerfil(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!user) return;

    setGuardando(true);

    try {
      let fotoPerfilUrl = fotoPerfil;

      if (nuevaFotoPerfil) {
        const storageRef = ref(
          storage,
          `duenos/${user.uid}/profile-${Date.now()}-${nuevaFotoPerfil.name}`
        );
        await uploadBytes(storageRef, nuevaFotoPerfil);
        fotoPerfilUrl = await getDownloadURL(storageRef);
      }

      await setDoc(
        doc(db, "perfiles_duenos", user.uid),
        {
          nombre: nombre.trim(),
          telefono: telefono.trim(),
          colonia: colonia.trim().toUpperCase(),
          fotoPerfil: fotoPerfilUrl,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      await Promise.all(
        mascotas.map(async (mascota) => {
          const pesoNumero = Number(mascota.peso);
          const estaturaNumero = Number(mascota.estatura);

          if (!Number.isFinite(pesoNumero) || !Number.isFinite(estaturaNumero)) {
            throw new Error(`Peso o estatura invalidos para ${mascota.nombre || "una mascota"}.`);
          }

          let fotoMascotaUrl = mascota.fotoMascota;

          if (mascota.nuevaFoto) {
            const storageRef = ref(
              storage,
              `mascotas/${user.uid}/${Date.now()}-${mascota.nuevaFoto.name}`
            );
            await uploadBytes(storageRef, mascota.nuevaFoto);
            fotoMascotaUrl = await getDownloadURL(storageRef);
          }

          await updateDoc(doc(db, "mascotas", mascota.docId), {
            nombre: mascota.nombre.trim(),
            tipoMascota: mascota.tipoMascota.trim(),
            raza: mascota.raza.trim(),
            peso: pesoNumero,
            estatura: estaturaNumero,
            cartillaVacunacion: mascota.cartillaVacunacion,
            observaciones: mascota.observaciones.trim(),
            fotoMascota: fotoMascotaUrl,
            updatedAt: new Date().toISOString(),
          });
        })
      );

      alert("Perfil y mascotas actualizados con exito.");
      navigate("/perfil-dueno");
    } catch (error) {
      console.error("Error al guardar perfil de dueno:", error);
      alert("No pudimos guardar los cambios. Revisa los datos e intenta de nuevo.");
    } finally {
      setGuardando(false);
    }
  };

  if (loading) return <p>Cargando...</p>;

  return (
    <ProtectedRoute allowedRoles={["dueno"]}>
      <div className="max-w-3xl mx-auto p-4">
        <div className="bg-white rounded-2xl shadow p-6 mt-4">
          <h2 className="text-2xl font-bold mb-6">Editar mi perfil</h2>

          <div className="space-y-4">
            <div className="flex flex-col items-center gap-3">
              <img
                src={previewFotoPerfil || fotoPerfil || "./mascota_default.webp"}
                className="w-28 h-28 rounded-full object-cover border-4 border-gray-100 shadow"
              />
              <label className="text-sm text-blue-500 cursor-pointer hover:underline">
                Cambiar foto
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFotoPerfil(e.target.files?.[0])}
                />
              </label>
            </div>

            <input
              className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Nombre completo"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
            <input
              className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Telefono"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
            />
            <input
              className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Colonia"
              value={colonia}
              style={{ textTransform: "uppercase" }}
              onChange={(e) => setColonia(e.target.value.toUpperCase())}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 mt-4">
          <h3 className="font-semibold mb-4">Mis mascotas</h3>

          {mascotas.length === 0 && (
            <p className="text-gray-500">Aun no has registrado mascotas.</p>
          )}

          <div className="space-y-4">
            {mascotas.map((mascota) => (
              <section key={mascota.docId} className="border border-gray-200 rounded-xl p-4">
                <div className="flex flex-col items-center gap-3 mb-4">
                  <img
                    src={mascota.previewFoto || mascota.fotoMascota || "./mascota_default.webp"}
                    className="w-28 h-28 rounded-full object-cover border-4 border-gray-100 shadow"
                  />
                  <label className="text-sm text-blue-500 cursor-pointer hover:underline">
                    Cambiar foto
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFotoMascota(mascota.docId, e.target.files?.[0])}
                    />
                  </label>
                </div>

                <div className="grid gap-3">
                  <input
                    className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Nombre"
                    value={mascota.nombre}
                    onChange={(e) => actualizarMascota(mascota.docId, { nombre: e.target.value })}
                  />
                  <input
                    className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Tipo de mascota"
                    value={mascota.tipoMascota}
                    onChange={(e) =>
                      actualizarMascota(mascota.docId, { tipoMascota: e.target.value })
                    }
                  />
                  <input
                    className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Raza"
                    value={mascota.raza}
                    onChange={(e) => actualizarMascota(mascota.docId, { raza: e.target.value })}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder="Peso"
                      value={mascota.peso}
                      onChange={(e) => actualizarMascota(mascota.docId, { peso: e.target.value })}
                    />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder="Estatura"
                      value={mascota.estatura}
                      onChange={(e) =>
                        actualizarMascota(mascota.docId, { estatura: e.target.value })
                      }
                    />
                  </div>
                  <label className="flex items-center gap-3 text-gray-600">
                    <input
                      type="checkbox"
                      checked={mascota.cartillaVacunacion}
                      onChange={(e) =>
                        actualizarMascota(mascota.docId, {
                          cartillaVacunacion: e.target.checked,
                        })
                      }
                    />
                    Cartilla de vacunacion
                  </label>
                  <textarea
                    className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Observaciones"
                    value={mascota.observaciones}
                    onChange={(e) =>
                      actualizarMascota(mascota.docId, { observaciones: e.target.value })
                    }
                  />
                </div>
              </section>
            ))}
          </div>
        </div>

        <button onClick={handleSave} disabled={guardando} className="btn-user w-full mt-6">
          {guardando ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </ProtectedRoute>
  );
}
