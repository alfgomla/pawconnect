import type { Config } from "@react-router/dev/config";

export default {
  // Desactivamos el renderizado en el servidor
  ssr: false,
  
  // Forzamos la creación del index.html para la ruta principal
  // Esto es lo que cPanel necesita para arrancar la app
  async prerender() {
    return ["/"];
  },
} satisfies Config;
