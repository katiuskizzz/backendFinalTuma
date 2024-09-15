import express from "express";
import cors from "cors";
import routerUser from "./src/routes/user.routes.js";
import routerAuth from "./src/routes/auth.routes.js";
import routerDepatamento from "./src/routes/deoartamento.routes.js";
import routerMunicipios from "./src/routes/municipio.routes.js";
import routerGeneros from "./src/routes/genero.routes.js";
import routerEspecies from "./src/routes/especie.routes.js";
import routerHistorialVacunas from "./src/routes/historial_vacunas.routes.js";
import routerRazas from "./src/routes/raza.routes.js";
import routerVacunas from "./src/routes/vacuna.routes.js";
import routerMascotas from "./src/routes/mascotas.routes.js";
import adopcionRouter from "./src/routes/adopciones.routes.js";
import routerNotificaciones from "./src/routes/notificaciones.routes.js";
import MasMascota from "./src/routes/CargarMasImagenesMascotas.routes.js";
import cambioPassword from "./src/routes/password.routes.js";
import {PORT} from './src/db/config.js'

const app = express();
app.use(cors()); // Si estás usando CORS

app.use(express.json()); // Para parsear el cuerpo de las solicitudes JSON
app.use(express.urlencoded({ extended: false })); // Para parsear el cuerpo de las solicitudes URL-encoded

app.use("/user", routerUser);
app.use("/", routerAuth);
app.use("/departamento", routerDepatamento);
app.use("/municipio", routerMunicipios);
app.use("/genero", routerGeneros);
app.use("/especie", routerEspecies);
app.use("/historial", routerHistorialVacunas);
app.use("/raza", routerRazas);
app.use("/vacuna", routerVacunas);
app.use("/pets", routerMascotas)
app.use("/adopciones", adopcionRouter)
app.use("/notificaciones", routerNotificaciones)
app.use("/imagenMascota",MasMascota)
app.use("/cambioPassword",cambioPassword)








app.use(express.static('./public')); // Para servir archivos estáticos (imágenes, etc.)

app.listen(PORT, () => {
    console.log("Servidor se está ejecutando en el puerto ", PORT);
});
