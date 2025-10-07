// types/user.interface.ts
export interface IUser {
  id: number;
  fullName: string;
  phoneNumber: string;
  email: string;
  passwordHash: string;
  refreshToken?: string;
  createdAt: Date;
}

export interface IUserSignup {
  fullName: string;
  phoneNumber: string;
  email: string;
  password: string;
}

export interface IUserSignin {
  email: string;
  password: string;
}

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface IForgotPassword {
  email: string;
}

export interface IResetPassword {
  email: string;
  otp: string;
  password: string;
}

export interface IVerifyEmail {
  token: string;
}

export interface ISendOTP {
  email: string;
}

export interface IVerifyOTP {
  email: string;
  otp: string;
}
