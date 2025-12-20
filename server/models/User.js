const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["super-admin", "sub-admin", "support-agent"],
    default: "support-agent",
  },
  profilePic: { type: String, default: "" },
  phone: { type: String, default: "" },
  location: { type: String, default: "" },
  dob: { type: Date }, 
  // --- ADDED THIS FIELD ---
  lastLogin: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);