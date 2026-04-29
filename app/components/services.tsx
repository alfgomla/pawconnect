// ServicesSection.tsx
import { useState, useEffect } from "react";

export const ServicesSection = () => {
  const [flippedCard, setFlippedCard] = useState<number | null>(null);

  const services = [
    { title: "Paseo", img: "./images/paseo.webp", imgSmall: "./images/paseo-400.webp", desc: "Caminatas activas...", videoId: "fjgJX6S4Q3U" },
    { title: "Estética", img: "./images/estetica.webp", imgSmall: "./images/estetica-400.webp", desc: "Baño, corte y mimos...", videoId: "yX_g5UouW3w" },
    { title: "Adiestramiento", img: "./images/adiestramiento.webp", imgSmall: "./images/adiestramiento-400.webp", desc: "Educación profesional...", videoId: "SgXGs8gaRXg" },
    { title: "Alojamiento", img: "./images/alojamiento.webp", imgSmall: "./images/alojamiento-400.webp", desc: "Cuidado las 24 horas...", videoId: "gPFwEx6DhW8" },
    { title: "Veterinario", img: "./images/veterinario.webp", imgSmall: "./images/veterinario-400.webp", desc: "Atención médica...", videoId: "TT0GmtrnUbU" },
    { title: "Cremación", img: "./images/cremacion.webp", imgSmall: "./images/cremacion-400.webp", desc: "Un adiós digno...", videoId: "wEapv4aUERY" },
  ];

  useEffect(() => {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.body.appendChild(tag);
    // ... resto de tu lógica de YouTube API ...
  }, []);

  return (
    <div className="home-wrapper">
      <section className="hero-text text-center py-10">
        <h3 className="text-3xl font-bold">¿Qué puedes encontrar aquí? 🐾</h3>
        <p className="text-gray-600">Estos son los servicios que nuestros expertos ofrecen para ti</p>
      </section>

      <div className="services-grid" style={{ marginTop: '3rem' }}>
        {services.map((s, i) => (
          <div key={i} className="perspective" style={{ height: '580px', cursor: 'pointer' }} onClick={() => setFlippedCard(flippedCard === i ? null : i)}>
            <div className={`flip-card-inner ${flippedCard === i ? 'is-flipped' : ''}`}>
              <div className="flip-card-front service-card-image">
                <img src={s.imgSmall} alt={s.title} className="card-bg-img" loading="lazy" />
                <div className="service-overlay">
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
              </div>
              <div className="flip-card-back">
                {flippedCard === i && (
                  <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${s.videoId}?autoplay=1`} allowFullScreen />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};