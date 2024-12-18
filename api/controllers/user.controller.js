import { User } from "../models/user.model.js"
import bcrypt from "bcrypt"

export const register = async (req, res) => {
    try {
        const { name, email, password, rol, admin } = req.body

        // Verifica que todos los campos del body existan
        if (!name || !email || !password || !rol || !admin) {
            return res.status(400).json({
                message: "Los campos name, email, password, rol y admin son obligatorios"
            })
        }

        // Verifica que el usuario admin exista y tenga el rol adecuado
        const existingAdmin = await User.findOne({ email: admin })

        if (!existingAdmin || existingAdmin.rol !== "admin") {
            return res.status(401).json({
                message: "El usuario admin no existe o no tiene el rol correspondiente"
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