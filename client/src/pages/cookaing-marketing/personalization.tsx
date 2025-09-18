import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  PersonStanding, 
  ChefHat, 
  Settings, 
  Eye,
  Save,
  Clock,
  Users,
  Heart,
  Utensils,
  Calendar
} from "lucide-react";

interface PersonalizationRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  category: 'dietary' | 'skill' | 'time' | 'preference';
  trigger: string;
  action: string;
}

interface MealPrepPreset {
  id: string;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  timeCommitment: string;
  mealTypes: string[];
  dietaryFocus: string[];
  enabled: boolean;
}

// Mock data for personalization rules
const mockRules: PersonalizationRule[] = [
  {
    id: "1",
    name: "Vegetarian Recipe Focus",
    description: "Show more vegetarian recipes to users with vegetarian preference",
    enabled: true,
    category: "dietary",
    trigger: "User dietary preference = vegetarian",
    action: "Increase vegetarian recipe weight by 3x"
  },
  {
    id: "2",
    name: "Quick Meal Preference",
    description: "Prioritize 30-minute meals for busy users",
    enabled: true,
    category: "time",
    trigger: "User time preference = quick",
    action: "Show recipes ≤30 minutes prep time"
  },
  {
    id: "3",
    name: "Beginner-Friendly Content",
    description: "Simplify recipes for cooking beginners",
    enabled: false,
    category: "skill",
    trigger: "User skill level = beginner",
    action: "Filter to 5 ingredients or less"
  }
];

// Mock data for meal prep presets
const mockPresets: MealPrepPreset[] = [
  {
    id: "1",
    name: "Weekend Warrior",
    description: "Prep 5 meals in 2-3 hours on Sunday",
    difficulty: "intermediate",
    timeCommitment: "2-3 hours weekend",
    mealTypes: ["lunch", "dinner"],
    dietaryFocus: ["balanced", "protein-rich"],
    enabled: true
  },
  {
    id: "2",
    name: "Quick & Simple",
    description: "15-minute meals with minimal prep",
    difficulty: "beginner",
    timeCommitment: "15 minutes daily",
    mealTypes: ["breakfast", "lunch"],
    dietaryFocus: ["quick", "healthy"],
    enabled: true
  },
  {
    id: "3",
    name: "Advanced Batch Cooking",
    description: "Complex meal prep with advanced techniques",
    difficulty: "advanced",
    timeCommitment: "4-5 hours weekend",
    mealTypes: ["breakfast", "lunch", "dinner", "snacks"],
    dietaryFocus: ["gourmet", "varied"],
    enabled: false
  }
];

