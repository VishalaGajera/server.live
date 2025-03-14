const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'info@cctraders.ca',
        pass: 'nrtg wymr clkh frtm'
    }
});

const SendMailToApplicient = async (from, Subject, text) => {
    try {
        const MailOption = {
            from,
            to:"info@cctraders.ca",
            subject:Subject,
            text
        };
        const info = await transporter.sendMail(MailOption);
        console.log('Email sent: ' + info.response);
        return { success: true, message: 'Email sent successfully' };
    } catch (error) {
        console.error(error);
        return { success: false, message: 'Error sending email' };
    }
}

module.exports = { SendMailToApplicient }