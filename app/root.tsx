import Nav from "~/components/Nav";
import Footer from "~/components/Footer";
import { useState, useEffect } from "react";
import { auth, db } from "./lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore"; // Para buscar el nombre
import { Links, Meta, Outlet, Scripts, ScrollRestoration, useNavigate } from "react-router";
import "./app.css";

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [nombreUsuario, setNombreUsuario] = useState(""); // Nuevo estado para el nombre real
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
        <Nav />
        <main className="main-content">
        {/* <main> */}
          <Outlet />
        </main>
        <Footer />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}