import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent } from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import { Separator } from "../ui/separator";
import AuthLayout from "./auth-layout";
import { user, phone1, email1, lock, googleIcon, whiteCheck, eye } from "../../assets/svg";
import { useLocation } from "wouter";
import { useSignup } from "../../hooks/useAuth";

const Signup = () => {
  const [, setLocation] = useLocation();
  const signupMutation = useSignup();
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Real-time validation
    if (field === 'fullName') {
      if (!value.toString().trim()) {
        setErrors(prev => ({ ...prev, [field]: "Full name is required" }));
      } else {
        setErrors(prev => ({ ...prev, [field]: "" }));
      }
    }
    
    if (field === 'phone') {
      if (!value.toString().trim()) {
        setErrors(prev => ({ ...prev, [field]: "Phone number is required" }));
      } else {
        setErrors(prev => ({ ...prev, [field]: "" }));
      }
    }
    
    if (field === 'email') {
      if (!value.toString().trim()) {
        setErrors(prev => ({ ...prev, [field]: "Email is required" }));
      } else if (!/\S+@\S+\.\S+/.test(value.toString())) {
        setErrors(prev => ({ ...prev, [field]: "Invalid email format" }));
      } else {
        setErrors(prev => ({ ...prev, [field]: "" }));
      }
    }
    
    if (field === 'password') {
      if (!value.toString()) {
        setErrors(prev => ({ ...prev, [field]: "Password is required" }));
      } else if (value.toString().length < 8) {
        setErrors(prev => ({ ...prev, [field]: "Password must be at least 8 characters" }));
      } else {
        setErrors(prev => ({ ...prev, [field]: "" }));
      }
      
      // Also validate confirm password if it has a value
      if (formData.confirmPassword && value.toString() !== formData.confirmPassword) {
        setErrors(prev => ({ ...prev, confirmPassword: "Passwords do not match" }));
      } else if (formData.confirmPassword) {
        setErrors(prev => ({ ...prev, confirmPassword: "" }));
      }
    }
    
    if (field === 'confirmPassword') {
      if (!value.toString()) {
        setErrors(prev => ({ ...prev, [field]: "Confirm password is required" }));
      } else if (formData.password !== value.toString()) {
        setErrors(prev => ({ ...prev, [field]: "Passwords do not match" }));
      } else {
        setErrors(prev => ({ ...prev, [field]: "" }));
      }
    }
    
    if (field === 'agreeToTerms') {
      if (!value) {
        setErrors(prev => ({ ...prev, [field]: "You must agree to the terms" }));
      } else {
        setErrors(prev => ({ ...prev, [field]: "" }));
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format";
    
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters";
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.agreeToTerms) newErrors.agreeToTerms = "You must agree to the terms";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      console.log("Form submitted:", formData);
      
      // Use React Query mutation for signup
      signupMutation.mutate({
        fullName: formData.fullName,
        phoneNumber: formData.phone,
        email: formData.email,
        password: formData.password,
      });
    }
  };

  return (
    <AuthLayout>
      <Card className="w-full border-0 bg-transparent shadow-none">
        <CardContent className="space-y-6">
          <div className="text-left space-y-2 pb-3">
            <h1 className="text-[32px] font-bold text-gray-900">Register Your Account</h1>
            <p className="text-[18px] text-[#696969]">
              Setting up account takes less than one minute
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-[16px] font-medium text-gray-700 flex items-center gap-2">
                <img src={user} alt="User" className="w-4 h-4" />
                Full Name
              </Label>
              <Input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                className={`h-[46px] bg-blue-50 border-grey-300 focus:border-royalBlue focus:outline-none outline-none focus:ring-0 ring-0 rounded-[10px] ${errors.fullName ? "border-red-500" : ""}`}
                style={{ outline: 'none', boxShadow: 'none' }}
                onFocus={(e) => e.target.style.boxShadow = '0px 4px 6px 0px #DBEAFE'}
                onBlur={(e) => e.target.style.boxShadow = 'none'}
                placeholder="Enter name"
              />
              {errors.fullName && (
                <p className="text-xs text-red-500">{errors.fullName}</p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-[16px] font-medium text-gray-700 flex items-center gap-2">
                <img src={phone1} alt="Phone" className="w-4 h-4" />
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className={`h-[46px] bg-blue-50 border-grey-300 focus:border-royalBlue focus:outline-none outline-none focus:ring-0 ring-0 rounded-[10px] ${errors.phone ? "border-red-500" : ""}`}
                style={{ outline: 'none', boxShadow: 'none' }}
                onFocus={(e) => e.target.style.boxShadow = '0px 4px 6px 0px #DBEAFE'}
                onBlur={(e) => e.target.style.boxShadow = 'none'}
                placeholder="+92 334 6574 433"
              />
              {errors.phone && (
                <p className="text-xs text-red-500">{errors.phone}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[16px] font-medium text-gray-700 flex items-center gap-2">
                <img src={email1} alt="Email" className="w-4 h-4" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={`h-[46px] bg-blue-50 border-grey-300 focus:border-royalBlue focus:outline-none outline-none focus:ring-0 ring-0 rounded-[10px] ${errors.email ? "border-red-500" : ""}`}
                style={{ outline: 'none', boxShadow: 'none' }}
                onFocus={(e) => e.target.style.boxShadow = '0px 4px 6px 0px #DBEAFE'}
                onBlur={(e) => e.target.style.boxShadow = 'none'}
                placeholder="example@gmail.com"
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[16px] font-medium text-gray-700 flex items-center gap-2">
                <img src={lock} alt="Password" className="w-4 h-4" />
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className={`h-[46px] bg-blue-50 border-grey-300 focus:border-royalBlue focus:outline-none outline-none focus:ring-0 ring-0 rounded-[10px] pr-10 ${errors.password ? "border-red-500" : ""}`}
                  style={{ outline: 'none', boxShadow: 'none' }}
                  onFocus={(e) => e.target.style.boxShadow = '0px 4px 6px 0px #DBEAFE'}
                  onBlur={(e) => e.target.style.boxShadow = 'none'}
                  placeholder="Create a strong password"
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

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-[16px] font-medium text-gray-700 flex items-center gap-2">
                <img src={lock} alt="Confirm Password" className="w-4 h-4" />
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  className={`h-[46px] bg-blue-50 border-grey-300 focus:border-royalBlue focus:outline-none outline-none focus:ring-0 ring-0 rounded-[10px] pr-10 ${errors.confirmPassword ? "border-red-500" : ""}`}
                  style={{ outline: 'none', boxShadow: 'none' }}
                  onFocus={(e) => e.target.style.boxShadow = '0px 4px 6px 0px #DBEAFE'}
                  onBlur={(e) => e.target.style.boxShadow = 'none'}
                  placeholder="Confirm your password"
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

            {/* Terms Checkbox */}
            <div className="space-y-3 pt-3">
              <div className="flex items-start space-x-3">
                <button
                  type="button"
                  onClick={() => handleInputChange("agreeToTerms", !formData.agreeToTerms)}
                  className={`flex items-center justify-center border-2 rounded transition-all duration-150 active:scale-95 ${
                    formData.agreeToTerms 
                      ? "bg-royalBlue rounded-[2px] border-royalBlue" 
                      : "bg-white rounded-[2px] border-gray-300"
                  }`}
                  style={{
                    width: '18px',
                    height: '18px',
                    marginTop: '0px'
                  }}
                >
                  {formData.agreeToTerms && (
                    <img src={whiteCheck} alt="Checked" className="w-3.5 h-3.5" />
                  )}
                </button>
                <div className="flex-1">
                  <Label
                    htmlFor="agreeToTerms"
                    className="text-sm text-gray-700">
                      <p className="leading-relaxed">
                        Creating an account means you are okay with our
                        Terms and Conditions of Service and
                        Default Notification Settings
                      </p>
                    </Label>
                  {errors.agreeToTerms && (
                    <p className="text-xs text-red-500">{errors.agreeToTerms}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <Button 
                type="submit" 
                disabled={signupMutation.isPending}
                className="w-full h-[57px] text-[20px] rounded-[100px] bg-royalBlue hover:bg-royalBlue text-white font-poppins space-y-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 active:scale-95 active:shadow-inner"
              >
                {signupMutation.isPending ? "Registering..." : "Register"}
              </Button>
            </div>
          </form>

          {/* Social Login */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-4">
              <Separator className="flex-1 bg-[#E1E1E1]" />
              <span className="text-sm text-gray-500 px-4">Or register with</span>
              <Separator className="flex-1 bg-[#E1E1E1]" />
            </div>
            <Button variant="outline" className="w-full h-[57px] text-[16px] rounded-[100px] text-[#696969] border-[0.7px] border-[#E1E1E1] transition-all duration-150 active:scale-95 active:shadow-inner hover:bg-gray-50">
              <img src={googleIcon} alt="Google" className="w-5 h-5 mr-2" />
              Continue with Google
            </Button>
          </div>

          {/* Sign In Link */}
          <div className="text-center pt-2">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <a href="/login" className="font-medium text-royalBlue hover:underline">
                Log in
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
};

export default Signup;
