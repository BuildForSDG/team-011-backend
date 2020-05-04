const User = require('../models/user.model');
const Token = require('../models/token');
const { sendEmail } = require('../utils/index');

async function sendVerificationEmail(user, req, res) {
  try {
    const token = user.generateVerificationToken();

    // Save the verification token
    await token.save();

    const subject = 'Account Verification Token';
    const to = user.email;
    const link = `http://${req.headers.host}/api/auth/verify/${token.token}`;
    const html = `<p>Hi ${user.username}<p><br><p>Please click on the following <a href='${link}'>link</a> to verify your account.</p> 
                  <br><p>If you did not request this, please ignore this email.</p>`;

    await sendEmail(to, { subject, html }, '');

    res.status(200).json({ message: `A verification email has been sent to ${user.email}.` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// @route POST api/auth/register
// @desc Register user
// @access Public
exports.register = async (req, res) => {
  try {
    const { email } = req.body;

    // Make sure this account doesn't already exist
    const user = await User.findOne({ email });

    if (user) return res.status(401).json({ message: 'The email address you have entered is already associated with another account.' });

    const newUser = new User({ ...req.body, role: 'landowner' });

    const addUser = await newUser.save();

    return await sendVerificationEmail(addUser, req, res);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST api/auth/login
// @desc Login user and return JWT token
// @access Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) return res.status(401).json({ msg: `The email address ${email} is not associated with any account. Double-check your email address and try again.` });

    // validate password
    if (!user.comparePassword(password)) return res.status(401).json({ message: 'Invalid email or password' });

    // Make sure the user has been verified
    if (!user.isVerified) return res.status(401).json({ type: 'not-verified', message: 'Your account has not been verified.' });

    // Login successful, write token, and send back user
    return res
      .status(200)
      .json({ token: user.generateJWT(), user, role: user.role });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


// ===EMAIL VERIFICATION
// @route GET api/verify/:token
// @desc Verify token
// @access Public
exports.verify = async (req, res) => {
  if (!req.params.token) return res.status(400).json({ message: 'We were unable to find a user for this token.' });

  try {
    // Find a matching token
    const token = await Token.findOne({ token: req.params.token });

    if (!token) return res.status(400).json({ message: 'We were unable to find a valid token. Your token my have expired.' });

    // If we found a token, find a matching user
    return User.findOne({ _id: token.userId }, (err, user) => {
      if (!user) return res.status(400).json({ message: 'We were unable to find a user for this token.' });

      if (user.isVerified) return res.status(400).json({ message: 'This user has already been verified.' });

      // Verify and save the user
      user.isVerified = true;
      return user.save((error) => {
        if (error) return res.status(500).json({ message: error.message });

        return res.status(200).send('The account has been verified. Please log in.');
      });
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @route POST api/resend
// @desc Resend Verification Token
// @access Public
exports.resendToken = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) return res.status(401).json({ message: `The email address ${req.body.email} is not associated with any account. Double-check your email address and try again.` });

    if (user.isVerified) return res.status(400).json({ message: 'This account has already been verified. Please log in.' });

    return await sendVerificationEmail(user, req, res);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
