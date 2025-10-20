// const nodemailer = require('nodemailer');

// const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST,
//   port: Number(process.env.SMTP_PORT) || 587,
//   secure: false, // use true for port 465
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS
//   }
// });

// // Test connection (optional but useful)
// transporter.verify((error) => {
//   if (error) {
//     console.error('❌ SMTP Connection Failed:', error);
//   } else {
//     console.log('✅ SMTP Server is ready to send emails');
//   }
// });


// module.exports={transporter}

const axios = require("axios");
require("dotenv").config();

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

async function sendEmail(to, subject, htmlContent) {
  try {
    const response = await axios.post(
      BREVO_API_URL,
      {
        sender: {
          email: process.env.SENDER_EMAIL,
          name: process.env.SENDER_NAME || "EduNova",
        },
        to: [{ email: to }],
        subject,
        htmlContent,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Email sent:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Email sending failed:", error.response?.data || error.message);
    throw error;
  }
}

module.exports = { sendEmail };
