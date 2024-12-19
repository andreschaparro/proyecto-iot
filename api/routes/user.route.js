import { register, login, profile, changePassword, forgotPassword, resetPassword } from "../controllers/user.controller.js"
import { isAdmin, checkTokenInBody } from "../middlewares/user.middleware.js"
import express from "express"
import passport from "passport"

export const userRouter = express.Router()

// Ruta para registrar usuarios con un usuario administrador autenticado
userRouter.post(
    "/register",
    // Middleware que autentifica al usuario mediante jwt
    passport.authenticate("jwt", { session: false }),
    // Middleware que verifica si el usuario autenticado es admin
    isAdmin,
    register
)

// Ruta para hacer el login
userRouter.post(
    "/login",
    login
)

// Ruta para obtener los datos del usuario autenticado con jwt
userRouter.get(
    "/profile",
    passport.authenticate("jwt", { session: false }),
    profile
)

// Ruta para cambiar la contraseña del usuario autenticado con jwt
userRouter.post(
    "/change-password",
    passport.authenticate("jwt", { session: false }),
    changePassword
)

// Ruta para enviar un token por correo a un usuario que olvidó su contraseña
userRouter.post(
    "/forgot-password",
    forgotPassword
)

// Ruta para utilizar el token recibido por mail y cambiar la contraseña
userRouter.post(
    "/reset-password",
    // Middleware que verifica el token que viene el body y adjunta su payload en el request
    checkTokenInBody,
    resetPassword
)