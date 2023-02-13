import { client } from "../index.js";

export async function checkUserPassChange(username, Hashedpassword) {
    return await client.db("kkrestaurant").collection("login").updateOne({ username: username }, { $set: { password: Hashedpassword } });
}
export async function OtpCheckForVerification(username) {
    return await client.db("kkrestaurant").collection("otp").findOne({ username: username });
}
export async function otpCheck(username) {
    return await client.db("kkrestaurant").collection("otp").findOne({ username: username });
}
export async function LoginCheckForget(username) {
    return await client.db("kkrestaurant").collection("login").findOne({ username: username });
}
export async function loginDataCheck(data) {
    return await client.db("kkrestaurant").collection("login").findOne({ username: data.username });
}
export async function InsertSignup(finalData) {
    return await client.db("kkrestaurant").collection("signupusers").insertOne(finalData);
}
export async function checkSignupUsername(username) {
    return await client.db("kkrestaurant").collection("signupusers").findOne({ username: username });
}
export async function checkSignupEmail(email) {
    return await client.db("kkrestaurant").collection("signusers").findOne({ email: email });
}
export async function checkLoginUsername(username) {
    return await client.db("kkrestaurant").collection("login").findOne({ username: username });
}
export async function checkLoginEmail(email) {
    return await client.db("kkrestaurant").collection("login").findOne({ email: email });
}
