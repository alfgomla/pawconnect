import { useState, useEffect } from "react";

export default function Home() {
  const [flippedCard, setFlippedCard] = useState<number | null>(null);

  const services = [
    { 
      title: "Paseo", 
      img: "./images/paseo.webp",
      imgSmall: "./images/paseo-400.webp", // versión 400px para móvil
      desc: "Caminatas activas para mantener a tu mascota saludable y feliz.",
      videoId: "fjgJX6S4Q3U"
    },
    { 
      title: "Estética", 
      img: "./images/estetica.webp",
      imgSmall: "./images/estetica-400.webp",
      desc: "Baño, corte y mimos para que luzca siempre espectacular.",
      videoId: "yX_g5UouW3w"
    },
    { 
      title: "Adiestramiento", 
      img: "./images/adiestramiento.webp",
      imgSmall: "./images/adiestramiento-400.webp",
      desc: "Educación profesional con refuerzo positivo para una mejor convivencia.",
      videoId: "SgXGs8gaRXg"
    },
    { 
      title: "Alojamiento", 
      img: "./images/alojamiento.webp",
      imgSmall: "./images/alojamiento-400.webp",
      desc: "Cuidado las 24 horas en un ambiente familiar y seguro.",
      videoId: "gPFwEx6DhW8"
    },
    { 
      title: "Veterinario", 
      img: "./images/veterinario.webp",
      imgSmall: "./images/veterinario-400.webp",
      desc: "Atención médica profesional, vacunas y chequeos para su salud.",
      videoId: "TT0GmtrnUbU"
    },
    { 
      title: "Cremación", 
      img: "./images/cremacion.webp",
      imgSmall: "./images/cremacion-400.webp",
      desc: "Un adiós digno y respetuoso para acompañarte en momentos difíciles.",
      videoId: "wEapv4aUERY"
    },
  ];

  // Escucha cuando termina el video de YouTube
  useEffect(() => {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.body.appendChild(tag);

    (window as any).onYouTubeIframeAPIReady = () => {
      window.addEventListener('message', (event) => {
        if (event.origin !== 'https://www.youtube.com') return;
        try {
          const data = JSON.parse(event.data);
          if (data.event === 'onStateChange' && data.info === 0) {
            setFlippedCard(null);
          }
        } catch (e) {}
      });
    };
  }, []);

  const handleFlip = (index: number) => {
    setFlippedCard(flippedCard === index ? null : index);
  };

  return (
    <div className="home-wrapper">
      <section className="hero-text">
        <h3>Que puedes encontrar aqui? 🐾</h3>
        <p>Estos son los servicios que nuestros expertos ofrecen para tí</p>
      </section>

      <div className="services-grid" style={{ marginTop: '3rem' }}>
        {services.map((s, i) => {
          const isFlipped = flippedCard === i;
          
          return (
            <div 
              key={i} 
              className="perspective" 
              style={{ height: '580px', cursor: 'pointer' }}
              onClick={() => handleFlip(i)}
            >
              <div className={`flip-card-inner ${isFlipped ? 'is-flipped' : ''}`}>
                
                {/* Frente: ahora con <img> + lazy */}
                <div className="flip-card-front service-card-image">
                  {!isFlipped && (
                    <img
                      src={s.imgSmall}
                      srcSet={`${s.imgSmall} 400w, ${s.img} 800w`}
                      sizes="(max-width: 768px) 400px, 800px"
                      alt={s.title}
                      loading={i === 0 ? "eager" : "lazy"} // La primera carga ya, las otras lazy
                      decoding="async"
                      className="card-bg-img"
                    />
                  )}
                  <div className="service-overlay">
                    <h3>{s.title}</h3>
                    <p>{s.desc}</p>
                  </div>
                </div>

                {/* Reverso: video de YouTube */}
                <div className="flip-card-back">
                  {isFlipped && (
                    <>
                      <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${s.videoId}?enablejsapi=1&autoplay=1&controls=1`}
                        title={s.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                      <button
                        className="btn-close-video"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFlippedCard(null);
                        }}
                      >
                        ✕
                      </button>
                    </>
                  )}
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}