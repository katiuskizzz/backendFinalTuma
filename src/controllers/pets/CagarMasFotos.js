import { pool } from "../../db/conexion.js";
import multer from "multer";
import path from 'path';

const petStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/img/pets');
    },
    filename: function (req, file, cb) {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);
    },
});

const petFile = multer({ 
    storage: petStorage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Tipo de archivo no permitido'), false);
        }
    }
}).array('fotos', 5);



export const cargarMasFotos = async (req, res) => {
    try {
        const { id_mascota } = req.params;

        petFile(req, res, async (err) => {
            if (err instanceof multer.MulterError) {
                console.error('Multer Error:', err.message);
                return res.status(400).json({ error: `Multer Error: ${err.message}` });
            } else if (err) {
                console.error('Upload Error:', err.message);
                return res.status(400).json({ error: `Upload Error: ${err.message}` });
            }

            if (!req.files || req.files.length === 0) {
                return res.status(400).json({ error: 'No se han subido archivos' });
            }

            const images = req.files.map(file => file.filename);

            if (images.length === 0) {
                return res.status(400).json({ error: 'No se encontraron imágenes para insertar en la base de datos' });
            }

            const query = `
                INSERT INTO fotos_mascotas (id_mascota, url_phot) 
                VALUES ${images.map(() => '(?, ?)').join(', ')};
            `;

            const values = [];
            images.forEach(image => {
                values.push(id_mascota, `public/img/pets/${image}`);
            });

            try {
                await pool.query(query, values);
                res.status(200).json({ message: "Imágenes cargadas y registradas correctamente" });
            } catch (dbError) {
                console.error('Database Error:', dbError.message);
                res.status(500).json({ error: "Error al registrar las imágenes en la base de datos" });
            }
        });
    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({ error: "Error al cargar las imágenes" });
    }
};

export const eliminarFoto = async (req, res) => {
    try {
        const { id_fotos_pets } = req.params;

        // Consulta SQL para eliminar la foto de la base de datos
        const queryDelete = 'DELETE FROM fotos_mascotas WHERE id_fotos_pets = ?';
        const [result] = await pool.query(queryDelete, [id_fotos_pets]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Foto no encontrada' });
        }

        res.status(200).json({ message: 'Foto eliminada correctamente' });
    } catch (error) {
        console.error('Error al eliminar la foto:', error.message);
        res.status(500).json({ error: 'Error al eliminar la foto' });
    }
};



export const listarFotos = async (req, res) => {
    try {
        const { id_mascota } = req.params;

        // Consulta SQL para obtener las fotos asociadas al id_mascota incluyendo el id_fotos_pets
        const query = 'SELECT id_fotos_pets, url_phot FROM fotos_mascotas WHERE id_mascota = ?';
        
        // Ejecutar la consulta
        const [rows] = await pool.query(query, [id_mascota]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'No se encontraron fotos para esta mascota' });
        }

        // Enviar la lista de fotos con el id_fotos_pets y URL como respuesta
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error al listar las fotos:', error.message);
        res.status(500).json({ error: 'Error al listar las fotos' });
    }
};
