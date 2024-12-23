import { Schema, model } from "mongoose"

// Válida el campo email utilizando Regex
const emailValidator = (value) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailPattern.test(value)
}

const userSchema = Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        validate: {
            validator: emailValidator,
            message: "El email es inválido"
        }
    },
    password: {
        type: String,
        required: true
    },
    rol: {
        type: String,
        required: true,
        enum: {
            values: ["admin", "user"],
            message: "El rol debe ser admin o user"
        }
    }
})

export const User = model("User", userSchema, "iotUsuarios")