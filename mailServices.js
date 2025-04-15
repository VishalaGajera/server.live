const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'vishalagajera@gmail.com',
        pass: 'aiwzyftarolruzpp'
    }
});

const SendMailToApplicient = async (from, Subject, html) => {
    try {
        const MailOption = {
            from,
            to:"info@cctraders.ca",
            // to:"vishalagajera@gmail.com",
            subject:Subject,
            html:html
        };
        const info = await transporter.sendMail(MailOption);
        return { success: true, message: 'Email sent successfully' };
    } catch (error) {
        console.error(error);
        return { success: false, message: 'Error sending email' };
    }
}

module.exports = { SendMailToApplicient }