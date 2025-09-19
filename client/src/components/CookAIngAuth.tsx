import React from 'react';

interface CookAIngAuthProps {
  children: React.ReactNode;
}

const CookAIngAuth: React.FC<CookAIngAuthProps> = ({ children }) => {
  // Password protection is disabled - always render children directly
  return <>{children}</>;
};

export default CookAIngAuth;