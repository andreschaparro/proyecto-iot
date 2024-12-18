import mongoose from "mongoose"
import validator from "validator"

const userSchema = mongoose.Schema({
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
            validator: validator.isEmail,
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

export const User = mongoose.model("User", userSchema, "iotUsuarios")