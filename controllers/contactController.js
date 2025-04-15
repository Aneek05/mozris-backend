const nodemailer = require("nodemailer");

exports.submitContactForm = async (req, res) => {
  const { name, email, phone, service, message } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      host: "smtpout.secureserver.net",
      port: 465,
      secure: true,
      auth: {
        user: "contact@mozris.com",
        pass: "Mozris@2025"
      },
    });

    const mailOptions = {
      from: "contact@mozris.com",
      to: "contact@mozris.com",
      subject: "New Contact Form Submission",
      html: `
        <h2>Contact Request from Mozris Website</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Service:</strong> ${service}</p>
        <p><strong>Message:</strong><br/>${message}</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Your message has been sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Something went wrong. Please try again later." });
  }
};
