import express from "express"
import mongoose from "mongoose"
import { mongoUrl } from "./config/database.config.js"
import { userRouter } from "./routes/user.route.js"
import passport from "./config/passport.config.js"

// Crea la aplicación con express
const app = express()
const port = process.env.API_PORT || 3000

// Middleware para parsear los body de los request que llegan en formato JSON
app.use(express.json())

// Conexión a la base de datos
const connectToDatabase = async (url) => {
    try {
        await mongoose.connect(url)
        console.log(`La API se conectó a la base de datos: ${url}`)
    } catch (error) {
        console.error(`Error de conexión de la API con la base de datos: ${error.message}`)
    }
}

await connectToDatabase(mongoUrl)

// Rutas
app.use("/users", userRouter)

// Ruta por defecto
app.use("/", (req, res) => {
    res.status(404).json({
        message: "La ruta solicitada no existe"
    })
})

// Middleware para autenticación
app.use(passport.initialize())
app.use(passport.session())

// La aplicación queda a la espera de que lleguen requests
app.listen(port, () => {
    console.log(`La API está funcionando en el port ${port}`)
})