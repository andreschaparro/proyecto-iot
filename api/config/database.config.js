const username = process.env.MONGO_USERNAME || "iotuser"
const password = process.env.MONGO_PASSWORD || "iot123"
const database = process.env.MONGO_DATABASE || "iot"

export const mongoUrl = `mongodb://${username}:${password}@localhost:27017/${database}`