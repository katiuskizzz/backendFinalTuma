import { validationResult, check } from "express-validator";

export const updateUserValidations = [
    check('nombre').optional().isLength({ min: 1 }).withMessage('Nombre debe tener al menos 1 carácter'),
    check('apellido').optional().isLength({ min: 1 }).withMessage('Apellido debe tener al menos 1 carácter'),
    check('id_departamento').optional().isInt().withMessage('ID Departamento debe ser un número entero'),
    check('id_municipio').optional().isInt().withMessage('ID Municipio debe ser un número entero'),
    check('telefono').optional().isLength({ min: 10, max: 15 }).withMessage('Teléfono debe tener entre 10 y 15 caracteres'),
    check('correo').optional().isEmail().withMessage('Correo electrónico inválido'),
    check('tipo_documento').optional().isIn(['Cedula', 'Tarjeta', 'Tarjeta Extranjera']).withMessage('Tipo de documento inválido'),
    check('documento_identidad').optional().isLength({ min: 5 }).withMessage('Documento de identidad debe tener al menos 5 caracteres'),
    check('password').optional().isLength({ min: 6 }).withMessage('Contraseña debe tener al menos 6 caracteres'),
];