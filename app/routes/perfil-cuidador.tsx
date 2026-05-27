import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { useNavigate } from "react-router";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";

type Reserva = {
  docId: string;
  idDueno: string;
  idCuidador: string;
  idMascota: string;
  estatus: string;
  diaLlegada?: string;
  horaLlegada?: string;
  diaSalida?: string;
  horaSalida?: string;
};

type ChatMensaje = {
  docId: string;
  idReserva: string;
  idDueno: string;
  idCuidador: string;
  comentario: string;
  fechaHora?: any;
};

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
  const [disponibilidad, setDisponibilidad] = useState<any>({});
  const [rating, setRating] = useState(0);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [mascotasPorId, setMascotasPorId] = useState<Record<string, any>>({});
  const [chatsPorReserva, setChatsPorReserva] = useState<Record<string, ChatMensaje[]>>({});
  const [observaciones, setObservaciones] = useState<Record<string, string>>({});

  const isComplete = "";

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
      setCodigoPostal(data.codigoPostal || "");
      setServicios(data.servicios || []);
      setRating(data.rating || 0);
      setColonia(data.colonia || "");
      setDisponibilidad(data.disponibilidad || {});
    }

    const reservasQuery = query(
      collection(db, "reserva"),
      where("idCuidador", "==", uid),
      where("estatus", "==", "solicitado")
    );
    const reservasSnapshot = await getDocs(reservasQuery);
    const reservasData = reservasSnapshot.docs.map((doc) => ({
      docId: doc.id,
      ...doc.data(),
    })) as Reserva[];
    setReservas(reservasData);

    const mascotasEntries = await Promise.all(
      reservasData.map(async (reserva) => {
        const mascotaSnap = await getDoc(doc(db, "mascotas", reserva.idMascota));
        return [
          reserva.idMascota,
          mascotaSnap.exists() ? { docId: mascotaSnap.id, ...mascotaSnap.data() } : null,
        ] as const;
      })
    );
    setMascotasPorId(Object.fromEntries(mascotasEntries.filter(([, mascota]) => mascota)));

    const chatsEntries = await Promise.all(
      reservasData.map(async (reserva) => {
        const chatQuery = query(
          collection(db, "chat"),
          where("idReserva", "==", reserva.docId),
          where("idCuidador", "==", uid)
        );
        const chatSnapshot = await getDocs(chatQuery);
        const mensajes = chatSnapshot.docs
          .map((doc) => ({ docId: doc.id, ...doc.data() }) as ChatMensaje)
          .sort((a, b) => {
            const fechaA = a.fechaHora?.toMillis?.() || 0;
            const fechaB = b.fechaHora?.toMillis?.() || 0;
            return fechaB - fechaA;
          });

        return [reserva.docId, mensajes] as const;
      })
    );
    setChatsPorReserva(Object.fromEntries(chatsEntries));
    setLoading(false);
  };

  useEffect(() => {
    cargarDatos();
  }, [uid]);

  const enviarObservacion = async (reserva: Reserva) => {
    if (!uid) return;

    const comentario = "Cuidador: " + observaciones[reserva.docId]?.trim();

    if (!comentario) {
      alert("Escribe una observacion antes de enviar.");
      return;
    }

    try {
      await addDoc(collection(db, "chat"), {
        idReserva: reserva.docId,
        idDueno: reserva.idDueno,
        idCuidador: uid,
        comentario,
        fechaHora: serverTimestamp(),
      });

      setObservaciones((prev) => ({ ...prev, [reserva.docId]: "" }));
      await cargarDatos();
    } catch (error) {
      console.error("Error enviando observacion:", error);
      alert("No pudimos enviar la observacion. Intenta de nuevo.");
    }
  };

  const formatearFecha = (fechaHora?: any) => {
    const fecha = fechaHora?.toDate?.();
    return fecha ? fecha.toLocaleString("es-MX") : "Enviado";
  };

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
          <p className="text-gray-500">Codigo Postal: {codigoPostal || "Tu codigo postal"}</p>
          <p className="text-gray-500">Ciudad: {ciudad || "Tu ciudad"}</p>
          <p className="text-gray-500">Colonia: {colonia || "Tu colonia"}</p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 mt-4 space-y-4">
          <button
            onClick={() => navigate("/editar-cuidador")}
            className="w-full py-3 rounded-xl bg-blue-500 text-white font-semibold hover:bg-blue-600 transition"
          >
            Editar perfil
          </button>
          <button
            disabled={!isComplete}
            onClick={() => navigate("/dashboard-cuidador")}
            className={`w-full py-3 rounded-xl font-semibold transition
              ${isComplete
                ? "bg-green-500 text-white hover:bg-green-600"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"}
            `}
          >
            Panel
          </button>
          {!isComplete && (
            <p className="text-sm text-red-500 text-center">
              Completa tu perfil para acceder al panel
            </p>
          )}
        </div>

        {reservas.length > 0 && (
          <div className="bg-white rounded-2xl shadow p-6 mt-4">
            <h3 className="font-semibold mb-4" style={{ color: "var(--pakal-blue)" }}>
              Reservas solicitadas
            </h3>

            {reservas.map((reserva) => {
              const mascota = mascotasPorId[reserva.idMascota];

              return (
                <div key={reserva.docId} className="mt-4 rounded-xl border border-gray-200 p-4">
                  <img
                  src={mascota?.fotoMascota || "./mascota_default.webp"}
                  className="w-16 h-16 rounded-full object-cover"
                />
                  <p className="font-semibold" style={{ color: "var(--pakal-cyan"}}>Reserva solicitada</p>
                  <p className="text-sm" style={{ color: "var(--pakal-cyan"}}>
                    Mascota: {mascota?.nombre || "Mascota"} {mascota?.tipoMascota ? `- ${mascota.tipoMascota}` : ""}
                  </p>
                  <p className="text-sm" style={{ color: "var(--pakal-cyan"}}>
                    Peso: {mascota?.peso+ " kg" || "Pendiente"} | Estatura: {mascota?.estatura+ " cm" || "Pendiente"}
                  </p>
                  <p className="text-sm" style={{ color: "var(--pakal-cyan"}}>
                    Llegada: {reserva.diaLlegada || "Pendiente"} {reserva.horaLlegada || ""}
                  </p>
                  {reserva.diaSalida && (
                    <p className="text-sm" style={{ color: "var(--pakal-cyan"}}>
                      Salida: {reserva.diaSalida} {reserva.horaSalida || ""}
                    </p>
                  )}

                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Observaciones</h4>
                    <textarea
                      className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder="Escribe una respuesta o comentario del servicio..."
                      value={observaciones[reserva.docId] || ""}
                      onChange={(e) =>
                        setObservaciones((prev) => ({
                          ...prev,
                          [reserva.docId]: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="grid gap-2 mt-4">
                    {(chatsPorReserva[reserva.docId] || []).map((mensaje) => (
                      <div key={mensaje.docId} className="rounded-xl bg-gray-100 p-3">
                        <p className="text-sm text-gray-500">{formatearFecha(mensaje.fechaHora)}</p>
                        <p 
                          className="text-gray-700" 
                          style={{
                            color: mensaje.comentario?.startsWith('D') 
                              ? 'var(--pakal-cyan)' 
                              : mensaje.comentario?.startsWith('C') 
                                ? 'var(--pakal-blue)' 
                                : 'var(--pakal-dark)' // Color por defecto si no empieza ni con D ni con C
                          }}
                        >
                          {mensaje.comentario}
                        </p>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => enviarObservacion(reserva)}
                    className="btn-sitter w-full mt-4"
                  >
                    Enviar
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
