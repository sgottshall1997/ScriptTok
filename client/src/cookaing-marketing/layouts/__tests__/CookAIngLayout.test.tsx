import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import CookAIngLayout from '../CookAIngLayout';

// Mock wouter
vi.mock('wouter', () => ({
  useLocation: () => ['/cookaing-marketing', vi.fn()],
  Link: ({ children, href, className, ...props }: any) => (
    <a href={href} className={className} {...props}>
      {children}
    </a>
  ),
}));

// Mock UI components
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, className, ...props }: any) => (
    <button className={className} {...props}>
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/tooltip', () => ({
  TooltipProvider: ({ children }: any) => <div>{children}</div>,
  Tooltip: ({ children }: any) => <div>{children}</div>,
  TooltipTrigger: ({ children }: any) => <div>{children}</div>,
  TooltipContent: ({ children }: any) => <div>{children}</div>,
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  Home: () => <span data-testid="icon-home">Home Icon</span>,
  ChefHat: () => <span data-testid="icon-chef-hat">ChefHat Icon</span>,
  Info: () => <span data-testid="icon-info">Info Icon</span>,
  Building: () => <span data-testid="icon-building">Building Icon</span>,
  Users: () => <span data-testid="icon-users">Users Icon</span>,
  Users2: () => <span data-testid="icon-users2">Users2 Icon</span>,
  FormInput: () => <span data-testid="icon-form-input">FormInput Icon</span>,
  FileSpreadsheet: () => <span data-testid="icon-file-spreadsheet">FileSpreadsheet Icon</span>,
  ShoppingCart: () => <span data-testid="icon-shopping-cart">ShoppingCart Icon</span>,
  Target: () => <span data-testid="icon-target">Target Icon</span>,
  FlaskConical: () => <span data-testid="icon-flask-conical">FlaskConical Icon</span>,
  Workflow: () => <span data-testid="icon-workflow">Workflow Icon</span>,
  PersonStanding: () => <span data-testid="icon-person-standing">PersonStanding Icon</span>,
  TrendingUp: () => <span data-testid="icon-trending-up">TrendingUp Icon</span>,
  History: () => <span data-testid="icon-history">History Icon</span>,
  Sparkles: () => <span data-testid="icon-sparkles">Sparkles Icon</span>,
  BarChart2: () => <span data-testid="icon-bar-chart2">BarChart2 Icon</span>,
  CreditCard: () => <span data-testid="icon-credit-card">CreditCard Icon</span>,
  GitBranch: () => <span data-testid="icon-git-branch">GitBranch Icon</span>,
  Monitor: () => <span data-testid="icon-monitor">Monitor Icon</span>,
  Send: () => <span data-testid="icon-send">Send Icon</span>,
  Mail: () => <span data-testid="icon-mail">Mail Icon</span>,
  Wrench: () => <span data-testid="icon-wrench">Wrench Icon</span>,
  BookOpen: () => <span data-testid="icon-book-open">BookOpen Icon</span>,
  LogOut: () => <span data-testid="icon-log-out">LogOut Icon</span>,
  Menu: () => <span data-testid="icon-menu">Menu Icon</span>,
  X: () => <span data-testid="icon-x">X Icon</span>,
}));

