import { Router } from "express";
import { 
    listarHistorialVacunas, 
    crearHistorialVacuna, 
    actualizarHistorialVacuna, 
    eliminarHistorialVacuna 
} from "../controllers/vacunas/historial_vacunas.js"; // Ajusta la ruta según tu estructura de carpetas
import { tokenautorizacion } from "../middlewares/token.js";

const routerHistorialVacunas = Router();

routerHistorialVacunas.get("/:id_mascota", listarHistorialVacunas);
routerHistorialVacunas.post("/",tokenautorizacion, crearHistorialVacuna);
routerHistorialVacunas.put("/:historialId",tokenautorizacion, actualizarHistorialVacuna);
routerHistorialVacunas.delete("/:historialId", tokenautorizacion, eliminarHistorialVacuna);

export default routerHistorialVacunas;
