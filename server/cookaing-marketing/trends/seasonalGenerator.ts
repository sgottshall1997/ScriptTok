import { SeasonalEvent, SeasonalGeneratorConfig } from './types.js';
import { storage } from '../../storage.js';

export class SeasonalGeneratorService {
  private config: SeasonalGeneratorConfig;
  private seasonalEvents: SeasonalEvent[];

  constructor() {
    this.config = {
      enabled: false, // Start disabled until toggled in UI
      leadTimeDays: 30,
      holidays: ['thanksgiving', 'christmas', 'new_year', 'valentine', 'easter', 'memorial_day', 'july_4th', 'labor_day', 'halloween'],
      autoPublish: false
    };

    this.seasonalEvents = this.initializeSeasonalEvents();
  }

  private initializeSeasonalEvents(): SeasonalEvent[] {
    const currentYear = new Date().getFullYear();
    
    return [
      {
        name: 'Thanksgiving Prep',
        date: new Date(currentYear, 10, 23), // November 23rd (4th Thursday)
        leadTimeDays: 30,
        category: 'holiday_cooking',
        keywords: ['thanksgiving recipes', 'turkey prep', 'side dishes', 'cranberry sauce', 'pumpkin pie'],
        templates: {
          blog: 'thanksgiving_prep',
          social: 'thanksgiving_countdown'
        }
      },
      {
        name: 'Christmas Holiday Cooking',
        date: new Date(currentYear, 11, 25), // December 25th
        leadTimeDays: 45,
        category: 'holiday_cooking',
        keywords: ['christmas cookies', 'holiday dinner', 'festive recipes', 'christmas breakfast', 'holiday desserts'],
        templates: {
          blog: 'christmas_cooking',
          social: 'holiday_recipe_series'
        }
      },
      {
        name: 'New Year Healthy Start',
        date: new Date(currentYear + 1, 0, 1), // January 1st next year
        leadTimeDays: 14,
        category: 'healthy_eating',
        keywords: ['healthy meal prep', 'detox recipes', 'new year nutrition', 'healthy breakfast', 'clean eating'],
        templates: {
          blog: 'new_year_health',
          social: 'healthy_new_year'
        }
      },
      {
        name: 'Valentine\'s Day Romantic Cooking',
        date: new Date(currentYear + 1, 1, 14), // February 14th next year
        leadTimeDays: 21,
        category: 'romantic_cooking',
        keywords: ['romantic dinner', 'date night recipes', 'valentine desserts', 'aphrodisiac foods', 'couple cooking'],
        templates: {
          blog: 'romantic_cooking',
          social: 'valentine_recipes'
        }
      },
      {
        name: 'Summer BBQ Season',
        date: new Date(currentYear + 1, 4, 30), // May 30th (Memorial Day weekend)
        leadTimeDays: 30,
        category: 'grilling_bbq',
        keywords: ['bbq recipes', 'grilling tips', 'summer salads', 'outdoor cooking', 'barbecue sides'],
        templates: {
          blog: 'summer_bbq_guide',
          social: 'bbq_season_prep'
        }
      },
      {
        name: 'July 4th Patriotic Feast',
        date: new Date(currentYear + 1, 6, 4), // July 4th
        leadTimeDays: 21,
        category: 'patriotic_cooking',
        keywords: ['patriotic desserts', 'red white blue recipes', 'july 4th bbq', 'american classics', 'picnic food'],
        templates: {
          blog: 'patriotic_recipes',
          social: 'july_4th_cooking'
        }
      },
      {
        name: 'Back to School Meal Prep',
        date: new Date(currentYear + 1, 7, 15), // August 15th
        leadTimeDays: 21,
        category: 'family_cooking',
        keywords: ['school lunch ideas', 'quick breakfast', 'after school snacks', 'family meal prep', 'kid friendly meals'],
        templates: {
          blog: 'back_to_school_meals',
          social: 'school_lunch_prep'
        }
      },
      {
        name: 'Halloween Treats',
        date: new Date(currentYear + 1, 9, 31), // October 31st
        leadTimeDays: 30,
        category: 'seasonal_treats',
        keywords: ['halloween cookies', 'spooky treats', 'pumpkin recipes', 'fall flavors', 'kids halloween food'],
        templates: {
          blog: 'halloween_treats',
          social: 'spooky_cooking'
        }
      }
    ];
  }

