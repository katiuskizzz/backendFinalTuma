import { Router } from "express";
import {
    registerUser,
    uploadUserImage,
    ListarUsers,
    updateUser,
    ListarUsersId
    } from "../controllers/users/user.js";

    import { CambiaPaswor, solicitarCambioContrasena, validarCampos, verificarCodigo } from "../controllers/users/password.js";
import express from "express"
import { updateUserValidations } from "../controllers/validations/User.validation.js";
import { tokenautorizacion } from "../middlewares/token.js";

const routerUser = Router();

routerUser.post('/register', updateUserValidations,uploadUserImage, registerUser);
routerUser.get('/listarUsers',tokenautorizacion, ListarUsers);
routerUser.get('/ListarUsersId/:id', ListarUsersId);
routerUser.put('/updateUser/:userId',updateUserValidations  , uploadUserImage, updateUser);


//password

routerUser.post('/requestPassword', solicitarCambioContrasena);
routerUser.post('/verifyPassword', verificarCodigo);


//nueva funcion de validar correo 
routerUser.post('/validardatos', validarCampos);
routerUser.put('/cambiarPasswor/:identificacion', CambiaPaswor);



export default routerUser;