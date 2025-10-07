import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent } from "../ui/card";
import AuthLayout from "./auth-layout";
import { lock, backbtn, eye } from "../../assets/svg";
import { useResetPassword } from "../../hooks/useAuth";
import { useLocation } from "wouter";

const CreateNewPassword = () => {
  const [, setLocation] = useLocation();
  const resetPasswordMutation = useResetPassword();
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  // Get email and OTP from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const emailParam = urlParams.get('email');
    const otpParam = urlParams.get('otp');
    console.log("🔍 [CREATE PASSWORD] URL params:", { emailParam, otpParam });
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }
    if (otpParam) {
      setOtp(otpParam);
    }
    console.log("🔍 [CREATE PASSWORD] State set:", { email: emailParam, otp: otpParam });
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Real-time validation
    if (field === 'password') {
      if (!value.trim()) {
        setErrors(prev => ({ ...prev, [field]: "Password is required" }));
      } else if (value.length < 8) {
        setErrors(prev => ({ ...prev, [field]: "Password must be at least 8 characters" }));
      } else {
        setErrors(prev => ({ ...prev, [field]: "" }));
      }
      
      // Also validate confirm password if it has a value
      if (formData.confirmPassword && value !== formData.confirmPassword) {
        setErrors(prev => ({ ...prev, confirmPassword: "Passwords do not match" }));
      } else if (formData.confirmPassword) {
        setErrors(prev => ({ ...prev, confirmPassword: "" }));
      }
    }
    
    if (field === 'confirmPassword') {
      if (!value.trim()) {
        setErrors(prev => ({ ...prev, [field]: "Please confirm your password" }));
      } else if (formData.password !== value) {
        setErrors(prev => ({ ...prev, [field]: "Passwords do not match" }));
      } else {
        setErrors(prev => ({ ...prev, [field]: "" }));
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.password.trim()) newErrors.password = "Password is required";
    else if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters";
    
    if (!formData.confirmPassword.trim()) newErrors.confirmPassword = "Please confirm your password";
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🔍 [CREATE PASSWORD] Form submission attempted");
    console.log("🔍 [CREATE PASSWORD] Form data:", formData);
    console.log("🔍 [CREATE PASSWORD] Email:", email);
    console.log("🔍 [CREATE PASSWORD] OTP:", otp);
    
    if (validateForm()) {
      if (!email || !otp) {
        console.error("❌ [CREATE PASSWORD] Email or OTP is missing");
        return;
      }

      console.log("🔄 [CREATE PASSWORD] Resetting password with OTP...");
      console.log("🔍 [CREATE PASSWORD] Data being sent:", { 
        email, 
        otp, 
        passwordLength: formData.password.length 
      });
      
      // Use React Query mutation to reset password
      resetPasswordMutation.mutate({
        email: email,
        otp: otp,
        password: formData.password,
      }, {
        onSuccess: (response) => {
          console.log("✅ [CREATE PASSWORD] Password reset successful:", response);
          
          // Navigate to success page
          setTimeout(() => {
            setLocation("/password-reset-success");
          }, 2000); // Wait 2 seconds to show the toast
        },
        onError: (error) => {
          console.error("❌ [CREATE PASSWORD] Password reset failed:", error);
        }
      });
    } else {
      console.log("❌ [CREATE PASSWORD] Form validation failed");
    }
  };

  const handleBackToVerification = () => {
    // Navigate back to two-step verification page
    window.history.back();
  };

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
              onClick={handleBackToVerification}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-all duration-150 active:scale-95"
            >
              <img src={backbtn} alt="Back" className="w-5 h-5 mr-2" />
            </button>
            <h1 className="text-[24px] md:text-[32px] font-bold text-gray-900">Create A New Password</h1>
          </div>

          {/* Instructions */}
          <div className="space-y-2">
            <p className="text-[14px] md:text-base text-gray-600">
              Please choose a password that hasn't been used before. Must be at least 8 characters.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            {/* Set New Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <img src={lock} alt="Password" className="w-4 h-4" />
                Set New Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className={`h-[42px] md:h-[46px] bg-blue-50 border-grey-300 focus:border-royalBlue focus:outline-none outline-none focus:ring-0 ring-0 rounded-[10px] pr-10 ${errors.password ? "border-red-500" : ""}`}
                  style={{ outline: 'none', boxShadow: 'none' }}
                  onFocus={(e) => e.target.style.boxShadow = '0px 4px 6px 0px #DBEAFE'}
                  onBlur={(e) => e.target.style.boxShadow = 'none'}
                  placeholder="Enter your new password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center transition-all duration-150 active:scale-95"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <div className="relative">
                    <img src={eye} alt="Password visibility" className="w-5 h-5" />
                    {showPassword && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-5 h-0.5 bg-[#3A3A3A] transform rotate-45"></div>
                      </div>
                    )}
                  </div>
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500">{errors.password}</p>
              )}
            </div>

            {/* Confirm New Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <img src={lock} alt="Confirm Password" className="w-4 h-4" />
                Confirm New Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  className={`h-[42px] md:h-[46px] bg-blue-50 border-grey-300 focus:border-royalBlue focus:outline-none outline-none focus:ring-0 ring-0 rounded-[10px] pr-10 ${errors.confirmPassword ? "border-red-500" : ""}`}
                  style={{ outline: 'none', boxShadow: 'none' }}
                  onFocus={(e) => e.target.style.boxShadow = '0px 4px 6px 0px #DBEAFE'}
                  onBlur={(e) => e.target.style.boxShadow = 'none'}
                  placeholder="Confirm your new password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center transition-all duration-150 active:scale-95"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <div className="relative">
                    <img src={eye} alt="Password visibility" className="w-5 h-5" />
                    {showConfirmPassword && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-5 h-0.5 bg-[#3A3A3A] transform rotate-45"></div>
                      </div>
                    )}
                  </div>
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-500">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Reset Password Button */}
            <div className="pt-6">
              <Button
                type="submit"
                disabled={resetPasswordMutation.isPending}
                className="w-full h-[57px] text-[20px] rounded-[100px] bg-royalBlue hover:bg-royalBlue text-white font-poppins transition-all duration-150 active:scale-95 active:shadow-inner disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resetPasswordMutation.isPending ? "Resetting..." : "Reset Password"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  );
};

export default CreateNewPassword;
