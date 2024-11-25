import * as nodemailer from "nodemailer";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";


@Injectable()
export class MailerConfig {
  constructor() {}

  createTransporter() {
    return nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
      },
    });
  }
}
  