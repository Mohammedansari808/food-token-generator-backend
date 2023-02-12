import jwt from "jsonwebtoken"
export const resetauth = (request, response, next) => {
    const token = request.header("re-auth-token")
    jwt.verify(token, process.env.RESET_KEY)
    next()
    console.log("rest token", token)
}

