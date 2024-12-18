import { User } from "../models/user.model.js"
import { secret } from "../config/jwt.config.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

export const register = async (req, res) => {
    try {
        const { name, email, password, rol } = req.body

        // Verifica que todos los campos del body existan
        if (!name || !email || !password || !rol) {
            return res.status(400).json({
                message: "Los campos name, email, password y rol son obligatorios"
            })
        }

        // Verifica que el usuario no se encuentre registrado
        const existingUser = await User.findOne({ email })

        if (existingUser) {
            return res.status(409).json({
                message: "El usuario ya se encuentra registrado"
            })
        }

        // Verifica la longitud mínima de la contraseña
        if (password.length < 8) {
            return res.status(400).json({
                message: "La contraseña debe tener al menos 8 caracteres"
            })
        }

        // Cifra la contraseña
        const hashedPassword = await bcrypt.hash(password, 10)

        // Registra el usuario
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            rol
        })

        const savedUser = await newUser.save()

        res.status(201).json({
            message: "El usuario fue registrado",
            user: {
                name: savedUser.name,
                email: savedUser.email,
                rol: savedUser.rol
            }
        })

    } catch (error) {
        // Maneja los mensajes de error producidos en el modelo
        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: "Error de validación",
                errors: Object.values(error.errors).map(err => ({
                    field: err.path,
                    message: err.message
                }))
            })
        }

        res.status(500).json({
            message: "Error en el servidor",
            error: error.message
        })
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body

        // Verifica que todos los campos del body existan
        if (!email || !password) {
            return res.status(400).json({
                message: "Los campos email y password son obligatorios"
            })
        }

        // Verifica que el usuario se encuentre registrado
        const existingUser = await User.findOne({ email })

        if (!existingUser) {
            return res.status(401).json({
                message: "El correo eletrónico o la contraseña son incorrectos"
            })
        }

        // Compara el password recibido contra el que esta cifrado en la base de datos
        const isPasswordValid = await bcrypt.compare(password, existingUser.password)

        if (!isPasswordValid) {
            return res.status(401).json({
                message: "El correo eletrónico o la contraseña son incorrectos"
            })
        }

        // Crea un token que se puede analizar en https://jwt.io/
        const token = jwt.sign(
            // Payload
            { _id: existingUser._id },
            // Clave secreta
            secret,
            // Duración de 1 día
            { expiresIn: "1d" }
        )

        // Devuelve el token para que los requests lo incluyan en la cabecera de autenticación
        res.json({
            message: "Login exitoso",
            token: `Bearer ${token}`
        })

    } catch (error) {
        res.status(500).json({
            message: "Error en el servidor",
            error: error.message
        })
    }
}