import { useEffect, useRef, useState } from "react";
import { auth, db, storage } from "../lib/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "../context/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";
import { useNavigate } from "react-router";

const ubicacionDefault = {
  latitudIni: 20.600713,
  longitudIni: -100.420944,
};

type LocationPickerProps = {
  latitud: string;
  longitud: string;
  onChange: (latitud: number, longitud: number) => void;
};

function LocationPicker({ latitud, longitud, onChange }: LocationPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const markerRef = useRef<import("leaflet").Marker | null>(null);

  const latitudMapa = Number.isFinite(Number(latitud)) ? Number(latitud) : ubicacionDefault.latitudIni;
  const longitudMapa = Number.isFinite(Number(longitud)) ? Number(longitud) : ubicacionDefault.longitudIni;

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    let isMounted = true;

    const initMap = async () => {
      const leaflet = await import("leaflet");
      await import("leaflet/dist/leaflet.css");

      if (!isMounted || !mapContainerRef.current || mapRef.current) return;

    leafletRef.current = leaflet;

    const pinIcon = leaflet.divIcon({
      className: "",
      html: `<div style="
        width: 22px;
        height: 22px;
        border-radius: 999px 999px 999px 0;
        background: #06b6d4;
        border: 3px solid white;
        box-shadow: 0 8px 18px rgba(0,0,0,.25);
        transform: rotate(-45deg);
      "></div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 28],
    });

    const map = leaflet.map(mapContainerRef.current).setView([latitudMapa, longitudMapa], 12);

    leaflet.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    const marker = leaflet.marker([latitudMapa, longitudMapa], {
      draggable: true,
      icon: pinIcon,
    }).addTo(map);

    marker.on("dragend", () => {
      const position = marker.getLatLng();
      onChange(position.lat, position.lng);
    });

    map.on("click", (event: import("leaflet").LeafletMouseEvent) => {
      marker.setLatLng(event.latlng);
      onChange(event.latlng.lat, event.latlng.lng);
    });

    mapRef.current = map;
    markerRef.current = marker;
    };

    initMap();

    return () => {
      isMounted = false;
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!leafletRef.current || !mapRef.current || !markerRef.current) return;

    const nextPosition = leafletRef.current.latLng(latitudMapa, longitudMapa);
    markerRef.current.setLatLng(nextPosition);
    mapRef.current.setView(nextPosition, mapRef.current.getZoom());
  }, [latitudMapa, longitudMapa]);

  return (
    <div
      ref={mapContainerRef}
      style={{
        width: "100%",
        aspectRatio: "1 / 1",
        borderRadius: "16px",
        overflow: "hidden",
        border: "1px solid #e5e7eb",
        background: "#f3f4f6",
      }}
    />
  );
}

export default function PerfilCuidador() {
  const { user, profile } = useAuth();
  const uid = user?.uid;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [descripcion, setDescripcion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [colonia, setColonia] = useState("");
  const [fotoPerfil, setFotoPerfil] = useState("");
  const [codigoPostal, setCodigoPostal] = useState("");
  const [servicios, setServicios] = useState<string[]>([]);
  const [rating, setRating] = useState(0);
  const [latitud, setLatitud] = useState("");
  const [longitud, setLongitud] = useState("");

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
                setDescripcion(data.descripcion || "");
                setTelefono(data.telefono || "");
                setCiudad(data.ciudad || "");
                setColonia(data.colonia || ""); 
                setFotoPerfil(data.fotoPerfil || "");
                setCodigoPostal(data.codigoPostal || "");
                setServicios(data.servicios || []);
                setRating(data.rating || 0);
                setLatitud(data.ubicacion?.latitud?.toString() || "");
                setLongitud(data.ubicacion?.longitud?.toString() || "");
                // Validar si la ubicación existe y no es 0
                const lat = data.ubicacion?.latitud;
                const lng = data.ubicacion?.longitud;
                if (lat && lng && lat !== 0 && lng !== 0) {
                setLatitud(lat.toString());
                setLongitud(lng.toString());
                } else {
                    // Si es 0 o no existe, usamos el default
                    setLatitud(ubicacionDefault.latitudIni.toString());
                    setLongitud(ubicacionDefault.longitudIni.toString());
                }
            } else {
                // Si el documento ni siquiera existe, ponemos los defaults
                setLatitud(ubicacionDefault.latitudIni.toString());
                setLongitud(ubicacionDefault.longitudIni.toString());
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

  const handleObtenerUbicacion = () => {
    if (!navigator.geolocation) {
      alert("Tu navegador no permite obtener la ubicacion.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitud(position.coords.latitude.toString());
        setLongitud(position.coords.longitude.toString());
      },
      () => {
        alert("No pudimos obtener tu ubicacion. Revisa los permisos del navegador.");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  };

  // 🔥 Guardar perfil
  const handleSave = async () => {
        if (!uid) return;

        const latitudNumero = Number(latitud);
        const longitudNumero = Number(longitud);
        const tieneUbicacion = Number.isFinite(latitudNumero) && Number.isFinite(longitudNumero);

        // 1. Preparamos los datos del perfil
        const perfilData = {
        descripcion,
        telefono,
        ciudad: ciudad.toUpperCase(),
        colonia: colonia.toUpperCase(),
        fotoPerfil,
        codigoPostal,
        servicios,
        rating,
        ...(tieneUbicacion && {
          ubicacion: {
            latitud: latitudNumero,
            longitud: longitudNumero,
          },
        }),
        };

        // 2. Guardamos en la colección 'perfiles_cuidadores'
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
                    <h1 className="text-2xl font-bold">{profile.nombre}</h1>
                    <h2>{user?.email}</h2>
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
                {/* <h3 className="font-semibold mb-2">Nombre</h3>
                <input className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Nombre completo"
                value={nombre}
                style={{ textTransform: "uppercase" }}
                onChange={(e) => setNombre(e.target.value.toUpperCase())}
                /> */}

                {/* ciudad */}
                <h3 className="font-semibold mb-2">Ciudad</h3>
                <select className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                 value={ciudad} required onChange={e => setCiudad(e.target.value.toUpperCase())}>
                    <option value="QUERETRO">Querétaro</option>
                    <option value="SAN JUAN DEL RIO">San Juan del Río</option>
                    <option value="EL MARQUES">El Marqués</option>
                    <option value="CORREGIDORA">Corregidora</option>
                    <option value="JURIQUILLA">Juriquilla</option>
                </select>

                {/* colonia */}
                <h3 className="font-semibold mb-2">Colonia</h3>
                <input className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400" 
                    placeholder="Colonia" 
                    value={colonia}
                    style={{ textTransform: "uppercase" }}
                    onChange={(e) => setColonia(e.target.value.toUpperCase())}
                  />

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
            {/* UBICACION */}
            <div className="bg-white rounded-2xl shadow p-6 mt-4">
                <h3 className="font-semibold mb-2">Ubicacion</h3>
                <p className="text-gray-500 mb-4">
                    Coloca el pin de tu zona de servicio. Puedes usar tu ubicacion actual o escribir las coordenadas.
                </p>

                <LocationPicker
                    latitud={latitud}
                    longitud={longitud}
                    onChange={(lat, lng) => {
                        setLatitud(lat.toFixed(6));
                        setLongitud(lng.toFixed(6));
                    }}
                />

                <button
                    type="button"
                    onClick={handleObtenerUbicacion}
                    className="btn-sitter w-full mt-4"
                >
                    Usar mi ubicacion actual
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                    <div>
                        <h3 className="font-semibold mb-2">Latitud</h3>
                        <input
                            className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="20.5888"
                            value={latitud}
                            onChange={(e) => setLatitud(e.target.value)}
                        />
                    </div>

                    <div>
                        <h3 className="font-semibold mb-2">Longitud</h3>
                        <input
                            className="w-full border border-gray-300 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="-100.3899"
                            value={longitud}
                            onChange={(e) => setLongitud(e.target.value)}
                        />
                    </div>
                </div>
            </div>

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
