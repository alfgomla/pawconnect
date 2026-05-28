import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
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

export default function PerfilDueno() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [mascotas, setMascotas] = useState<any[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [chatsPorReserva, setChatsPorReserva] = useState<Record<string, ChatMensaje[]>>({});
  const [observaciones, setObservaciones] = useState<Record<string, string>>({});
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [colonia, setColonia] = useState("");
  const [fotoPerfil, setFotoPerfil] = useState("");

  const cargarDatos = async () => {
    if (!user) return;

    const docRef = doc(db, "perfiles_duenos", user.uid);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const duenoData = snap.data();
      setNombre(duenoData.nombre || "");
      setTelefono(duenoData.telefono || "");
      setColonia(duenoData.colonia || "");
      setFotoPerfil(duenoData.fotoPerfil || "");
    }

    const mascotasQuery = query(collection(db, "mascotas"), where("id", "==", user.uid));
    const mascotasSnapshot = await getDocs(mascotasQuery);
    setMascotas(mascotasSnapshot.docs.map((doc) => ({ docId: doc.id, ...doc.data() })));

    const reservasQuery = query(
      collection(db, "reserva"),
      where("idDueno", "==", user.uid),
      where("estatus", "==", "solicitado")
    );
    const reservasSnapshot = await getDocs(reservasQuery);
    const reservasData = reservasSnapshot.docs.map((doc) => ({
      docId: doc.id,
      ...doc.data(),
    })) as Reserva[];
    setReservas(reservasData);

    const chatsEntries = await Promise.all(
      reservasData.map(async (reserva) => {
        const chatQuery = query(
          collection(db, "chat"),
          where("idReserva", "==", reserva.docId),
          where("idDueno", "==", user.uid)
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
  };

  useEffect(() => {
    cargarDatos();
  }, [user]);

  const cancelarReserva = async (reserva: Reserva) => {
    const confirmar = window.confirm("¿Deseas cancelar esta reserva?");

    if (!confirmar) return;

    try {
      await updateDoc(doc(db, "reserva", reserva.docId), {
        estatus: "cancelado: "+ new Date().toLocaleDateString('en-US', {timeZone: 'America/Mexico_City'})
        + " " 
        + new Date().toLocaleTimeString('es-MX', {timeZone: 'America/Mexico_City', hour12: true})
      });

      setReservas((prev) => prev.filter((item) => item.docId !== reserva.docId));
      setChatsPorReserva((prev) => {
        const siguiente = { ...prev };
        delete siguiente[reserva.docId];
        return siguiente;
      });
    } catch (error) {
      console.error("Error cancelando reserva:", error);
      alert("No pudimos cancelar la reserva. Intenta de nuevo.");
    }
  };


  const enviarObservacion = async (reserva: Reserva) => {
    if (!user) return;

    const comentario = "Dueño: " + observaciones[reserva.docId]?.trim();

    if (!comentario) {
      alert("Escribe una observacion antes de enviar.");
      return;
    }

    try {
      await addDoc(collection(db, "chat"), {
        idReserva: reserva.docId,
        idDueno: user.uid,
        idCuidador: reserva.idCuidador,
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

  const reservasPorMascota = (mascotaId: string) =>
    reservas.filter((reserva) => reserva.idMascota === mascotaId);

  return (
    <ProtectedRoute allowedRoles={["dueno"]}>
      <div className="max-w-3xl mx-auto p-4">
        <div className="bg-white rounded-2xl shadow p-6 text-center">
          <img
            src={fotoPerfil || "./mascota_default.webp"}
            className="w-32 h-32 rounded-full mx-auto object-cover"
          />
          <h2 className="text-2xl font-bold mt-3" style={{ color: 'var(--pakal-blue)' }}>
            {nombre || profile?.nombre}
          </h2>
          <p className="text-gray-500">Colonia: {colonia || "No especificada"}</p>
          <p className="text-gray-500">Telefono: {telefono || "XXXXXXXXXX"}</p>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 mt-4">
          <h3 className="font-semibold mb-4">Mis Mascotas</h3>
          {mascotas.map((m) => (
            <div key={m.docId} className="border-b pb-4 mb-4">
              <div className="flex items-center gap-4">
                <img
                  src={m.fotoMascota || "./mascota_default.webp"}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <p className="font-bold">{m.nombre}</p>
                  <p className="text-sm text-gray-500">{m.tipoMascota} - {m.raza}</p>
                  <p className="text-sm text-gray-500">Peso: {m.peso} | Estatura: {m.estatura}</p>
                  <p className="text-sm text-gray-500">
                    Cartilla: {m.cartillaVacunacion ? "Si" : "No"}
                  </p>
                </div>
              </div>

              {reservasPorMascota(m.docId).map((reserva) => (
                <div key={reserva.docId} className="mt-4 rounded-xl border border-gray-200 p-4">
                  <p className="font-semibold">Reserva solicitada</p>
                  <p className="text-sm text-gray-500">
                    Llegada: {reserva.diaLlegada || "Pendiente"} {reserva.horaLlegada || ""}
                  </p>
                  {reserva.diaSalida && (
                    <p className="text-sm text-gray-500">
                      Salida: {reserva.diaSalida} {reserva.horaSalida || ""}
                    </p>
                  )}

                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Observaciones</h4>
                    <textarea
                      className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                      placeholder="Escribe una pregunta o comentario del servicio..."
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
                        {/* <p className="text-gray-700">{mensaje.comentario}</p> */}
                        <p                     
                          style={{
                            color: mensaje.comentario?.startsWith('D') 
                              ? 'var(--pakal-cyan)' 
                              : mensaje.comentario?.startsWith('C') 
                                ? 'var(--pakal-blue)' 
                                : 'var(--pakal-dark)' // Color por defecto si no empieza ni con D ni con C
                          }}
                        >
                          {mensaje.comentario+"si estoy aqui"}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                    <button
                      type="button"
                      onClick={() => enviarObservacion(reserva)}
                      className="btn-sitter"
                    >
                      Enviar
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(`/pago?reserva=${reserva.docId}`)}
                      className="btn-user"
                    >
                      Pagar
                    </button>
                    <button
                      type="button"
                      onClick={() => cancelarReserva(reserva)}
                      className="btn-sitter"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}
          {mascotas.length === 0 && (
            <p className="text-gray-500">Aun no has registrado mascotas.</p>
          )}
        </div>

        <div className="flex justify-center gap-4 mt-6">
          <button 
            onClick={() => navigate("/editar-dueno")}
            className="btn-user-fill flex-1 w-1/3"
          >
            Editar Perfil
          </button>
          <button
            onClick={() => navigate("/alta-mascota")}
            className="btn-user-fill flex-1 w-1/3"
          >
            Agregar mascota
          </button>
          <button
            onClick={() => navigate("/buscar")}
            className="btn-user-fill flex-1 w-1/3"
          >
            Buscar Cuidadores
          </button>
        </div>
      </div>
    </ProtectedRoute>
  );
}
