const nodemailer = require("nodemailer");

const username = process.env.GMAIL_USERNAME;
const password = process.env.GMAIL_PASSWORD;
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: username,
    pass: password,
  },
});

const SendMailToApplicient = async (from, Subject, html, to) => {
  try {
    const MailOption = {
      from,
      to,
      subject: Subject,
      html: html,
    };
    const info = await transporter.sendMail(MailOption);
    return { success: true, message: "Email sent successfully" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Error sending email" };
  }
};

module.exports = { SendMailToApplicient };
