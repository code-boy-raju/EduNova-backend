const axios=require("axios")
const {claudynaryUpload}=require("../config/cloudinary.js")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { userModel } = require("../models/registerModel.js");
const { transporter } = require("../services/emailervice.js");
require("dotenv").config();
const fs=require("fs");
const { log } = require("console");

// ------------------- STUDENT SIGNUP WITH OTP -----------------------
const studentSignup = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000); // 1000-9999

    // Save user with OTP (not verified yet)
    const newUser = await userModel.create({
      username,
      email,
      passwordHash: hashedPassword,
      role: "student",
      otp: otp,
      emailVerified: false, // user not verified yet
    });

    // Send OTP via email
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: "Verify Your Student Account - OTP",
      html: `<h2>Welcome ${username}!</h2>
             <p>Your verification OTP is: <b>${otp}</b></p>
             <p>Enter this OTP in the app to complete registration.</p>`
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      message: "Registration successful. OTP sent to your email.",
      userId: newUser._id // return ID to verify later
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong in signupDetails: " + error });
  }
};

// ------------------- VERIFY OTP -----------------------
const verifyStudentOtp = async (req, res) => {
  const { userId, otp } = req.body;

  try {
    const user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.otp == otp) {
      user.emailVerified = true;
      user.otp = null; // clear OTP after verification
      await user.save();
      return res.status(200).json({ message: "OTP verified! Account is now active." });
    }

    res.status(400).json({ message: "Invalid OTP" });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error verifying OTP: " + error });
  }
};



// ------------------- INSTRUCTOR SIGNUP -----------------------
const instructorSignup = async (req, res) => {
  const { username, email, password } = req.body;
  const uploadfile = await claudynaryUpload(req.file.path);
  console.log(uploadfile);
  
  try {
    fs.unlinkSync(req.file.path);
  if (!username || !email || !password || !uploadfile) {
    return res.status(400).json({ message: "All fields required" });
  }

    const check = await userModel.findOne({ email });
    if (check) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashPass = await bcrypt.hash(password, 10);
    const pendingInstructor = {
      username,
      email,
      passwordHash: hashPass,
      role: "instructor",
      emailVerified: true,
      instructorApplication: {
         status: "pending",
         docsfile:uploadfile?uploadfile.secure_url:null},
     
    };

    // Create token to identify this instructor
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "1d" });
    const approveUrl = `https://edunova-srever.onrender.com/user/verifyInstructor?status=approve&token=${token}`;
    const rejectUrl = `https://edunova-srever.onrender.com/user/verifyInstructor?status=reject&token=${token}`;
 
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: process.env.ADMIN_MAIL,
      subject: "Instructor Approval Request",
      html:`  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; border: 1px solid #ddd; border-radius: 8px;">
  <h2 style="color: #191818ff; text-align: center;">Approve or Reject Instructor</h2>

  <p style="font-size: 16px; color: #151515ff;">
    <strong>${username}</strong> has applied to become an instructor.
  </p>

  <p style="font-size: 14px; color: #1c1b1bff;">
    <strong>Email:</strong> ${email}<br/>
    <strong>Password:</strong> ${password}
  </p>

  <p style="font-size: 14px; margin-top: 20px;">
    <a href="${uploadfile.secure_url}" 
       style="color: #11bff4ff; text-decoration: none; font-weight: 600;" 
       target="_blank">
       📎 View Identity Document
    </a>
  </p>

  <div style="margin-top: 30px; text-align: center;">
    <a href="${approveUrl}" 
       style="padding: 12px 24px; background: #28a745; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin-right: 10px; display: inline-block;">
       ✅ Approve
    </a>

    <a href="${rejectUrl}" 
       style="padding: 12px 24px; background: #dc3545; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
       ❌ Reject
    </a>
  </div>

  <p style="font-size: 12px; color: #888; text-align: center; margin-top: 30px;">
    This is an automated email. Please do not reply.
  </p>
</div>`

    };
    
    await transporter.sendMail(mailOptions);
  
  
    // Save temporary user record (pending)
    await userModel.create(pendingInstructor);
    res.status(200).json({
    message:"✅email approval sent to admin,incase Approved you will got success mail"
    })

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "❌ Something went wrong in signupDetails ",error:error });
  }
};



// ------------------- VERIFY INSTRUCTOR APPROVAL -----------------------
const verifyInstructor = async (req, res) => {
  const { status, token } = req.query;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.email;

    if (!email) return res.status(400).send("❌ Invalid token");

    if (status === "approve") {
      // Approve instructor
      await userModel.findOneAndUpdate(
        { email },
        { "instructorApplication.status": "approved" },
        { new: true }
      );

      const successMail = {
        from: process.env.SMTP_USER,
        to: email,
        subject: "Instructor Approval Accepted",
        html: `<h2>✅ Your instructor account has been approved!</h2>
               <p>You can now log in to your instructor dashboard.</p>`
      };
      await transporter.sendMail(successMail);

      return res.send(`<h2>✅ Instructor approved successfully!</h2>
                       <p>An email has been sent to the instructor notifying them.</p>`);
    }


    if (status === "reject") {
      // Reject instructor
      const user = await userModel.findOne({ email });
      if (user) {
        await userModel.findOneAndDelete({ email });

        const rejectMail = {
          from: process.env.SMTP_USER,
          to: email,
          subject: "Instructor Approval Rejected",
          html: `<h2>❌ Sorry, your instructor application has been rejected.</h2>
                 <p>You may reapply later.</p>`
        };
        await transporter.sendMail(rejectMail);
      }

      return res.send(`<h2>❌ Instructor rejected successfully!</h2>
                       <p>An email has been sent to the applicant.</p>`);
    }

    return res.status(400).send("❌ Invalid status. Use approve or reject.");

  } catch (error) {
    console.log(error);
    return res.status(400).send("❌ Invalid or expired token");
  }
};




const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await userModel.findOne({ email });
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });

   // Compare password
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

  if (!user.emailVerified) return res.status(403).json({ message: 'Email not verified' });

  const token = jwt.sign({ id: user._id, role: user.role },process.env.JWT_SECRET,{expiresIn:"1d"});
  res.status(200).json({message:"login successful", token, user: { id: user._id, username: user.username, email: user.email, role: user.role, emailVerified:user.emailVerified } });
};


module.exports = { studentSignup,verifyStudentOtp , instructorSignup, verifyInstructor ,login};
