const username = process.env.MONGO_IOT_USERNAME || "iotuser"
const password = process.env.MONGO_IOT_PASSWORD || "iot123"
const database = process.env.MONGO_IOT_DATABASE || "iot"

export const mongoUrl = `mongodb://${username}:${password}@localhost:27017/${database}`