import { Router } from "express";
import { 
    listarGeneros, 
    crearGenero, 
    actualizarGenero, 
    eliminarGenero 
} from "../controllers/pets/genero.js"; // Ajusta la ruta según tu estructura de carpetas
import { tokenautorizacion } from "../middlewares/token.js";

const routerGeneros = Router();

routerGeneros.get("/", listarGeneros);
routerGeneros.post("/",tokenautorizacion, crearGenero);
routerGeneros.put("/:generoId",tokenautorizacion, actualizarGenero);
routerGeneros.delete("/:generoId",tokenautorizacion, eliminarGenero);

export default routerGeneros;
