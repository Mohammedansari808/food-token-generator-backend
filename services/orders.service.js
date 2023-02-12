import { client } from "../index.js";

export async function checkKkOrder(data) {
    return await client.db("kkrestaurant").collection("orders").findOne({ token_no: data._id });
}
export async function uploadKkOrder(data) {
    return await client.db("kkrestaurant").collection("orders").insertOne(data);
}
export async function getKkMonthlyChart() {
    return await client.db("kkrestaurant").collection("orders").aggregate([
        {
            $group: {
                _id: {
                    $month: "$date"
                }, total: { $sum: "$gst_total" }, month: { $first: "$date" }
            },
        }
    ]).toArray();
}
export async function getKkDailyChart() {
    return await client.db("kkrestaurant").collection("orders").aggregate([
        {
            $group: {
                _id: {
                    $dayOfYear: "$date"
                }, total: { $sum: "$gst_total" }, date: { $first: "$date" }
            },
        }
    ]).toArray();
}
export async function getKkOrders() {
    return await client.db("kkrestaurant").collection("orders").find().toArray();
}
export async function checkKkOrderStatus(data) {
    return await client.db("kkrestaurant").collection("orders").findOne({ token_no: data.token });
}
export async function updateKitchenKkOrders(data) {
    return await client.db("kkrestaurant").collection('orders').updateOne({ token_no: data.token }, {
        $set: {
            kitchen_orders: true
        }
    });
}
export async function checkKitchenKKOrders(data) {
    return await client.db("kkrestaurant").collection("orders").findOne({ token_no: data.token });
}
export async function updateKkOrderStatus(data) {
    return await client.db("kkrestaurant").collection('orders').updateOne({ token_no: data.token }, {
        $set: {
            order_status: true
        }
    });
}
