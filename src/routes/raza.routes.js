import { Router } from "express";
import { 
    listarRazas, 
    crearRaza, 
    actualizarRaza, 
    eliminarRaza ,
    listarRazasPorEspecie,
    activarRaza,
    desactivarRaza
} from "../controllers/pets/razas.js"; // Ajusta la ruta según tu estructura de carpetas
import { tokenautorizacion } from "../middlewares/token.js";

const routerRazas = Router();

routerRazas.get("/",tokenautorizacion, listarRazas);
routerRazas.get("/razas/:id_especie",tokenautorizacion, listarRazasPorEspecie);
routerRazas.post("/",tokenautorizacion, crearRaza);
routerRazas.put("/:razaId", tokenautorizacion, actualizarRaza);
routerRazas.delete("/:razaId",tokenautorizacion, eliminarRaza);

routerRazas.put("/activar/:razaId", tokenautorizacion, activarRaza);
routerRazas.put("/desactivar/:razaId", tokenautorizacion, desactivarRaza);



export default routerRazas;
