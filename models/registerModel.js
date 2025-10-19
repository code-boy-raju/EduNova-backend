
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username:{type:String,required:true},
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  otp:{type:Number},
  role: { type: String, enum: ['student','instructor'], default: 'student' },
  emailVerified: { type: Boolean, default: false },
  instructorApplication: {
   status:  { type: String, enum: ['none','pending','rejected','approved'], default: 'none' },
    docsfile: { type: String},
    appliedAt: Date,
    reviewedAt: Date
  }
}, { timestamps: true });

const userModel = mongoose.model('User', userSchema);

module.exports={userModel}
