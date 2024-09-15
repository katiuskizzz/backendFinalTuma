import { Router } from "express";
import { cargarMasFotos, listarFotos, eliminarFoto } from "../controllers/pets/CagarMasFotos.js";
import { tokenautorizacion } from "../middlewares/token.js";

const MasMascota = Router();

MasMascota.post("/MasMascota/:id_mascota",cargarMasFotos)
MasMascota.get("/ListaFotos/:id_mascota", listarFotos)
MasMascota.delete("/Eliminar/:id_fotos_pets", eliminarFoto)
export default MasMascota