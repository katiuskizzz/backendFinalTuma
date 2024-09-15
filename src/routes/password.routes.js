import { Router } from "express";
import { tokenautorizacion } from "../middlewares/token.js";
import { solicitarCambioContrasena, verificarCodigo, cambiarContrasena } from "../controllers/users/password.js";

const cambioPassword = Router();

cambioPassword.post("/solicitarCambioContrasena", solicitarCambioContrasena);
cambioPassword.post("/verificarCodigo", verificarCodigo);
cambioPassword.put("/cambiarContrasena", cambiarContrasena);


export default cambioPassword;
