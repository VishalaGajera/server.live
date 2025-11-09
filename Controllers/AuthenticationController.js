const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../Models/AuthModel");
const { SendMailToApplicient } = require("../mailServices");

// Generate OTP function
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Create OTP email template
const createOTPEmailTemplate = (otp, name) => {
  return `
    <div style="
  max-width: 600px;
  margin: 0 auto;
  background-color: #ffffff;
  border-radius: 10px;
  border: 1px solid #e0e0e0;
  font-family: 'Segoe UI', Arial, sans-serif;
  color: #333;
  box-shadow: 0 3px 10px rgba(0,0,0,0.08);
">
  <!-- Header -->
  <div style="
    background: linear-gradient(90deg, #0078d7, #00a0ff);
    color: #fff;
    text-align: center;
    padding: 20px;
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
  ">
    <h2 style="margin: 0; font-size: 22px; letter-spacing: 0.5px;">
      🔒 Email Verification Required
    </h2>
  </div>

  <!-- Body -->
  <div style="padding: 25px;">
    <p style="font-size: 16px;">Dear <strong>${name}</strong>,</p>

    <p style="font-size: 15px; line-height: 1.6;">
      Thank you for registering with 
      <a href="https://cctraders.ca/" style="color: #0078d7; text-decoration: none; font-weight: 600;">cctrander.ca</a>!  
      To complete your registration, please use the one-time password (OTP) below to verify your email address:
    </p>

    <!-- OTP Box -->
    <div style="
      background-color: #f7faff;
      padding: 25px;
      text-align: center;
      border-radius: 8px;
      margin: 25px 0;
      border-left: 5px solid #0078d7;
    ">
      <h1 style="
        color: #0078d7;
        font-size: 36px;
        letter-spacing: 8px;
        margin: 0;
      ">${otp}</h1>
    </div>

    <p style="font-size: 15px; color: #333;">
      <strong>This OTP will expire in 5 minutes.</strong>
    </p>

    <p style="font-size: 14px; color: #666; line-height: 1.6;">
      If you didn’t request this verification, please ignore this email.  
      Your account will remain unverified until confirmed.
    </p>

    <p style="font-size: 15px; margin-top: 25px;">
      Best regards,<br>
      <strong>The cctraders.ca Team</strong>
    </p>
  </div>

  <!-- Footer -->
  <div style="
    background: #f9f9f9;
    text-align: center;
    padding: 15px;
    border-top: 1px solid #eee;
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
    font-size: 13px;
    color: #777;
  ">
    <p style="margin: 0;">
      This email was sent by 
      <a href="https://cctraders.ca/" style="color: #0078d7; text-decoration: none;">cctrander.ca</a> 
      to verify your email address.
    </p>
  </div>
</div>
  `;
};

exports.signup = async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP and set expiration (5 minutes)
    const otp = generateOTP();
    const otpExpiration = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    const user = await User.create({
      firstname,
      lastname,
      email,
      password: hashedPassword,
      otp,
      otpExpiration,
      status: "unverified",
    });

    // Send OTP via email
    const name = `${firstname} ${lastname}`;
    const htmlContent = createOTPEmailTemplate(otp, name);
    const emailResult = await SendMailToApplicient(
      "info@cctraders.ca",
      email,
      "Email Verification - OTP",
      htmlContent,
      name
    );

    if (!emailResult.success) {
      // If email fails, delete the user
      await User.findByIdAndDelete(user._id);
      return res
        .status(500)
        .json({ message: "Failed to send verification email" });
    }

    res.status(201).json({
      message:
        "User registered successfully. Please check your email for OTP verification.",
      userId: user._id,
      email: user.email,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Check if OTP is expired
    if (new Date() > user.otpExpiration) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    // Check if OTP matches
    if (user.otp !== otp) {
      // Increment failed attempts
      user.otpAttempts += 1;
      await user.save();

      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Update user status to verified and clear OTP fields
    user.status = "verified";
    user.otp = undefined;
    user.otpExpiration = undefined;
    user.otpAttempts = 0;
    await user.save();

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.status === "verified") {
      return res.status(400).json({ message: "Email already verified" });
    }

    // Generate new OTP and expiration
    const otp = generateOTP();
    const otpExpiration = new Date(Date.now() + 5 * 60 * 1000);

    user.otp = otp;
    user.otpExpiration = otpExpiration;
    user.otpAttempts = 0;
    await user.save();

    const name = `${user.firstname} ${user.lastname}`;

    const htmlContent = createOTPEmailTemplate(otp, name);
    const emailResult = await SendMailToApplicient(
      "info@cctraders.ca",
      email,
      "Email Verification - OTP",
      htmlContent,
      name
    );

    // Send new OTP via email

    if (!emailResult.success) {
      // If email fails, delete the user
      await User.findByIdAndDelete(user._id);
      return res.status(500).json({
        message: "Failed to send verification email. Please try again later",
      });
    }

    res.status(200).json({ message: "New OTP sent successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Check if user is verified
    if (user.status !== "verified") {
      const otp = generateOTP();
      const otpExpiration = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

      user.otp = otp;

      user.otpExpiration = otpExpiration;
      user.otpAttempts = 0;
      await user.save();

      const name = `${user.firstname} ${user.lastname}`;
      const htmlContent = createOTPEmailTemplate(otp, name);
      const emailResult = await SendMailToApplicient(
        "info@cctraders.ca",
        email,
        "Email Verification - OTP",
        htmlContent,
        name
      );

      // Send new OTP via email

      if (!emailResult.success) {
        // If email fails, delete the user
        await User.findByIdAndDelete(user._id);
        return res.status(500).json({
          message:
            "We couldn't send your verification email due to a temporary issue. Please try again after a few minutes.",
        });
      }

      return res.status(200).json({
        message: "Please verify your email. OTP has been sent.",
      });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Set the token in an httpOnly cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    res.status(200).json({ token, user });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
