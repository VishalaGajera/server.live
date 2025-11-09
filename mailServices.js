const SendMailToApplicient = async (
  from,
  to,
  subject,
  content,
  name
) => {
  try {
    const serviceId = process.env.EMAILJS_SERVICE_ID;
    const templateId = process.env.EMAILJS_TEMPLATE_ID;
    const privateKey = process.env.EMAILJS_PRIVATE_KEY;
    const publicKey = process.env.EMAILJS_PUBLIC_KEY;

    const payload = {
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      accessToken: privateKey,
      template_params: {
        htmlContent: content,
        from_email: from,
        to_email: to,
        subject,
        name
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
