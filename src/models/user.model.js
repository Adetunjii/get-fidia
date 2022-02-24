const mongoose = require("mongoose");
const {hashPassword, generateVerificationUrl, sendAccountVerificationEmail} = require("../utils");
const dotenv = require("dotenv").config();

const UserSchema = mongoose.Schema(
  {
    name: {type: String, required: true, trim: true},
    email: {type: String, required: true, trim: true},
    password: {type: String, required: true},
    phoneNumber: {type: String, required: true, trim: true},
    country: {type: String, required: true},
    isVerified: {type: Boolean, required: false, default: false},
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.password;
        return ret;
      },
    },
  }
);

UserSchema.pre("save", async function (next) {
  try {
    const user = this;

    // hash user's password if it is modified in any way.
    if (user.isModified("password")) {
      user.password = hashPassword(user.password);
    }

    //generate and send verification email to user
    const verificationUrl = generateVerificationUrl(user.id);
    if (!verificationUrl) throw new Error("An error occured");

    const emailPayload = {
      reciepients: user.email,
      templateVariables: {
        verificationUrl,
      },
    };

    await sendAccountVerificationEmail(emailPayload);

    next();
  } catch (error) {
    throw new Error(error);
  }
});

module.exports = mongoose.model("user", UserSchema);
