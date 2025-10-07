import React from 'react';
import { Link } from "wouter";

const Footer: React.FC = () => {
  return (
    <footer className="mt-8 border-t border-gray-200 bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Pheme</h3>
            <p className="text-sm text-gray-600">
              AI-powered content generation with viral score analysis.
            </p>
            <p className="text-sm text-gray-600">
              Create engaging viral content that resonates with your audience.
            </p>
          </div>
          
          {/* Product Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Product</h4>
            <div className="space-y-2">
              <Link href="/generate">
                <span className="block text-sm text-gray-600 hover:text-blue-600 cursor-pointer">Content Generator</span>
              </Link>
              <Link href="/content-history">
                <span className="block text-sm text-gray-600 hover:text-blue-600 cursor-pointer">Content History</span>
              </Link>
              <Link href="/how-it-works">
                <span className="block text-sm text-gray-600 hover:text-blue-600 cursor-pointer">How It Works</span>
              </Link>
              <Link href="/compliance">
                <span className="block text-sm text-gray-600 hover:text-blue-600 cursor-pointer">Compliance</span>
              </Link>
            </div>
          </div>
          
          {/* Support Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Support</h4>
            <div className="space-y-2">
              <Link href="/faq">
                <span className="block text-sm text-gray-600 hover:text-blue-600 cursor-pointer">FAQ</span>
              </Link>
              <Link href="/contact">
                <span className="block text-sm text-gray-600 hover:text-blue-600 cursor-pointer">Contact</span>
              </Link>
              <Link href="/about">
                <span className="block text-sm text-gray-600 hover:text-blue-600 cursor-pointer">About Pheme</span>
              </Link>
              <a 
                href="mailto:shallsdigital@gmail.com" 
                className="block text-sm text-gray-600 hover:text-blue-600"
              >
                Email Support
              </a>
            </div>
          </div>
          
          {/* Legal Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Legal</h4>
            <div className="space-y-2">
              <Link href="/terms-billing">
                <span className="block text-sm text-gray-600 hover:text-blue-600 cursor-pointer">Terms & Billing</span>
              </Link>
              <Link href="/privacy-cookies">
                <span className="block text-sm text-gray-600 hover:text-blue-600 cursor-pointer">Privacy & Cookies</span>
              </Link>
              <Link href="/cookie-preferences">
                <span className="block text-sm text-gray-600 hover:text-blue-600 cursor-pointer">Cookie Preferences</span>
              </Link>
              <Link href="/legal-notices">
                <span className="block text-sm text-gray-600 hover:text-blue-600 cursor-pointer">Legal Notices</span>
              </Link>
              <Link href="/trust-safety">
                <span className="block text-sm text-gray-600 hover:text-blue-600 cursor-pointer">Trust & Safety</span>
              </Link>
              <Link href="/compliance">
                <span className="block text-sm text-gray-600 hover:text-blue-600 cursor-pointer">FTC Disclosures</span>
              </Link>
            </div>
          </div>
          
        </div>
        
        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-300">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-500">
              © 2025 Pheme. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link href="/privacy-cookies">
                <span className="text-sm text-gray-500 hover:text-blue-600 cursor-pointer">Privacy</span>
              </Link>
              <Link href="/terms-billing">
                <span className="text-sm text-gray-500 hover:text-blue-600 cursor-pointer">Terms</span>
              </Link>
              <Link href="/cookie-preferences">
                <span className="text-sm text-gray-500 hover:text-blue-600 cursor-pointer">Cookies</span>
              </Link>
            </div>
          </div>
        </div>
        
      </div>
    </footer>
  );
};

export default Footer;