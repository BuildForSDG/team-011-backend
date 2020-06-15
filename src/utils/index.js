/* eslint-disable no-console */
const Datauri = require("datauri");
const path = require("path");
const Mailgun = require("mailgun-js");
const cloudinary = require("../config/cloudinary");

const mailgun = new Mailgun({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.DOMAIN
});

function uploadImgAndReturnUrl(file) {
  return new Promise((resolve, reject) => {
    const dUri = new Datauri();
    const image = dUri.format(path.extname(file.originalname).toString(), file.buffer);

    cloudinary.uploader.upload(image.content, (err, url) => {
      if (err) { return reject(err); }
      return resolve(url);
    });
  });
}

function sendEmail(recipient, message, attachment) {
  const data = {
    from: process.env.FROM_NAME,
    to: recipient,
    subject: message.subject,
    text: message.text,
    inline: attachment,
    html: message.html
  };
  mailgun.messages().send(data, (error, result) => {
    if (error) {
      console.error(error);
    } else {
      console.log({ ...result });
    }
  });
}

module.exports = { uploadImgAndReturnUrl, sendEmail };
