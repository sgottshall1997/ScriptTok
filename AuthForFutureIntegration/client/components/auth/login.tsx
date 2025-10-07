import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent } from "../ui/card";
import { Separator } from "../ui/separator";
import AuthLayout from "./auth-layout";
import { email1, lock, googleIcon, eye, whiteCheck } from "../../assets/svg";
import { useSignin } from "../../hooks/useAuth";
import { useLocation } from "wouter";

const Login = () => {
  const [, setLocation] = useLocation();
  const signinMutation = useSignin();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Real-time validation
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
      } else {
        setErrors(prev => ({ ...prev, [field]: "" }));
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format";
    
    if (!formData.password) newErrors.password = "Password is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login form submission attempted");
    console.log("Current form data:", formData);
    
    const isValid = validateForm();
    console.log("Form validation result:", isValid);
    console.log("Current errors:", errors);
    
    if (isValid) {
      console.log("Attempting login...");
      
      // Use React Query mutation for login
      signinMutation.mutate({
        email: formData.email,
        password: formData.password,
      });
    } else {
      console.log("Login validation failed, not redirecting");
      // Don't redirect - just show errors
    }
  };

  return (
    <AuthLayout
      tagline="Where Every Home Project Feels in Control"
      description="Enter your personal information to connect with us!"
    >
      <Card className="w-full border-0 bg-transparent shadow-none lg:-mt-[200px]">
        <CardContent className="space-y-4 md:space-y-6 px-4 md:px-0">
          <div className="text-left space-y-2 pb-3">
            <h1 className="text-[24px] md:text-[32px] font-bold text-gray-900">Welcome back!<br />login to get started.</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <img src={email1} alt="Email" className="w-4 h-4" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={`h-[42px] md:h-[46px] bg-blue-50 border-grey-300 focus:border-royalBlue focus:outline-none outline-none focus:ring-0 ring-0 rounded-[10px] ${errors.email ? "border-red-500" : ""}`}
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
              <Label htmlFor="password" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <img src={lock} alt="Password" className="w-4 h-4" />
                Password
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
                  placeholder="Enter your password"
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

            {/* Remember Me and Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-start space-x-2">
                <button
                  type="button"
                  onClick={() => handleInputChange("rememberMe", !formData.rememberMe)}
                  className={`flex items-center justify-center border-2 rounded transition-all duration-150 active:scale-95 ${
                    formData.rememberMe 
                      ? "bg-royalBlue rounded-[2px] border-royalBlue" 
                      : "bg-white rounded-[2px] border-gray-300"
                  }`}
                  style={{
                    width: '18px',
                    height: '18px',
                    marginTop: '0px'
                  }}
                >
                  {formData.rememberMe && (
                    <img src={whiteCheck} alt="Checked" className="w-3.5 h-3.5" />
                  )}
                </button>
                <Label className="text-sm text-gray-700">Remember me</Label>
              </div>
              <a href="/forgot-password" className="text-sm text-royalBlue hover:underline">
                Forgot Password?
              </a>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <Button 
                type="submit" 
                disabled={signinMutation.isPending}
                className="w-full h-[57px] text-[20px] rounded-[100px] bg-royalBlue hover:bg-royalBlue text-white font-poppins disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 active:scale-95 active:shadow-inner"
              >
                {signinMutation.isPending ? "Logging in..." : "Login"}
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

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <a href="/signup" className="font-medium text-royalBlue hover:underline">
                Register
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
};

export default Login;
