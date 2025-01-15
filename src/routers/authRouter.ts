import { Router } from "express";
import { AuthController } from "../controller/Auth.controller";
import { body } from "express-validator";
import { authenticate } from "../middleware/auth.middleware";

const router = Router()

router.post('/crear-cuenta',
    body("email").isEmail().withMessage("Email no valido"),
    body("password")
        .isLength({ min: 8 })
        .withMessage("Contraseña es muy corta min 8 caracteres"),
    body("password_confirmation").custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error("La Contraseña no coincide");
        }
        return true;
    }),
    authenticate,
    AuthController.crearCuenta);

router.post('/inicio-sesion',
    body("email").isEmail().withMessage("Email no valido"),
    body("password")
        .notEmpty()
        .withMessage("Contraseña es muy corta min 8 caracteres"),
    authenticate,
    AuthController.iniciarSecion);

router.post(
    "/confirmar-cuenta",
    body("token").notEmpty().withMessage("el token no puede ir vacio"),
    authenticate,
    AuthController.confirmarCuenta
);

router.post(
    "/nuevo-codigo",
    body("email").isEmail().withMessage("Email no valido"),
    authenticate,
    AuthController.solicitarCodigo
);

router.post(
    "/recuperar-password",
    body("email").isEmail().withMessage("Email no valido"),
    authenticate,
    AuthController.recuperarContraseña
);

router.post(
    "/validar-token",
    body("token").notEmpty().withMessage("el token no puede ir vacio"),
    authenticate,
    AuthController.validarToken
);

router.post(
    "/nueva-contraseña/:token",  
    body("password")
        .isLength({ min: 8 })
        .withMessage("Contraseña es muy corta min 8 caracteres"),
    body("password_confirmation").custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error("La Contraseña no coincide");
        }
        return true;
    }),
    authenticate,
    AuthController.ActualizarConToken
);

export default router 