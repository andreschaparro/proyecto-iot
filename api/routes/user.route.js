import { register, login } from "../controllers/user.controller.js"
import { verifyAdmin } from "../middlewares/user.middleware.js"
import express from "express"
import passport from "passport"

export const userRouter = express.Router()

// La autenticación se maneja mediante la estrategia definida en passport.config.js
userRouter.post("/register", passport.authenticate("jwt", { session: false }), verifyAdmin, register)
userRouter.post("/login", login)