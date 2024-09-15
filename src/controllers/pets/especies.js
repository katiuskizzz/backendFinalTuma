import { pool } from "../../db/conexion.js";
import { validationResult } from "express-validator";

// Listar todas las especies
export const listarEspecies = async (req, res) => {
    try {
        const query = 'SELECT * FROM especies';
        const [rows] = await pool.query(query);
        res.status(200).json({ especies: rows });
    } catch (error) {
        console.error("Error al listar especies:", error);
        res.status(500).json({ message: "Error al listar especies" });
    }
};

// Crear una nueva especie
export const crearEspecie = async (req, res) => {
    try {
        // Validar los datos
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.error("Errores de validación:", errors.array());
            return res.status(400).json({ errors: errors.array() });
        }

        const { nombre } = req.body;

        if (!nombre ) {
            return res.status(400).json({ message: "Todos los campos son requeridos" });
        }

        const query = `
            INSERT INTO especies (nombre)
            VALUES (?)
        `;
        await pool.query(query, [nombre]);

        res.status(201).json({ message: "Especie creada con éxito" });
    } catch (error) {
        console.error("Error al crear especie:", error);
        res.status(500).json({ message: "Error al crear especie" });
    }
};

// Actualizar una especie existente
export const actualizarEspecie = async (req, res) => {
    try {
        // Validar los datos
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.error("Errores de validación:", errors.array());
            return res.status(400).json({ errors: errors.array() });
        }

        const { especieId } = req.params;
        const { nombre, estado } = req.body;

        if (!nombre && !estado) {
            return res.status(400).json({ message: "Ningún dato proporcionado para actualizar" });
        }

        let query = `UPDATE especies SET 
            nombre = COALESCE(?, nombre),
            estado = COALESCE(?, estado)
            WHERE id_especie = ?`;

        const params = [nombre, estado, especieId].filter(param => param !== null && param !== undefined);

        const [result] = await pool.query(query, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Especie no encontrada" });
        }

        res.status(200).json({ message: "Especie actualizada con éxito" });
    } catch (error) {
        console.error("Error al actualizar especie:", error);
        res.status(500).json({ message: "Error al actualizar especie" });
    }
};

// Eliminar una especie
export const eliminarEspecie = async (req, res) => {
    try {
        const { especieId } = req.params;

        const query = 'DELETE FROM especies WHERE id_especie = ?';
        const [result] = await pool.query(query, [especieId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Especie no encontrada" });
        }

        res.status(200).json({ message: "Especie eliminada con éxito" });
    } catch (error) {
        console.error("Error al eliminar especie:", error);
        res.status(500).json({ message: "Error al eliminar especie" });
    }
};

// activar
export const activarEspecie = async (req, res) => {
    try {
        const { especieId } = req.params;

        const query = `
            UPDATE especies 
            SET estado = 'activo'
            WHERE id_especie = ?
        `;
        const [result] = await pool.query(query, [especieId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Especie no encontrada" });
        }

        res.status(200).json({ message: "Especie activada con éxito" });
    } catch (error) {
        console.error("Error al activar especie:", error);
        res.status(500).json({ message: "Error al activar especie" });
    }
};

// Inactivar una especie
export const inactivarEspecie = async (req, res) => {
    try {
        const { especieId } = req.params;

        // Verificar si hay mascotas activas asociadas a la especie
        const checkQuery = `
            SELECT COUNT(*) AS count 
            FROM mascotas 
            WHERE especie = ? AND estado IN ('en adopción', 'urgente', 'reservado')
        `;
        const [checkResult] = await pool.query(checkQuery, [especieId]);

        if (checkResult[0].count > 0) {
            return res.status(400).json({ message: "No se puede desactivar la especie. Hay mascotas asociadas en proceso de adopción o urgentes." });
        }

        // Verificar si la especie ya está desactivada
        const statusQuery = `
            SELECT estado 
            FROM especies 
            WHERE id_especie = ?
        `;
        const [statusResult] = await pool.query(statusQuery, [especieId]);

        if (statusResult.length === 0) {
            return res.status(404).json({ message: "Especie no encontrada" });
        }

        if (statusResult[0].estado === 'inactivo') {
            return res.status(400).json({ message: "La especie ya está inactiva" });
        }

        // Actualizar estado de la especie a 'inactivo'
        const updateQuery = `
            UPDATE especies 
            SET estado = 'inactivo'
            WHERE id_especie = ?
        `;
        const [updateResult] = await pool.query(updateQuery, [especieId]);

        if (updateResult.affectedRows === 0) {
            return res.status(404).json({ message: "Especie no encontrada" });
        }

        res.status(200).json({ message: "Especie inactivada con éxito" });
    } catch (error) {
        console.error("Error al inactivar especie:", error);
        res.status(500).json({ message: "Error al inactivar especie" });
    }
};
