import { pool } from "../../db/conexion.js";
import { validationResult } from "express-validator";

// Listar todo el historial de vacunas

export const listarHistorialVacunas = async (req, res) => {
    try {
        // Obtiene el id_mascota desde los parámetros de la solicitud
        const { id_mascota } = req.params;

        // Verifica si el id_mascota está presente
        if (!id_mascota) {
            return res.status(400).json({ message: "Falta el ID de la mascota" });
        }

        // Realiza la consulta para obtener el historial de vacunas con nombres de vacunas
        const query = `
            SELECT 
                hv.id_historial,
                v.nombre AS nombre_vacuna,  
                DATE_FORMAT(hv.fecha_vacunacion, '%d-%m-%Y') AS fecha_vacunacion,
                hv.descripcion
            FROM 
                historial_vacunas hv
            JOIN 
                vacunas v ON hv.id_vacuna = v.id_vacuna
            WHERE 
                hv.id_mascota = ?
        `;
        const [rows] = await pool.query(query, [id_mascota]);

        // Verifica si se encontraron resultados
        if (rows.length === 0) {
            return res.status(404).json({ message: "No se encontraron vacunas para esta mascota" });
        }

        // Envía la respuesta con el historial de vacunas
        res.status(200).json({ historial: rows });
    } catch (error) {
        console.error("Error al listar historial de vacunas:", error);
        res.status(500).json({ message: "Error al listar historial de vacunas" });
    }
};

// Crear un nuevo registro en el historial de vacunas
export const crearHistorialVacuna = async (req, res) => {
    try {
        // Validar los datos
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.error("Errores de validación:", errors.array());
            return res.status(400).json({ errors: errors.array() });
        }

        const { id_mascota, id_vacuna, fecha_vacunacion } = req.body;

        if (!id_mascota || !id_vacuna || !fecha_vacunacion) {
            return res.status(400).json({ message: "Todos los campos son requeridos" });
        }

        // Verificar si la mascota ya tiene esta vacuna
        const checkQuery = `
            SELECT * FROM historial_vacunas 
            WHERE id_mascota = ? AND id_vacuna = ?
        `;
        const [existingVacuna] = await pool.query(checkQuery, [id_mascota, id_vacuna]);

        if (existingVacuna.length > 0) {
            return res.status(400).json({ message: "Esta vacuna ya ha sido administrada a la mascota." });
        }

        // Si no existe, proceder a agregar la vacuna
        const insertQuery = `
            INSERT INTO historial_vacunas (id_mascota, id_vacuna, fecha_vacunacion)
            VALUES (?, ?, ?)
        `;
        await pool.query(insertQuery, [id_mascota, id_vacuna, fecha_vacunacion]);

        res.status(201).json({ message: "Historial de vacuna creado con éxito" });
    } catch (error) {
        console.error("Error al crear historial de vacuna:", error);
        res.status(500).json({ message: "Error al crear historial de vacuna" });
    }
};

// Actualizar un registro en el historial de vacunas
export const actualizarHistorialVacuna = async (req, res) => {
    try {
        // Validar los datos
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.error("Errores de validación:", errors.array());
            return res.status(400).json({ errors: errors.array() });
        }

        const { historialId } = req.params;
        const { id_mascota, id_vacuna, fecha_vacunacion } = req.body;

        if (!id_mascota && !id_vacuna && !fecha_vacunacion) {
            return res.status(400).json({ message: "Ningún dato proporcionado para actualizar" });
        }

        let query = `UPDATE historial_vacunas SET 
            id_mascota = COALESCE(?, id_mascota),
            id_vacuna = COALESCE(?, id_vacuna),
            fecha_vacunacion = COALESCE(?, fecha_vacunacion)
            WHERE id_historial = ?`;

        const params = [id_mascota, id_vacuna, fecha_vacunacion, historialId].filter(param => param !== null && param !== undefined);

        const [result] = await pool.query(query, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Registro de historial de vacuna no encontrado" });
        }

        res.status(200).json({ message: "Historial de vacuna actualizado con éxito" });
    } catch (error) {
        console.error("Error al actualizar historial de vacuna:", error);
        res.status(500).json({ message: "Error al actualizar historial de vacuna" });
    }
};

// Eliminar un registro del historial de vacunas
export const eliminarHistorialVacuna = async (req, res) => {
    try {
        const { historialId } = req.params;

        const query = 'DELETE FROM historial_vacunas WHERE id_historial = ?';
        const [result] = await pool.query(query, [historialId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Registro de historial de vacuna no encontrado" });
        }

        res.status(200).json({ message: "Registro de historial de vacuna eliminado con éxito" });
    } catch (error) {
        console.error("Error al eliminar historial de vacuna:", error);
        res.status(500).json({ message: "Error al eliminar historial de vacuna" });
    }
};
