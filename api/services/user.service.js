import { secret } from "../config/jwt.config.js"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const SALT_ROUNDS = 10

export const generateToken = (_id) => {
    // El jwt se puede analizar en https://jwt.io/
    return jwt.sign(
        // Payload
        { _id },
        // Clave secreta
        secret,
        // Duración de 1 día
        { expiresIn: "1d" }
    )
}

export const hashPassword = async (password) => {
    return await bcrypt.hash(password, SALT_ROUNDS)
}

export const comparePasswords = async (password, hashPassword) => {
    return await bcrypt.compare(password, hashPassword)
}