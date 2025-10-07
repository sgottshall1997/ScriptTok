import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent } from "../ui/card";
import { Separator } from "../ui/separator";
import AuthLayout from "./auth-layout";
import { email1, backbtn } from "../../assets/svg";
import { useForgotPassword } from "../../hooks/useAuth";
import { useLocation } from "wouter";

const ForgotPassword = () => {
  const [, setLocation] = useLocation();
  const forgotPasswordMutation = useForgotPassword();
  const [formData, setFormData] = useState({
    email: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Real-time validation
    if (field === 'email') {
      if (!value.trim()) {
        setErrors(prev => ({ ...prev, [field]: "Email is required" }));
      } else if (!/\S+@\S+\.\S+/.test(value)) {
        setErrors(prev => ({ ...prev, [field]: "Invalid email format" }));
      } else {
        setErrors(prev => ({ ...prev, [field]: "" }));
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🔍 [FORGOT PASSWORD] Form submission attempted");
    console.log("🔍 [FORGOT PASSWORD] Form data:", formData);
    
    const isValid = validateForm();
    console.log("🔍 [FORGOT PASSWORD] Form validation result:", isValid);
    console.log("🔍 [FORGOT PASSWORD] Current errors:", errors);
    
    if (isValid) {
      console.log("🔄 [FORGOT PASSWORD] Sending forgot password request...");
      
      // Use React Query mutation to send forgot password request
      forgotPasswordMutation.mutate({
        email: formData.email,
      }, {
        onSuccess: (response) => {
          console.log("✅ [FORGOT PASSWORD] Request successful:", response);
          
          // Navigate to two-step verification with email parameter
          setTimeout(() => {
            setLocation(`/two-step-verification?email=${encodeURIComponent(formData.email)}`);
          }, 2000); // Wait 2 seconds to show the toast
        },
        onError: (error) => {
          console.error("❌ [FORGOT PASSWORD] Request failed:", error);
        }
      });
    } else {
      console.log("❌ [FORGOT PASSWORD] Form validation failed");
    }
  };

  const handleBackToLogin = () => {
    // Navigate back to login page
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
              onClick={handleBackToLogin}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-all duration-150 active:scale-95"
            >
              <img src={backbtn} alt="Back" className="w-5 h-5 mr-2" />
              
            </button>
            <h1 className="text-[24px] md:text-[32px] font-bold text-gray-900">Forgot Password?</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
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

            {/* Action Buttons */}
            <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleBackToLogin}
                className="w-1/2 md:flex-1 h-[57px] text-[16px] rounded-[100px] border-[0.7px] border-royalBlue text-royalBlue hover:bg-royalBlue hover:text-white transition-all duration-150 active:scale-95 active:shadow-inner"
              >
                Back to Login
              </Button>
              <Button
                type="submit"
                disabled={forgotPasswordMutation.isPending}
                className="w-1/2 h-[57px] text-[16px] rounded-[100px] bg-royalBlue hover:bg-royalBlue text-white font-poppins transition-all duration-150 active:scale-95 active:shadow-inner disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {forgotPasswordMutation.isPending ? "Sending..." : "Get 6-digit code"}
              </Button>
            </div>
          </form>


        </CardContent>
      </Card>
    </AuthLayout>
  );
};

export default ForgotPassword;
