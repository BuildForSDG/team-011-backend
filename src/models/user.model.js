const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const Token = require('./token');

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: 'Your email is required',
      trim: true
    },

    username: {
      type: String,
      unique: true,
      required: 'Your username is required'
    },

    password: {
      type: String,
      required: 'Your password is required',
      max: 100
    },

    firstName: {
      type: String,
      required: 'First Name is required',
      max: 100
    },

    lastName: {
      type: String,
      required: 'Last Name is required',
      max: 100
    },

    bio: {
      type: String,
      required: false,
      max: 255
    },

    profileImage: {
      type: String,
      required: false,
      max: 255
    },

    isVerified: {
      type: Boolean,
      default: false
    },

    role: {
      type: String,
      default: 'landowner',
      enum: ['landowner', 'farmer', 'admin']
    },

    resetPasswordToken: {
      type: String,
      required: false
    },

    resetPasswordExpires: {
      type: Date,
      required: false
    }
  },
  { timestamps: true }
);


UserSchema.pre('save', async (next) => {
  const user = this;

  if (!user.isModified('password')) return next();

  return bcrypt.genSalt(10, (err, salt) => {
    if (err) return next(err);

    return bcrypt.hash(user.password, salt, (error, hash) => {
      if (error) return next(err);

      user.password = hash;
      return next();
    });
  });
});

UserSchema.methods.comparePword = async (password) => bcrypt.compareSync(password, this.password);

UserSchema.methods.generateJWT = async () => {
  const today = new Date();
  const expirationDate = new Date(today);
  expirationDate.setDate(today.getDate() + 60);

  const payload = {
    // eslint-disable-next-line no-underscore-dangle
    userId: this._id,
    email: this.email,
    username: this.username,
    firstName: this.firstName,
    lastName: this.lastName
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: parseInt(expirationDate.getTime() / 1000, 10)
  });
};

UserSchema.methods.generatePasswordReset = async () => {
  this.resetPasswordToken = crypto.randomBytes(20).toString('hex');
  this.resetPasswordExpires = Date.now() + 3600000; // expires in an hour
};

UserSchema.methods.generateVerificationToken = async () => {
  const payload = {
    // eslint-disable-next-line no-underscore-dangle
    userId: this._id,
    token: crypto.randomBytes(20).toString('hex')
  };

  return new Token(payload);
};

module.exports = mongoose.model('Users', UserSchema);
