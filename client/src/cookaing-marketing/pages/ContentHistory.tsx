import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { History, Search, Filter, Download } from 'lucide-react';

export default function ContentHistory() {
  return (
    <div className="space-y-6" data-testid="content-history-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="page-title">
            Content History
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            View and manage all your generated content across campaigns
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" data-testid="button-filter">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" data-testid="button-export">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card data-testid="search-card">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search content by title, campaign, or keywords..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800"
                  data-testid="input-search"
                />
              </div>
            </div>
            <select 
              className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-800"
              data-testid="select-campaign"
            >
              <option value="">All Campaigns</option>
              <option value="summer">Summer Campaign</option>
              <option value="holiday">Holiday Campaign</option>
            </select>
            <select 
              className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-800"
              data-testid="select-content-type"
            >
              <option value="">All Content Types</option>
              <option value="social">Social Media</option>
              <option value="email">Email</option>
              <option value="blog">Blog Post</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Content List */}
      <div className="grid gap-4">
        {/* Placeholder Content Items */}
        {[1, 2, 3].map((item) => (
          <Card key={item} className="hover:shadow-md transition-shadow" data-testid={`content-item-${item}`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white" data-testid={`content-title-${item}`}>
                      Sample Content Title {item}
                    </h3>
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900 dark:text-blue-200">
                      Social Media
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-3" data-testid={`content-description-${item}`}>
                    This is a sample content description that would show the first few lines of the generated content...
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <span data-testid={`content-campaign-${item}`}>Campaign: Summer 2024</span>
                    <span data-testid={`content-date-${item}`}>Created: Nov 15, 2024</span>
                    <span data-testid={`content-performance-${item}`}>Performance: 85% engagement</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" data-testid={`button-edit-${item}`}>
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" data-testid={`button-duplicate-${item}`}>
                    Duplicate
                  </Button>
                  <Button variant="outline" size="sm" data-testid={`button-view-${item}`}>
                    View
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State (when no content exists) */}
      <Card className="text-center py-12" data-testid="empty-state" style={{ display: 'none' }}>
        <CardContent>
          <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No content history yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Start creating content with campaigns to see your history here.
          </p>
          <Button data-testid="button-create-content">
            Create Your First Content
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}