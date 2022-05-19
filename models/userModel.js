const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
      trim: true,
      maxlength: 25,
    },
    username: {
      type: String,
      // required: true,
      unique: true,
      default: mongoose.Types.ObjectId,
    },
    email: {
      type: String,
      required: true,
      trim: true,

      unique: true,
    },
    password: {
      type: String,
      // required: true,
    },
    avatar: {
      type: String,
    },

    gender: { type: String, default: "male" },
    mobile: { type: String, default: "" },
    address: { type: String, default: "" },

    pincode: { type: String, default: "" },
    followers: [{ type: mongoose.Types.ObjectId, ref: "user" }],
    following: [{ type: mongoose.Types.ObjectId, ref: "user" }],
    cart: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "product" },
        quantity: { type: Number, default: 1 },
        size: { type: String, default: "" },
      },
    ],
    wishlist: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "product" },
        quantity: { type: Number, default: 1 },
        size: { type: String, default: "" },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("user", userSchema);
