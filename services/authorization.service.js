import { client } from "../index.js";

export async function checkUserForPasschangr(username, Hashedpassword) {
    return await client.db("kkrestaurant").collection("login").updateOne({ username: username }, { $set: { password: Hashedpassword } });
}
export async function oTPcheckVerification(username) {
    return await client.db("kkrestaurant").collection("otp").findOne({ username: username });
}
export async function checkForOTP(username) {
    return await client.db("kkrestaurant").collection("otp").findOne({ username: username });
}
export async function loginCheckForForget(username) {
    return await client.db("kkrestaurant").collection("login").findOne({ username: username });
}
export async function LoginDataCheck(data) {
    return await client.db("kkrestaurant").collection("login").findOne({ username: data.username });
}
export async function loginInsert(checkData) {
    return await client.db("kkrestaurant").collection("login").insertOne(checkData);
}
export async function signupVerifyLinkCheck(link) {
    return await client.db("kkrestaurant").collection("signupusers").findOne({ verify_link: link });
}
export async function signupInsertData(finalData) {
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
