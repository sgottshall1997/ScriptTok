import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Star, TrendingUp, ThumbsUp, Target, Award } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface ContentRatingProps {
  contentHistoryId: number;
  userId?: number;
  isExpanded?: boolean;
  onToggle?: () => void;
}

interface Rating {
  id?: number;
  contentHistoryId: number;
  userId?: number;
  overallRating?: number;
  captionRating?: number;
  notes?: string;
}

export function ContentRating({ contentHistoryId, userId, isExpanded = false, onToggle }: ContentRatingProps) {
  // Validate contentHistoryId
  if (!contentHistoryId || isNaN(contentHistoryId)) {
    console.warn('ContentRating: Invalid contentHistoryId:', contentHistoryId);
    return (
      <div className="flex items-center gap-2 p-2 border rounded-lg bg-gray-50">
        <span className="text-sm text-gray-500">Rating unavailable - invalid content ID</span>
      </div>
    );
  }

  const [ratings, setRatings] = useState<Rating>({
    contentHistoryId,
    userId,
    overallRating: undefined,
    captionRating: undefined,
    notes: '',
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch existing rating
  const { data: existingRating } = useQuery({
    queryKey: ['content-rating', contentHistoryId, userId],
    queryFn: async () => {
      const params = userId ? `?userId=${userId}` : '';
      const response = await fetch(`/api/rating/${contentHistoryId}${params}`);
      const data = await response.json();
      return data.rating;
    },
    enabled: isExpanded,
  });

  // Update local state when existing rating is loaded
  useEffect(() => {
    if (existingRating) {
      setRatings({
        contentHistoryId,
        userId,
        overallRating: existingRating.overallRating || undefined,
        captionRating: existingRating.captionRating || undefined,
        notes: existingRating.notes || '',
      });
    }
  }, [existingRating, contentHistoryId, userId]);

  // Save rating mutation
  const saveRatingMutation = useMutation({
    mutationFn: async (ratingData: Rating) => {
      const response = await fetch('/api/rating/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ratingData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save rating');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Rating Saved",
        description: "Your content rating has been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['content-rating', contentHistoryId, userId] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save rating. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleRatingChange = (field: keyof Rating, value: number | string) => {
    setRatings(prev => ({
      ...prev,
      [field]: value === '' ? undefined : value,
    }));
  };

  const handleSave = () => {
    // Validate contentHistoryId before saving
    if (!contentHistoryId || isNaN(contentHistoryId)) {
      toast({
        title: "Error",
        description: "Cannot save rating - invalid content ID",
        variant: "destructive",
      });
      return;
    }

    // Filter out undefined values for API call
    const filteredRatings = Object.fromEntries(
      Object.entries(ratings).filter(([_, value]) => value !== undefined && value !== '')
    );
    
    // Ensure contentHistoryId is included and valid
    const validatedRatings = {
      ...filteredRatings,
      contentHistoryId: contentHistoryId,
    };
    
    saveRatingMutation.mutate(validatedRatings as Rating);
  };

  const getRatingBadge = (rating?: number) => {
    if (!rating) return null;
    
    if (rating >= 90) return <Badge className="bg-green-500">Excellent</Badge>;
    if (rating >= 80) return <Badge className="bg-blue-500">Great</Badge>;
    if (rating >= 70) return <Badge className="bg-yellow-500">Good</Badge>;
    if (rating >= 60) return <Badge className="bg-orange-500">Fair</Badge>;
    return <Badge className="bg-red-500">Needs Work</Badge>;
  };

  const getAverageRating = () => {
    const ratingValues = [
      ratings.overallRating,
      ratings.captionRating,
    ].filter(r => r !== undefined) as number[];
    
    if (ratingValues.length === 0) return undefined;
    return Math.round(ratingValues.reduce((sum, r) => sum + r, 0) / ratingValues.length);
  };

  const averageRating = getAverageRating();

  if (!isExpanded) {
    return (
      <div className="flex items-center gap-2 p-2 border rounded-lg bg-gray-50">
        <Star className="w-4 h-4 text-yellow-500" />
        <span className="text-sm font-medium">Rate Content</span>
        {averageRating && (
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-blue-600">{averageRating}</span>
            {getRatingBadge(averageRating)}
          </div>
        )}
        <Button size="sm" variant="outline" onClick={onToggle}>
          {existingRating ? 'Edit Rating' : 'Add Rating'}
        </Button>
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Star className="w-5 h-5 text-yellow-500" />
            Content Quality Rating
          </CardTitle>
          <Button size="sm" variant="ghost" onClick={onToggle}>
            ✕
          </Button>
        </div>
        {averageRating && (
          <div className="flex items-center gap-3">
            <div className="text-2xl font-bold text-blue-600">{averageRating}/100</div>
            {getRatingBadge(averageRating)}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Overall Rating */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Award className="w-4 h-4" />
            Overall Content Quality
          </Label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleRatingChange('overallRating', star)} // Store 1-5 directly
                className={`text-2xl transition-colors ${
                  (ratings.overallRating || 0) >= star 
                    ? 'text-yellow-400 hover:text-yellow-500' 
                    : 'text-gray-300 hover:text-yellow-300'
                }`}
              >
                ★
              </button>
            ))}
            <span className="ml-2 text-sm text-gray-600">
              {ratings.overallRating ? `${ratings.overallRating}/5 stars` : 'Not rated'}
            </span>
          </div>
        </div>

        {/* Caption Rating */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Caption Quality
          </Label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleRatingChange('captionRating', star)} // Store 1-5 directly
                className={`text-2xl transition-colors ${
                  (ratings.captionRating || 0) >= star 
                    ? 'text-blue-400 hover:text-blue-500' 
                    : 'text-gray-300 hover:text-blue-300'
                }`}
              >
                ★
              </button>
            ))}
            <span className="ml-2 text-sm text-gray-600">
              {ratings.captionRating ? `${ratings.captionRating}/5 stars` : 'Not rated'}
            </span>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label>Notes (Optional)</Label>
          <Textarea
            placeholder="What worked well? What could be improved? Any specific feedback..."
            value={ratings.notes || ''}
            onChange={(e) => handleRatingChange('notes', e.target.value)}
            rows={3}
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button 
            onClick={handleSave}
            disabled={saveRatingMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {saveRatingMutation.isPending ? 'Saving...' : 'Save Rating'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Smart Learning Toggle Component
interface SmartLearningToggleProps {
  userId: number;
}

export function SmartLearningToggle({ userId }: SmartLearningToggleProps) {
  const [useSmartLearning, setUseSmartLearning] = useState(true);
  const { toast } = useToast();

  // Fetch user preferences
  const { data: preferences } = useQuery({
    queryKey: ['user-preferences', userId],
    queryFn: async () => {
      const response = await fetch(`/api/rating/preferences/${userId}`);
      const data = await response.json();
      return data.preferences;
    },
  });

  useEffect(() => {
    if (preferences) {
      setUseSmartLearning(preferences.useSmartLearning);
    }
  }, [preferences]);

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: async (newPrefs: { useSmartLearning: boolean }) => {
      const response = await fetch(`/api/rating/preferences/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPrefs),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update preferences');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Settings Updated",
        description: `Smart learning ${useSmartLearning ? 'enabled' : 'disabled'} successfully.`,
      });
    },
  });

  const handleToggle = (checked: boolean) => {
    setUseSmartLearning(checked);
    updatePreferencesMutation.mutate({ useSmartLearning: checked });
  };

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <Label className="text-base font-medium">Use my best-rated style</Label>
            </div>
            <p className="text-sm text-gray-600">
              Automatically apply patterns from your highest-rated content to new generations
            </p>
          </div>
          <Switch
            checked={useSmartLearning}
            onCheckedChange={handleToggle}
            disabled={updatePreferencesMutation.isPending}
          />
        </div>
      </CardContent>
    </Card>
  );
}