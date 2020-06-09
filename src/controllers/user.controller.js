/* eslint-disable no-console */
const httpStatus = require("http-status-codes");

const { User } = require("../models/user.model");
const { sendEmail } = require("../utils/index");
const { uploadImgAndReturnUrl } = require("../utils/index");
const { roles } = require("../utils/permissions");

// @route POST api/auth/recover
// @desc Recover Password - Generates token and Sends password reset email
// @access Public
exports.recover = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        message: "Invalid login attempt"
      });
    }
    // Generate and set password reset token
    user.generatePasswordReset();

    // Save the updated user object
    await user.save();

    // send email
    const subject = "Password change request";
    const to = user.email;
    const link = `http://${req.headers.host}/api/auth/reset/${user.resetPasswordToken}`;
    const html = `<p>Hi ${user.firstName}</p>
                    <p>Please click on the following <a href='${link}'>link</a> to reset your password.</p>
                    <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>`;

    sendEmail(to, { subject, html }, "");

    return res.status(httpStatus.OK).json({ message: `A reset email has been sent to ${user.email}.` });
  } catch (error) {
    console.error(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "An error has occured" });
  }
};

// @route POST api/auth/reset
// @desc Reset Password - Validate password reset token and shows the password reset view
// @access Public
exports.reset = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(httpStatus.UNAUTHORIZED).json({ message: "Password reset token is invalid or has expired." });
    }
    // Redirect user to form with the email address
    return res.render("reset", { user });
  } catch (error) {
    console.error(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "An error has occured" });
  }
};

// @route POST api/auth/reset
// @desc Reset Password
// @access Public
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(httpStatus.UNAUTHORIZED).json({ message: "Password reset token is invalid or has expired." });
    }
    // Set the new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.isVerified = true;

    // Save the updated user object
    await user.save();

    const subject = "Your password has been changed";
    const to = user.email;
    const html = `<p>Hi ${user.firstName}</p>
                    <p>This is a confirmation that the password for your account ${user.email} has just been changed.</p>`;

    sendEmail(to, { subject, html }, "");

    return res.status(httpStatus.OK).json({ message: "Your password has been updated." });
  } catch (error) {
    console.error(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "An error has occured" });
  }
};

// @route GET admin/user
// @desc Returns all users
// @access Public
exports.index = async (req, res) => {
  const users = await User.find({});
  return res.status(httpStatus.OK).json({ users });
};

// @route POST api/user
// @desc Add a new user
// @access Public
exports.store = async (req, res) => {
  try {
    const { email } = req.body;

    // Make sure this account doesn't already exist
    const user = await User.findOne({ email });

    if (user) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        message: "Invalid login attempt"
      });
    }
    const password = `_${Math.random().toString(36).substr(2, 9)}`; // generate a random password
    const newUser = new User({ ...req.body, password });

    const addUser = await newUser.save();

    // Generate and set password reset token
    addUser.generatePasswordReset();

    // Save the updated user object
    await addUser.save();

    // Get mail options
    const domain = `http://${req.headers.host}`;
    const subject = "New Account Created";
    const to = user.email;
    const from = process.env.FROM_EMAIL;
    const link = `http://${req.headers.host}/api/auth/reset/${user.resetPasswordToken}`;
    const html = `<p>Hi ${user.firstName}<p><br><p>A new account has been created for you on ${domain}. Please click on the following <a href='${link}'>link</a> to set your password and login.</p>
                  <br><p>If you did not request this, please ignore this email.</p>`;

    await sendEmail({
      to,
      from,
      subject,
      html
    });

    return res.status(httpStatus.OK).json({ message: `An email has been sent to ${user.email}.` });
  } catch (error) {
    console.error(error);
    const data = { success: false, message: "An error has occured" };
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(data);
  }
};

// @route GET api/user/{id}
// @desc Returns a specific user
// @access Public
exports.show = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) return res.status(httpStatus.UNAUTHORIZED).json({ message: "User does not exist" });

    delete user.password;

    return res.status(httpStatus.OK).json({ ...user.toJSON() });
  } catch (error) {
    console.error(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "An error has occured" });
  }
};

// @route PUT api/user/{id}
// @desc Update user details
// @access Public
exports.update = async (req, res) => {
  try {
    const update = req.body;
    // Attempt to upload to cloudinary
    if (req.file) {
      const photo = await uploadImgAndReturnUrl(req.file);
      update.profileImage = photo.secure_url;
    } else delete update.profileImage;

    const { id } = req.user;
    const opt = { new: true, useFindAndModify: true };
    const user = await User.findByIdAndUpdate({ _id: id }, { $set: update }, opt);
    user.password = undefined;

    return res.status(httpStatus.OK).json({ ...user.toJSON() });
  } catch (error) {
    console.error(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "An error has occured" });
  }
};

// @route DESTROY api/user/{id}
// @desc Delete User
// @access Public
exports.destroy = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;

    // Make sure the passed id is that of the logged in user
    if (userId.toString() !== id.toString()) {
      return res
        .status(httpStatus.FORBIDDEN)
        .json({ message: "Sorry, you don't have the permission to delete this data." });
    }
    await User.findByIdAndDelete(id);
    return res.status(httpStatus.OK).json({ message: "User has been deleted" });
  } catch (error) {
    console.error(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "An error has occured" });
  }
};

exports.grantAccess = function accessCheck(action, resource) {
  return async (req, res, next) => {
    try {
      const permission = roles.can(req.user.role)[`${action}`](resource);
      if (!permission.granted) {
        return res.status(httpStatus.FORBIDDEN).json({
          message: "You don't have enough permission to perform this action"
        });
      }
      return next();
    } catch (error) {
      return next(error);
    }
  };
};
