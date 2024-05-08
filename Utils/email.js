const nodemiller = require("nodemailer");

const sendEmail = async (option) => {
  //Create a Transpoiter

  const transpoter = nodemiller.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  //Defind email options

  const emailOptions = {
    from: "Cineflix support<Support@cineflix.com>",
    to: option.email,
    subjectr: option.subject,
    text: option.message,
  };

  await transpoter.sendMail(emailOptions);
};

module.exports = sendEmail;