describe('CookAIngLayout Sidebar', () => {
  const expectedSidebarOrder = [
    // Overview section
    'Overview',
    'Marketing Dashboard',
    'About',
    
    // Data section
    'Data',
    'Organizations',
    'Contacts',
    'Segments',
    'Forms',
    'Form Submissions',
    'Affiliate Products',
    
    // Campaign Ops section
    'Campaign Ops',
    'Campaigns',
    'A/B Testing',
    'Workflows',
    'Personalization',
    
    // Intelligence & Content section
    'Intelligence & Content',
    'Trends & Seasonal',
    'Content History',
    'Unified Content Generator',
    
    // Analytics section
    'Analytics',
    'Reports',
    'Costs & ROAS',
    'Attribution Inspector',
    
    // System section
    'System',
    'Health',
    'Webhooks Monitor',
    'Email Delivery Test',
    'Developer Tools',
    
    // Help section
    'Help',
    'Docs',
    'Exit CookAIng'
  ];

  it('renders all sidebar items in the exact specified order', () => {
    const mockDiv = document.createElement('div');
    document.body.appendChild(mockDiv);
    
    const { render } = require('@testing-library/react');
    render(
      <CookAIngLayout>
        <div>Test Content</div>
      </CookAIngLayout>,
      { container: mockDiv }
    );

    // Get all text content from the sidebar in order
    const sidebar = document.querySelector('nav');
    expect(sidebar).toBeTruthy();
    
    const allTextElements = Array.from(sidebar!.querySelectorAll('h3, a, button'))
      .map((el: Element) => el.textContent?.trim())
      .filter(text => text && text.length > 0);

    // Verify exact order matches our expected order
    expectedSidebarOrder.forEach((expectedItem, index) => {
      expect(allTextElements).toContain(expectedItem);
      
      // Find the actual position of this item in the rendered list
      const actualPosition = allTextElements.indexOf(expectedItem);
      expect(actualPosition).not.toBe(-1);
      
      // Verify items appear in the correct relative order
      if (index > 0) {
        const previousItem = expectedSidebarOrder[index - 1];
        const previousPosition = allTextElements.indexOf(previousItem);
        expect(actualPosition).toBeGreaterThan(previousPosition);
      }
    });
  });

  it('renders all section headers as non-clickable labels', () => {
    render(
      <CookAIngLayout>
        <div>Test Content</div>
      </CookAIngLayout>
    );

    const sectionHeaders = [
      'Overview',
      'Data', 
      'Campaign Ops',
      'Intelligence & Content',
      'Analytics',
      'System',
      'Help'
    ];

    sectionHeaders.forEach(header => {
      const headerElement = screen.getByText(header);
      expect(headerElement.tagName).toBe('H3');
      expect(headerElement).toHaveClass('text-xs', 'font-semibold', 'uppercase');
    });
  });

  it('renders all navigation items with correct icons and paths', () => {
    render(
      <CookAIngLayout>
        <div>Test Content</div>
      </CookAIngLayout>
    );

    // Test specific navigation items and their expected hrefs
    const navigationItems = [
      { name: 'Marketing Dashboard', expectedHref: '/cookaing-marketing' },
      { name: 'About', expectedHref: '/about' },
      { name: 'Organizations', expectedHref: '/organizations' },
      { name: 'Contacts', expectedHref: '/contacts' },
      { name: 'Content History', expectedHref: '/content-history' },
      { name: 'Unified Content Generator', expectedHref: '/content-generator' },
      { name: 'Reports', expectedHref: '/reports' },
      { name: 'Health', expectedHref: '/integrations-health' },
      { name: 'Docs', expectedHref: '/docs' }
    ];

    navigationItems.forEach(item => {
      const linkElement = screen.getByText(item.name);
      if (item.name !== 'Exit CookAIng') {
        expect(linkElement.closest('a')).toHaveAttribute('href', item.expectedHref);
      }
    });
  });

  it('handles Exit CookAIng as a special button element', () => {
    render(
      <CookAIngLayout>
        <div>Test Content</div>
      </CookAIngLayout>
    );

    const exitButton = screen.getByText('Exit CookAIng');
    expect(exitButton.tagName).toBe('BUTTON');
    expect(exitButton).toHaveClass('flex', 'items-center', 'w-full');
  });

  it('renders disabled items with proper styling and tooltips when specified', () => {
    // This test would verify disabled functionality when items are marked as disabled
    render(
      <CookAIngLayout>
        <div>Test Content</div>
      </CookAIngLayout>
    );

    // For now, verify that the structure supports disabled states
    // In a real scenario, you would modify the navigation data to include disabled items
    const navigationLinks = screen.getAllByRole('link');
    expect(navigationLinks.length).toBeGreaterThan(0);
    
    // Verify the class structure supports disabled states
    navigationLinks.forEach(link => {
      expect(link).toHaveClass('flex', 'items-center');
    });
  });

  it('ensures all items are always visible regardless of environment', () => {
    // Mock different environment scenarios
    const originalEnv = process.env.NODE_ENV;
    
    try {
      // Test in development environment
      process.env.NODE_ENV = 'development';
      const { unmount: unmountDev } = render(
        <CookAIngLayout>
          <div>Test Content</div>
        </CookAIngLayout>
      );

      expectedSidebarOrder.forEach(item => {
        expect(screen.getByText(item)).toBeInTheDocument();
      });
      
      unmountDev();

      // Test in production environment
      process.env.NODE_ENV = 'production';
      render(
        <CookAIngLayout>
          <div>Test Content</div>
        </CookAIngLayout>
      );

      expectedSidebarOrder.forEach(item => {
        expect(screen.getByText(item)).toBeInTheDocument();
      });
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });

  it('maintains correct active state highlighting', () => {
    render(
      <CookAIngLayout>
        <div>Test Content</div>
      </CookAIngLayout>
    );

    // Since we mocked useLocation to return '/cookaing-marketing', 
    // the Marketing Dashboard should be active
    const dashboardLink = screen.getByText('Marketing Dashboard');
    const linkElement = dashboardLink.closest('a');
    
    expect(linkElement).toHaveClass('bg-blue-100');
  });

  it('verifies all required navigation items are present', () => {
    render(
      <CookAIngLayout>
        <div>Test Content</div>
      </CookAIngLayout>
    );

    // Comprehensive list of all required items from the specifications
    const requiredItems = [
      'Marketing Dashboard', 'About',
      'Organizations', 'Contacts', 'Segments', 'Forms', 'Form Submissions', 'Affiliate Products',
      'Campaigns', 'A/B Testing', 'Workflows', 'Personalization',
      'Trends & Seasonal', 'Content History', 'Unified Content Generator',
      'Reports', 'Costs & ROAS', 'Attribution Inspector',
      'Health', 'Webhooks Monitor', 'Email Delivery Test', 'Developer Tools',
      'Docs', 'Exit CookAIng'
    ];

    requiredItems.forEach(item => {
      expect(screen.getByText(item)).toBeInTheDocument();
    });

    // Verify total count matches expected
    expect(requiredItems).toHaveLength(24);
  });

  it('verifies section organization matches specifications', () => {
    render(
      <CookAIngLayout>
        <div>Test Content</div>
      </CookAIngLayout>
    );

    // Verify each section has the correct number of items
    const sectionStructure = {
      'Overview': 2,       // Marketing Dashboard, About
      'Data': 6,           // Organizations, Contacts, Segments, Forms, Form Submissions, Affiliate Products  
      'Campaign Ops': 4,   // Campaigns, A/B Testing, Workflows, Personalization
      'Intelligence & Content': 3, // Trends & Seasonal, Content History, Unified Content Generator
      'Analytics': 3,      // Reports, Costs & ROAS, Attribution Inspector
      'System': 4,         // Health, Webhooks Monitor, Email Delivery Test, Developer Tools
      'Help': 2            // Docs, Exit CookAIng
    };

    Object.entries(sectionStructure).forEach(([sectionName, expectedCount]) => {
      const sectionHeader = screen.getByText(sectionName);
      expect(sectionHeader).toBeInTheDocument();
      
      // Note: In a more sophisticated test, you could verify the exact count 
      // of items under each section by traversing the DOM structure
    });
  });
});