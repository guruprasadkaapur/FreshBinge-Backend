
export const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };
  export const sendOTP = (mobileNumber, otp) => {
    console.log(`[DEV] OTP for ${mobileNumber}: ${otp}`);
  };

