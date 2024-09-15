import { createPool } from "mysql2/promise";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../env/.env") });


export const pool = createPool({
    host: 'bb9qyj7ihat8ai5jpswz-mysql.services.clever-cloud.com',
    user: 'ufdtcujaptdkkepj',
    password: 'ooTQlVn3rSBsohCYAgM3',
    port: '3306',
    database: 'bb9qyj7ihat8ai5jpswz'
})

pool.getConnection().then(connect => {
    console.log("Conexión a base de datos exitosa.");
    connect.release();
})
    .catch(error => {
        console.error("Conexion a base de datos fallida . " + error);
})  
