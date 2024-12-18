import { register, login } from "../controllers/user.controller.js"
import express from "express"

export const userRouter = express.Router()

userRouter.post("/register", register)
userRouter.post("/login", login)