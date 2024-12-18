import express from "express"
import bodyParser from "body-parser"
import mongoose from "mongoose"
import { userRouter } from "./routes/user.route.js"

// TODO en producción utilizar variables de entorno para el puerto y mongoUrl
const app = express()
const port = 3000
const mongoUrl = "mongodb://iotuser:iot123@172.16.36.141:27017/iot"

// Middleware para parsear los body que vienen en formato JSON
app.use(bodyParser.json())

// Se conecta a la base de datos
const connectToDatabase = async (url) => {
    try {
        await mongoose.connect(url)
        console.log(`La API se conectó a la base de datos: ${url}`)
    } catch (error) {
        console.error(`Error de conexión de la API con la base de datos: ${error.message}`)
    }
}

connectToDatabase(mongoUrl)

// Declarar las rutas
app.use("/users", userRouter)

// Ruta por defecto
app.use("/", (req, res) => {
    res.status(404).json({
        message: "La ruta solicitada no existe"
    })
})

// Se escuchan requests
app.listen(port, () => {
    console.log(`La API está funcionando en el port ${port}`)
})