export default function PersonalizationPage() {
  const [activeTab, setActiveTab] = useState("rules");

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'dietary': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'skill': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'time': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'preference': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <PersonStanding className="h-8 w-8" />
            Personalization
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Customize user experiences with meal prep coaching and smart recommendations
          </p>
        </div>
        <Button data-testid="button-save-settings">
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Rules</p>
                <p className="text-2xl font-bold text-green-600">
                  {mockRules.filter(r => r.enabled).length}
                </p>
              </div>
              <Settings className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Meal Prep Presets</p>
                <p className="text-2xl font-bold text-blue-600">
                  {mockPresets.filter(p => p.enabled).length}
                </p>
              </div>
              <ChefHat className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Personalized Users</p>
                <p className="text-2xl font-bold text-purple-600">1,234</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Engagement Lift</p>
                <p className="text-2xl font-bold text-orange-600">+23%</p>
              </div>
              <Heart className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different personalization aspects */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="rules" data-testid="tab-rules">Personalization Rules</TabsTrigger>
          <TabsTrigger value="mealprep" data-testid="tab-mealprep">Meal Prep Coach</TabsTrigger>
          <TabsTrigger value="preview" data-testid="tab-preview">Preview Experience</TabsTrigger>
        </TabsList>

        {/* Personalization Rules Tab */}
        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personalization Rules</CardTitle>
              <CardDescription>
                Configure how content is customized based on user preferences and behavior
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockRules.map((rule) => (
                  <Card key={rule.id} data-testid={`card-rule-${rule.id}`} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{rule.name}</h3>
                            <Badge variant="outline" className={getCategoryColor(rule.category)}>
                              {rule.category.charAt(0).toUpperCase() + rule.category.slice(1)}
                            </Badge>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 mb-3">{rule.description}</p>
                          
                          <div className="grid gap-2 text-sm">
                            <div>
                              <strong className="text-gray-700 dark:text-gray-300">Trigger:</strong>{" "}
                              <span className="text-gray-600 dark:text-gray-400">{rule.trigger}</span>
                            </div>
                            <div>
                              <strong className="text-gray-700 dark:text-gray-300">Action:</strong>{" "}
                              <span className="text-gray-600 dark:text-gray-400">{rule.action}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          <Switch 
                            checked={rule.enabled} 
                            data-testid={`switch-rule-${rule.id}`}
                          />
                          <Button variant="outline" size="sm" data-testid={`button-edit-rule-${rule.id}`}>
                            <Settings className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Meal Prep Coach Tab */}
        <TabsContent value="mealprep" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Meal Prep Coach Presets</CardTitle>
              <CardDescription>
                Pre-configured meal prep programs to guide users through cooking workflows
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {mockPresets.map((preset) => (
                  <Card key={preset.id} data-testid={`card-preset-${preset.id}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{preset.name}</CardTitle>
                        <Switch 
                          checked={preset.enabled} 
                          data-testid={`switch-preset-${preset.id}`}
                        />
                      </div>
                      <CardDescription>{preset.description}</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={getDifficultyColor(preset.difficulty)}>
                            {preset.difficulty.charAt(0).toUpperCase() + preset.difficulty.slice(1)}
                          </Badge>
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <Clock className="h-3 w-3 mr-1" />
                            {preset.timeCommitment}
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Meal Types:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {preset.mealTypes.map((type) => (
                              <Badge key={type} variant="secondary" className="text-xs">
                                {type}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Dietary Focus:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {preset.dietaryFocus.map((focus) => (
                              <Badge key={focus} variant="secondary" className="text-xs">
                                {focus}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                          <Button variant="outline" size="sm" data-testid={`button-edit-preset-${preset.id}`}>
                            <Settings className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button variant="outline" size="sm" data-testid={`button-preview-preset-${preset.id}`}>
                            <Eye className="h-3 w-3 mr-1" />
                            Preview
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preview Experience Tab */}
        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Experience Preview</CardTitle>
              <CardDescription>
                See how personalization affects the user experience for different persona types
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600">
                  <CardContent className="p-6 text-center">
                    <Utensils className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Beginner Cook Preview
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      See how the experience adapts for cooking beginners
                    </p>
                    <Button variant="outline" data-testid="button-preview-beginner">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview Experience
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600">
                  <CardContent className="p-6 text-center">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Busy Professional Preview
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Experience optimized for time-conscious users
                    </p>
                    <Button variant="outline" data-testid="button-preview-professional">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview Experience
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600">
                  <CardContent className="p-6 text-center">
                    <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Health-Focused Preview
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Nutrition and wellness-oriented experience
                    </p>
                    <Button variant="outline" data-testid="button-preview-health">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview Experience
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600">
                  <CardContent className="p-6 text-center">
                    <ChefHat className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Advanced Cook Preview
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Complex recipes and advanced techniques
                    </p>
                    <Button variant="outline" data-testid="button-preview-advanced">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview Experience
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Help Text */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <PersonStanding className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100">
                Personalization Tips
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Start with simple rules based on clear user preferences. Test different approaches 
                with A/B tests to measure engagement improvements. The Meal Prep Coach helps users 
                build sustainable cooking habits through guided workflows.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}