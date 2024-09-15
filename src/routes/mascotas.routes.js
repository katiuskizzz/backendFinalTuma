import { Router } from "express";
import { 
    listarMascotas,
    actualizarMascota,
    crearMascota,
    eliminarMascota,
    listarMascotaPorId,
    listarMascotasPorUsuario, listarMascotasUrgentes,listarMascotasAdoptadasPorUsuario

 } from "../controllers/pets/mascotas.js";
 import { tokenautorizacion } from "../middlewares/token.js";
 import { petFile } from "../middlewares/multer.js";



 const routerMascotas = Router();

 routerMascotas.get("/", listarMascotas);
 routerMascotas.get("/listarMascotasUrgentes", listarMascotasUrgentes);
 routerMascotas.get("/:id_usuario", listarMascotasPorUsuario);
 routerMascotas.get("/listarMascotaPorId/:idMascota", listarMascotaPorId);
 routerMascotas.get("/listarMascotasAdoptadasPorUsuario/:id_usuario", listarMascotasAdoptadasPorUsuario);
 routerMascotas.post("/",tokenautorizacion, crearMascota);
 routerMascotas.put("/:mascotaId", actualizarMascota);
 routerMascotas.delete("/:mascotaId",tokenautorizacion, eliminarMascota);

 
//  routerMascotas.put("/activarEspecie/:especieId", activarEspecie);
//  routerMascotas.put("/inactivarEspecie/:especieId", inactivarEspecie);
 
 export default routerMascotas;
 
