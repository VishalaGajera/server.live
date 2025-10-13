const nodemailer = require("nodemailer");
const { Resend } = require("resend");

const username = process.env.GMAIL_USERNAME;
const password = process.env.GMAIL_PASSWORD;
const resend = new Resend(process.env.RESEND_API_KEY);
s;
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: username,
    pass: password,
  },
  connectionTimeout: 2 * 60 * 1000,
  secure: false,
  connection: true,
});

const SendMailToApplicient = async (from, Subject, html, to) => {
  try {
    const MailOption = {
      from,
      to,
      subject: Subject,
      html: html,
    };
    console.log("MailOption :", MailOption);
    // const info = await transporter.sendMail(MailOption);
    const info = await resend.emails.send(MailOption);
    console.log("info :", info);
    return { success: true, message: "Email sent successfully" };
  } catch (error) {
    console.log(`error in sending email: ${error}`);
    return { success: false, message: "Error sending email" };
  }
};

module.exports = { SendMailToApplicient };
