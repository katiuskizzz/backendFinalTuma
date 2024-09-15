import { Router } from "express";
import { autenticacion } from "../controllers/autenticacion/auth.js";

const routerAuth = Router();

routerAuth.post("/login", autenticacion )

export default routerAuth;