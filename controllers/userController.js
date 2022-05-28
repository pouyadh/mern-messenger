const User = require("../model/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const DEFAULT_AVATAR_IMAGE = "https://api.multiavatar.com/0337b826f67bb9ec94";

module.exports.register = async (req, res, next) => {
  try {
    let { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.json({ msg: "All fields are required" }).status(400);
    }
    email = email.toLowerCase();
    username = username.toLowerCase();
    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.json({ msg: "Username already in use" }).status(409);
    }
    const emailExists = await User.findOne({ username });
    if (emailExists) {
      return res.json({ msg: "Email already in use" }).status(409);
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      username,
      password: hashedPassword,
      avatarImage: DEFAULT_AVATAR_IMAGE,
    });
    const token = jwt.sign(
      { user_id: user._id, username: user.username, email: user.email },
      process.env.TOKEN_SECRET_KEY,
      { expiresIn: "2h" }
    );
    user.password = undefined;

    return res
      .cookie("token", `Bearer ${token}`, {
        httpOnly: true,
        sameSite: "None",
        secure: true,
      })
      .json({ user })
      .status(201);
  } catch (error) {
    next(error);
  }
};

module.exports.login = async (req, res, next) => {
  try {
    const username = req.params.username.toLowerCase();
    const { password } = req.body;
    if (!username || !password) {
      return res.json({ msg: "All fields are required" }).status(400);
    }
    const user = await User.findOne({ username });
    if (!user) {
      return res.json({ msg: "Incorrect username or password" }).status(400);
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.json({ msg: "Incorrect username or password" }).status(400);
    }
    const token = jwt.sign(
      { user_id: user._id, username: user.username, email: user.email },
      process.env.TOKEN_SECRET_KEY,
      { expiresIn: "2h" }
    );
    user.password = undefined;
    return res
      .cookie("token", `Bearer ${token}`, {
        httpOnly: true,
        sameSite: "None",
        secure: true,
      })
      .json({ user })
      .status(200);
  } catch (err) {
    next(err);
  }
};

module.exports.updateAvatarImage = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const newImage = req.body.image;
    const { matchedCount } = await User.updateOne(
      { _id: userId },
      {
        isAvatarImageSet: true,
        avatarImage: newImage,
      }
    );
    if (!matchedCount) {
      return res.json({ msg: "User not found" }).status(404);
    }
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};

module.exports.addContact = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const contact_username = req.params.contact_username.toLowerCase();
    const theUser = await User.findOne({ contact_username });
    if (!theUser) {
      return res.json({ msg: "username not found" }).status(404);
    }
    const contactExists = await User.findOne({
      _id: userId,
      contacts: { $elemMatch: { $eq: contact_username } },
    });
    if (contactExists) {
      return res.json({ msg: "contact already exists" }).status(409);
    }
    await User.updateOne(
      { _id: userId },
      { $push: { contacts: contact_username } }
    );
    return res.json({ msg: "contact added" }).status(200);
  } catch (err) {
    next(err);
  }
};

module.exports.removeContact = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const contact_username = req.params.contact_username.toLowerCase();
    const contactExists = await User.findOne({
      _id: userId,
      contacts: { $elemMatch: { $eq: contact_username } },
    });
    if (!contactExists) {
      return res.json({ msg: "contact not found" }).status(404);
    }
    await User.updateOne(
      { _id: userId },
      { $pull: { contacts: contact_username } }
    );
    return res.json({ msg: "contact removed" }).status(200);
  } catch (err) {
    next(err);
  }
};

module.exports.getContacts = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const user = await User.findById(userId);
    return res.json(user.contacts).status(200);
  } catch (err) {
    next(err);
  }
};
