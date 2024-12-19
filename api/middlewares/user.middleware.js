import { secret } from "../config/jwt.config.js"
import jwt from "jsonwebtoken"

export const isAdmin = (req, res, next) => {
    if (!req.user || req.user.rol !== "admin") {
        return res.status(403).json({
            message: "Se requiere el rol de administrador"
        })
    }

    // Pasa al siguiente middleware o controlador
    next()
}

export const checkTokenInBody = (req, res, next) => {
    // Verifica que exista el token y que sea válido
    const token = req.body.token

    if (!token) {
        return res.status(400).json({
            message: "El campo token es obligatorio"
        })
    }

    jwt.verify(token, secret, (error, decoded) => {
        if (error) {
            return res.status(401).json({
                message: "El token es inválido"
            })
        }

        //Agrega al request el payload del jwt
        req.user = decoded

        // Pasa al siguiente middleware o controlador
        next()
    })
}