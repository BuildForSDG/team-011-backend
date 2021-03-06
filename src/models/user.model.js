/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
/* eslint-disable func-names */
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const Token = require("./token.model");

const UserRole = {
  Landowner: "Landowner",
  Farmer: "Farmer",
  Admin: "Admin"
};

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: "Your email is required",
      lowercase: true,
      maxlength: 64,
      trim: true
    },

    password: {
      type: String,
      required: "Your password is required",
      maxlength: 100
    },

    firstName: {
      type: String,
      required: "First Name is required",
      trim: true,
      maxlength: 64
    },

    lastName: {
      type: String,
      required: "Last Name is required",
      trim: true,
      maxlength: 64
    },

    profileImage: {
      type: String
    },
    description: {
      type: String,
      trim: true,
      maxlength: 255
    },
    address: {
      type: String,
      trim: true,
      maxlength: 255
    },
    country: {
      type: String,
      trim: true,
      maxlength: 64
    },
    city: {
      type: String,
      trim: true,
      maxlength: 64
    },
    phoneNumber: {
      type: String,
      trim: true,
      maxlength: 32
    },
    postalCode: {
      type: String,
      trim: true,
      maxlength: 12
    },
    isVerified: {
      type: Boolean,
      default: false
    },

    role: {
      type: UserRole,
      default: UserRole.Farmer
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
).set("toJSON", {
  transform(doc, ret, options) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

UserSchema.pre("save", function (next) {
  const user = this;

  if (!user.isModified("password")) { return next(); }

  return bcrypt.genSalt(10, (err, salt) => {
    if (err) { return next(err); }

    return bcrypt.hash(user.password, salt, (error, hash) => {
      if (error) { return next(err); }

      user.password = hash;
      return next();
    });
  });
});

UserSchema.methods.comparePword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

// eslint-disable-next-line func-names
UserSchema.methods.generateJWT = function () {
  const payload = {
    // eslint-disable-next-line no-underscore-dangle
    userId: this._id,
    email: this.email,
    firstName: this.firstName,
    lastName: this.lastName,
    role: this.role
  };

  const expiresIn = 60 * 60 * 24; // expires in 24 hours
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
  return { accessToken, expiresIn };
};

UserSchema.methods.generatePasswordReset = function () {
  this.resetPasswordToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordExpires = Date.now() + 3600000; // expires in an hour
};

UserSchema.methods.generateVerificationToken = function () {
  const payload = {
    // eslint-disable-next-line no-underscore-dangle
    userId: this._id,
    token: crypto.randomBytes(20).toString("hex")
  };

  return new Token(payload);
};

module.exports = {
  User: mongoose.model("User", UserSchema),
  UserRole
};
