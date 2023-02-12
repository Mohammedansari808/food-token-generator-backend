import jwt from "jsonwebtoken"

export const auth = (request, response, next) => {
    const token = request.header("x-auth-token")

    jwt.verify(token, process.env.MY_KEY)
    next()


}
