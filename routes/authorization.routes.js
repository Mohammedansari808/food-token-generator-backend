import express from "express"
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { auth } from "../middleware/auth.js";
import nodemailer from "nodemailer"
import { resetauth } from "../middleware/resetauth.js";

const router = express.Router()

import { client } from "../index.js";
import { ObjectId } from "mongodb";
import { checkSignupUsername, checkSignupEmail, checkLoginUsername, checkLoginEmail, InsertSignup, loginDataCheck, LoginCheckForget, otpCheck, OtpCheckForVerification, checkUserPassChange } from "../services/authorization.service.js";
import { fullLink } from "../link.js";


router.post("/signup", async function (request, response) {
    const { fullname, username, password, email } = request.body
    //checking both signup and users collection 
    const isSCheck = await checkSignupUsername(username)
    const isSCheckE = await checkSignupEmail(email)
    const isCheck = await checkLoginUsername(username)
    const isCheckE = await checkLoginEmail(email)

    //if not data will be added in signup collection with verification link, not in login collection
    if (!isCheck && !isCheckE && !isSCheck && !isSCheckE) {
        //generating hashed password using bcrypt and salt
        const Hashedpassword = await Hashed(password)
        async function Hashed(password) {
            const NO_OF_ROUNDS = 10
            const salt = await bcrypt.genSalt(NO_OF_ROUNDS)
            const HashedPassword = await bcrypt.hash(password, salt)
            return HashedPassword
        }
        let tempLink = ""
        const character = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz123456789"
        const characters = character.length
        for (let i = 0; i < 60; i++) {
            tempLink += character.charAt(Math.floor(Math.random() * characters))

        }

        let finalData = {
            fullname: fullname,
            username: username,
            password: Hashedpassword,
            role_id: 1,
            email: email,
            verify_link: `${fullLink}/verify_link/${username}/${tempLink}`
        }
        const insertData = await InsertSignup(finalData)
        //after inserting to signup collection mail will sent to signed up email
        if (insertData) {
            async function main(finalData) {
                let username = finalData.username;
                let email = finalData.email;
                let verify_link = finalData.verify_link

                let transporter = await nodemailer.createTransport({
                    host: "smtp.gmail.com",
                    port: 587,
                    secure: false,
                    auth: {
                        user: process.env.SMTP_MAIL,
                        pass: process.env.SMTP_KEY,
                    },
                });
                let info = await transporter.sendMail({
                    from: '"kkrestaurant" <foo@example.com>', // sender address
                    to: `${email}`, // list of receivers
                    subject: "Verification link for Signin", // Subject line
                    text: "Hello world?", // plain text body
                    html: `Hi ${username} please click the below link to verify.
                    <div style="text-align:center;margin:45px">
                    <a rel="noopener" target="_blank" href=${verify_link} target="_blank"
                     style="font-size: 18px; font-family: Helvetica, Arial, sans-serif;
                     font-weight: bold; text-decoration: none;border-radius: 5px; 
                      padding: 12px 18px; border: 1px solid #1F7F4C;background-color: 
                    darkblue ;box-shadow:2px 2px 10px grey ;color:white;display: inline-block;">
                    Verify</a>
                    </div>
                    
                    `, // html body
                });


                console.log("Message sent: %s", info.messageId);

                console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
                response.send({ message: "sign verify sent" })


            }

            main(finalData).catch(console.error);

        }

    } else {
        response.send({ message: "sign fail" })
    }
})

//after signup verification that link will expired and the data will added to login 
//collection
router.get("/verify_link/:username/:id", async function (request, response) {
    const { username, id } = request.params
    const link = `${fullLink}/verify_link/${username}/${id}`
    //checking the verified is same as the link in database
    const isCheck = await client.db("kkrestaurant").collection("signupusers").findOne({ verify_link: link })

    if (isCheck) {
        let checkData = {
            username: isCheck.username,
            password: isCheck.password,
            role_id: isCheck.role_id,
            email: isCheck.email,
        }
        const insertData = await client.db("kkrestaurant").collection("login").insertOne(checkData)

        if (insertData) {
            response.send({ message: "sign success" })
            //this link will deleted so the link will get expired
            client.db("kkrestaurant").collection("signupusers").updateOne({ username: username }, { $unset: { verify_link: link } })


        }

    } else {
        response.send({ message: "error" })
    }

})

