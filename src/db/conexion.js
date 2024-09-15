import { createPool } from "mysql2/promise";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../env/.env") });


export const pool = createPool({
    host: 'bysjuhsh4nxg3pnzmnx6-mysql.services.clever-cloud.com',
    user: 'uru9oor6wb0kdjvi',
    password: '5jRi0EYUlncBWnY9Kkow',
    port: '3306',
    database: 'bysjuhsh4nxg3pnzmnx6'
})

pool.getConnection().then(connect => {
    console.log("Conexión a base de datos exitosa.");
    connect.release();
})
    .catch(error => {
        console.error("Conexion a base de datos fallida . " + error);
})  
