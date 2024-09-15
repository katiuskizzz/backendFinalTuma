import { Router } from "express";
import { tokenautorizacion } from "../middlewares/token.js";
import {
    notificarAdopcion,
    rechazarAdopcion,
    aceptarAdopcion,
    listarMascotasPendientesAdopcion,
    listarMascotasPendientesAdopcionuser
} from "../controllers/pets/notificaciones.js";

const routerNotificaciones = Router();

routerNotificaciones.put("/notificarAdopcion", tokenautorizacion, notificarAdopcion);

routerNotificaciones.put("/rechazarAdopcion", tokenautorizacion, rechazarAdopcion);

routerNotificaciones.put("/aceptarAdopcion", tokenautorizacion, aceptarAdopcion);

routerNotificaciones.get("/pendientes/:idUsuario", tokenautorizacion, listarMascotasPendientesAdopcion);
routerNotificaciones.get("/pendientesuser/:idUsuario", tokenautorizacion, listarMascotasPendientesAdopcionuser);

export default routerNotificaciones;
