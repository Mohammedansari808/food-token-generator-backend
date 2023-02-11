import express from "express";
import cors from "cors"
import { MongoClient } from "mongodb";
import productsRouter from "./routes/products.routes.js"
import ordersRouter from "./routes/orders.routes.js"

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

export { client }

app.listen(PORT, () => console.log(`The server started in: ${PORT} ✨✨`));
