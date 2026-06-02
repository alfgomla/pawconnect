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
  route("editar-cuidador", "routes/editar-cuidador.tsx"),
  route("editar-dueno", "routes/editar-dueno.tsx"),
  route("ver-cuidador/:id", "routes/ver-cuidador.tsx"),
  route("alta-mascota", "routes/alta-mascota.tsx"),
  route("pago", "routes/pago.tsx"),
  route("dashboard-cuidador", "routes/dashboard-cuidador.tsx"),
] satisfies RouteConfig;