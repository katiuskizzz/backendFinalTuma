import { pool } from "../../db/conexion.js";
import { validationResult } from "express-validator";

// Listar todos los géneros
export const listarGeneros = async (req, res) => {
    try {
        const query = 'SELECT * FROM generos';
        const [rows] = await pool.query(query);
        res.status(200).json({ generos: rows });
    } catch (error) {
        console.error("Error al listar géneros:", error);
        res.status(500).json({ message: "Error al listar géneros" });
    }
};

// Crear un nuevo género
export const crearGenero = async (req, res) => {
    try {
        // Validar los datos
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.error("Errores de validación:", errors.array());
            return res.status(400).json({ errors: errors.array() });
        }

        const { nombre, estado } = req.body;

        if (!nombre || !estado) {
            return res.status(400).json({ message: "Todos los campos son requeridos" });
        }

        const query = `
            INSERT INTO generos (nombre, estado)
            VALUES (?, ?)
        `;
        await pool.query(query, [nombre, estado]);

        res.status(201).json({ message: "Género creado con éxito" });
    } catch (error) {
        console.error("Error al crear género:", error);
        res.status(500).json({ message: "Error al crear género" });
    }
};

// Actualizar un género existente
export const actualizarGenero = async (req, res) => {
    try {
        // Validar los datos
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.error("Errores de validación:", errors.array());
            return res.status(400).json({ errors: errors.array() });
        }

        const { generoId } = req.params;
        const { nombre, estado } = req.body;

        if (!nombre && !estado) {
            return res.status(400).json({ message: "Ningún dato proporcionado para actualizar" });
        }

        let query = `UPDATE generos SET 
            nombre = COALESCE(?, nombre),
            estado = COALESCE(?, estado)
            WHERE id_genero = ?`;

        const params = [nombre, estado, generoId].filter(param => param !== null && param !== undefined);

        const [result] = await pool.query(query, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Género no encontrado" });
        }

        res.status(200).json({ message: "Género actualizado con éxito" });
    } catch (error) {
        console.error("Error al actualizar género:", error);
        res.status(500).json({ message: "Error al actualizar género" });
    }
};

// Eliminar un género
export const eliminarGenero = async (req, res) => {
    try {
        const { generoId } = req.params;

        const query = 'DELETE FROM generos WHERE id_genero = ?';
        const [result] = await pool.query(query, [generoId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Género no encontrado" });
        }

        res.status(200).json({ message: "Género eliminado con éxito" });
    } catch (error) {
        console.error("Error al eliminar género:", error);
        res.status(500).json({ message: "Error al eliminar género" });
    }
};
