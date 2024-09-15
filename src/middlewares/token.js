import jwt from 'jsonwebtoken';

export const tokenautorizacion = (req, res, next) => {
    // Obtén el token del encabezado `token`
    const token = req.headers['token'];

    if (token == null) return res.status(401).json({ message: 'Token no proporcionado' });

    jwt.verify(token, 'estemensajedebeserlargoyseguro', (err, user) => {
        if (err) return res.status(403).json({ message: 'Token inválido' });

        req.user = user; // Agrega el usuario al objeto de solicitud
        next();
    });
};
