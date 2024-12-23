import { JWT_SECRET } from "../config/jwt.config.js"
import { EMAIL_USER, EMAIL_PASS } from "../config/nodemailer.config.js"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import nodemailer from "nodemailer"

const SALT_ROUNDS = 10

// Genera un token JWT con un tiempo de expiración para un usuario
export const generateToken = (_id, expiresIn) => {
    // https://jwt.io/
    return jwt.sign({ _id }, JWT_SECRET, { expiresIn })
}

// Cifra una contraseña
export const hashPassword = async (password) => {
    return await bcrypt.hash(password, SALT_ROUNDS)
}

// Compara una contraseña en texto plano contra una cifrada
export const comparePasswords = async (password, hashPassword) => {
    return await bcrypt.compare(password, hashPassword)
}

// Envía un correo electrónico donde el contenido del mismo debe estar en formato HTML
export const sendMail = async (to, subject, html) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: EMAIL_USER,
                pass: EMAIL_PASS
            }
        })

        const mailOptions = {
            from: "iot",
            to,
            subject,
            html
        }

        await transporter.sendMail(mailOptions)
    } catch (error) {
        throw new Error(`Error al enviar correo a ${to}: ${error.message}`)
    }
}