  async generateSeasonalContent(): Promise<void> {
    if (!this.config.enabled) {
      console.log('🎃 Seasonal Generator: Skipped (disabled)');
      return;
    }

    console.log('🎃 Seasonal Generator: Checking for upcoming holidays...');

    try {
      const upcomingEvents = this.getUpcomingEvents();
      
      if (upcomingEvents.length === 0) {
        console.log('🎃 No upcoming seasonal events within lead time');
        return;
      }

      for (const event of upcomingEvents) {
        await this.createSeasonalCampaign(event);
      }

      console.log(`✅ Seasonal Generator: Created campaigns for ${upcomingEvents.length} events`);
    } catch (error) {
      console.error('❌ Seasonal Generator error:', error);
    }
  }

  private getUpcomingEvents(): SeasonalEvent[] {
    const now = new Date();
    const leadTimeMs = this.config.leadTimeDays * 24 * 60 * 60 * 1000;

    return this.seasonalEvents.filter(event => {
      const timeDiff = event.date.getTime() - now.getTime();
      const isWithinLeadTime = timeDiff > 0 && timeDiff <= leadTimeMs;
      const isEnabledHoliday = this.config.holidays.includes(event.name.toLowerCase().replace(/\s+/g, '_'));
      
      return isWithinLeadTime && isEnabledHoliday;
    });
  }

  private async createSeasonalCampaign(event: SeasonalEvent) {
    const daysUntil = Math.ceil((event.date.getTime() - new Date().getTime()) / (24 * 60 * 60 * 1000));
    const campaignName = `${event.name} - ${daysUntil} Days Until`;
    
    console.log(`🎃 Creating seasonal campaign: ${campaignName}`);

    try {
      // For now, create content generations instead of campaigns since those methods exist
      const blogContent = this.generateSeasonalBlogContent(event);
      const socialContents = this.generateSeasonalSocialContent(event);

      // Create blog content generation
      await storage.createContentGeneration({
        niche: event.category,
        selectedProduct: `Seasonal: ${event.name}`,
        template: event.templates.blog || 'general',
        aiModel: 'claude-3-haiku',
        content: blogContent,
        platformCaptions: socialContents,
        metadata: {
          source: 'seasonal_generator',
          event_name: event.name,
          event_date: event.date.toISOString(),
          days_until: daysUntil,
          keywords: event.keywords
        }
      });

      console.log(`✅ Created seasonal content for ${event.name}`);
      
    } catch (error) {
      console.error(`❌ Failed to create seasonal campaign for ${event.name}:`, error);
    }
  }

  private generateSeasonalBlogContent(event: SeasonalEvent): string {
    const daysUntil = Math.ceil((event.date.getTime() - new Date().getTime()) / (24 * 60 * 60 * 1000));
    
    return `# ${event.name}: Your Complete Guide to Seasonal Cooking

With just ${daysUntil} days until ${event.name.toLowerCase()}, it's time to start planning your seasonal menu! This comprehensive guide will help you create memorable meals that capture the essence of the season.

## Planning Your ${event.name} Menu

The key to successful seasonal cooking is preparation. Here's your timeline for the perfect ${event.name.toLowerCase()} experience:

### ${Math.ceil(daysUntil / 2)} Days Before
- Plan your menu and create shopping lists
- Prepare make-ahead items and freezer-friendly dishes
- Organize your kitchen and cooking tools

### 2-3 Days Before  
- Shop for non-perishable ingredients
- Prep vegetables and marinades
- Make desserts that improve with time

### Day Before
- Final shopping for fresh ingredients
- Complete all prep work
- Set up your cooking station

## Featured Recipes for ${event.name}

${event.keywords.map(keyword => `
### ${keyword.charAt(0).toUpperCase() + keyword.slice(1)} Ideas
Perfect for capturing the seasonal spirit with flavors that everyone will love. These recipes balance tradition with modern convenience.
`).join('')}

## Pro Tips for ${event.name} Success

**Timing is Everything**
- Start with dishes that need the longest cooking time
- Use slow cookers and instant pots to maximize efficiency  
- Prep ingredients the night before to reduce day-of stress

**Flavor Development**
- Season early and often throughout the cooking process
- Layer flavors with aromatics, herbs, and spices
- Don't forget to taste and adjust as you go

**Presentation Matters**
- Use seasonal colors and garnishes
- Serve in warming dishes to keep food at proper temperature
- Create a beautiful tablescape that complements your menu

## Make-Ahead Strategy

Many ${event.name.toLowerCase()} dishes actually taste better when made ahead:

- Soups and stews develop deeper flavors overnight
- Desserts often benefit from chilling time
- Marinades work their magic with extra time
- Prep work done in advance reduces stress

## Creating New Traditions

${event.name} is the perfect time to start new family traditions:

- Involve kids in age-appropriate cooking tasks
- Try one new recipe alongside favorite classics
- Document your cooking process with photos
- Share recipes with friends and family

## Shopping and Storage Tips

**Smart Shopping**
- Buy non-perishables early to spread out costs
- Check store sales and plan around seasonal ingredients
- Don't forget ice if you're cooking for a crowd

**Proper Storage**
- Keep cold foods cold and hot foods hot
- Use food thermometers to ensure safety
- Label leftovers with dates for food safety

Ready to make this ${event.name.toLowerCase()} unforgettable? Start with our planning checklist and work your way through these tried-and-true recipes. Your family and friends will be talking about this meal all year long!

---

*What are your favorite ${event.name.toLowerCase()} traditions? Share your go-to recipes and tips in the comments below!*`;
  }

