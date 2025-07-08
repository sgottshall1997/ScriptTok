import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { PieChart, Pie, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { NICHES } from '@shared/constants';
import { BarChart2, Calendar, FileText, TrendingUp, TrendingDown, PieChart as PieChartIcon, LineChart as LineChartIcon, Plus, Trash2, RefreshCw, Download, Upload, Check, X } from 'lucide-react';

interface ContentItem {
  id: string;
  title: string;
  platform: string;
  niche: string;
  publishDate: string;
  impressions: number;
  engagements: number;
  clicks: number;
  conversions: number;
  revenue: number;
}

interface PerformanceMetric {
  name: string;
  value: number;
}

interface TimeSeriesData {
  date: string;
  impressions: number;
  engagements: number;
  clicks: number;
  conversions: number;
}

export default function ContentPerformanceTracker() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<ContentItem[]>([]);
  const [filterNiche, setFilterNiche] = useState<string>('all');
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [filterDateRange, setFilterDateRange] = useState<string>('all');
  const [newContentDialog, setNewContentDialog] = useState<boolean>(false);
  const [editingContent, setEditingContent] = useState<ContentItem | null>(null);
  
  // New content form state
  const [formTitle, setFormTitle] = useState<string>('');
  const [formPlatform, setFormPlatform] = useState<string>('Instagram');
  const [formNiche, setFormNiche] = useState<string>('');
  const [formPublishDate, setFormPublishDate] = useState<string>('');
  const [formImpressions, setFormImpressions] = useState<string>('0');
  const [formEngagements, setFormEngagements] = useState<string>('0');
  const [formClicks, setFormClicks] = useState<string>('0');
  const [formConversions, setFormConversions] = useState<string>('0');
  const [formRevenue, setFormRevenue] = useState<string>('0');
  
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [showDemo, setShowDemo] = useState<boolean>(false);
  
  // Platform options
  const platforms = [
    'Instagram',
    'Facebook',
    'Twitter',
    'LinkedIn',
    'TikTok',
    'Pinterest',
    'Blog',
    'Email',
    'YouTube',
  ];

  // Date range options
  const dateRanges = [
    { value: 'all', label: 'All Time' },
    { value: '7days', label: 'Last 7 Days' },
    { value: '30days', label: 'Last 30 Days' },
    { value: '90days', label: 'Last 90 Days' },
    { value: 'year', label: 'This Year' },
  ];

  // Initialize with demo data on component mount
  useEffect(() => {
    // In a real implementation, we would fetch from the backend
    // For now, using demo data
    if (showDemo) {
      initializeDemoData();
    }
  }, [showDemo]);
  
  // Apply filters when filter values change
  useEffect(() => {
    applyFilters();
  }, [contentItems, filterNiche, filterPlatform, filterDateRange]);

  // Initialize with demo data
  const initializeDemoData = () => {
    const demoData: ContentItem[] = [
      {
        id: '1',
        title: 'Top 10 Summer Skincare Tips',
        platform: 'Instagram',
        niche: 'beauty',
        publishDate: '2025-05-01',
        impressions: 15200,
        engagements: 1850,
        clicks: 420,
        conversions: 38,
        revenue: 760
      },
      {
        id: '2',
        title: 'Must-Have Tech Gadgets for 2025',
        platform: 'Blog',
        niche: 'tech',
        publishDate: '2025-04-15',
        impressions: 8900,
        engagements: 450,
        clicks: 780,
        conversions: 65,
        revenue: 3250
      },
      {
        id: '3',
        title: 'Morning Workout Routine for Busy Professionals',
        platform: 'YouTube',
        niche: 'fitness',
        publishDate: '2025-05-05',
        impressions: 22500,
        engagements: 2650,
        clicks: 980,
        conversions: 145,
        revenue: 1740
      },
      {
        id: '4',
        title: 'Minimalist Home Office Setup Guide',
        platform: 'Pinterest',
        niche: 'home',
        publishDate: '2025-04-22',
        impressions: 18700,
        engagements: 3420,
        clicks: 1240,
        conversions: 87,
        revenue: 2175
      },
      {
        id: '5',
        title: 'How to Choose the Perfect Pet Food',
        platform: 'Facebook',
        niche: 'pet',
        publishDate: '2025-05-10',
        impressions: 12800,
        engagements: 1560,
        clicks: 580,
        conversions: 95,
        revenue: 1425
      },
      {
        id: '6',
        title: 'Summer Fashion Trends 2025',
        platform: 'Instagram',
        niche: 'fashion',
        publishDate: '2025-05-12',
        impressions: 25600,
        engagements: 4350,
        clicks: 1780,
        conversions: 210,
        revenue: 5250
      },
      {
        id: '7',
        title: 'Best Budget Camera Gear for Beginners',
        platform: 'YouTube',
        niche: 'tech',
        publishDate: '2025-04-30',
        impressions: 14300,
        engagements: 1980,
        clicks: 760,
        conversions: 58,
        revenue: 2900
      },
      {
        id: '8',
        title: 'Eco-Friendly Skincare Products Review',
        platform: 'Blog',
        niche: 'beauty',
        publishDate: '2025-05-08',
        impressions: 9700,
        engagements: 850,
        clicks: 620,
        conversions: 74,
        revenue: 1480
      },
      {
        id: '9',
        title: '5-Minute Healthy Breakfast Ideas',
        platform: 'TikTok',
        niche: 'food',
        publishDate: '2025-05-13',
        impressions: 42000,
        engagements: 8750,
        clicks: 1250,
        conversions: 180,
        revenue: 900
      },
      {
        id: '10',
        title: 'Hidden Gems: Travel Destinations for 2025',
        platform: 'LinkedIn',
        niche: 'travel',
        publishDate: '2025-04-18',
        impressions: 7500,
        engagements: 620,
        clicks: 430,
        conversions: 28,
        revenue: 5600
      }
    ];
    
    setContentItems(demoData);
  };

  // Apply filters to content items
  const applyFilters = () => {
    let filtered = [...contentItems];
    
    // Apply niche filter
    if (filterNiche !== 'all') {
      filtered = filtered.filter(item => item.niche === filterNiche);
    }
    
    // Apply platform filter
    if (filterPlatform !== 'all') {
      filtered = filtered.filter(item => item.platform === filterPlatform);
    }
    
    // Apply date range filter
    if (filterDateRange !== 'all') {
      const now = new Date();
      let cutoffDate = new Date();
      
      switch(filterDateRange) {
        case '7days':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case '30days':
          cutoffDate.setDate(now.getDate() - 30);
          break;
        case '90days':
          cutoffDate.setDate(now.getDate() - 90);
          break;
        case 'year':
          cutoffDate = new Date(now.getFullYear(), 0, 1);
          break;
      }
      
      filtered = filtered.filter(item => new Date(item.publishDate) >= cutoffDate);
    }
    
    setFilteredItems(filtered);
  };

  // Calculate total metrics across all filtered content
  const calculateTotalMetrics = () => {
    return filteredItems.reduce((totals, item) => {
      return {
        impressions: totals.impressions + item.impressions,
        engagements: totals.engagements + item.engagements,
        clicks: totals.clicks + item.clicks,
        conversions: totals.conversions + item.conversions,
        revenue: totals.revenue + item.revenue
      };
    }, { impressions: 0, engagements: 0, clicks: 0, conversions: 0, revenue: 0 });
  };

  // Calculate engagement rate
  const calculateEngagementRate = () => {
    const totals = calculateTotalMetrics();
    return totals.impressions > 0 ? (totals.engagements / totals.impressions) * 100 : 0;
  };

  // Calculate click-through rate
  const calculateCTR = () => {
    const totals = calculateTotalMetrics();
    return totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
  };

  // Calculate conversion rate
  const calculateConversionRate = () => {
    const totals = calculateTotalMetrics();
    return totals.clicks > 0 ? (totals.conversions / totals.clicks) * 100 : 0;
  };

  // Calculate return on investment
  const calculateROI = () => {
    // Assuming a fixed cost per content piece of $150
    const totalCost = filteredItems.length * 150;
    const totalRevenue = calculateTotalMetrics().revenue;
    
    return totalCost > 0 ? ((totalRevenue - totalCost) / totalCost) * 100 : 0;
  };

  // Get data for platform distribution chart
  const getPlatformDistributionData = () => {
    const platformCounts: Record<string, number> = {};
    
    filteredItems.forEach(item => {
      platformCounts[item.platform] = (platformCounts[item.platform] || 0) + 1;
    });
    
    return Object.entries(platformCounts).map(([name, value]) => ({ name, value }));
  };

  // Get data for niche performance chart
  const getNichePerformanceData = () => {
    const nicheMetrics: Record<string, { impressions: number, engagements: number, clicks: number, conversions: number }> = {};
    
    filteredItems.forEach(item => {
      if (!nicheMetrics[item.niche]) {
        nicheMetrics[item.niche] = { impressions: 0, engagements: 0, clicks: 0, conversions: 0 };
      }
      
      nicheMetrics[item.niche].impressions += item.impressions;
      nicheMetrics[item.niche].engagements += item.engagements;
      nicheMetrics[item.niche].clicks += item.clicks;
      nicheMetrics[item.niche].conversions += item.conversions;
    });
    
    return Object.entries(nicheMetrics).map(([niche, metrics]) => ({
      niche,
      ...metrics
    }));
  };

  // Get time series data
  const getTimeSeriesData = () => {
    const dateMap = new Map<string, { impressions: number, engagements: number, clicks: number, conversions: number }>();
    
    // Sort items by date
    const sortedItems = [...filteredItems].sort((a, b) => 
      new Date(a.publishDate).getTime() - new Date(b.publishDate).getTime()
    );
    
    // Aggregate metrics by date
    sortedItems.forEach(item => {
      if (!dateMap.has(item.publishDate)) {
        dateMap.set(item.publishDate, { impressions: 0, engagements: 0, clicks: 0, conversions: 0 });
      }
      
      const dateData = dateMap.get(item.publishDate)!;
      dateData.impressions += item.impressions;
      dateData.engagements += item.engagements;
      dateData.clicks += item.clicks;
      dateData.conversions += item.conversions;
    });
    
    // Convert to array of objects
    return Array.from(dateMap.entries()).map(([date, metrics]) => ({
      date: formatDate(date),
      ...metrics
    }));
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  // Handle form submission for new content
  const handleFormSubmit = () => {
    if (!formTitle || !formPlatform || !formNiche || !formPublishDate) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }
    
    const newContent: ContentItem = {
      id: editingContent ? editingContent.id : Math.random().toString(36).substring(2, 9),
      title: formTitle,
      platform: formPlatform,
      niche: formNiche,
      publishDate: formPublishDate,
      impressions: parseInt(formImpressions) || 0,
      engagements: parseInt(formEngagements) || 0,
      clicks: parseInt(formClicks) || 0,
      conversions: parseInt(formConversions) || 0,
      revenue: parseFloat(formRevenue) || 0,
    };
    
    if (editingContent) {
      // Update existing content
      setContentItems(contentItems.map(item => 
        item.id === editingContent.id ? newContent : item
      ));
      
      toast({
        title: 'Content Updated',
        description: 'Performance data has been updated successfully.',
      });
    } else {
      // Add new content
      setContentItems([...contentItems, newContent]);
      
      toast({
        title: 'Content Added',
        description: 'New content has been added to the tracker.',
      });
    }
    
    // Reset form and close dialog
    resetForm();
    setNewContentDialog(false);
  };

  // Reset form state
  const resetForm = () => {
    setFormTitle('');
    setFormPlatform('Instagram');
    setFormNiche('');
    setFormPublishDate('');
    setFormImpressions('0');
    setFormEngagements('0');
    setFormClicks('0');
    setFormConversions('0');
    setFormRevenue('0');
    setEditingContent(null);
  };

  // Delete content item
  const deleteContent = (id: string) => {
    setContentItems(contentItems.filter(item => item.id !== id));
    
    toast({
      title: 'Content Deleted',
      description: 'Content has been removed from the tracker.',
    });
  };

  // Edit content item
  const editContent = (item: ContentItem) => {
    setEditingContent(item);
    setFormTitle(item.title);
    setFormPlatform(item.platform);
    setFormNiche(item.niche);
    setFormPublishDate(item.publishDate);
    setFormImpressions(item.impressions.toString());
    setFormEngagements(item.engagements.toString());
    setFormClicks(item.clicks.toString());
    setFormConversions(item.conversions.toString());
    setFormRevenue(item.revenue.toString());
    setNewContentDialog(true);
  };

  // Import content from file
  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsImporting(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        if (Array.isArray(data) && data.length > 0) {
          // Validate data format
          const valid = data.every(item => 
            typeof item.title === 'string' &&
            typeof item.platform === 'string' &&
            typeof item.niche === 'string' &&
            typeof item.publishDate === 'string'
          );
          
          if (valid) {
            setContentItems(data);
            toast({
              title: 'Import Successful',
              description: `${data.length} content items have been imported.`,
            });
          } else {
            throw new Error('Invalid data format');
          }
        } else {
          throw new Error('No content items found');
        }
      } catch (error) {
        console.error('Import error:', error);
        toast({
          title: 'Import Failed',
          description: 'Failed to import content. Please check the file format.',
          variant: 'destructive',
        });
      } finally {
        setIsImporting(false);
      }
    };
    
    reader.onerror = () => {
      setIsImporting(false);
      toast({
        title: 'Import Failed',
        description: 'Failed to read the file.',
        variant: 'destructive',
      });
    };
    
    reader.readAsText(file);
  };

  // Export content to file
  const handleExport = () => {
    const data = JSON.stringify(contentItems, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'content-performance-data.json';
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
    
    toast({
      title: 'Export Successful',
      description: 'Content performance data has been exported.',
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Content Performance Tracker</h1>
          <p className="text-gray-600 mt-1">
            Track and analyze the performance of your content across different platforms
          </p>
        </div>
        
        <div className="flex space-x-2">
          {contentItems.length === 0 && !showDemo ? (
            <Button onClick={() => setShowDemo(true)} variant="outline" className="flex items-center">
              <RefreshCw className="w-4 h-4 mr-2" />
              Load Demo Data
            </Button>
          ) : (
            <>
              <Button onClick={() => setNewContentDialog(true)} className="flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                Add Content
              </Button>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center">
                    <Upload className="w-4 h-4 mr-2" />
                    Import/Export
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Import/Export Data</DialogTitle>
                    <DialogDescription>
                      Import content performance data from a file or export your current data.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div>
                      <Label htmlFor="import-file">Import Data</Label>
                      <div className="flex mt-1">
                        <Input
                          id="import-file"
                          type="file"
                          accept=".json"
                          onChange={handleImportFile}
                          disabled={isImporting}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Import content performance data from a JSON file.
                      </p>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <Button 
                        onClick={handleExport} 
                        disabled={contentItems.length === 0} 
                        className="w-full"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export Current Data
                      </Button>
                      <p className="text-xs text-gray-500 mt-1">
                        Export your current content performance data to a JSON file.
                      </p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>
      
      {contentItems.length === 0 && !showDemo ? (
        <Card className="bg-white">
          <CardContent className="py-12">
            <div className="text-center">
              <BarChart2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Performance Data Available</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                Start tracking your content performance by adding content items or importing existing data.
              </p>
              <div className="flex justify-center space-x-4">
                <Button onClick={() => setNewContentDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Content
                </Button>
                <Button onClick={() => setShowDemo(true)} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Load Demo Data
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Filter Controls */}
          <Card>
            <CardContent className="py-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="filter-niche">Filter by Niche</Label>
                  <Select value={filterNiche} onValueChange={setFilterNiche}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select niche" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Niches</SelectItem>
                      {NICHES.map((niche) => (
                        <SelectItem key={niche} value={niche}>
                          {niche.charAt(0).toUpperCase() + niche.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="filter-platform">Filter by Platform</Label>
                  <Select value={filterPlatform} onValueChange={setFilterPlatform}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Platforms</SelectItem>
                      {platforms.map((platform) => (
                        <SelectItem key={platform} value={platform}>
                          {platform}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="filter-date">Date Range</Label>
                  <Select value={filterDateRange} onValueChange={setFilterDateRange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select date range" />
                    </SelectTrigger>
                    <SelectContent>
                      {dateRanges.map((range) => (
                        <SelectItem key={range.value} value={range.value}>
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview" className="flex items-center">
                <BarChart2 className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="content-list" className="flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                Content List
              </TabsTrigger>
              <TabsTrigger value="platform-analytics" className="flex items-center">
                <PieChartIcon className="w-4 h-4 mr-2" />
                Platform Analytics
              </TabsTrigger>
              <TabsTrigger value="trends" className="flex items-center">
                <LineChartIcon className="w-4 h-4 mr-2" />
                Trends
              </TabsTrigger>
            </TabsList>
            
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Total Content</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="text-3xl font-bold">{filteredItems.length}</div>
                      <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      {contentItems.length} total content items
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Engagement Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="text-3xl font-bold">{calculateEngagementRate().toFixed(2)}%</div>
                      <div className={calculateEngagementRate() > 10 ? "text-green-500" : "text-amber-500"}>
                        {calculateEngagementRate() > 10 ? (
                          <TrendingUp className="w-8 h-8" />
                        ) : (
                          <TrendingDown className="w-8 h-8" />
                        )}
                      </div>
                    </div>
                    <Progress value={Math.min(calculateEngagementRate() * 3, 100)} className="mt-2" />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Conversion Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="text-3xl font-bold">{calculateConversionRate().toFixed(2)}%</div>
                      <div className={calculateConversionRate() > 5 ? "text-green-500" : "text-amber-500"}>
                        {calculateConversionRate() > 5 ? (
                          <TrendingUp className="w-8 h-8" />
                        ) : (
                          <TrendingDown className="w-8 h-8" />
                        )}
                      </div>
                    </div>
                    <Progress value={Math.min(calculateConversionRate() * 10, 100)} className="mt-2" />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">ROI</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="text-3xl font-bold">{calculateROI().toFixed(0)}%</div>
                      <div className={calculateROI() > 100 ? "text-green-500" : "text-amber-500"}>
                        {calculateROI() > 100 ? (
                          <TrendingUp className="w-8 h-8" />
                        ) : (
                          <TrendingDown className="w-8 h-8" />
                        )}
                      </div>
                    </div>
                    <Progress value={Math.min(calculateROI() / 2, 100)} className="mt-2" />
                  </CardContent>
                </Card>
              </div>
              
              {/* Performance Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Platform Distribution</CardTitle>
                    <CardDescription>
                      Content distribution across different platforms
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {getPlatformDistributionData().length > 0 ? (
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={getPlatformDistributionData()}
                              cx="50%"
                              cy="50%"
                              labelLine={true}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                              {getPlatformDistributionData().map((entry, index) => (
                                <Tooltip key={`tooltip-${index}`} />
                              ))}
                            </Pie>
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="h-80 flex items-center justify-center">
                        <p className="text-gray-500">No data available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Niche Performance</CardTitle>
                    <CardDescription>
                      Comparing performance metrics across different niches
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {getNichePerformanceData().length > 0 ? (
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            width={500}
                            height={300}
                            data={getNichePerformanceData()}
                            margin={{
                              top: 5,
                              right: 30,
                              left: 20,
                              bottom: 5,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="niche" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="impressions" fill="#8884d8" />
                            <Bar dataKey="engagements" fill="#82ca9d" />
                            <Bar dataKey="clicks" fill="#ffc658" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="h-80 flex items-center justify-center">
                        <p className="text-gray-500">No data available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* Content List Tab */}
            <TabsContent value="content-list">
              <Card>
                <CardHeader>
                  <CardTitle>Content Performance Data</CardTitle>
                  <CardDescription>
                    Detailed performance metrics for all content items
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableCaption>
                      {filteredItems.length} content items found
                    </TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Platform</TableHead>
                        <TableHead>Niche</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Impressions</TableHead>
                        <TableHead className="text-right">Engagement</TableHead>
                        <TableHead className="text-right">Clicks</TableHead>
                        <TableHead className="text-right">Conversions</TableHead>
                        <TableHead className="text-right">Revenue</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium max-w-xs truncate">{item.title}</TableCell>
                          <TableCell>{item.platform}</TableCell>
                          <TableCell>{item.niche}</TableCell>
                          <TableCell>{formatDate(item.publishDate)}</TableCell>
                          <TableCell className="text-right">{item.impressions.toLocaleString()}</TableCell>
                          <TableCell className="text-right">{item.engagements.toLocaleString()}</TableCell>
                          <TableCell className="text-right">{item.clicks.toLocaleString()}</TableCell>
                          <TableCell className="text-right">{item.conversions.toLocaleString()}</TableCell>
                          <TableCell className="text-right">${item.revenue.toLocaleString()}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => editContent(item)}
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="text-red-500 hover:text-red-700" 
                                onClick={() => deleteContent(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Platform Analytics Tab */}
            <TabsContent value="platform-analytics">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Platform Engagement</CardTitle>
                    <CardDescription>
                      Comparison of engagement rates across platforms
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          width={500}
                          height={300}
                          data={
                            // Group by platform and calculate engagement rate
                            platforms
                              .filter(platform => 
                                filteredItems.some(item => item.platform === platform)
                              )
                              .map(platform => {
                                const platformItems = filteredItems.filter(item => item.platform === platform);
                                const totalImpressions = platformItems.reduce((sum, item) => sum + item.impressions, 0);
                                const totalEngagements = platformItems.reduce((sum, item) => sum + item.engagements, 0);
                                const engagementRate = totalImpressions > 0 ? (totalEngagements / totalImpressions) * 100 : 0;
                                
                                return {
                                  platform,
                                  engagementRate,
                                  contentCount: platformItems.length
                                };
                              })
                          }
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="platform" />
                          <YAxis yAxisId="left" label={{ value: 'Engagement Rate (%)', angle: -90, position: 'insideLeft' }} />
                          <YAxis yAxisId="right" orientation="right" label={{ value: 'Content Count', angle: 90, position: 'insideRight' }} />
                          <Tooltip />
                          <Legend />
                          <Bar yAxisId="left" dataKey="engagementRate" fill="#8884d8" name="Engagement Rate (%)" />
                          <Bar yAxisId="right" dataKey="contentCount" fill="#82ca9d" name="Content Count" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Conversion Performance</CardTitle>
                    <CardDescription>
                      Comparison of conversion metrics across platforms
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          width={500}
                          height={300}
                          data={
                            // Group by platform and calculate conversion rate
                            platforms
                              .filter(platform => 
                                filteredItems.some(item => item.platform === platform)
                              )
                              .map(platform => {
                                const platformItems = filteredItems.filter(item => item.platform === platform);
                                const totalClicks = platformItems.reduce((sum, item) => sum + item.clicks, 0);
                                const totalConversions = platformItems.reduce((sum, item) => sum + item.conversions, 0);
                                const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
                                const totalRevenue = platformItems.reduce((sum, item) => sum + item.revenue, 0);
                                
                                return {
                                  platform,
                                  conversionRate,
                                  revenue: totalRevenue
                                };
                              })
                          }
                          margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="platform" />
                          <YAxis yAxisId="left" label={{ value: 'Conversion Rate (%)', angle: -90, position: 'insideLeft' }} />
                          <YAxis yAxisId="right" orientation="right" label={{ value: 'Revenue ($)', angle: 90, position: 'insideRight' }} />
                          <Tooltip />
                          <Legend />
                          <Bar yAxisId="left" dataKey="conversionRate" fill="#ffc658" name="Conversion Rate (%)" />
                          <Bar yAxisId="right" dataKey="revenue" fill="#ff8042" name="Revenue ($)" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            {/* Trends Tab */}
            <TabsContent value="trends">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Trends Over Time</CardTitle>
                  <CardDescription>
                    Track how your content performance metrics change over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        width={500}
                        height={300}
                        data={getTimeSeriesData()}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="impressions" stroke="#8884d8" activeDot={{ r: 8 }} name="Impressions" />
                        <Line type="monotone" dataKey="engagements" stroke="#82ca9d" name="Engagements" />
                        <Line type="monotone" dataKey="clicks" stroke="#ffc658" name="Clicks" />
                        <Line type="monotone" dataKey="conversions" stroke="#ff8042" name="Conversions" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
      
      {/* Add/Edit Content Dialog */}
      <Dialog open={newContentDialog} onOpenChange={setNewContentDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingContent ? 'Edit Content' : 'Add New Content'}</DialogTitle>
            <DialogDescription>
              {editingContent
                ? 'Update the performance data for your content.'
                : 'Add a new content item to track its performance.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="content-title">Content Title</Label>
              <Input
                id="content-title"
                placeholder="Enter content title"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="content-platform">Platform</Label>
              <Select value={formPlatform} onValueChange={setFormPlatform}>
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  {platforms.map((platform) => (
                    <SelectItem key={platform} value={platform}>
                      {platform}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="content-niche">Niche</Label>
              <Select value={formNiche} onValueChange={setFormNiche}>
                <SelectTrigger>
                  <SelectValue placeholder="Select niche" />
                </SelectTrigger>
                <SelectContent>
                  {NICHES.map((niche) => (
                    <SelectItem key={niche} value={niche}>
                      {niche.charAt(0).toUpperCase() + niche.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="content-date">Publish Date</Label>
              <Input
                id="content-date"
                type="date"
                value={formPublishDate}
                onChange={(e) => setFormPublishDate(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="content-impressions">Impressions</Label>
              <Input
                id="content-impressions"
                type="number"
                placeholder="0"
                value={formImpressions}
                onChange={(e) => setFormImpressions(e.target.value)}
                min="0"
              />
            </div>
            
            <div>
              <Label htmlFor="content-engagements">Engagements</Label>
              <Input
                id="content-engagements"
                type="number"
                placeholder="0"
                value={formEngagements}
                onChange={(e) => setFormEngagements(e.target.value)}
                min="0"
              />
            </div>
            
            <div>
              <Label htmlFor="content-clicks">Clicks</Label>
              <Input
                id="content-clicks"
                type="number"
                placeholder="0"
                value={formClicks}
                onChange={(e) => setFormClicks(e.target.value)}
                min="0"
              />
            </div>
            
            <div>
              <Label htmlFor="content-conversions">Conversions</Label>
              <Input
                id="content-conversions"
                type="number"
                placeholder="0"
                value={formConversions}
                onChange={(e) => setFormConversions(e.target.value)}
                min="0"
              />
            </div>
            
            <div>
              <Label htmlFor="content-revenue">Revenue ($)</Label>
              <Input
                id="content-revenue"
                type="number"
                placeholder="0"
                value={formRevenue}
                onChange={(e) => setFormRevenue(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>
          </div>
          
          <DialogFooter className="flex justify-between">
            <Button variant="outline" onClick={resetForm}>
              Reset
            </Button>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setNewContentDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleFormSubmit}>
                {editingContent ? 'Update Content' : 'Add Content'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}