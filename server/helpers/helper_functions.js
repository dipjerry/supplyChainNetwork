const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');

// Create the transporter using SMTP transport
const transporter = nodemailer.createTransport(
    smtpTransport({
        service: process.env.MAIL_SERVICE,
        host: process.env.MAIL_HOST,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASSWORD,
        },
    })
);

// Function to send an email with a custom message
module.exports.sendMail = function(to, subject, message) {
    const mailOptions = {
        from: process.env.MAIL_USER,
        to,
        subject,
        text: message, // Use 'text' instead of 'html' to send plain text email
    };

    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
                console.log(error);
                reject(error);
            } else {
                console.log('Email sent: ' + info.response);
                resolve(info.response);
            }
        });
    });
};
