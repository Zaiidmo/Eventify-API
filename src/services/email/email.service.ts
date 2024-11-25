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
      subject: 'Welcome to our service!',
      html: `<h1> Dear user, ${user.username}</h1>
            <p>Thank you for registering with us. We are glad to have you on board.</p>`,
    };

    try { 
        await this.transporter.sendMail(mailOptions);
        console.log(`Email sent to ${user.email}`);
    } catch (err) {
        throw new Error(`Error sending email: ${err}`);
    }
  }
}
