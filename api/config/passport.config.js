import passport from "passport"
import { Strategy, ExtractJwt } from "passport-jwt"
import { User } from "../models/user.model.js"
import { secret } from "./jwt.config.js"

const opts = {
    // Se extrae el token de la cabecera de autenticación
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    // Clave secreta para verificar el token
    secretOrKey: secret
}

const findUserByJwtPayload = async (payload, done) => {
    try {
        const user = await User.findById(payload._id)

        // El usuario no existe
        if (!user) {
            return done(null, false)
        }

        // Se encontró al usuario y se lo pasa al siguiente middleware
        return done(null, user)

    } catch (error) {
        // Se produjo un error
        return done(error, false)
    }
}

// Estrategia "jwt" para passport
const strategy = new Strategy(opts, findUserByJwtPayload)

passport.use(strategy)

export default passport