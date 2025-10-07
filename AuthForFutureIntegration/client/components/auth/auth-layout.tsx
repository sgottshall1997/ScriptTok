import React from "react";
import rectangle43Image from "../../assets/image/Rectangle 43.png";
import logoImage from "../../assets/svg/logo.svg";

interface AuthLayoutProps {
  children: React.ReactNode;
  tagline?: string;
  description?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  tagline = "Back To Where Renovation Begins with Clarity",
  description = "Enter your personal information to connect with us!"
}) => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row items-center justify-center">
      {/* Mobile Logo - Visible only on mobile */}
      <div className="md:hidden w-full flex justify-start pl-9 pt-6 pb-4">
        <img src={logoImage} alt="BUILDAIDE Logo" className="w-20 h-24" />
      </div>

      {/* Left Section - Form Container */}
      <div className="w-full md:flex-1 flex items-center justify-center px-4 md:pl-8 md:pr-4 pt-0 md:pt-8 pb-8 md:pb-0">
        <div className="w-full max-w-[550px]">
          {children}
        </div>
      </div>

      {/* Right Section - Promotional Visual (Hidden on mobile) */}
      <div className="hidden md:block w-[640px] h-[1012px] mt-6 mb-6 mr-3 relative rounded-[51px] border-[1px] border-[#F6E001]">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat rounded-[51px]"
          style={{ backgroundImage: `url(${rectangle43Image})` }}
        />

        {/* Dark Blue Overlay */}
        <div className="absolute inset-0 bg-blue-900/70 rounded-[51px]" />

        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col justify-between h-full p-8 text-white">
          {/* Logo and Top Content */}
          <div className="space-y-8 pl-8 w-full">
            {/* Logo, Title and Description Container */}
            <div className="w-full max-w-md">
              {/* Logo */}
              <div className="flex items-center">
                <img src={logoImage} alt="BUILDAIDE Logo" className="w-[160px] h-[180px]" />
              </div>

              {/* Tagline */}
              <h2 className="text-[32px] font-bold leading-tight w-full mt-10">
                {tagline}
              </h2>

              {/* Description */}
              <p className="text-[18px] text-white leading-relaxed w-full mt-6 whitespace-nowrap">
                {description}
              </p>
            </div>
          </div>

          {/* Bottom Content */}
          <div className="text-center -mb-3">
            <p className="text-[18px] text-white font-medium">BuildAlde.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
