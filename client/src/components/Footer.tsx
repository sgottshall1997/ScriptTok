import React from 'react';
import { Link } from 'wouter';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-8 mt-10">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-bold text-gray-800 mb-2">GlowBot AI</h3>
            <p className="text-gray-600 max-w-md">
              Trend-aware content generation engine for niche-specific affiliate marketing
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link href="/dashboard">
              <span className="text-blue-600 hover:text-blue-800 cursor-pointer">Dashboard</span>
            </Link>
            <Link href="/templates">
              <span className="text-blue-600 hover:text-blue-800 cursor-pointer">Templates</span>
            </Link>
            <a 
              href="https://github.com/yourusername/glowbot" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
            >
              GitHub
            </a>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-6">
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-6">
            <Link href="/about">
              <span className="text-gray-600 hover:text-gray-900 cursor-pointer">About</span>
            </Link>
            <Link href="/how-it-works">
              <span className="text-gray-600 hover:text-gray-900 cursor-pointer">How It Works</span>
            </Link>
            <Link href="/faq">
              <span className="text-gray-600 hover:text-gray-900 cursor-pointer">FAQ</span>
            </Link>
            <Link href="/privacy">
              <span className="text-gray-600 hover:text-gray-900 cursor-pointer">Privacy Policy</span>
            </Link>
            <Link href="/terms">
              <span className="text-gray-600 hover:text-gray-900 cursor-pointer">Terms & Conditions</span>
            </Link>
            <Link href="/contact">
              <span className="text-gray-600 hover:text-gray-900 cursor-pointer">Contact</span>
            </Link>
          </nav>
          
          <p className="text-center text-gray-500 text-sm">
            &copy; {currentYear} GlowBot AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;