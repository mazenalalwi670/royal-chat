import nodemailer from 'nodemailer';
import { OTP, User } from './database.js';

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Generate OTP code
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP via email
export async function sendOTP(phoneNumber: string, email: string): Promise<{ success: boolean; message: string }> {
  try {
    // Check if user exists
    const existingUser = await User.findOne({ phoneNumber });
    
    // Generate OTP
    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete old OTPs for this phone number
    await OTP.deleteMany({ phoneNumber, verified: false });

    // Save new OTP
    await OTP.create({
      phoneNumber,
      email,
      code,
      expiresAt,
      verified: false
    });

    // Send email
    const mailOptions = {
      from: process.env.SMTP_USER || 'noreply@royal-chat.com',
      to: email,
      subject: 'كود التحقق - Royal Chat',
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h1 style="color: #FFD700; text-align: center; margin-bottom: 30px;">👑 Royal Chat</h1>
            <h2 style="color: #333; text-align: center; margin-bottom: 20px;">كود التحقق</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6; text-align: center;">
              مرحباً بك في Royal Chat!
            </p>
            <p style="color: #666; font-size: 16px; line-height: 1.6; text-align: center; margin-bottom: 30px;">
              استخدم الكود التالي للتحقق من رقم هاتفك:
            </p>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
              <h1 style="color: #FFD700; font-size: 48px; letter-spacing: 10px; margin: 0; font-weight: bold;">${code}</h1>
            </div>
            <p style="color: #999; font-size: 14px; text-align: center; margin-top: 30px;">
              هذا الكود صالح لمدة 10 دقائق فقط
            </p>
            <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px;">
              إذا لم تطلب هذا الكود، يرجى تجاهل هذه الرسالة
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    return {
      success: true,
      message: 'تم إرسال كود التحقق إلى بريدك الإلكتروني'
    };
  } catch (error: any) {
    console.error('Error sending OTP:', error);
    return {
      success: false,
      message: error.message || 'حدث خطأ في إرسال كود التحقق'
    };
  }
}

// Verify OTP
export async function verifyOTP(phoneNumber: string, code: string): Promise<{ success: boolean; user?: any; message: string }> {
  try {
    const otp = await OTP.findOne({
      phoneNumber,
      code,
      verified: false,
      expiresAt: { $gt: new Date() }
    });

    if (!otp) {
      return {
        success: false,
        message: 'كود التحقق غير صحيح أو منتهي الصلاحية'
      };
    }

    // Mark OTP as verified
    otp.verified = true;
    await otp.save();

    // Check if user exists
    let user = await User.findOne({ phoneNumber });

    if (!user) {
      // Create new user
      user = await User.create({
        phoneNumber,
        email: otp.email,
        name: `User ${phoneNumber}`,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${phoneNumber}`,
        status: 'online',
        isVerified: true
      });
    } else {
      // Update user
      user.isVerified = true;
      user.status = 'online';
      user.lastSeen = new Date();
      await user.save();
    }

    return {
      success: true,
      user: {
        id: user._id.toString(),
        phoneNumber: user.phoneNumber,
        name: user.name,
        avatar: user.avatar,
        email: user.email,
        status: user.status,
        isVerified: user.isVerified
      },
      message: 'تم التحقق بنجاح'
    };
  } catch (error: any) {
    console.error('Error verifying OTP:', error);
    return {
      success: false,
      message: error.message || 'حدث خطأ في التحقق'
    };
  }
}

// Find users by phone numbers (for contact sync)
export async function findUsersByPhoneNumbers(phoneNumbers: string[]): Promise<any[]> {
  try {
    const users = await User.find({
      phoneNumber: { $in: phoneNumbers },
      isVerified: true
    }).select('phoneNumber name avatar status lastSeen');

    return users.map(user => ({
      id: user._id.toString(),
      phoneNumber: user.phoneNumber,
      name: user.name,
      avatar: user.avatar,
      status: user.status,
      lastSeen: user.lastSeen
    }));
  } catch (error: any) {
    console.error('Error finding users:', error);
    return [];
  }
}

