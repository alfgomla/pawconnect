import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("registro-dueno", "routes/register-owner.tsx"),
  route("registro-cuidador", "routes/register-sitter.tsx"), // <-- Esta es la clave
  route("resultados", "routes/results.tsx"),
  route("login", "routes/login.tsx"),
  route("buscar", "routes/search.tsx"),
  route("perfil-cuidador", "routes/perfil-cuidador.tsx"),
  route("perfil-dueno", "routes/perfil-dueno.tsx"),
  route("prueba", "routes/prueba.tsx"),
] satisfies RouteConfig;