import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Home, Settings, FileText, Users, HelpCircle, Calendar, BarChart2, Download, Upload, Layout, Eye, LineChart, Sliders, Hash, Smile } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-1">
          <Link href="/">
            <a className="flex items-center text-xl font-bold text-gray-800">
              <span className="text-indigo-600">Glow</span>
              <span>Bot</span>
            </a>
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/">
            <a className="text-gray-600 hover:text-indigo-600 text-sm font-medium flex items-center">
              <Home className="w-4 h-4 mr-1" />
              Home
            </a>
          </Link>
          <Link href="/dashboard">
            <a className="text-gray-600 hover:text-indigo-600 text-sm font-medium flex items-center">
              <FileText className="w-4 h-4 mr-1" />
              Dashboard
            </a>
          </Link>
          <Link href="/templates">
            <a className="text-gray-600 hover:text-indigo-600 text-sm font-medium flex items-center">
              <Settings className="w-4 h-4 mr-1" />
              Templates
            </a>
          </Link>
          <Link href="/about">
            <a className="text-gray-600 hover:text-indigo-600 text-sm font-medium flex items-center">
              <Users className="w-4 h-4 mr-1" />
              About
            </a>
          </Link>
          <Link href="/how-it-works">
            <a className="text-gray-600 hover:text-indigo-600 text-sm font-medium flex items-center">
              <HelpCircle className="w-4 h-4 mr-1" />
              How It Works
            </a>
          </Link>
          <Link href="/content-calendar">
            <a className="text-gray-600 hover:text-indigo-600 text-sm font-medium flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              Content Calendar
            </a>
          </Link>
          <Link href="/competitive-analysis">
            <a className="text-gray-600 hover:text-indigo-600 text-sm font-medium flex items-center">
              <BarChart2 className="w-4 h-4 mr-1" />
              Competitive Analysis
            </a>
          </Link>
          <Link href="/export-import">
            <a className="text-gray-600 hover:text-indigo-600 text-sm font-medium flex items-center">
              <Upload className="w-4 h-4 mr-1" />
              Export/Import
            </a>
          </Link>
          <Link href="/platform-preview">
            <a className="text-gray-600 hover:text-indigo-600 text-sm font-medium flex items-center">
              <Layout className="w-4 h-4 mr-1" />
              Platform Preview
            </a>
          </Link>
          <Link href="/performance-tracker">
            <a className="text-gray-600 hover:text-indigo-600 text-sm font-medium flex items-center">
              <LineChart className="w-4 h-4 mr-1" />
              Performance Tracker
            </a>
          </Link>
          <Link href="/ai-model-config">
            <a className="text-gray-600 hover:text-indigo-600 text-sm font-medium flex items-center">
              <Sliders className="w-4 h-4 mr-1" />
              AI Model Config
            </a>
          </Link>
          <Link href="/emoji-hashtag-test">
            <a className="text-gray-600 hover:text-indigo-600 text-sm font-medium flex items-center">
              <Hash className="w-4 h-4 mr-1" />
              <Smile className="w-4 h-4 mr-1" />
              Emoji & Hashtags
            </a>
          </Link>
        </nav>
        
        <div className="hidden md:flex items-center space-x-4">
          <Link href="/claude-generator">
            <Button variant="outline" className="text-indigo-600 border-indigo-600 hover:bg-indigo-50">
              Claude AI
            </Button>
          </Link>
          <Link href="/ai-model-test">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
              AI Model Test
            </Button>
          </Link>
        </div>
        
        <Button className="md:hidden" variant="ghost" size="sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </Button>
      </div>
    </header>
  );
}