//in login checks the username and password after checking a token will be given to particular user
//for authorization
router.post("/login", async function (request, response) {
    const data = request.body

    const loginData = await loginDataCheck(data)
    //checking login and username
    if (loginData) {
        //comparing password using bcrypt
        async function comparPassword() {
            return bcrypt.compare(data.password, loginData.password);
        }
        const comparePassword = await comparPassword()
        if (comparePassword) {
            //generating token
            const token = jwt.sign({ _id: new ObjectId(loginData._id) }, process.env.MY_KEY)
            response.send({ message: "successful login", token: token, role_id: loginData.role_id, email: loginData.email })
        } else {
            response.send({ message: "fail" })
        }
    } else {
        response.send({ message: "error" })
    }

})


//in forget password after checking the username and mail an OTP and a link will be
//sent to particular mail 
router.post("/forgetpassword", async function (request, response) {
    const { username, email } = request.body;
    //checking the usename and email
    const data = await LoginCheckForget(username)
    if (data.username == username && data.email == email) {
        let tempLink = ""
        const character = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz123456789"
        const characters = character.length
        for (let i = 0; i < 40; i++) {
            tempLink += character.charAt(Math.floor(Math.random() * characters))

        }
        //for random otp
        const otp = Math.floor(1000 + Math.random() * 9000)
        const otpData = {
            otp: otp,
            email: email,
            username: username,
            tempLink: `${fullLink}/verification-link/${username}/${tempLink}`,
        }
        const checkData = await otpCheck(username)

        if (!checkData) {
            //otp inserted to database
            const otpInsertData = await client.db("kkrestaurant").collection("otp").insertOne(otpData)

            //otp countdown set after inserting it to database
            if (otpInsertData) {
                setTimeout(async () => {
                    await client.db("kkrestaurant").collection("otp").deleteOne({ otp: otpData.otp })
                }, 120000);
            }



            //this otp and link will be sent to the user
            async function main(finalData) {


                let username = finalData.username;
                let otp = finalData.otp;
                let email = finalData.email;
                let tempLink = finalData.tempLink
                let testAccount = await nodemailer.createTestAccount();


                let transporter = await nodemailer.createTransport({
                    host: "smtp.gmail.com",
                    port: 587,
                    // secure: false,
                    // tls: {
                    //     rejectUnauthorized: false
                    // },
                    auth: {
                        user: process.env.SMTP_MAIL,
                        pass: process.env.SMTP_KEY,
                    },
                });


                let info = await transporter.sendMail({
                    from: '"kkrestaurant" <foo@example.com>', // sender address
                    to: `${email}`, // list of receivers
                    subject: "Verification link", // Subject line
                    text: "Hello world?", // plain text body
                    html: `Hi ${username} your otp is <strong>${otp} </strong>it will expire in two minutes
                    please paste it in the following link ${tempLink}`, // html body
                });

                response.send({ message: "link sent" });

                console.log("Message sent: %s", info.messageId);
                // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

                // Preview only available when sending through an Ethereal account
                console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
                // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...

            }

            main(otpData).catch(console.error);

            ;

        } else {
            response.send({ message: "fail" })
        }




    } else {
        response.send("error")
    }


});

//verification link for forget password
router.post("/verification-link/:username/:id", async function (request, response) {
    const { username, id } = request.params

    let data = request.body
    const otpData = await OtpCheckForVerification(username)

    if (parseInt(data.otp) == parseInt(otpData.otp)) {
        const token = jwt.sign({ _id: new ObjectId(data._id) }, process.env.RESET_KEY)
        response.send({ message: "otp success", username: username, token: token })
    } else {
        response.send({ message: "error" })
    }

})


//after verification completed password change page will open for password change separate auth 
//auth is created
router.put("/password-change/:username", resetauth, async function (request, response) {
    let data = request.body
    const { username } = request.params

    const Hashedpassword = await Hashed(data.newpassword)
    async function Hashed(password) {
        const NO_OF_ROUNDS = 10
        const salt = await bcrypt.genSalt(NO_OF_ROUNDS)
        const HashedPassword = await bcrypt.hash(password, salt)
        return HashedPassword
    }
    let checkuser = await checkUserPassChange(username, Hashedpassword)
    if (checkuser) {
        response.send({ message: "success" })
    } else if (response.status === 404) {
        response.send({ message: "error" })
    }





})
export default router


