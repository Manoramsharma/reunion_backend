const userModel = require("../models/userModel");
const jwt = require("jsonwebtoken");

class Controller {
  async getUser(req, res, next) {
    try {
      const token = req.header("Authorization");
      if (token != "undefined") {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await userModel.findOne({ _id: decoded.id });

        if (user.length === 0) throw { status: 404, message: "User not found" };
        res.status(200).json({ user });
      } else throw { status: 500, message: "User not authorized" };
    } catch (error) {
      next(error);
    }
  }
  async follow(req, res, next) {
    try {
      const user = await userModel.find({
        _id: req.params.id,
        followers: req.user._id,
      });
      if (user.length > 0)
        return res.status(500).json({ message: "You followed this user." });

      const newUser = await userModel
        .findOneAndUpdate(
          { _id: req.params.id },
          {
            $push: {
              followers: req.user._id,
            },
          },
          { new: true }
        )
        .populate("followers following", "-password");

      await userModel.findOneAndUpdate(
        { _id: req.user._id },
        {
          $push: { following: req.params.id },
        },
        { new: true }
      );

      res.json({ newUser });
    } catch (error) {
      next(error);
    }
  }
  async unfollow(req, res, next) {
    try {
      const newUser = await userModel
        .findOneAndUpdate(
          { _id: req.params.id },
          {
            $pull: { followers: req.user._id },
          },
          { new: true }
        )
        .populate("followers following", "-password");

      await userModel.findOneAndUpdate(
        { _id: req.user._id },
        {
          $pull: { following: req.params.id },
        },
        { new: true }
      );

      res.json({ newUser });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new Controller();
