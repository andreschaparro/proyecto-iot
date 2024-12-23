import { JWT_SECRET } from "../config/jwt.config.js"
import { User } from "../models/user.model.js"
import jwt from "jsonwebtoken"

// Verifica el token que puede venir en el header de autenticación o en el body
const verifyJwt = async (req, res, next, tokenSource) => {
    const token = tokenSource === "header"
        ? req.headers.authorization?.split(" ")[1]
        : req.body?.token

    if (!token) {
        return res.status(401).json({ message: "No se proporcionó un token de autenticación" })
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET)

        const user = await User.findById(decoded._id)

        if (!user) {
            return res.status(403).json({ message: "Usuario no encontrado" })
        }

        req.user = user

        next()
    } catch (error) {
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Token inválido" })
        }

        if ((error.name === "TokenExpiredError")) {
            return res.status(401).json({ message: "Token expirado" })
        }

        console.error(error)
        return res.status(500).json({ message: "Error interno del servidor", error: error.message })
    }
}

// Middleware para verificar el token que viene en el header de autenticación
export const verifyJwtFromHeader = (req, res, next) => { verifyJwt(req, res, next, "header") }

// Middleware para verificar el token que viene en el body
export const verifyJwtFromBody = (req, res, next) => { verifyJwt(req, res, next, "body") }

// Middleware para verificar que el usuario tenga el rol de administrador
export const ensureAdminRole = (req, res, next) => {
    const role = req.user?.rol

    if (role !== "admin") {
        return res.status(403).json({ message: "El usuario no es administrador" })
    }

    next()
}