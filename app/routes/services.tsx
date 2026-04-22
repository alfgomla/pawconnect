import { Scissors, Home, GraduationCap, Footprints, Stethoscope, Flame } from "lucide-react";

const services = [
  { 
    title: "Paseo", 
    desc: "Caminatas activas para mantener a tu mascota saludable y feliz.",
    icon: <Footprints size={40} color="#4f46e5" /> 
  },
  { 
    title: "Estética", 
    desc: "Baño, corte y mimos para que luzca siempre espectacular.",
    icon: <Scissors size={40} color="#4f46e5" /> 
  },
  { 
    title: "Adiestramiento", 
    desc: "Educación profesional con refuerzo positivo para una mejor convivencia.",
    icon: <GraduationCap size={40} color="#4f46e5" /> 
  },
  { 
    title: "Alojamiento", 
    desc: "Cuidado las 24 horas en un ambiente familiar y seguro.",
    icon: <Home size={40} color="#4f46e5" /> 
  },
  { 
    title: "Veterinario", 
    desc: "Atención médica profesional, vacunas y chequeos para la salud de tu mascota.",
    icon: <Stethoscope size={40} color="#4f46e5" /> 
  },
  { 
    title: "Cremación", 
    desc: "Un adiós digno y respetuoso para acompañarte en los momentos más difíciles.",
    icon: <Flame size={40} color="#4f46e5" /> 
  },
];

export default function Services() {
return (
  <div style={{ textAlign: 'center' }}>
    <h2 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Nuestros Servicios</h2>
    
    {/* Contenedor principal con una clase para CSS */}
    <div className="services-grid">
      {services.map((s, i) => (
        // Cada tarjeta individual con una clase para CSS
        <div key={i} className="service-card">
          <div className="service-icon-wrapper">{s.icon}</div>
          <h3>{s.title}</h3>
          <p className="service-desc">{s.desc}</p>
        </div>
      ))}
    </div>
  </div>
);
}