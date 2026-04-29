
import { Link, useNavigate} from "react-router";
import { useState } from "react";
import { auth } from "../lib/firebase";
import {signOut } from "firebase/auth";

export default function Nav() {
    const [user, setUser] = useState<any>(null);
    const [nombreUsuario, setNombreUsuario] = useState(""); // Nuevo estado para el nombre real
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = async () => {
        await signOut(auth);
        navigate("/");
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
                    {user && !user.isAnonymous ? (
                        <>
                            <span className="welcome-msg">Hola, {nombreUsuario || "propietario"}</span>
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