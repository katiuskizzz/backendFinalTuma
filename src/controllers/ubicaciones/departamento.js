import { pool } from "../../db/conexion.js";
import { validationResult } from "express-validator";

// Listar todos los departamentos
export const listarDepartamentos = async (req, res) => {
    try {
        const query = 'SELECT * FROM departamentos';
        const [rows] = await pool.query(query);
        res.status(200).json({ departamentos: rows });
    } catch (error) {
        console.error("Error al listar departamentos:", error);
        res.status(500).json({ message: "Error al listar departamentos" });
    }
};

// Crear un nuevo departamento
export const crearDepartamento = async (req, res) => {
    try {
        // Validar los datos
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.error("Errores de validación:", errors.array());
            return res.status(400).json({ errors: errors.array() });
        }

        const { codigo_dane, nombre, estado } = req.body;

        if (!codigo_dane || !nombre || !estado) {
            return res.status(400).json({ message: "Todos los campos son requeridos" });
        }

        const query = `
            INSERT INTO departamentos (codigo_dane, nombre, estado)
            VALUES (?, ?, ?)
        `;
        await pool.query(query, [codigo_dane, nombre, estado]);

        res.status(201).json({ message: "Departamento creado con éxito" });
    } catch (error) {
        console.error("Error al crear departamento:", error);
        res.status(500).json({ message: "Error al crear departamento" });
    }
};

// Actualizar un departamento existente
export const actualizarDepartamento = async (req, res) => {
    try {
        // Validar los datos
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.error("Errores de validación:", errors.array());
            return res.status(400).json({ errors: errors.array() });
        }

        const { departamentoId } = req.params;
        const { codigo_dane, nombre, estado } = req.body;

        if (!codigo_dane && !nombre && !estado) {
            return res.status(400).json({ message: "Ningún dato proporcionado para actualizar" });
        }

        let query = `UPDATE departamentos SET 
            codigo_dane = COALESCE(?, codigo_dane),
            nombre = COALESCE(?, nombre),
            estado = COALESCE(?, estado)
            WHERE id_departamento = ?`;

        const params = [codigo_dane, nombre, estado, departamentoId].filter(param => param !== null && param !== undefined);

        const [result] = await pool.query(query, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Departamento no encontrado" });
        }

        res.status(200).json({ message: "Departamento actualizado con éxito" });
    } catch (error) {
        console.error("Error al actualizar departamento:", error);
        res.status(500).json({ message: "Error al actualizar departamento" });
    }
};

// Eliminar un departamento
export const eliminarDepartamento = async (req, res) => {
    try {
        const { departamentoId } = req.params;

        const query = 'DELETE FROM departamentos WHERE id_departamento = ?';
        const [result] = await pool.query(query, [departamentoId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Departamento no encontrado" });
        }

        res.status(200).json({ message: "Departamento eliminado con éxito" });
    } catch (error) {
        console.error("Error al eliminar departamento:", error);
        res.status(500).json({ message: "Error al eliminar departamento" });
    }
};
