import { Router } from "express";
import { actualizarDepartamento, crearDepartamento, eliminarDepartamento, listarDepartamentos } from "../controllers/ubicaciones/departamento.js";
import { tokenautorizacion } from "../middlewares/token.js";

const routerDepatamento = Router();

routerDepatamento.get("/listarDepartamentos", listarDepartamentos )
routerDepatamento.post("/registroDepartamento",tokenautorizacion,crearDepartamento )
routerDepatamento.put("/actualizarDepartamento/:departamentoId",tokenautorizacion,actualizarDepartamento )
routerDepatamento.delete("/eliminarDepartamento/departamentoId",tokenautorizacion,eliminarDepartamento )

export default  routerDepatamento;