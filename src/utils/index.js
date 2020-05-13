const Datauri = require('datauri');
const path = require('path');
const Mailgun = require('mailgun-js');
const cloudinary = require('../config/cloudinary');

const mailgun = new Mailgun({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.DOMAIN
});

function uploader(req) {
  return new Promise((resolve, reject) => {
    const dUri = new Datauri();
    const image = dUri.format(path.extname(req.file.originalname).toString(), req.file.buffer);

    cloudinary.uploader.upload(image.content, (err, url) => {
      if (err) return reject(err);
      return resolve(url);
    });
  });
}

function sendEmail(recipient, message, attachment) {
  const data = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
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

// function sendEmail2(recipient, message) {
//   const data = {
//     from: process.env.FROM_EMAIL,
//     to: recipient,
//     subject: message.subject,
//     html: message.html
//   };
//   return new Promise((resolve, reject) => {
//     sgMail.send(data, (error, result) => {
//       if (error) return reject(error);
//       return resolve(result);
//     });
//   });
// }

module.exports = { uploader, sendEmail };
