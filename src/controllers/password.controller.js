const httpStatus = require("http-status-codes");
const User = require("../models/user.model");
const { sendEmail } = require("../utils/index");

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

    await sendEmail(to, { subject, html }, "");

    return res.status(httpStatus.OK).json({ message: `A reset email has been sent to ${user.email}.` });
  } catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
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
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
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
    delete user.resetPasswordToken;
    delete user.resetPasswordExpires;
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
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};
