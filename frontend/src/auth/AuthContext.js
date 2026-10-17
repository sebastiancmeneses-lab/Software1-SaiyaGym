import { createContext } from "react";

// Contexto de la sesión: { usuario, iniciarSesion, cerrarSesion, avisoSesion }
export const AuthContext = createContext(null);
