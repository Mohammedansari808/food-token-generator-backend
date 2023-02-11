import express from "express"
import { checkPostProduct, UploadKkProduct, getKkProducts, checkPutProduct, updateKkProduct, checkDeleteProduct, deleteKkProduct } from "../services/products.service.js"

const router = express.Router()



router.post("/products", async function (request, response) {
    const data = request.body
    const checkProduct = await checkPostProduct(data)
    if (!checkProduct) {
        const uploadProduct = await UploadKkProduct(data)
        uploadProduct ? response.send({ message: "success" }) : response.send({ message: "fail" })
    } else {
        response.send({ message: "error" })
    }
})

router.get("/products", async function (request, response) {
    const getProducts = await getKkProducts()
    response.send({ message: "received from database", products: getProducts })
})


router.put("/products/:id", async function (request, response) {
    const { id } = request.params;
    console.log(id)
    const data = request.body
    const checkProduct = await checkPutProduct(id)
    if (checkProduct) {
        console.log("yes")
        const updateProduct = await updateKkProduct(id, data)
        if (updateProduct) {
            response.send({ message: "success" })
        } else {
            response.send({ message: "fail" })
        }
    } else {
        response.send({ message: "error" })
    }
})


router.delete("/products/:id", async function (request, response) {
    const { id } = request.params
    const checkProduct = await checkDeleteProduct(id)
    if (checkProduct) {
        const deleteProduct = await deleteKkProduct(id)
        if (deleteProduct) {
            response.send({ message: "success" })
        } else {
            response.send({ message: "fail" })
        }
    } else {
        response.send({ message: "error" })
    }
})

export default router


