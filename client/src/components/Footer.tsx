import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

const Footer: React.FC = () => {
  return (
    <footer className="mt-8 border-t border-gray-200 bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Need support? Contact us at{' '}
            <a 
              href="mailto:shallsdigital@gmail.com" 
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              shallsdigital@gmail.com
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;