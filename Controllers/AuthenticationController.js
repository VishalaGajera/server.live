const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../Models/AuthModel");
const { SendMailToApplicient } = require("../mailServices");

// Generate OTP function
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Create OTP email template
const createOTPEmailTemplate = (otp, firstname) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Email Verification</h2>
      <p>Dear ${firstname},</p>
      <p>Thank you for registering! Please use the following OTP to verify your email address:</p>
      <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
        <h1 style="color: #333; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
      </div>
      <p><strong>This OTP will expire in 5 minutes.</strong></p>
      <p>If you didn't request this verification, please ignore this email.</p>
      <p>Best regards,<br>Your E-Commerce Team</p>
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
    const emailTemplate = createOTPEmailTemplate(otp, firstname);

    const emailResult = await SendMailToApplicient(
      process.env.GMAIL_USERNAME,
      "Email Verification - OTP",
      emailTemplate,
      email
    );

    console.log("emailResult:", emailResult);

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

    // Send new OTP via email
    const emailTemplate = createOTPEmailTemplate(otp, user.firstname);
    await SendMailToApplicient(
      process.env.GMAIL_USERNAME,
      "Email Verification - New OTP",
      emailTemplate,
      email
    );

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

      const emailTemplate = createOTPEmailTemplate(otp, user.firstname);

      const emailResult = await SendMailToApplicient(
        process.env.GMAIL_USERNAME,
        "Email Verification - OTP",
        emailTemplate,
        email
      );

      console.log("emailResult:", emailResult);

      return res.status(200).json({
        message:
          "Please verify your email. OTP has been sent.",
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
