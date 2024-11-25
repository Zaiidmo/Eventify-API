import { Injectable } from '@nestjs/common';
import { MailerConfig } from 'src/config/mailer.config';
import { User } from 'src/modules/users/users.schema';

@Injectable()
export class EmailService {
  private transporter;
  constructor(private readonly mailerConfig: MailerConfig) {
    this.transporter = this.mailerConfig.createTransporter();
  }

  // Send Register Confirmation Email
  async sendRegistrationEmail(user: User): Promise<void> {
    const mailOptions = {
      from: process.env.MAIL_USER,
      to: user.email,
      subject: 'Welcome to Our Service!',
      html: `
        <div style="
          font-family: Mono, sans-serif; 
          line-height: 1.6; 
          color: #fff; 
          max-width: 600px; 
          margin: 0 auto; 
          padding: 20px; 
          border: 1px solid #ddd; 
          border-radius: 8px; 
          background-color: #000;
        ">
          <h1 style="
            color: #AE1918; 
            text-align: center; 
            font-size: 24px; 
            margin-bottom: 20px;
          ">
            Welcome, ${user.username}!
          </h1>
          <p style="
            font-size: 16px; 
            margin-bottom: 20px;
          ">
            Thank you for registering with us. We're thrilled to have you join our community. Explore our features, and let us help you achieve your goals!
          </p>
          <p style="
            font-size: 14px; 
            margin-bottom: 20px;
          ">
            If you have any questions, feel free to contact us at 
            <a href="mailto:support@example.com" style="color: #AE1918; text-decoration: none;">
              support@example.com
            </a>.
          </p>
          <div style="
            text-align: center; 
            margin-top: 30px;
          ">
            <a href="https://example.com/login" style="
              background-color: #AE1918; 
              color: white; 
              padding: 10px 20px; 
              text-decoration: none; 
              font-size: 16px; 
              border-radius: 4px;
            ">
              Login to Your Account
            </a>
          </div>
          <footer style="
            margin-top: 30px; 
            font-size: 12px; 
            color: #777; 
            text-align: center;
          ">
            <p>
              You received this email because you recently registered on our platform. If this wasn't you, please ignore this email.
            </p>
          </footer>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Email sent to ${user.email}`);
    } catch (err) {
      throw new Error(`Error sending email: ${err}`);
    }
  }
}
