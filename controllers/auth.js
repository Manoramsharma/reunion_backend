const UsersService = require("../services/users.service");
const userModel = require("../models/userModel");
const xss = require("xss");
const jwt = require("jsonwebtoken");

const { google } = require("googleapis");
const { find } = require("../models/userModel");
const { OAuth2 } = google.auth;
const client = new OAuth2(process.env.GOOGLE_CLIENT_ID);

class Controller {
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const findUser = await userModel.findOne({ email });

      if (!findUser) throw { status: 400, message: "User not found" };
      const { message, access_token, user, refresh_token } =
        await UsersService.login(email, password);
      res.cookie("refreshtoken", refresh_token, {
        httpOnly: true,
        path: "/api/refresh_token",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30days
      });
      res.status(200).json({ message, access_token, user });
    } catch (error) {
      next(error);
    }
  }
  async register(req, res, next) {
    try {
      //console.log("inregister");
      var { fullname, username, email, password, gender } = req.body;

      const { message, access_token, user, refresh_token } =
        await UsersService.register(
          fullname,
          username,
          email,
          password,
          gender
        );
      res.cookie("refreshtoken", refresh_token, {
        httpOnly: true,
        path: "/api/refresh_token",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30days
      });
      res.status(200).json({ message, access_token, user });
    } catch (error) {
      next(error);
    }
  }
  async googleLogin(req, res, next) {
    try {
      const { tokenId } = req.body;

      const verify = await client.verifyIdToken({
        idToken: tokenId,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const { email, name, picture } = verify.payload;

      const { message, access_token, user, refresh_token } =
        await UsersService.socialLogin(email, name, picture);
      res.cookie("refreshtoken", refresh_token, {
        httpOnly: true,
        path: "/api/refresh_token",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30days
      });
      res.status(200).json({ message, access_token, user });
    } catch (error) {
      next(error);
    }
  }
  async facebooklogin(req, res, next) {
    try {
      const { name, email, picture } = req.body;
      const url = picture.data.url;
      const { message, access_token, user, refresh_token } =
        await UsersService.socialLogin(email, name, url);
      res.cookie("refreshtoken", refresh_token, {
        httpOnly: true,
        path: "/api/refresh_token",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30days
      });
      res.status(200).json({ message, access_token, user });
    } catch (error) {
      next(error);
    }
  }

  async logout(_, res, next) {
    try {
      res.clearCookie("refreshtoken", { path: "/api/refresh_token" });
      return res.json({ message: "Logged out!" });
    } catch (error) {
      next(error);
    }
  }
  async generateAccessToken(req, res, next) {
    try {
      const rf_token = req.cookies.refreshtoken;
      if (!rf_token) throw { status: 400, message: "Please login now" };

      jwt.verify(
        rf_token,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, result) => {
          if (err) throw { status: 400, message: "Please login now" };

          const user = await userModel
            .findById(result.id)
            .select("-password")
            .populate(" cart.product ");
          if (!user) throw { status: 400, message: "User does not exist" };
          user.cart = user.cart.filter((item) => item.product != null);
          user.save();

          const access_token = await UsersService.createAccessToken({
            id: result.id,
          });

          res.status(200).json({
            access_token,
            user,
          });
        }
      );
    } catch (error) {
      next(error);
    }
  }
}
module.exports = new Controller();
