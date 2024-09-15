import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../../db/conexion.js';

export const autenticacion = async (req, res) => {
    try {
        const { correo, password } = req.body;

        if (!correo || !password) {
            return res.status(400).json({
                message: 'Por favor, completa todos los campos'
            });
        }

        // Seleccionar el usuario con el correo proporcionado
        const [result] = await pool.query('SELECT * FROM usuarios WHERE correo = ?', [correo]);

        if (result.length === 0) {
            return res.status(404).json({
                message: 'Usuario no encontrado'
            });
        }

        const user = result[0];

        // Verificar si la contraseña está disponible en la base de datos
        if (!user.password) { // Cambia 'password' si el nombre de tu campo es diferente
            return res.status(500).json({
                message: 'Contraseña no encontrada en la base de datos'
            });
        }

        console.log('Password ingresada:', password);
        console.log('Password en la base de datos:', user.password);

        // Comparar la contraseña ingresada con la contraseña almacenada
        const match = await bcrypt.compare(password, user.password);

        if (match) {
            // Generar un token JWT
            const token = jwt.sign(
                { userId: user.id_usuario },
                'estemensajedebeserlargoyseguro', 
                { expiresIn: '24h' }
            );

            return res.status(200).json({
                message: 'Usuario autenticado',
                token: token,
                id: user.id_usuario,
                correo: user.correo,
                rol: user.rol
            });
        } else {
            return res.status(401).json({
                message: 'Contraseña incorrecta'
            });
        }
    } catch (error) {
        console.error('Error en autenticación:', error);
        return res.status(500).json({
            message: 'Error en el servidor'
        });
    }
};