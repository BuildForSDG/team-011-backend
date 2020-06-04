const httpStatus = require('http-status-codes');

const { User } = require('../models/user.model');
const Token = require('../models/token');
const { sendEmail } = require('../utils/index');

async function sendVerificationEmail(user, host, protocol) {
  const token = user.generateVerificationToken();

  // Save the verification token
  await token.save();
  const subject = 'Farmlord Account Verification Token';
  const to = user.email;
  const link = `${protocol}://${host}/account/login?token=${token.token}`;
  const html = `<p>Hi ${user.firstName}<p><br><p>Please click on the following <a href='${link}'>link</a> to verify your account.</p>
                  <br><p>If you did not request this, please ignore this email.</p>`;

  sendEmail(to, { subject, html }, '');
}

// @route POST api/auth/register
// @desc Register user
// @access Public
exports.register = async (req, res) => {
  try {
    const { email, role } = req.body;

    // Make sure this account doesn't already exist
    const user = await User.findOne({ email });

    if (user) {
      return res.status(httpStatus.CONFLICT).json({ message: 'Account already exists' });
    }

    const newUser = new User({ ...req.body, role });
    const addUser = await newUser.save();

    await sendVerificationEmail(addUser, req.headers.host, req.protocol);

    return await res.status(httpStatus.CREATED).json({
      success: true,
      message: 'User Registration successful',
      canLogin: addUser.isVerified,
      id: addUser.id
    });
  } catch (error) {
    const data = { success: false, message: error.message };
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(data);
  }
};

// @route POST api/auth/login
// @desc Login user and return JWT token
// @access Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(httpStatus.UNAUTHORIZED).json({
        message: 'Invalid email or password'
      });
    }

    // validate password
    if (!user.comparePword(password)) {
      return res.status(httpStatus.UNAUTHORIZED).json({ message: 'Invalid email or password' });
    }
    // Make sure the user has been verified
    if (!user.isVerified) {
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json({ type: 'not-verified', message: 'Your account has not been verified.' });
    }
    // Login successful, write token, and send back usergenerateJWT
    const { accessToken } = user.generateJWT();
    return res.status(httpStatus.OK).json({ accessToken, id: user.id });
  } catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// ===EMAIL VERIFICATION
// @route GET api/verify/:token
// @desc Verify token
// @access Public
exports.verify = async (req, res) => {
  try {
    const { token: emailToken } = req.params;
    const token = await Token.findOne({ token: emailToken });

    if (!token) {
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json({ message: 'Cannot verify your email. Your token my have expired.' });
    }

    const user = await User.findOne({ _id: token.userId });
    if (!user) {
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json({ message: 'Cannot verify your email. Your token my have expired.' });
    }
    user.isVerified = true;
    await user.save();
    await Token.findOneAndDelete({ token: token.token });

    return res.status(httpStatus.OK).send('The account has been verified. Please log in.');
  } catch (error) {
    console.error(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};

// @route POST api/resend
// @desc Resend Verification Token
// @access Public
exports.resendToken = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(httpStatus.OK).json({
        message: 'Confirmation email has been sent'
      });
    }

    if (user.isVerified) {
      const data = { message: 'This account has already been verified. Please log in.' };
      return res.status(httpStatus.CONFLICT).json(data);
    }
    await sendVerificationEmail(user, req.headers.host, req.protocol);
    return res.status(httpStatus.OK).send('Email sent');
  } catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};
