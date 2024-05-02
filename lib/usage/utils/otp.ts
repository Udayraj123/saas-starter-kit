import { authenticator } from 'otplib';
import env from '@/lib/env';

export const getCurrentOtp = () => {
  return authenticator.generate(env.usageProtection.secret);
};

export const verifyTimeBasedOTP = (otp) => {
  const expectedOtp = getCurrentOtp();

  return expectedOtp === otp;
};
