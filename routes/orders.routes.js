import express from "express"
import { auth } from "../middleware/auth.js";

import { checkKkOrder, uploadKkOrder, getKkOrders, getKkDailyChart, getKkMonthlyChart, checkKkOrderStatus, updateKkOrderStatus, checkKitchenKKOrders, updateKitchenKkOrders } from "../services/orders.service.js";

const router = express.Router()
//this is to post orders
router.post("/orders", auth, async function (request, response) {
    let data = request.body;
    let newDate = new Date(data.date);
    let only_date = new Date(data.only_date);
    data.date = newDate
    data.only_date = only_date
    const checkOrder = await checkKkOrder(data)
    if (!checkOrder) {
        const uploadOrder = await uploadKkOrder(data)
        if (uploadOrder) {
            response.send({ message: "success" })
        } else {
            response.send({ message: "fail" })
        }
    } else {
        response.send({ message: "error" })
    }
})

//to fetch orders
router.get("/orders", auth, async function (request, response) {
    const getOrders = await getKkOrders();
    const getDailyChart = await getKkDailyChart()
    const getMonthlyChart = await getKkMonthlyChart()
    response.send({ message: "received from database", getOrders, getDailyChart, getMonthlyChart })
})

//this is for status page after clicking remove by admin it updates order_status in the collection
//to true so that it cannot be displayed in the TOKEN BOARD 
router.put("/orders", auth, async function (request, response) {
    const data = request.body
    const checkOrderStatus = await checkKkOrderStatus(data)
    if (checkOrderStatus) {
        const updateOrderStatus = await updateKkOrderStatus(data)
        if (updateOrderStatus) {
            response.send({ message: "success" })
        } else {
            response.send({ message: "fail" })
        }
    } else {
        response.send({ message: "error" })
    }
})


//this is for status page after clicking ready by people in kitchen it updates kitchen_status in the collection
//to true so that it cannot be displayed in the ORDERS
router.put("/kitchenorders", auth, async function (request, response) {
    const data = request.body
    const checkKitchenOrders = await checkKitchenKKOrders(data)
    if (checkKitchenOrders) {
        const updateKitchenOrders = await updateKitchenKkOrders(data)
        if (updateKitchenOrders) {
            response.send({ message: "success" })
        } else {
            response.send({ message: "fail" })
        }
    } else {
        response.send({ message: "error" })
    }
})


export default router



