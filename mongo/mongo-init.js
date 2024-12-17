// Creamos el usuario para conectar la base de datos con la api
db.createUser({
    user: "iotuser",
    pwd: "iot123",
    roles: [
        {
            role: "readWrite",
            db: "iot"
        }
    ]
})

// Creamos las colecciones de la base de datos
db.createCollection("iotAcciones")
db.createCollection("iotAtributos")
db.createCollection("iotDatos")
db.createCollection("iotDispositivos")
db.createCollection("iotGrupos")
db.createCollection("iotUsuarios")

// Creamos el primer usuario admin de la api
db.iotUsuarios.insertOne({
    name: "admin",
    email: "admin@admin.com",
    // El password "admin123" se debe encriptar en https://bcrypt-generator.com/ utilizando 10 rounds
    password: "$2a$10$.1vt8F1.vVc3iv943Z1Fquy04mHG1OpHI7UAzRKNpbMKolgFGgDWK",
    rol: "admin"
})