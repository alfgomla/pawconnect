
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

                <button 
                    className="menu-toggle" 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Menú"
                >
                    <span className={isMenuOpen ? "bar open" : "bar"}></span>
                    <span className={isMenuOpen ? "bar open" : "bar"}></span>
                    <span className={isMenuOpen ? "bar open" : "bar"}></span>

                </button>

                <div className={`nav-links ${isMenuOpen ? "active" : ""}`}>
                    {user && !user.isAnonymous ? (
                    <>
                        <span className="welcome-msg">Hola, {nombreUsuario || "propietario"}</span>
                        <button onClick={handleLogout} className="btn-sitter">Salir</button>
                    </>
                    ) : (
                    <>
                        <Link to="/login" className="btn-user" onClick={() => setIsMenuOpen(false)}>Entrar</Link>
                        <Link to="/prueba" className="btn-user" onClick={() => setIsMenuOpen(false)}>Prueba</Link>      
                        <Link to="/registro-usuario" className="btn-user" onClick={() => setIsMenuOpen(false)}>Registrarme</Link>
                        <Link to="/registro-cuidador" className="btn-user" onClick={() => setIsMenuOpen(false)}>Prestar servicios</Link>       
                    </>
                    )}
                </div>
            </div>
        </nav> 
    )
}