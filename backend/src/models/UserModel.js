import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

userSchema.pre("save", async function (next) {
  // eslint-disable-next-line no-invalid-this
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  // eslint-disable-next-line no-invalid-this
  this.password = await bcrypt.hash(this.password, salt);
});
userSchema.methods.matchPassword = async function (enteredPassword) {
  const comparisonResult = await bcrypt.compare(enteredPassword, this.password);
  return comparisonResult;
};

export default mongoose.model("User", userSchema);
