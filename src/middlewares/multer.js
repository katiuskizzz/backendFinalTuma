import multer from "multer";
import { v4 as uuidv4 } from "uuid"; // Importa una librería para generar IDs únicos

// Configuración para fotos de perfil de usuarios
const userStorage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, "public/img/users"); // Carpeta de destino
    },
    filename: function (req, file, cb) {
        // Genera un nombre único para el archivo
        const uniqueName = `${uuidv4()}-${file.originalname}`;
        cb(null, uniqueName); // Usa el nombre único
    },
});

export const userFile = multer({ storage: userStorage }).single('fotografia');




const petStorage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, "public/img/pets"); // Carpeta de destino
    },
    filename: function (req, file, cb) {
        // Genera un nombre único para el archivo
        const uniqueName = `${uuidv4()}-${file.originalname}`;
        cb(null, uniqueName); // Usa el nombre único
    },
});

export const petFile = multer({ storage: petStorage }).single('fotos_mascota'); // Usa single en lugar de fields
