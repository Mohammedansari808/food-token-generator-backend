import express from "express"
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { auth } from "../middleware/auth.js";
import nodemailer from "nodemailer"
import { resetauth } from "../middleware/resetauth.js";

const router = express.Router()

import { client } from "../index.js";
import { ObjectId } from "mongodb";
import { fullLink } from "../link.js";

router.get("/helo", function (request, response) {
    response.send("🙋‍♂️, 🌏 🎊✨🤩");
});


router.post("/signup", async function (request, response) {
    const { fullname, username, password, email } = request.body
    const isSCheck = await checkSignupUsername(username)
    const isSCheckE = await checkSignupEmail(email)
    const isLCheck = await checkLoginUsername(username)
    const isLCheckE = await checkLoginEmail(email)


    if (!isLCheck && !isLCheckE && !isSCheck && !isSCheckE) {

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
            role_id: 0,
            email: email,
            verify_link: `${fullLink}/verify_link/${username}/${tempLink}`
        }
        const insertData = await signupInsertData(finalData)
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

router.get("/verify_link/:username/:id", async function (request, response) {
    const { username, id } = request.params
    const link = `${fullLink}/verify_link/${username}/${id}`
    const isCheck = await signupVerifyLinkCheck(link)

    if (isCheck) {
        let checkData = {
            username: isCheck.username,
            password: isCheck.password,
            role_id: isCheck.role_id,
            email: isCheck.email,
        }
        const insertData = await newFunction(checkData)

        if (insertData) {
            response.send({ message: "sign success" })
            // await client.db("kkrestaurant").collection("userurls").insertOne({ username: username })
            client.db("kkrestaurant").collection("signupusers").updateOne({ username: username }, { $unset: { verify_link: link } })


        }

    } else {
        response.send({ message: "error" })
    }

})

router.post("/login", async function (request, response) {
    const data = request.body
    const loginData = await client.db("kkrestaurant").collection("login").findOne({ username: data.username })
    if (loginData) {

        async function comparPassword() {
            return bcrypt.compare(data.password, loginData.password);
        }
        const comparePassword = await comparPassword()
        if (comparePassword) {
            const token = jwt.sign({ _id: new ObjectId(loginData._id) }, process.env.MY_KEY)
            response.send({ message: "successful login", token: token, role_id: loginData.role_id, email: loginData.email })
        } else {
            response.send({ message: "fail" })
        }
    } else {
        response.send({ message: "error" })
    }

})

router.post("/forgetpassword", async function (request, response) {
    const { username, email } = request.body;
    const data = await client.db("kkrestaurant").collection("login").findOne({ username: username })
    if (data.username == username && data.email == email) {
        console.log("hello")
        let tempLink = ""
        const character = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz123456789"
        const characters = character.length
        for (let i = 0; i < 40; i++) {
            tempLink += character.charAt(Math.floor(Math.random() * characters))

        }
        const otp = Math.floor(1000 + Math.random() * 9000)
        const otpData = {
            otp: otp,
            email: email,
            username: username,
            tempLink: `${fullLink}/verification-link/${username}/${tempLink}`,
        }
        const checkData = await client.db("kkrestaurant").collection("otp").findOne({ username: username })

        if (!checkData) {
            const otpInsertData = await client.db("kkrestaurant").collection("otp").insertOne(otpData)


            if (otpInsertData) {
                setTimeout(async () => {
                    await client.db("kkrestaurant").collection("otp").deleteOne({ otp: otpData.otp })
                }, 120000);
            }




            async function main(finalData) {

                // Generate test SMTP service account from ethereal.email
                // Only needed if you don't have a real mail account for testing
                let username = finalData.username;
                let otp = finalData.otp;
                let email = finalData.email;
                let tempLink = finalData.tempLink
                let testAccount = await nodemailer.createTestAccount();
                // create reusable transporter object using the default SMTP transport


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

                // send mail with defined transport object

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


router.post("/verification-link/:username/:id", async function (request, response) {
    const { username, id } = request.params

    let data = request.body
    const otpData = await client.db("kkrestaurant").collection("otp").findOne({ username: username })

    if (parseInt(data.otp) == parseInt(otpData.otp)) {
        const token = jwt.sign({ _id: new ObjectId(data._id) }, process.env.RESET_KEY)
        response.send({ message: "otp success", username: username, token: token })
    } else {
        response.send({ message: "error" })
    }

})

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
    let checkuser = await client.db("kkrestaurant").collection("login").updateOne({ username: username }, { $set: { password: Hashedpassword } })
    if (checkuser) {
        response.send({ message: "success" })
    } else if (response.status === 404) {
        response.send({ message: "error" })
    }





})
export default router

async function newFunction(checkData) {
    return await client.db("kkrestaurant").collection("login").insertOne(checkData);
}

async function signupVerifyLinkCheck(link) {
    return await client.db("kkrestaurant").collection("signupusers").findOne({ verify_link: link });
}

async function signupInsertData(finalData) {
    return await client.db("kkrestaurant").collection("signupusers").insertOne(finalData);
}

async function checkSignupUsername(username) {
    return await client.db("kkrestaurant").collection("signupusers").findOne({ username: username });
}

async function checkSignupEmail(email) {
    return await client.db("kkrestaurant").collection("signusers").findOne({ email: email });
}

async function checkLoginUsername(username) {
    return await client.db("kkrestaurant").collection("login").findOne({ username: username });
}

async function checkLoginEmail(email) {
    return await client.db("kkrestaurant").collection("login").findOne({ email: email });
}
