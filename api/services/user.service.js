import { secret } from "../config/jwt.config.js"
import { user, pass } from "../config/nodemailer.config.js"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import nodemailer from "nodemailer"

const SALT_ROUNDS = 10

export const generateToken = (_id, expiresIn) => {
    // https://jwt.io/
    return jwt.sign(
        // Payload
        { _id },
        // Clave secreta
        secret,
        // Duración
        { expiresIn }
    )
}

export const hashPassword = async (password) => {
    return await bcrypt.hash(password, SALT_ROUNDS)
}

export const comparePasswords = async (password, hashPassword) => {
    return await bcrypt.compare(password, hashPassword)
}

export const sendMail = async (to, subject, html) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: { user, pass }
        })

        const mailOptions = {
            from: "iot",
            to,
            subject,
            text: "Solicitud de blanqueo de password",
            html
        }

        const info = await transporter.sendMail(mailOptions)

    } catch (error) {
        console.error(`Error enviando el mail : ${errror.message}`)
    }
}