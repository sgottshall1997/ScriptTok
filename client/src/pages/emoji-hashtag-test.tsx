import { useState } from 'react';
import AboutThisPage from '@/components/AboutThisPage';
import { Helmet } from 'react-helmet';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SmartEmojiHashtagSuggestions from '@/components/SmartEmojiHashtagSuggestions';
import { NICHES, TEMPLATE_TYPES } from '@shared/constants';

const EmojiHashtagTest = () => {
  const [niche, setNiche] = useState<string>('');
  const [templateType, setTemplateType] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('configuration');

  // Sample content for demonstration
  const sampleContent = {
    beauty: "Discover our new hydrating serum with hyaluronic acid and vitamin C. Perfect for dry winter skin, this lightweight formula absorbs quickly and provides all-day moisture. Clinically proven to reduce fine lines and improve skin texture in just 2 weeks. Made with clean, vegan ingredients. No parabens, sulfates, or artificial fragrances.",
    tech: "Just unboxed the latest smartphone with incredible camera capabilities. The 108MP main sensor captures stunning detail even in low light, while the ultrawide lens is perfect for landscape photography. Battery life is impressive - lasted a full day of heavy use. The new processor makes everything lightning fast. Gaming performance is top-notch too!",
    fashion: "Obsessed with this season's sustainable denim collection! These high-waisted jeans are made from recycled materials but still have that perfect vintage look. The relaxed fit is so comfortable for all-day wear, and they pair perfectly with crop tops or oversized sweaters. Available in three washes: classic blue, acid wash, and black.",
    fitness: "Completed my 30-day strength training challenge today! Started with barely managing 10 push-ups, now I'm doing 3 sets of a strong high push-ups and seeing real definition in my shoulders and arms. Mixing strength days with cardio has really helped with overall endurance. So much progress in just a month - consistency really is key!",
    food: "Made the most amazing homemade sourdough bread today! After 3 days of nurturing my starter, the loaf turned out with a perfect crispy crust and soft, airy interior. The tangy flavor pairs perfectly with the herb-infused olive oil for dipping. Next time I'll add some roasted garlic and rosemary to the dough for an extra flavor dimension.",
    travel: "Just spent an incredible week exploring hidden gems in Bali! Skipped the tourist crowds and discovered a secluded waterfall near Ubud - had it all to ourselves for hours. The local family-run warung nearby served the most authentic nasi goreng I've ever tasted. Rented a scooter to reach remote rice terraces at sunrise - worth waking up at 4am!",
    pet: "My rescue pup just graduated from basic training class! Six weeks ago he could barely sit, now he's mastering stay, come, and even some agility obstacles. The positive reinforcement method worked wonders for his confidence - he's like a different dog. So proud of how far he's come from his nervous shelter days to a well-behaved family member!"
  };

  const handleSelectSample = () => {
    if (niche in sampleContent) {
      setContent(sampleContent[niche as keyof typeof sampleContent]);
    }
  };

  const handleClearContent = () => {
    setContent('');
  };

  const isFormValid = !!niche && !!templateType && !!content;

  return (
    <div className="container py-8">
      <Helmet>
        <title>Emoji & Hashtag Test | GlowBot</title>
        <meta name="description" content="Test the smart emoji and hashtag recommendation engine in GlowBot" />
      </Helmet>

      <h1 className="text-3xl font-bold mb-6">Smart Emoji & Hashtag Test</h1>

      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="suggestions" disabled={!isFormValid}>View Suggestions</TabsTrigger>
        </TabsList>

        <TabsContent value="configuration">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Content Settings</CardTitle>
                <CardDescription>
                  Select niche and template type
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="niche">Content Niche</Label>
                  <Select
                    value={niche}
                    onValueChange={setNiche}
                  >
                    <SelectTrigger id="niche">
                      <SelectValue placeholder="Select Niche" />
                    </SelectTrigger>
                    <SelectContent>
                      {NICHES.map((n) => (
                        <SelectItem key={n} value={n}>
                          {n.charAt(0).toUpperCase() + n.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="templateType">Template Type</Label>
                  <Select
                    value={templateType}
                    onValueChange={setTemplateType}
                    disabled={!niche}
                  >
                    <SelectTrigger id="templateType">
                      <SelectValue placeholder="Select Template Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {TEMPLATE_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-between pt-4">
                  <Button 
                    variant="outline" 
                    onClick={handleSelectSample}
                    disabled={!niche}
                  >
                    Use Sample
                  </Button>
                  <Button
                    variant="default"
                    onClick={() => setActiveTab('suggestions')}
                    disabled={!isFormValid}
                  >
                    View Suggestions
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Content</CardTitle>
                <CardDescription>
                  Enter your content to get emoji and hashtag suggestions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Textarea
                    placeholder="Enter your content here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[200px]"
                  />
                  <div className="flex justify-end">
                    <Button 
                      variant="outline" 
                      onClick={handleClearContent}
                      className="mr-2"
                    >
                      Clear
                    </Button>
                    <Button
                      variant="default"
                      onClick={() => setActiveTab('suggestions')}
                      disabled={!isFormValid}
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="suggestions">
          <div className="grid grid-cols-1 gap-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-2xl font-bold">Smart Suggestions</h2>
                <p className="text-muted-foreground">
                  Niche: <span className="font-medium">{niche}</span> | 
                  Template: <span className="font-medium">{templateType.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</span>
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setActiveTab('configuration')}
              >
                Edit Content
              </Button>
            </div>
            
            <SmartEmojiHashtagSuggestions
              content={content}
              niche={niche}
              templateType={templateType}
            />
          </div>
        </TabsContent>
      </Tabs>

      <AboutThisPage 
        title="Emoji & Hashtag Test Laboratory"
        whatItDoes="Advanced testing environment for experimenting with AI-powered emoji and hashtag suggestions. Provides intelligent recommendations based on niche, content type, and platform optimization strategies. Perfect for testing content enhancement before publishing."
        setupRequirements={[
          "Select target niche from available options",
          "Choose template type for content optimization",
          "Input sample or actual content for testing",
          "Understanding of hashtag and emoji best practices"
        ]}
        usageInstructions={[
          "Configure niche and template type in the Configuration tab",
          "Enter your content or use sample content for testing",
          "Switch to Suggestions tab to view AI-generated recommendations",
          "Test different content variations to see suggestion changes",
          "Use results to optimize your actual content before publishing",
          "Experiment with different niches to understand optimization patterns"
        ]}
        relatedLinks={[
          {name: "Generate Content", path: "/"},
          {name: "Claude Generator", path: "/claude-generator"},
          {name: "Template Explorer", path: "/template-explorer"},
          {name: "How It Works", path: "/how-it-works"}
        ]}
        notes={[
          "AI suggestions adapt to your selected niche for maximum relevance",
          "Template type influences the style and format of suggestions",
          "Testing environment allows safe experimentation without affecting published content",
          "Results help optimize engagement through strategic emoji and hashtag placement",
          "Different content types may produce varying suggestion strategies"
        ]}
      />
    </div>
  );
};

export default EmojiHashtagTest;