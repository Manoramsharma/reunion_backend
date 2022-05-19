const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

const userModel = require("../models/userModel");

const { google } = require("googleapis");
const { OAuth2 } = google.auth;
const client = new OAuth2(process.env.GOOGLE_CLIENT_ID);

const { validateEmail, validatePassword } = require("../utils/validator");

class UsersService {
  /**
   *
   * @param {string} email email id of user
   * @param {string} password password of user
   * @returns success message, access_token, user details, refresh_token
   */
  async login(email, password) {
    const user = await userModel.findOne({ email: email });

    user.cart = user.cart.filter((item) => item.product != null);
    user.save();

    const verifyPassword = await bcrypt.compare(password, user.password);
    if (!verifyPassword) throw { status: 401, message: "Incorrect Password" };

    const refresh_token = await this.createRefreshToken({ id: user._id });
    const access_token = await this.createAccessToken({ id: user._id });

    return {
      message: "Login Success!",
      access_token,
      user: { ...user._doc, password: "" },
      refresh_token,
    };
  }
  /**
   *
   * @param {string} fullname fullname of user
   * @param {string} username username of user
   * @param {string} email email id of user
   * @param {string} password password of user
   * @param {string} gender gender of user
   * @returns success message, access_token, user details, refresh_token
   */
  async register(fullname, username, email, password, gender) {
    try {
      username = username.toLowerCase().replace(/ /g, "");

      const checkUsername = await userModel.findOne({ username });
      if (checkUsername)
        throw { status: 400, message: "Username already in use" };

      const checkEmail = await userModel.findOne({ email });

      if (checkEmail) throw { status: 400, message: "Email already exists" };

      if (!validateEmail(email))
        throw { status: 400, message: "Email is not valid" };

      if (!validatePassword(password))
        throw { status: 400, message: "Password is not valid" };

      password = await bcrypt.hash(password, 12);

      const user = await userModel.create({
        fullname,
        username,
        email,
        password,
        gender,
      });

      const refresh_token = await this.createRefreshToken({ id: user._id });
      const access_token = await this.createAccessToken({ id: user._id });

      return {
        message: "Register Success!",
        access_token,
        user: { ...user._doc, password: "" },
        refresh_token,
      };
    } catch (error) {
      throw error;
    }
  }

  async socialLogin(email, name, picture) {
    var user = await userModel.findOne({ email: email });

    if (user) {
      const refresh_token = await this.createRefreshToken({ id: user._id });
      const access_token = await this.createAccessToken({ id: user._id });

      return {
        message: "Login Success!",
        access_token,
        user: { ...user._doc, password: "" },
        refresh_token,
      };
    } else {
      user = await userModel.create({
        email,
        fullname: name,
        avatar: picture,
      });

      const refresh_token = await this.createRefreshToken({ id: user._id });
      const access_token = await this.createAccessToken({ id: user._id });

      return {
        message: "Register Success!",
        access_token,
        user: { ...user._doc, password: "" },
        refresh_token,
      };
    }
  }
  async createAccessToken(payload) {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "1d",
    });
  }
  async createRefreshToken(payload) {
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: "30d",
    });
  }
}
module.exports = new UsersService();
