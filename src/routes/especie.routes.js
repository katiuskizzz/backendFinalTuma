import { Router } from "express";
import { 
    listarEspecies, 
    crearEspecie, 
    actualizarEspecie, 
    eliminarEspecie,
    activarEspecie,
    inactivarEspecie
} from "../controllers/pets/especies.js"; // Ajusta la ruta según tu estructura de carpetas
import { tokenautorizacion } from "../middlewares/token.js";

const routerEspecies = Router();

routerEspecies.get("/",tokenautorizacion, listarEspecies);
routerEspecies.post("/",tokenautorizacion, crearEspecie);
routerEspecies.put("/:especieId", actualizarEspecie);
routerEspecies.delete("/:especieId",tokenautorizacion, eliminarEspecie);
routerEspecies.put("/activarEspecie/:especieId",tokenautorizacion, activarEspecie);
routerEspecies.put("/inactivarEspecie/:especieId",tokenautorizacion, inactivarEspecie);

export default routerEspecies;
