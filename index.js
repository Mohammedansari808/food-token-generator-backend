import express from "express";
import cors from "cors"
import { MongoClient } from "mongodb";
import productsRouter from "./routes/products.routes.js"
import ordersRouter from "./routes/orders.routes.js"
import authorizationRouter from "./routes/authorization.routes.js"
import * as dotenv from "dotenv"

dotenv.config()
const app = express();
app.use(express.json())
app.use(cors())
//
//mongodb+srv://mohammedansari808:PRwl2ajPVWhY2jr1@cluster0.q2rstmh.mongodb.net/?retryWrites=true&w=majority
const MONGO_URL = "mongodb://127.0.0.1";
const client = new MongoClient(MONGO_URL)
await client.connect()
console.log("Mongo is connected")
const PORT = 4000;
app.get("/", function (request, response) {
    response.send("🙋‍♂️, 🌏 🎊✨🤩");
});

app.use("/kkproducts", productsRouter)
app.use("/kkorders", ordersRouter)
app.use("/", authorizationRouter)
export { client }

app.listen(PORT, () => console.log(`The server started in: ${PORT} ✨✨`));
