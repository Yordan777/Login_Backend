import { Request, Response } from 'express';
import User from '../model/User.model';
import Token from '../model/Token.model';
import { generateToken } from '../utils/token.util';
import { checkPassword, hashPassword } from '../utils/auth.util';
import { generateJWT } from '../utils/jwt.util';
import { AuthEmail } from '../email/auth.email';


export class AuthController {
    static crearCuenta = async (req: Request, res: Response): Promise<void> => {
        try {
            const { password, email } = req.body;

            // Verificar si el usuario ya existe
            const usuarioExiste = await User.findOne({ email });
            if (usuarioExiste) {
                res.status(409).json({ error: 'El usuario ya está registrado' });
            }
            // Crear el nuevo usuario
            const nuevoUsuario = new User(req.body);

            // Hashear la contraseña
            nuevoUsuario.password = await hashPassword(password);

            // Generar el token
            const token = new Token();
            token.token = generateToken();
            token.user = nuevoUsuario.id;

            //enviar email
            AuthEmail.sendConfirmationEmail({
                email: nuevoUsuario.email,
                name: nuevoUsuario.name,
                token: token.token,
            });

            // Responder con éxito
            Promise.allSettled([nuevoUsuario.save(), token.save()])
            res.send('Usuario creado exitosamente')
        } catch (error: any) {
            // Manejar errores
            res.status(500).json({ message: error.message });
        }
    };

    static iniciarSecion = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email, password } = req.body;

            // Verificar si el usuario ya existe
            const usuario = await User.findOne({ email });
            if (!usuario) {
                res.status(409).json({ error: 'Usuario no encontrado' });
            }

            // confirmar si el usuario no esta confirmado
            if (!usuario.confirmed) {
                // generar token
                const token = new Token();
                token.user = usuario.id;
                token.token = generateToken();
                await token.save();

                // enviar email
                AuthEmail.sendConfirmationEmail({
                    email: usuario.email,
                    name: usuario.name,
                    token: token.token,
                });

                const error = new Error(
                    "La cuenta no se ha confirmado, le enviamos un token a su email"
                );
                res.status(401).json({ error: error.message });
            }

            const contraseñaCorrecta = await checkPassword(password, usuario.password)
            if (!contraseñaCorrecta) {
                const error = new Error("Contraseña no valida");
                res.status(401).json({ error: error.message });
            }

            const token = generateJWT({ id: usuario.id });

            res.send(token);
        } catch (error: any) {
            // Manejar errores
            res.status(500).json({ message: error.message });
        }
    };

    static confirmarCuenta = async (req: Request, res: Response): Promise<void> => {
        try {
            const { token } = req.body;

            // Verificar si el token ya existe
            const tokeExiste = await Token.findOne({ token });
            if (!tokeExiste) {
                res.status(409).json({ error: 'Token no valido' });
            }

            const usuario = await User.findOne(tokeExiste.user)
            usuario.confirmed = true;



            // Responder con éxito
            Promise.allSettled([usuario.save(), tokeExiste.save()])
            res.send("Cuenta confirmada correctamente")
        } catch (error: any) {
            // Manejar errores
            res.status(500).json({ message: error.message });
        }
    };

    static solicitarCodigo = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email } = req.body;

            // Verificar si el token ya existe
            const usuario = await User.findOne({ email });
            if (!usuario) {
                const error = new Error("El usuario no existe");
                res.status(404).json({ error: error.message });
            }

            if (usuario.confirmed) {
                const error = new Error("El usuario ya esta confirmado");
                res.status(403).json({ error: error.message });
            }

            // generar token
            const token = new Token();
            token.user = usuario.id;
            token.token = generateToken();
            await token.save();

            // enviar email
            AuthEmail.sendConfirmationEmail({
                email: usuario.email,
                name: usuario.name,
                token: token.token,
            });

            // Responder con éxito
            Promise.allSettled([usuario.save(), token.save()])
            res.send("Cuenta confirmada correctamente")
        } catch (error: any) {
            // Manejar errores
            res.status(500).json({ message: error.message });
        }
    };

    static recuperarContraseña = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email } = req.body;

            // Verificar si el token ya existe
            const usuario = await User.findOne({ email });
            if (!usuario) {
                const error = new Error("El usuario no existe");
                res.status(404).json({ error: error.message });
            }

            // generar token
            const token = new Token();
            token.user = usuario.id;
            token.token = generateToken();
            await token.save();

            // enviar email
            AuthEmail.sendPasswordResetToken({
                email: usuario.email,
                name: usuario.name,
                token: token.token,
            });

            // Responder con éxito
            Promise.allSettled([usuario.save(), token.save()])
            res.send("Revisa tu e-mail para restablecer tu contraseña")
        } catch (error: any) {
            // Manejar errores
            res.status(500).json({ message: error.message });
        }
    };

    static validarToken = async (req: Request, res: Response) => {
        try {
            const { token } = req.body;

            const tokenExiste = await Token.findOne({ token });
            if (!tokenExiste) {
                const error = new Error("Token no valido");
                res.status(404).json({ error: error.message });
            }

            res.send("Token valido, define tu nueva contraseña");
        } catch (error) {
            res.status(500).json({ error: "hubo un error" });
        }
    };

    static ActualizarConToken = async (req: Request, res: Response) => {
        try {
            const { token } = req.params;
            const { password } = req.body;

            const tokenExiste = await Token.findOne({ token });
            if (!tokenExiste) {
                const error = new Error("Token no valido");
                res.status(404).json({ error: error.message });
            }

            const user = await User.findById(tokenExiste.user);
            user.password = await hashPassword(password);

            await Promise.allSettled([user.save(), tokenExiste.deleteOne()]);
            res.send("Su contraseña se modifico correctamente");
        } catch (error) {
            res.status(500).json({ error: "hubo un error" });
        }
    };
}

