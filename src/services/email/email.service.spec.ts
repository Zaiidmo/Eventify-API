import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import { MailerConfig } from 'src/config/mailer.config';
import { User } from 'src/modules/users/users.schema';

describe('EmailService', () => {
  let emailService: EmailService;
  let mockMailerConfig: MailerConfig;
  let mockTransporter: { sendMail: jest.Mock };

  beforeEach(async () => {
    mockTransporter = {
      sendMail: jest.fn(),
    };

    mockMailerConfig = {
      createTransporter: jest.fn(() => mockTransporter),
    } as unknown as MailerConfig;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        { provide: MailerConfig, useValue: mockMailerConfig },
      ],
    }).compile();

    emailService = module.get<EmailService>(EmailService);
  });

  it('should call createTransporter once during initialization', () => {
    expect(mockMailerConfig.createTransporter).toHaveBeenCalledTimes(1);
  });

  describe('sendRegistrationEmail', () => {
    const mockUser: User = {
      email: 'test@example.com',
      username: 'testuser',
    } as User;

    it('should send an email with the correct options', async () => {
      const expectedMailOptions = {
        from: process.env.MAIL_USER,
        to: mockUser.email,
        subject: 'Welcome to Our Service!',
        html: expect.stringContaining(`<h1 style="`), 
      };

      await emailService.sendRegistrationEmail(mockUser);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(expectedMailOptions);
    });

    it('should log a success message when email is sent', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      await emailService.sendRegistrationEmail(mockUser);
      expect(consoleSpy).toHaveBeenCalledWith(`Email sent to ${mockUser.email}`);
      consoleSpy.mockRestore();
    });

    it('should throw an error if email sending fails', async () => {
      mockTransporter.sendMail.mockRejectedValueOnce(new Error('SendMailError'));
      await expect(emailService.sendRegistrationEmail(mockUser)).rejects.toThrow(
        'Error sending email: Error: SendMailError',
      );
    });
  });
});
