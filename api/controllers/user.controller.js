import { User } from "../models/user.model.js"
import { generateToken, hashPassword, comparePasswords, sendMail } from "../services/user.service.js"

// Registra un nuevo usuario
export const register = async (req, res) => {
    const { name, email, password, rol } = req.body

    if (!name || !email || !password || !rol) {
        return res.status(400).json({ message: "Los campos name, email, password y rol son obligatorios" })
    }

    if (password.length < 8) {
        return res.status(400).json({ message: "La contraseña debe tener al menos 8 caracteres" })
    }

    try {
        const existingUser = await User.findOne({ email })

        if (existingUser) {
            return res.status(409).json({ message: "El correo electrónico ya está registrado" })
        }

        const hashedPassword = await hashPassword(password)

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            rol
        })

        await newUser.save()

        res.status(201).json({ message: "El usuario fue registrado con éxito" })
    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: "Error de validación",
                errors: Object.values(error.errors).map(err => ({ field: err.path, message: err.message }))
            })
        }

        res.status(500).json({ message: "Error interno del servidor", error: error.message })
    }
}

// Procesa una solicitud de login y devuelve un token JWT que expira en una hora en caso de éxito
export const login = async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).json({ message: "Los campos email y password son obligatorios" })
    }

    try {
        const existingUser = await User.findOne({ email })

        if (!existingUser) {
            return res.status(401).json({ message: "El correo eletrónico o la contraseña son incorrectos" })
        }

        const match = await comparePasswords(password, existingUser.password)

        if (!match) {
            return res.status(401).json({ message: "El correo eletrónico o la contraseña son incorrectos" })
        }

        const token = generateToken(existingUser._id, "1h")

        res.json({ token })
    } catch (error) {
        res.status(500).json({ message: "Error interno del servidor", error: error.message })
    }
}

// Devuelve los datos de un usuario autenticado
export const profile = (req, res) => {
    const { name, email, rol } = req.user
    res.json({ name, email, rol })
}

// Cambia la contraseña de un usuario autenticado
export const changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body

    if (!oldPassword || !newPassword) {
        return res.status(400).json({ message: "Los campos oldPassword y newPassword son obligatorios" })
    }

    if (newPassword.length < 8) {
        return res.status(400).json({ message: "La nueva contraseña debe tener al menos 8 caracteres" })
    }

    try {
        const { email, password } = req.user

        const matchOldPassword = await comparePasswords(oldPassword, password)

        if (!matchOldPassword) {
            return res.status(401).json({ message: "La contraseña actual es incorrecta" })
        }

        const matchNewPassword = await comparePasswords(newPassword, password)

        if (matchNewPassword) {
            return res.status(400).json({ message: "La nueva contraseña no puede ser la misma que la actual" })
        }

        const hashedPassword = await hashPassword(newPassword)

        await User.findOneAndUpdate({ email }, { password: hashedPassword })

        res.json({ message: "La contraseña fue modificada" })
    } catch (error) {
        res.status(500).json({ message: "Error interno del servidor", error: error.message })
    }
}

// Envía por correo electrónico un token JWT que expira en 15 minutos para restablecer la contraseña 
export const forgotPassword = async (req, res) => {
    const { email } = req.body

    if (!email) {
        return res.status(400).json({ message: "El campo email es obligatorio" })
    }

    try {
        const existingUser = await User.findOne({ email })

        if (!existingUser) {
            return res.status(404).json({ message: "El correo electrónico no está registrado" })
        }

        const token = generateToken(existingUser._id, "15m")

        // https://ethereal.email/messages
        const message = `<p>Para restablecer tu contraseña utiliza el siguiente token:<p><h4>${token}<h4>`

        await sendMail(email, "Restablecer contraseña", message)

        res.json({ message: "Se ha enviado el correo electrónico para restablecer la contraseña" })
    } catch (error) {
        res.status(500).json({ message: "Error interno del servidor", error: error.message })
    }
}

// Restablece la contraseña de un usuario
export const resetPassword = async (req, res) => {
    const { newPassword } = req.body

    if (!newPassword) {
        return res.status(400).json({ message: "El campo newPassword es obligatorio" })
    }

    if (newPassword.length < 8) {
        return res.status(400).json({ message: "La nueva contraseña debe tener al menos 8 caracteres" })
    }

    try {
        const { email, password } = req.user

        const matchNewPassword = await comparePasswords(newPassword, password)

        if (matchNewPassword) {
            return res.status(400).json({ message: "La nueva contraseña no puede ser la misma que la actual" })
        }

        const hashedPassword = await hashPassword(newPassword)

        await User.findOneAndUpdate({ email }, { password: hashedPassword })

        res.json({ message: "La contraseña fue modificada" })
    } catch (error) {
        res.status(500).json({ message: "Error interno del servidor", error: error.message })
    }
}