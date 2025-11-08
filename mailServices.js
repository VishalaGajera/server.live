const SendMailToApplicient = async (
  template_id,
  from,
  to,
  subject,
  name,
  otp,
  message,
  submitted_date
) => {
  try {
    const serviceId = process.env.EMAILJS_SERVICE_ID;
    const privateKey = process.env.EMAILJS_PRIVATE_KEY;
    const publicKey = process.env.EMAILJS_PUBLIC_KEY;

    const payload = {
      service_id: serviceId,
      template_id: template_id,
      user_id: publicKey,
      accessToken: privateKey,
      template_params: {
        from_email: from,
        to_email: to,
        subject,
        name,
        otp,
        message,
        submitted_date,
      },
    };

    const response = await fetch(
      "https://api.emailjs.com/api/v1.0/email/send",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (response.ok) {
      return { success: true, message: "Email sent successfully" };
    } else {
      const errorText = await response.text();
      console.error("EmailJS error:", errorText);
      return { success: false, message: "Error sending email" };
    }
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, message: "Error sending email" };
  }
};

module.exports = { SendMailToApplicient };
