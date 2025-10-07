import React from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import AuthLayout from "./auth-layout";
import { verify } from "../../assets/svg";

const PasswordResetSuccess = () => {
  const handleContinueToLogin = () => {
    // Navigate to login page
    window.location.href = "/login";
  };

  return (
    <AuthLayout
      tagline="Your Password Reset Successfully!"
      description="Let's get you back where you belong."
    >
      <Card className="w-full border-0 bg-transparent shadow-none lg:-mt-[350px]">
        <CardContent className="space-y-6 md:space-y-8 px-4 md:px-0">
          {/* Success Content */}
          <div className="text-left space-y-6 md:space-y-8">
            {/* Success Icon */}
            <div className="flex justify-left">
              <div className="w-32 h-32 rounded-full flex items-center justify-center" >
                <img src={verify} alt="Verify" className="w-25 h-25" />
              </div>
            </div>

            {/* Success Message */}
            <div className="space-y-2">
              <h1 className="text-[24px] md:text-[32px] font-bold text-gray-900">Password Reset!</h1>
              <p className="text-[14px] md:text-base text-gray-600">
                Your password has been successfully reset. Click below to continue to login page.
              </p>
            </div>

            {/* Continue Button */}
            <div className="pt-6">
              <Button
                onClick={handleContinueToLogin}
                className="w-full h-[57px] text-[20px] rounded-[100px] bg-royalBlue hover:bg-royalBlue text-white font-poppins transition-all duration-150 active:scale-95 active:shadow-inner"
              >
                Continue to login
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
};

export default PasswordResetSuccess;
