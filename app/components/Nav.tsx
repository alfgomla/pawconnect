import { Link, useNavigate} from "react-router";
import { useState } from "react";
import { auth } from "../lib/firebase";
import {signOut } from "firebase/auth";
import { useAuth } from "../context/AuthContext";

export default function Nav() {
    const { user, profile, loading  } = useAuth();

    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = async () => {
        await signOut(auth);
        navigate("/");
    };
    
    const primerNombre = profile?.nombre ? capitalizarNombre(profile.nombre).split(" ")[0]: "Usuario";
    
    if (loading) return null; // evita parpadeos
    
    function capitalizarNombre(nombre: string) {
    return nombre
        .toLowerCase()
        .split(" ")
        .map(p => p.charAt(0).toUpperCase() + p.slice(1))
        .join(" ");
    };

    return (
        <nav className="navbar">
            <div className="nav-container">
                <Link to="/" className="logo-link" onClick={() => setIsMenuOpen(false)}>
                    <img 
                        src="/logo-compelto.webp" 
                        alt="Pakal Pets" 
                        style={{ height: '60px', width: 'auto' }} 
                    />
                </Link>

                {/* BOTÓN TOGGLE */}
                <button 
                    className="menu-toggle" 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Menú"
                >
                    <span className={isMenuOpen ? "bar open" : "bar"}></span>
                    <span className={isMenuOpen ? "bar open" : "bar"}></span>
                    <span className={isMenuOpen ? "bar open" : "bar"}></span>
                    
                </button>

                {/* --- CAPA PARA CERRAR AL TOCAR FUERA --- */}
                {isMenuOpen && (
                    <div 
                        className="menu-overlay" 
                        onClick={() => setIsMenuOpen(false)} 
                    />
                )}

                {/* LINKS DEL MENÚ */}
                <div className={`nav-links ${isMenuOpen ? "active" : ""}`}>
                    {user ? (
                        <>
                            
                            <span className="welcome-msg">Hola, {primerNombre}</span>
                            <button onClick={handleLogout} className="btn-sitter">Salir</button>
                        </>
                    ) : (
                        <>
                            {/* Te recomiendo agregar "Inicio" aquí también 
                            <Link to="/" className="btn-user" onClick={() => setIsMenuOpen(false)}>Inicio</Link> */}
                            <Link to="/login" className="btn-user" onClick={() => setIsMenuOpen(false)}>Entrar</Link>
                            <Link to="/registro-usuario" className="btn-user" onClick={() => setIsMenuOpen(false)}>Registrarme</Link>
                            <Link to="/registro-cuidador" className="btn-sitter" onClick={() => setIsMenuOpen(false)}>Prestar servicios</Link>       
                        </>
                    )}
                </div>
            </div>
        </nav> 
    )
}