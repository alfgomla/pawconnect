import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";

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
  const [codigo, setCodigo] = useState("");
  const [servicios, setServicios] = useState<string[]>([]);
  const [disponibilidad, setDisponibilidad] = useState<any>({});
  const [rating, setRating] = useState(0);

  const checaCosto = (costoDia: number, costoHora: number) => {
    if (costoDia > 0) return "Costo: $" + costoDia.toString() + " por dia, ";
    if (costoHora > 0) return "Costo: $" + costoHora.toString() + " por hora, ";
    return "Consultar los costos, ";
  };

  const cargarDatos = async () => {
    if (!uid) {
      setLoading(false);
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
      setCodigo(data.codigo || "");
      setServicios(data.servicios || []);
      setRating(data.rating || 0);
      setColonia(data.colonia || "");
      setDisponibilidad(data.disponibilidad || {});
    }

    setLoading(false);
  };

  useEffect(() => {
    cargarDatos();
  }, [uid]);

  if (loading) return <p>Cargando...</p>;

  return (
    <ProtectedRoute allowedRoles={["cuidador"]}>
      <div className="max-w-3xl mx-auto p-4">
        <div className="bg-white rounded-2xl shadow p-6 text-center relative">
          <div className="relative inline-block">
            <img
              src={fotoPerfil || "/images/default-user.png"}
              className="w-36 h-36 rounded-full mx-auto object-cover border-4 border-white shadow"
            />
          </div>
          <h2 className="text-xl font-bold mt-3">{profile.nombre || "Tu nombre"}</h2>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 mt-4">
          <h3 className="font-semibold mb-2">Sobre mi</h3>
          <p className="text-gray-500">{descripcion || "Escribe sobre ti..."}</p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 mt-4 text-center">
          <h3 className="font-semibold mb-2">Los servicios con los que contamos:</h3>
          {servicios.map((s, indexServicios) => (
            <div key={indexServicios} className="bg-white rounded-2xl shadow-md p-1 mt-3 border-1 border-blue-400">
              <p className="text-gray-500">{s}</p>
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
          <p className="text-gray-500">Celular: {telefono || "Tu telefono"}</p>
          <p className="text-gray-500">Correo: {user?.email || "Tu correo"}</p>
          <p className="text-gray-500">Ciudad: {ciudad || "Tu ciudad"}</p>
          <p className="text-gray-500">Colonia: {colonia || "Tu colonia"}</p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 mt-4 space-y-4">
          <div className="flex justify-center gap-4 mt-6">
            <button
              disabled={codigo === "revision"}
              onClick={() => navigate("/editar-cuidador")}
              className={codigo === "revision" ? "btn-desactivar w-full mt-4" : "btn-user w-full mt-4"}
            >
              Editar perfil
            </button>
            <button
              disabled={codigo === "incompleto" || codigo === "" || codigo === "revision"}
              onClick={() => navigate("/dashboard-cuidador")}
              className={codigo === "completo" ? "btn-user w-full mt-4" : "btn-desactivar w-full mt-4"}
            >
              Panel
            </button>

          </div>

          <p className="text-sm text-red-500 text-center">
            {codigo === "" || codigo === "incompleto" 
              ? "Completa tu perfil para acceder al panel" 
              : codigo === "revision" 
                ? "Una vez revisados tus datos por el equipo de PawConnect, podrás acceder al panel, cualquier duda comunicate con nosotros a través de nuestro correo de soporte. sistemas@pawconnect.com" 
                : "Sus datos han sido confirmados, cualquier cambio posterior será revisado nuevamente"}
          </p>
        </div>

      </div>
    </ProtectedRoute>
  );
}
