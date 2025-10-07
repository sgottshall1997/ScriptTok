import React, { useState, useRef, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent } from "../ui/card";
import AuthLayout from "./auth-layout";
import { backbtn } from "../../assets/svg";
import { useAuthToast } from "../../hooks/use-auth-toast";
import { useSendOTP, useVerifyOTP } from "../../hooks/useAuth";
import { useLocation } from "wouter";

const TwoStepVerification = () => {
  const [, setLocation] = useLocation();
  const sendOTPMutation = useSendOTP();
  const verifyOTPMutation = useVerifyOTP();
  const [formData, setFormData] = useState({
    code1: "",
    code2: "",
    code3: "",
    code4: "",
    code5: "",
    code6: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [email, setEmail] = useState("");
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [isExpired, setIsExpired] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Fetch email from URL parameters on component mount
  useEffect(() => {
    console.log("🔍 [EMAIL] Fetching email from URL parameters");
    const urlParams = new URLSearchParams(window.location.search);
    const emailParam = urlParams.get('email');
    console.log("🔍 [EMAIL] URL params:", urlParams.toString());
    console.log("🔍 [EMAIL] Email param:", emailParam);
    
    if (emailParam) {
      const decodedEmail = decodeURIComponent(emailParam);
      console.log("🔍 [EMAIL] Setting email:", decodedEmail);
      setEmail(decodedEmail);
    } else {
      console.warn("⚠️ [EMAIL] No email parameter found in URL");
    }
  }, []);

  // Countdown timer effect
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setIsExpired(true);
    }
  }, [timeLeft]);

  // Reset timer when OTP is resent
  const resetTimer = () => {
    setTimeLeft(600); // Reset to 10 minutes
    setIsExpired(false);
  };

  // Format time for display
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleInputChange = (field: string, value: string) => {
    // Only allow single digits and numbers
    if (value.length > 1 || (!/^\d*$/.test(value))) return;
    
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }

    // Auto-focus to next input when a digit is entered
    if (value && field !== 'code6') {
      const currentIndex = parseInt(field.replace('code', '')) - 1;
      const nextInput = inputRefs.current[currentIndex + 1];
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, field: string) => {
    // Handle backspace to go to previous input
    if (e.key === 'Backspace' && !formData[field as keyof typeof formData] && field !== 'code1') {
      const currentIndex = parseInt(field.replace('code', '')) - 1;
      const prevInput = inputRefs.current[currentIndex - 1];
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    
    // Only process if it's a 6-digit number
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      const newFormData = {
        code1: digits[0] || '',
        code2: digits[1] || '',
        code3: digits[2] || '',
        code4: digits[3] || '',
        code5: digits[4] || '',
        code6: digits[5] || '',
      };
      
      setFormData(newFormData);
      
      // Clear any errors
      setErrors({});
      
      // Focus on the last input
      const lastInput = inputRefs.current[5];
      if (lastInput) {
        lastInput.focus();
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const codeFields = ['code1', 'code2', 'code3', 'code4', 'code5', 'code6'];
    
    codeFields.forEach(field => {
      if (!formData[field as keyof typeof formData]) {
        newErrors[field] = "Code digit required";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🔍 [TWO STEP] Form submitted");
    console.log("🔍 [TWO STEP] Form data:", formData);
    console.log("🔍 [TWO STEP] Email:", email);
    
    if (validateForm()) {
      const otp = Object.values(formData).join('');
      console.log("🔍 [TWO STEP] Verification code submitted:", otp);
      console.log("🔍 [TWO STEP] OTP length:", otp.length);
      
      // Use React Query mutation to verify OTP
      verifyOTPMutation.mutate({
        email: email,
        otp: otp,
      });
    } else {
      console.log("🔍 [TWO STEP] Form validation failed");
      console.log("🔍 [TWO STEP] Errors:", errors);
    }
  };

  const handleBackToForgotPassword = () => {
    // Navigate back to forgot password page
    window.history.back();
  };

  const handleResendCode = async () => {
    console.log("🔍 [RESEND] Button clicked");
    console.log("🔍 [RESEND] Email available:", email);
    console.log("🔍 [RESEND] SendOTP mutation state:", sendOTPMutation);
    console.log("🔍 [RESEND] Mutation pending:", sendOTPMutation.isPending);
    
    if (!email) {
      console.error("❌ [RESEND] No email available for resending OTP");
      alert("No email available for resending OTP");
      return;
    }
    
    console.log("🔄 [RESEND] Resending verification code...");
    
    try {
      // Use React Query mutation to resend OTP
      const result = sendOTPMutation.mutate({
        email: email,
      });
      
      console.log("🔍 [RESEND] Mutation result:", result);
      
      // Reset the countdown timer
      resetTimer();
      console.log("✅ [RESEND] Timer reset successfully");
    } catch (error) {
      console.error("❌ [RESEND] Error in handleResendCode:", error);
      alert("Error resending code: " + error);
    }
  };

  // Debug log for component state
  console.log("🔍 [COMPONENT] Render state:", {
    email,
    timeLeft,
    isExpired,
    sendOTPMutationPending: sendOTPMutation.isPending,
    verifyOTPMutationPending: verifyOTPMutation.isPending
  });

  return (
    <AuthLayout
      tagline="Lost Your Password? We've Got You"
      description="Let's get you back where you belong."
    >
      <Card className="w-full border-0 bg-transparent shadow-none lg:-mt-[350px]">
        <CardContent className="space-y-4 md:space-y-6 px-4 md:px-0">
          {/* Back Arrow and Title */}
          <div className="space-y-3 md:space-y-4">
            <button
              onClick={handleBackToForgotPassword}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-all duration-150 active:scale-95"
            >
              <img src={backbtn} alt="Back" className="w-5 h-5 mr-2" />
            </button>
            <h1 className="text-[24px] md:text-[32px] font-bold text-gray-900">Two-Step Verification</h1>
          </div>

          {/* Instructions */}
          <div className="space-y-2">
            <p className="text-[14px] md:text-base text-gray-600">
              Please enter the one-time passcode to verify your account. A code has been sent to{" "}
              {email ? (
                <span className="underline text-royalBlue">{email}</span>
              ) : (
                <span className="text-gray-500">your email address</span>
              )}
            </p>
            
            {/* Countdown Timer */}
            <div className="flex items-center justify-center space-x-2 mt-4">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                isExpired 
                  ? 'bg-red-100 text-red-700' 
                  : timeLeft < 60 
                    ? 'bg-orange-100 text-orange-700' 
                    : 'bg-green-100 text-green-700'
              }`}>
                {isExpired ? (
                  <span className="flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
                    Code Expired
                  </span>
                ) : (
                  <span className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                    Valid for {formatTime(timeLeft)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            {/* Verification Code Inputs */}
            <div className="space-y-2">
              
              <div className="flex justify-left md:justify-left space-x-2 md:space-x-3">
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <Input
                    key={num}
                    ref={(el) => (inputRefs.current[num - 1] = el)}
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]"
                    maxLength={1}
                    value={formData[`code${num}` as keyof typeof formData]}
                    onChange={(e) => handleInputChange(`code${num}`, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, `code${num}`)}
                    onPaste={handlePaste}
                    className={`w-10 h-10 md:w-12 md:h-12 text-center text-base md:text-lg font-semibold bg-blue-50 border-grey-300 focus:border-royalBlue focus:outline-none outline-none focus:ring-0 ring-0 rounded-[10px] ${errors[`code${num}` as keyof typeof errors] ? "border-red-500" : ""}`}
                    style={{ outline: 'none', boxShadow: 'none' }}
                    onFocus={(e) => e.target.style.boxShadow = '0px 4px 6px 0px #DBEAFE'}
                    onBlur={(e) => e.target.style.boxShadow = 'none'}
                    placeholder=""
                    autoComplete="one-time-code"
                  />
                ))}
              </div>
              {/* Show first error if any */}
              {Object.values(errors)[0] && (
                <p className="text-xs text-red-500 text-center">{Object.values(errors)[0]}</p>
              )}
            </div>

            {/* Verify Button */}
            <Button
              type="submit"
              disabled={isExpired || verifyOTPMutation.isPending}
              className={`w-full h-[57px] text-[20px] rounded-[100px] font-poppins transition-all duration-150 ${
                isExpired 
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                  : 'bg-royalBlue hover:bg-royalBlue text-white active:scale-95 active:shadow-inner'
              }`}
            >
              {isExpired ? 'Code Expired' : verifyOTPMutation.isPending ? 'Verifying...' : 'Verify'}
            </Button>
          </form>

          {/* Resend Code */}
          <div className="text-center md:text-left">
            <p className="text-sm text-gray-600">
              {isExpired ? (
                <>
                  Code has expired.{" "}
                  <button
                    onClick={handleResendCode}
                    disabled={sendOTPMutation.isPending}
                    className="font-medium text-royalBlue hover:underline disabled:opacity-50 transition-all duration-150 active:scale-95"
                    style={{ cursor: sendOTPMutation.isPending ? 'not-allowed' : 'pointer' }}
                  >
                    {sendOTPMutation.isPending ? 'Sending...' : 'Send new code'}
                  </button>
                </>
              ) : (
                <>
                  Didn't get the code?{" "}
                  <button
                    onClick={handleResendCode}
                    disabled={sendOTPMutation.isPending}
                    className="font-medium text-royalBlue hover:underline disabled:opacity-50 transition-all duration-150 active:scale-95"
                    style={{ cursor: sendOTPMutation.isPending ? 'not-allowed' : 'pointer' }}
                  >
                    {sendOTPMutation.isPending ? 'Sending...' : 'Resend it'}
                  </button>
                </>
              )}
            </p>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
};

export default TwoStepVerification;
