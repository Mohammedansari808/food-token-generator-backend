import { ObjectId } from "mongodb";
import { client } from "../index.js";

export async function UploadKkProduct(data) {
    return await client.db("kkrestaurant").collection("kkproducts").insertOne(data);
}
export async function checkPostProduct(data) {
    return await client.db("kkrestaurant").collection("kkproducts").findOne({ name: data.name });
}
export async function getKkProducts() {
    return await client.db("kkrestaurant").collection("kkproducts").find().toArray();
}
export async function checkPutProduct(id) {
    return await client.db("kkrestaurant").collection("kkproducts").findOne({ _id: new ObjectId(id) });
}
export async function updateKkProduct(id, data) {
    return await client.db("kkrestaurant").collection("kkproducts").updateOne({ _id: new ObjectId(id) }, {
        $set: {
            name: data.name,
            image: data.image,
            rate: data.rate,
            pieces: data.pieces,
            quantity: 1
        }
    });
}
export async function checkDeleteProduct(id) {
    return await client.db("kkrestaurant").collection("kkproducts").findOne({ _id: new ObjectId(id) });
}
export async function deleteKkProduct(id) {
    return await client.db("kkrestaurant").collection("kkproducts").deleteOne({ _id: new ObjectId(id) });
}
