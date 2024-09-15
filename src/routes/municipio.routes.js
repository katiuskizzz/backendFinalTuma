import { Router } from "express";
import { 
    listarMunicipios, 
    crearMunicipio, 
    actualizarMunicipio, 
    eliminarMunicipio 
} from "../controllers/ubicaciones/municipios.js"; // Ajusta la ruta según tu estructura de carpetas
import { tokenautorizacion } from "../middlewares/token.js";

const routerMunicipios = Router();

routerMunicipios.get("/:idDepartamento", listarMunicipios);
routerMunicipios.post("/:idDepartamento",tokenautorizacion, crearMunicipio);
routerMunicipios.put("/:municipioId",tokenautorizacion, actualizarMunicipio);
routerMunicipios.delete("/:municipioId",tokenautorizacion, eliminarMunicipio);

export default routerMunicipios;
