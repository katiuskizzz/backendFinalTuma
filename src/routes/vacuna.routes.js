import { Router } from "express";
import { 
    listarVacunas, 
    crearVacuna, 
    actualizarVacuna, 
    eliminarVacuna ,
    listarVacunasPorEspecie
} from "../controllers/vacunas/vacunas.js"; // Ajusta la ruta según tu estructura de carpetas
import { tokenautorizacion } from "../middlewares/token.js";

const routerVacunas = Router();

routerVacunas.get("/", listarVacunas);
routerVacunas.get("/listarVacunasporId/:id_especie", listarVacunasPorEspecie);
routerVacunas.post("/", tokenautorizacion,crearVacuna);
routerVacunas.put("/:vacunaId",tokenautorizacion, actualizarVacuna);
routerVacunas.delete("/:vacunaId",tokenautorizacion, eliminarVacuna);

export default routerVacunas;