  private generateSeasonalSocialContent(event: SeasonalEvent): Record<string, string> {
    const daysUntil = Math.ceil((event.date.getTime() - new Date().getTime()) / (24 * 60 * 60 * 1000));
    const mainKeyword = event.keywords[0];
    
    return {
      instagram: `${event.name} is just ${daysUntil} days away! 🍂✨

Time to start planning your seasonal menu. Here's what should be on your prep list:

📝 Plan your menu this week
🛒 Shop for non-perishables  
🥘 Prep make-ahead dishes
👨‍🍳 Organize your cooking timeline

What's your must-have dish for ${event.name.toLowerCase()}? Drop it in the comments! 👇

#${mainKeyword.replace(/\s+/g, '')} #SeasonalCooking #HolidayPrep #MealPlanning #${event.category.replace(/\s+/g, '')}`,

      twitter: `⏰ ${daysUntil} days until ${event.name}! 

Start prepping now:
• Plan your menu
• Prep make-ahead dishes  
• Organize shopping lists
• Set up your timeline

What's your secret to stress-free seasonal cooking? #${mainKeyword.replace(/\s+/g, '')} #SeasonalPrep`,

      facebook: `🍽️ ${event.name} Planning Made Easy!

With ${daysUntil} days to go, here's your stress-free approach to seasonal cooking:

Week Before: Menu planning and non-perishable shopping
3 Days Before: Fresh ingredient shopping and prep
Day Before: Final preparations and setup
Day Of: Enjoy the process and your guests!

The secret to amazing seasonal meals? Start early and prep smart. What's your favorite ${event.name.toLowerCase()} tradition?`,

      tiktok: `POV: ${event.name} is in ${daysUntil} days and you're actually prepared this time 🤯

Your seasonal cooking timeline:
✅ Menu planned  
✅ Shopping done
✅ Prep work finished
✅ Ready to impress

Follow for more seasonal cooking hacks! 

#${mainKeyword.replace(/\s+/g, '')} #SeasonalCooking #MealPrep #HolidayPrep #KitchenHacks`
    };
  }

  // Configuration methods
  updateConfig(newConfig: Partial<SeasonalGeneratorConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('🔧 Seasonal Generator config updated:', this.config);
  }

  getConfig(): SeasonalGeneratorConfig {
    return { ...this.config };
  }

  enable(): void {
    this.config.enabled = true;
    console.log('✅ Seasonal Generator enabled');
  }

  disable(): void {
    this.config.enabled = false;
    console.log('🚫 Seasonal Generator disabled');
  }

  getUpcomingEventsPreview(): Array<{name: string, date: string, daysUntil: number}> {
    const now = new Date();
    return this.seasonalEvents
      .filter(event => event.date.getTime() > now.getTime())
      .map(event => ({
        name: event.name,
        date: event.date.toLocaleDateString(),
        daysUntil: Math.ceil((event.date.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
      }))
      .slice(0, 5); // Show next 5 upcoming events
  }
}

export const seasonalGeneratorService = new SeasonalGeneratorService();