import { User } from "../models/user.model.js"
import { generateToken, hashPassword, comparePasswords, sendMail } from "../services/user.service.js"

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
        const hashedPassword = await hashPassword(password)

        // Registra el usuario
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            rol
        })

        await newUser.save()

        res.status(201).json({
            message: "El usuario fue registrado"
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
        const match = await comparePasswords(password, existingUser.password)

        if (!match) {
            return res.status(401).json({
                message: "El correo eletrónico o la contraseña son incorrectos"
            })
        }

        // Genera el token
        const token = generateToken(existingUser._id, "1d")

        // Devuelve el token para que los requests lo incluyan en la cabecera de autenticación
        res.json({ token })

    } catch (error) {
        res.status(500).json({
            message: "Error en el servidor",
            error: error.message
        })
    }
}

export const profile = (req, res) => {
    // Devulve los datos del usuario que pasó por el proceso de autenticación con jwt
    const { name, email, rol } = req.user

    res.json({ name, email, rol })
}

export const changePassword = async (req, res) => {
    try {
        // Verifica que todos los campos del body existan
        const { oldPassword, newPassword } = req.body

        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                message: "Los campos oldPassword y newPassword son obligatorios"
            })
        }

        // Obtiene los datos del usuario autenticado
        const { email, password } = req.user

        const matchOldPassword = await comparePasswords(oldPassword, password)

        if (!matchOldPassword) {
            return res.status(401).json({
                message: "La contraseña vieja es incorrecta"
            })
        }

        // Verifica la longitud mínima de la nueva contraseña
        if (newPassword.length < 8) {
            return res.status(400).json({
                message: "La nueva contraseña debe tener al menos 8 caracteres"
            })
        }

        // Verifica que no ingrese la contraseña actual
        const matchNewPassword = await comparePasswords(newPassword, password)

        if (matchNewPassword) {
            return res.status(400).json({
                message: "La nueva contraseña no puede ser la misma que la actual"
            })
        }

        // Cifra la nueva contraseña
        const hashedPassword = await hashPassword(newPassword)

        // Actualiza la contraseña en la base de datos
        await User.findOneAndUpdate(
            { email },
            { password: hashedPassword }
        )

        res.json({
            message: "La contraseña fue actualizada"
        })

    } catch (error) {
        res.status(500).json({
            message: "Error en el servidor",
            error: error.message
        })
    }
}

export const forgotPassword = async (req, res) => {
    try {
        // Verifica que todos los campos del body existan
        const { email } = req.body

        if (!email) {
            return res.status(400).json({
                message: "El campo email es obligatorio"
            })
        }

        // Verifica que el usuario se encuentre registrado
        const existingUser = await User.findOne({ email })

        if (!existingUser) {
            return res.status(404).json({
                message: "El correo electrónico es incorrecto"
            })
        }

        // Genera el token
        const token = generateToken(existingUser._id, "15m")

        // Envía el correo electrónico con el token https://ethereal.email/messages
        const message = `<p>Has olvidado tu contraseña. Para cambiarla, utiliza el siguiente token:<p>
                        <h4>${token}<h4>`

        await sendMail(email, "Reestablecer contraseña", message)

        res.json({
            message: "Se ha enviado el correo electrónico para cambiar la contraseña"
        })

    } catch (error) {
        res.status(500).json({
            message: "Error en el servidor",
            error: error.message
        })
    }
}

export const resetPassword = async (req, res) => {
    try {
        // Verifica que todos los campos del body existan
        const { newPassword } = req.body

        if (!newPassword) {
            return res.status(400).json({
                message: "El campo newPassword es obligatorio"
            })
        }

        // Verifica que el usuario se encuentre registrado
        const { _id } = req.user

        const existingUser = await User.findById(_id)

        if (!existingUser) {
            return res.status(404).json({
                message: "Usuario no encontrado"
            })
        }

        // Verifica la longitud mínima de la nueva contraseña
        if (newPassword.length < 8) {
            return res.status(400).json({
                message: "La nueva contraseña debe tener al menos 8 caracteres"
            })
        }

        // Verifica que no ingrese la contraseña actual
        const matchNewPassword = await comparePasswords(newPassword, existingUser.password)

        if (matchNewPassword) {
            return res.status(400).json({
                message: "La nueva contraseña no puede ser la misma que la actual"
            })
        }

        // Cifra la nueva contraseña
        const hashedPassword = await hashPassword(newPassword)

        // Actualiza la contraseña en la base de datos
        await User.findByIdAndUpdate(
            _id,
            { password: hashedPassword }
        )

        res.json({
            message: "La contraseña fue actualizada"
        })

    } catch (error) {
        res.status(500).json({
            message: "Error en el servidor",
            error: error.message
        })
    }
}