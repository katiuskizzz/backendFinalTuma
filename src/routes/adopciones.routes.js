import { Router } from "express";
import { listarAdopciones, crearAdopcion, actualizarAdopcion, eliminarAdopcion, misAdopciones } from "../controllers/pets/adopciones.js"
import { tokenautorizacion } from "../middlewares/token.js";

const adopcionRouter = Router();

adopcionRouter.get('/adopciones',tokenautorizacion, listarAdopciones);
adopcionRouter.post('/adopciones',tokenautorizacion, crearAdopcion);
adopcionRouter.put('/adopciones/:adopcionId',tokenautorizacion, actualizarAdopcion);
adopcionRouter.delete('/adopciones/:adopcionId',tokenautorizacion, eliminarAdopcion);
adopcionRouter.get('/MisAdopciones/:id',misAdopciones); 

export default adopcionRouter;
