import sgMail from '@sendgrid/mail';

// Set Twilio SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (to, subject, message) => {
  try {
    const msg = {
      to: to, // Recipient email
      from: process.env.SENDGRID_FROM_EMAIL, // Your verified sender email
      subject: subject,
      text: message, // Plain text version
      html: `<p>${message}</p>`, // HTML version
    };

    const result = await sgMail.send(msg);
    console.log('Email sent successfully via Twilio SendGrid:', result[0].statusCode);
    return result;
  } catch (error) {
    console.error('Twilio SendGrid email sending failed:', error);
    if (error.response) {
      console.error('SendGrid error details:', error.response.body);
    }
    throw error;
  }
};

export default sendEmail;
