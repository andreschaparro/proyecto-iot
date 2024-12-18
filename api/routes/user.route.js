import { register } from "../controllers/user.controller.js"
import express from "express"

export const userRouter = express.Router()

userRouter.post("/", register)