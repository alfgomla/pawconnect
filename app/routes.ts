import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("servicios", "routes/services.tsx"),
  route("prueba", "routes/prueba.tsx"),
  route("registro-usuario", "routes/register-user.tsx"),
  route("resultados", "routes/results.tsx"),
  route("registro-cuidador", "routes/register-sitter.tsx"), // <-- Esta es la clave
  route("login", "routes/login.tsx"),
  route("buscar", "routes/search.tsx"),
] satisfies RouteConfig;