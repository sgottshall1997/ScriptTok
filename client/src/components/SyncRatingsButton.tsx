import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Cloud, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  FileSpreadsheet,
  BarChart3,
  Download,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface UnmatchedItem {
  product: string;
  timestamp: string;
  tone: string;
  template: string;
  script: string;
  ratings: {
    overall?: number;
    instagram?: number;
    tiktok?: number;
    youtube?: number;
    twitter?: number;
  };
  reason: string;
}

interface SyncResult {
  success: boolean;
  message: string;
  syncedCount: number;
  unmatchedCount: number;
  unmatchedItems: UnmatchedItem[];
  webhookStatus?: number;
  payload?: any;
}

interface SyncRatingsButtonProps {
  className?: string;
}

const SyncRatingsButton: React.FC<SyncRatingsButtonProps> = ({ className = '' }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);
  const [showUnmatchedDetails, setShowUnmatchedDetails] = useState(false);

  const exportUnmatchedItems = (unmatchedItems: UnmatchedItem[]) => {
    if (unmatchedItems.length === 0) {
      toast({
        title: "No Unmatched Items",
        description: "There are no unmatched items to export.",
        variant: "default"
      });
      return;
    }

    const csvContent = [
      // CSV Header
      'Product,Timestamp,Tone,Template,Script (Preview),Overall Rating,TikTok Rating,IG Rating,YT Rating,X Rating,Reason',
      // CSV Data
      ...unmatchedItems.map(item => [
        `"${item.product}"`,
        item.timestamp,
        item.tone,
        item.template,
        `"${item.script.substring(0, 50)}..."`,
        item.ratings.overall || '',
        item.ratings.tiktok || '',
        item.ratings.instagram || '',
        item.ratings.youtube || '',
        item.ratings.twitter || '',
        `"${item.reason}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `unmatched-ratings-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);

    toast({
      title: "Export Complete!",
      description: `Exported ${unmatchedItems.length} unmatched items to CSV.`,
      variant: "default"
    });
  };

  const handleSyncRatings = async () => {
    setIsLoading(true);
    
    try {
      console.log('🔄 Starting ratings sync to Google Sheet...');
      
      const response = await apiRequest('POST', '/api/sync-ratings', {});
      
      const result = await response.json() as SyncResult;
      setLastSyncResult(result);

      if (result.success) {
        toast({
          title: "Sync Successful!",
          description: `Successfully synced ${result.syncedCount} rated items to Google Sheet`,
          duration: 5000,
        });
        
        console.log('✅ Ratings sync completed successfully');
        console.log(`📊 Synced: ${result.syncedCount}, Unmatched: ${result.unmatchedCount}`);
        
        if (result.unmatchedCount > 0) {
          console.log('⚠️ Unmatched items:', result.unmatchedItems);
        }
      } else {
        toast({
          title: "Sync Failed",
          description: result.message || 'Failed to sync ratings to Google Sheet',
          variant: "destructive",
          duration: 7000,
        });
        
        console.error('❌ Ratings sync failed:', result.message);
      }

    } catch (error: any) {
      console.error('❌ Error syncing ratings:', error);
      
      const errorMessage = error.message || 'An unexpected error occurred during sync';
      
      toast({
        title: "Sync Error",
        description: errorMessage,
        variant: "destructive",
        duration: 7000,
      });

      setLastSyncResult({
        success: false,
        message: errorMessage,
        syncedCount: 0,
        unmatchedCount: 0,
        unmatchedItems: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Sync Button */}
      <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-900/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <FileSpreadsheet className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-medium text-blue-900 dark:text-blue-100">Sync Ratings to Google Sheet</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Updates rating columns for existing content in your Google Sheet
                </p>
              </div>
            </div>
            
            <Button
              onClick={handleSyncRatings}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white"
              size="sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <Cloud className="h-4 w-4 mr-2" />
                  Sync Ratings
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sync Results Display */}
      {lastSyncResult && (
        <Card className={`border ${lastSyncResult.success ? 'border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-900/20' : 'border-red-200 dark:border-red-800 bg-red-50/30 dark:bg-red-900/20'}`}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              {lastSyncResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
              )}
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <h4 className={`font-medium ${lastSyncResult.success ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'}`}>
                    {lastSyncResult.success ? 'Sync Completed' : 'Sync Failed'}
                  </h4>
                  <Badge variant={lastSyncResult.success ? 'default' : 'destructive'}>
                    {lastSyncResult.success ? 'Success' : 'Failed'}
                  </Badge>
                </div>
                
                <p className={`text-sm ${lastSyncResult.success ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                  {lastSyncResult.message}
                </p>
                
                {lastSyncResult.success && lastSyncResult.syncedCount > 0 && (
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1">
                      <BarChart3 className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-700">
                        {lastSyncResult.syncedCount} items synced
                      </span>
                    </div>
                    
                    {lastSyncResult.unmatchedCount > 0 && (
                      <div className="flex items-center gap-1">
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm text-yellow-700">
                          {lastSyncResult.unmatchedCount} unmatched
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Unmatched Items Details (if any) */}
      {lastSyncResult && lastSyncResult.unmatchedItems && lastSyncResult.unmatchedItems.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50/30">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <h4 className="font-medium text-yellow-900">Unmatched Items</h4>
                  <Badge variant="secondary">{lastSyncResult.unmatchedItems.length}</Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowUnmatchedDetails(!showUnmatchedDetails)}
                    className="text-xs"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    {showUnmatchedDetails ? 'Hide' : 'View'} All
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => exportUnmatchedItems(lastSyncResult.unmatchedItems)}
                    className="text-xs"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Export CSV
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-yellow-700">
                  These items couldn't be matched in the Google Sheet and were <strong>skipped</strong> (UPDATE-ONLY mode):
                </p>
                <div className="text-xs bg-yellow-100 p-2 rounded border border-yellow-300">
                  <strong>Sync Behavior:</strong> Only updates existing rows. Unmatched content is logged but not added to prevent duplicates.
                </div>
              </div>
              
              <div className={`space-y-2 overflow-y-auto ${showUnmatchedDetails ? 'max-h-60' : 'max-h-40'}`}>
                {(showUnmatchedDetails ? lastSyncResult.unmatchedItems : lastSyncResult.unmatchedItems.slice(0, 3)).map((item, index) => (
                  <div key={index} className="p-3 bg-white rounded border border-yellow-200">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {item.product}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {item.tone} • {item.template} • {new Date(item.timestamp).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-yellow-700 mt-1">
                      <strong>Reason:</strong> {item.reason}
                    </div>
                    {showUnmatchedDetails && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {item.ratings.overall && <Badge variant="outline" className="text-xs">Overall: {item.ratings.overall}</Badge>}
                        {item.ratings.tiktok && <Badge variant="outline" className="text-xs">TikTok: {item.ratings.tiktok}</Badge>}
                        {item.ratings.instagram && <Badge variant="outline" className="text-xs">IG: {item.ratings.instagram}</Badge>}
                        {item.ratings.youtube && <Badge variant="outline" className="text-xs">YT: {item.ratings.youtube}</Badge>}
                        {item.ratings.twitter && <Badge variant="outline" className="text-xs">X: {item.ratings.twitter}</Badge>}
                      </div>
                    )}
                  </div>
                ))}
                
                {!showUnmatchedDetails && lastSyncResult.unmatchedItems.length > 3 && (
                  <div className="text-xs text-yellow-600 text-center py-1">
                    ... and {lastSyncResult.unmatchedItems.length - 3} more items (click "View All" to see details)
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SyncRatingsButton;