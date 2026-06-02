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

export default function DashboardCuidador() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const uid = user?.uid;

  const [loading, setLoading] = useState(true);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [mascotasPorId, setMascotasPorId] = useState<Record<string, any>>({});
  const [chatsPorReserva, setChatsPorReserva] = useState<Record<string, ChatMensaje[]>>({});
  const [observaciones, setObservaciones] = useState<Record<string, string>>({});

  const cargarDatos = async () => {
    if (!uid) {
      setLoading(false);
      return;
    }

    const reservasQuery = query(
      collection(db, "reserva"),
      where("idCuidador", "==", uid),
      where("estatus", "==", "solicitado")
    );
    const reservasSnapshot = await getDocs(reservasQuery);
    const reservasData = reservasSnapshot.docs.map((documento) => ({
      docId: documento.id,
      ...documento.data(),
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
          .map((documento) => ({ docId: documento.id, ...documento.data() }) as ChatMensaje)
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

    const texto = observaciones[reserva.docId]?.trim();

    if (!texto) {
      alert("Escribe una observacion antes de enviar.");
      return;
    }

    try {
      await addDoc(collection(db, "chat"), {
        idReserva: reserva.docId,
        idDueno: reserva.idDueno,
        idCuidador: uid,
        comentario: "Cuidador: " + texto,
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

  if (loading) return <p className="text-center p-6">Cargando...</p>;

  return (
    <ProtectedRoute allowedRoles={["cuidador"]}>
      <div className="max-w-3xl mx-auto p-4">
        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold" style={{ color: "var(--pakal-blue)" }}>
                Panel de cuidador
              </h2>
              <p className="text-sm text-gray-500">
                Revisa tus reservas solicitadas y responde a los dueños.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/perfil-cuidador")}
              className="btn-user"
            >
              Volver al perfil
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 mt-4">
          <h3 className="font-semibold mb-4" style={{ color: "var(--pakal-blue)" }}>
            Reservas solicitadas
          </h3>

          {reservas.length === 0 && (
            <p className="text-gray-500">Aun no tienes reservas solicitadas.</p>
          )}

          {reservas.map((reserva) => {
            const mascota = mascotasPorId[reserva.idMascota];

            return (
              <div key={reserva.docId} className="mt-4 rounded-xl border border-gray-200 p-4">
                <img
                  src={mascota?.fotoMascota || "./mascota_default.webp"}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <p className="font-semibold mt-2" style={{ color: "var(--pakal-cyan)" }}>
                  Reserva solicitada
                </p>
                <p className="text-sm" style={{ color: "var(--pakal-cyan)" }}>
                  Mascota: {mascota?.nombre || "Mascota"}{" "}
                  {mascota?.tipoMascota ? `- ${mascota.tipoMascota}` : ""}
                </p>
                <p className="text-sm" style={{ color: "var(--pakal-cyan)" }}>
                  Peso: {mascota?.peso ? `${mascota.peso} kg` : "Pendiente"} | Estatura:{" "}
                  {mascota?.estatura ? `${mascota.estatura} cm` : "Pendiente"}
                </p>
                <p className="text-sm" style={{ color: "var(--pakal-cyan)" }}>
                  Llegada: {reserva.diaLlegada || "Pendiente"} {reserva.horaLlegada || ""}
                </p>
                {reserva.diaSalida && (
                  <p className="text-sm" style={{ color: "var(--pakal-cyan)" }}>
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
                          color: mensaje.comentario?.startsWith("D")
                            ? "var(--pakal-cyan)"
                            : mensaje.comentario?.startsWith("C")
                              ? "var(--pakal-blue)"
                              : "var(--pakal-dark)",
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
      </div>
    </ProtectedRoute>
  );
}
