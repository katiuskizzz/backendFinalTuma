import { pool } from "../../db/conexion.js";

// Listar todas las adopciones
export const listarAdopciones = async (req, res) => {
    try {
        const query = 'SELECT * FROM adopciones';
        const [rows] = await pool.query(query);
        res.status(200).json({ adopciones: rows });
    } catch (error) {
        console.error("Error al listar adopciones:", error);
        res.status(500).json({ message: "Error al listar adopciones" });
    }
};


// Crear una nueva adopción
export const crearAdopcion = async (req, res) => {
    try {
        // Validar los datos
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.error("Errores de validación:", errors.array());
            return res.status(400).json({ errors: errors.array() });
        }

        const { id_mascota, id_usuario_adoptante, id_usuario_dador, fecha_adopcion } = req.body;

        if (!id_mascota || !id_usuario_adoptante || !id_usuario_dador || !fecha_adopcion) {
            return res.status(400).json({ message: "Todos los campos son requeridos" });
        }

        const query = `
            INSERT INTO adopciones (id_mascota, id_usuario_adoptante, id_usuario_dador, fecha_adopcion)
            VALUES (?, ?, ?, ?)
        `;
        await pool.query(query, [id_mascota, id_usuario_adoptante, id_usuario_dador, fecha_adopcion]);

        res.status(201).json({ message: "Adopción creada con éxito" });
    } catch (error) {
        console.error("Error al crear adopción:", error);
        res.status(500).json({ message: "Error al crear adopción" });
    }
};



export const actualizarAdopcion = async (req, res) => {
    try {
        // Validar los datos
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.error("Errores de validación:", errors.array());
            return res.status(400).json({ errors: errors.array() });
        }

        const { adopcionId } = req.params;
        const { id_mascota, id_usuario_adoptante, id_usuario_dador, fecha_adopcion } = req.body;

        if (!id_mascota && !id_usuario_adoptante && !id_usuario_dador && !fecha_adopcion) {
            return res.status(400).json({ message: "Ningún dato proporcionado para actualizar" });
        }

        const query = `
            UPDATE adopciones SET 
                id_mascota = COALESCE(?, id_mascota),
                id_usuario_adoptante = COALESCE(?, id_usuario_adoptante),
                id_usuario_dador = COALESCE(?, id_usuario_dador),
                fecha_adopcion = COALESCE(?, fecha_adopcion)
            WHERE id_adopcion = ?
        `;

        const params = [id_mascota, id_usuario_adoptante, id_usuario_dador, fecha_adopcion, adopcionId].filter(param => param !== null && param !== undefined);

        const [result] = await pool.query(query, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Adopción no encontrada" });
        }

        res.status(200).json({ message: "Adopción actualizada con éxito" });
    } catch (error) {
        console.error("Error al actualizar adopción:", error);
        res.status(500).json({ message: "Error al actualizar adopción" });
    }
};


export const eliminarAdopcion = async (req, res) => {
    try {
        const { adopcionId } = req.params;

        const query = 'DELETE FROM adopciones WHERE id_adopcion = ?';
        const [result] = await pool.query(query, [adopcionId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Adopción no encontrada" });
        }

        res.status(200).json({ message: "Adopción eliminada con éxito" });
    } catch (error) {
        console.error("Error al eliminar adopción:", error);
        res.status(500).json({ message: "Error al eliminar adopción" });
    }
};

export const misAdopciones = async (req, res) => {
    try {
        const { id } = req.params;

        const query = `
            SELECT m.* 
            FROM mascotas m 
            INNER JOIN adopciones a ON m.id_mascota = a.id_mascota 
            WHERE a.id_usuario_adoptante = ?
        `;

        const [rows] = await pool.query(query, [id]);
        res.status(200).json({ adopciones: rows });
    } catch (error) {
        console.error("Error al mostrar las adopciones:", error);
        res.status(500).json({ message: "Error al mostrar las adopciones" });
    }
};
