import { useState, useEffect } from "react";

export default function Home() {
  const [flippedCard, setFlippedCard] = useState<number | null>(null);

  const services = [
    { 
      title: "Paseo", 
      img: "paseo.png",
      desc: "Caminatas activas para mantener a tu mascota saludable y feliz.",
      videoId: "dQw4w9WgXcQ" // Cambia por tu ID real de YouTube
    },
    { 
      title: "Estética", 
      img: "estetica.png",
      desc: "Baño, corte y mimos para que luzca siempre espectacular.",
      videoId: "dQw4w9WgXcQ" // Cambia por tu ID real
    },
    { 
      title: "Adiestramiento", 
      img: "adiestramiento.png",
      desc: "Educación profesional con refuerzo positivo para una mejor convivencia.",
      videoId: "dQw4w9WgXcQ"
    },
    { 
      title: "Alojamiento", 
      img: "alojamiento.png",
      desc: "Cuidado las 24 horas en un ambiente familiar y seguro.",
      videoId: "dQw4w9WgXcQ"
    },
    { 
      title: "Veterinario", 
      img: "veterinario.png",
      desc: "Atención médica profesional, vacunas y chequeos para su salud.",
      videoId: "dQw4w9WgXcQ"
    },
    { 
      title: "Cremación", 
      img: "cremacion.png",
      desc: "Un adiós digno y respetuoso para acompañarte en momentos difíciles.",
      videoId: "dQw4w9WgXcQ"
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
            // 0 = video terminó
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
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <section className="hero-text">
        <h1>El cuidado que tu mascota merece, cerca de ti 🐾</h1>
        <p>Expertos listos para consentir a tu mejor amigo.</p>
      </section>

      <div className="services-grid" style={{ marginTop: '3rem' }}>
        {services.map((s, i) => {
          const isFlipped = flippedCard === i;
          
          return (
            <div 
              key={i} 
              className="perspective" 
              style={{ height: '450px', cursor: 'pointer' }}
              onClick={() => handleFlip(i)}
            >
              <div className={`flip-card-inner ${isFlipped ? 'is-flipped' : ''}`}>
                
                {/* Frente: tu tarjeta actual */}
                <div 
                  className="flip-card-front service-card-image" 
                  style={{ backgroundImage: `url(${s.img})` }}
                >
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