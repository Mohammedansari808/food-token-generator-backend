import express from "express"
import { client } from "../index.js"
const router = express.Router()

router.post("/orders", async function (request, response) {
    console.log('hello')
    let data = request.body;

    let newDate = new Date(data.date);
    let only_date = new Date(data.only_date)
    data.date = newDate
    data.only_date = only_date
    const checkOrder = await client.db("kkrestaurant").collection("orders").findOne({ token_no: data._id })
    if (!checkOrder) {
        const uploadOrder = await client.db("kkrestaurant").collection("orders").insertOne(data)
        if (uploadOrder) {
            response.send({ message: "success" })
        } else {
            response.send({ message: "fail" })
        }
    } else {
        response.send({ message: "error" })
    }
})

router.get("/orders", async function (request, response) {
    const getOrders = await client.db("kkrestaurant").collection("orders").find().toArray();
    const getDailyChart = await client.db("kkrestaurant").collection("orders").aggregate([
        {
            $group: {
                _id: {
                    $dayOfYear: "$date"
                }, total: { $sum: "$gst_total" }, date: { $first: "$date" }
            },
        }
    ]).toArray()
    const getMonthlyChart = await client.db("kkrestaurant").collection("orders").aggregate([
        {
            $group: {
                _id: {
                    $month: "$date"
                }, total: { $sum: "$gst_total" }, month: { $first: "$date" }
            },
        }
    ]).toArray()
    response.send({ message: "received from database", getOrders, getDailyChart, getMonthlyChart })
})


router.put("/orders", async function (request, response) {
    console.log("hello")
    const data = request.body
    const checkProduct = await client.db("kkrestaurant").collection("orders").findOne({ token_no: data.token })
    if (checkProduct) {
        console.log("yes")
        const updateProduct = await client.db("kkrestaurant").collection('orders').updateOne({ token_no: data.token }, {
            $set: {
                order_status: true
            }
        })
        if (updateProduct) {
            response.send({ message: "success" })
            console.log("hellosdfs")
        } else {
            response.send({ message: "fail" })
        }
    } else {
        response.send({ message: "error" })
    }
})

router.put("/kitchenorders", async function (request, response) {
    console.log("llo")
    const data = request.body
    const checkProduct = await client.db("kkrestaurant").collection("orders").findOne({ token_no: data.token })
    if (checkProduct) {
        console.log("yes")
        const updateProduct = await client.db("kkrestaurant").collection('orders').updateOne({ token_no: data.token }, {
            $set: {
                kitchen_orders: true
            }
        })
        if (updateProduct) {
            response.send({ message: "success" })
        } else {
            response.send({ message: "fail" })
        }
    } else {
        response.send({ message: "error" })
    }
})





export default router


