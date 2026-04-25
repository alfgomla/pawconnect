import { useState, useEffect } from "react";
import { auth, db } from "./lib/firebase"; // Importamos db
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore"; // Para buscar el nombre
import { Link, Links, Meta, Outlet, Scripts, ScrollRestoration, useNavigate } from "react-router";
import "./app.css";

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [nombreUsuario, setNombreUsuario] = useState(""); // Nuevo estado para el nombre real
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Si hay usuario, buscamos su nombre en la colección "duenos"
        const docRef = doc(db, "duenos", currentUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const nombreCompleto = docSnap.data().nombre;
          // Tomamos solo la primera palabra (el primer nombre)
          setNombreUsuario(nombreCompleto.split(" ")[0]);
        }
      } else {
        setNombreUsuario("");
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <Meta />
        <title>Pakalpets</title>
        <link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet"></link>
        <link rel="icon" type="image/png" href="./images/favicon.png?v=2"></link>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <Links />
      </head>

      <body>
        <nav className="navbar">
          <div className="nav-container">
            
            <Link to="/" className="logo" style={{ textDecoration: 'none' }}>
              <img 
                src="/logo-compelto.webp" 
                alt="Pakal Pets" 
                style={{ height: '65px', width: 'auto', display: 'block' }} 
              />
            </Link>

            <div className="nav-links">
              {user ? (
                <>
                  <span style={{ fontWeight: 'bold', color: '#4f46e5' }}>
                    Hola, {nombreUsuario || "propietario"} {/* Mostramos el nombre real */}
                  </span>
                  <button onClick={handleLogout} className="btn-sitter">Salir</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn-user" style={{ marginRight: '10px' }}>Entrar</Link>
                  <Link to="/registro-usuario" className="btn-user">Registrarme</Link>
                  <Link to="/registro-cuidador" className="btn-sitter">Prestar servicios</Link>       
                </>
              )}
            </div>
          </div>
        </nav>
        
        <main className="main-content">
          <Outlet />
        </main>

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}