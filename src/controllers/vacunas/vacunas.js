import { pool } from "../../db/conexion.js";
import { validationResult } from "express-validator";


// Función para verificar si hay mascotas en un estado prohibido
const verificarMascotasEnEstadoProhibido = async (idVacuna) => {
    const query = `
        SELECT COUNT(*) AS count 
        FROM mascotas 
        WHERE id_vacuna = ? AND estado IN ('en adopcion', 'urgente')
    `;
    const [rows] = await pool.query(query, [idVacuna]);
    return rows[0].count > 0;
};


export const listarVacunas = async (req, res) => {
    try {
        const query = 'SELECT * FROM vacunas';
        const [rows] = await pool.query(query);
        res.status(200).json({ vacunas: rows });
    } catch (error) {
        console.error("Error al listar vacunas:", error);
        res.status(500).json({ message: "Error al listar vacunas" });
    }
};

export const listarVacunasPorEspecie = async (req, res) => {
    const { id_especie } = req.params;

    try {
        const query = 'SELECT * FROM vacunas WHERE id_especie = ?';
        const [rows] = await pool.query(query, [id_especie]);
        res.status(200).json({ vacunas: rows });
    } catch (error) {
        console.error("Error al listar vacunas por especie:", error);
        res.status(500).json({ message: "Error al listar vacunas por especie" });
    }
};



export const crearVacuna = async (req, res) => {
    try {
        // Validar los datos
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.error("Errores de validación:", errors.array());
            return res.status(400).json({ errors: errors.array() });
        }

        const { nombre, descripcion, estado = "activo", id_especie } = req.body; // Estado por defecto a "activo"

        if (!nombre || !estado || !id_especie) {
            return res.status(400).json({ message: "Nombre, estado e id_especie son campos requeridos" });
        }

        const query = `
            INSERT INTO vacunas (nombre, descripcion, estado, id_especie)
            VALUES (?, ?, ?, ?)
        `;
        await pool.query(query, [nombre, descripcion, estado, id_especie]);

        res.status(201).json({ message: "Vacuna creada con éxito" });
    } catch (error) {
        console.error("Error al crear vacuna:", error);
        res.status(500).json({ message: "Error al crear vacuna" });
    }
};

export const actualizarVacuna = async (req, res) => {
    try {
        // Validar los datos
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.error("Errores de validación:", errors.array());
            return res.status(400).json({ errors: errors.array() });
        }

        const { vacunaId } = req.params;
        const { nombre, descripcion, estado } = req.body;

        if (!nombre && !descripcion && !estado) {
            return res.status(400).json({ message: "Ningún dato proporcionado para actualizar" });
        }

        let query = `UPDATE vacunas SET 
            nombre = COALESCE(?, nombre),
            descripcion = COALESCE(?, descripcion),
            estado = COALESCE(?, estado)
            WHERE id_vacuna = ?`;

        // Asegurar que todos los parámetros sean pasados en el orden correcto
        const params = [nombre || null, descripcion || null, estado || null, vacunaId];

        const [result] = await pool.query(query, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Vacuna no encontrada" });
        }

        res.status(200).json({ message: "Vacuna actualizada con éxito" });
    } catch (error) {
        console.error("Error al actualizar vacuna:", error);
        res.status(500).json({ message: "Error al actualizar vacuna" });
    }
};


// Eliminar una vacuna
export const eliminarVacuna = async (req, res) => {
    try {
        const { vacunaId } = req.params;

        const query = 'DELETE FROM vacunas WHERE id_vacuna = ?';
        const [result] = await pool.query(query, [vacunaId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Vacuna no encontrada" });
        }

        res.status(200).json({ message: "Vacuna eliminada con éxito" });
    } catch (error) {
        console.error("Error al eliminar vacuna:", error);
        res.status(500).json({ message: "Error al eliminar vacuna" });
    }
};
