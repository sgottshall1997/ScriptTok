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
  BarChart3 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface SyncResult {
  success: boolean;
  message: string;
  syncedCount: number;
  unmatchedCount: number;
  unmatchedItems: Array<{
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
  }>;
}

interface SyncRatingsButtonProps {
  className?: string;
}

const SyncRatingsButton: React.FC<SyncRatingsButtonProps> = ({ className = '' }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);

  const handleSyncRatings = async () => {
    setIsLoading(true);
    
    try {
      console.log('🔄 Starting ratings sync to Google Sheet...');
      
      const response = await apiRequest('/api/sync-ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const result = response as SyncResult;
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
      <Card className="border-blue-200 bg-blue-50/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileSpreadsheet className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-blue-900">Sync Ratings to Google Sheet</h3>
                <p className="text-sm text-blue-700">
                  Updates rating columns for existing content in your Google Sheet
                </p>
              </div>
            </div>
            
            <Button
              onClick={handleSyncRatings}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
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
        <Card className={`border ${lastSyncResult.success ? 'border-green-200 bg-green-50/30' : 'border-red-200 bg-red-50/30'}`}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              {lastSyncResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              )}
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <h4 className={`font-medium ${lastSyncResult.success ? 'text-green-900' : 'text-red-900'}`}>
                    {lastSyncResult.success ? 'Sync Completed' : 'Sync Failed'}
                  </h4>
                  <Badge variant={lastSyncResult.success ? 'default' : 'destructive'}>
                    {lastSyncResult.success ? 'Success' : 'Failed'}
                  </Badge>
                </div>
                
                <p className={`text-sm ${lastSyncResult.success ? 'text-green-700' : 'text-red-700'}`}>
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
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <h4 className="font-medium text-yellow-900">Unmatched Items</h4>
                <Badge variant="secondary">{lastSyncResult.unmatchedItems.length}</Badge>
              </div>
              
              <p className="text-sm text-yellow-700">
                These items couldn't be matched in the Google Sheet and were not updated:
              </p>
              
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {lastSyncResult.unmatchedItems.slice(0, 5).map((item, index) => (
                  <div key={index} className="p-2 bg-white rounded border border-yellow-200">
                    <div className="text-xs font-medium text-gray-900 truncate">
                      {item.product}
                    </div>
                    <div className="text-xs text-gray-600">
                      {item.tone} • {item.template} • {item.reason}
                    </div>
                  </div>
                ))}
                
                {lastSyncResult.unmatchedItems.length > 5 && (
                  <div className="text-xs text-yellow-600 text-center py-1">
                    ... and {lastSyncResult.unmatchedItems.length - 5} more items
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