import { Injectable } from '@nestjs/common';
import { otpGenerator } from '@src/utils/common';
import * as nodemailer from 'nodemailer';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Injectable()
export class NotificationsService {
  private transporter;
  private static myEmail: string = process.env.MAIL_USER!;
  private static myPassword: string = process.env.MAIL_PASS!;



  constructor(){
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }
  create(createNotificationDto: CreateNotificationDto) {
    return 'This action adds a new notification';
  }

  findAll() {
    return `This action returns all notifications`;
  }

  findOne(id: number) {
    return `This action returns a #${id} notification`;
  }

  update(id: number, updateNotificationDto: UpdateNotificationDto) {
    return `This action updates a #${id} notification`;
  }

  remove(id: number) {
    return `This action removes a #${id} notification`;
  }


  async sendMail(to: string, subject: string, text: string, html?: string) {
    const mailOptions = {
      from: NotificationsService.myEmail,
      to,
      subject,
      text,
      html,
    };
    return this.transporter.sendMail(mailOptions);
  }

  async sendEmailOtp(to : string , otp? : string){
    if (!otp) {
      otp = otpGenerator();
    }

    this.sendMail(
      to,
      "OTP",
      `Your own OTP is : ${otp}`
    )
    return otp;
  }
}
