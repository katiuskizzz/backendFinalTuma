import { generarFichaTecnicaPDF } from "../controllers/pdf/mascotaspdf.js";
import { Router } from "express";

const routerPdf= Router();

routerPdf.get("/generarFichaTecnicaPDF/:idMascota", generarFichaTecnicaPDF )

export default routerPdf;
