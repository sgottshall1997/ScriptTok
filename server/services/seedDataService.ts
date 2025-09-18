import { storage } from '../storage';
import { 
  InsertOrganization, 
  InsertContact, 
  InsertCampaign
} from '@shared/schema';

/**
 * Comprehensive seed data service for CookAIng Marketing Engine QA
 * Creates 50 contacts across organizations + 1 sample campaign
 * Note: Segments and Campaign Artifacts require storage interface implementation
 */
export async function initializeCookAIngSeedData() {
  try {
    console.log('🚀 Initializing CookAIng Marketing Engine seed data...');
    
    // Create organizations first
    const orgs = await createSampleOrganizations();
    
    // Create 50 contacts across organizations
    const contacts = await createSampleContacts(orgs);
    
    // Create sample campaign
    const campaign = await createSampleCampaign(orgs[0]);
    
    console.log('✅ CookAIng Marketing Engine seed data initialization complete!');
    console.log(`📊 Created: ${orgs.length} orgs, ${contacts.length} contacts, 1 campaign`);
    
    return {
      organizations: orgs,
      contacts: contacts,
      campaign: campaign
    };
  } catch (error) {
    console.error('❌ Error initializing CookAIng seed data:', error);
    throw error;
  }
}

/**
 * Creates sample organizations with different plans
 */
async function createSampleOrganizations() {
  console.log('🏢 Creating sample organizations...');
  
  const orgData: InsertOrganization[] = [
    { name: 'CookAIng Demo Kitchen', plan: 'enterprise' },
    { name: 'Gourmet Home Cooking', plan: 'pro' },
    { name: 'Quick Meal Solutions', plan: 'starter' }
  ];
  
  const orgs = [];
  for (const org of orgData) {
    const created = await storage.createOrganization(org);
    orgs.push(created);
  }
  
  return orgs;
}

// Note: Segments require storage.createSegment implementation
// For now, we'll use segment names in contact metadata

/**
 * Creates 50 diverse contacts across organizations with realistic data
 */
async function createSampleContacts(orgs: any[]) {
  console.log('👥 Creating 50 sample contacts across segments...');
  
  const contacts = [];
  const names = [
    'Sarah Johnson', 'Mike Chen', 'Emily Rodriguez', 'David Kim', 'Lisa Wang',
    'Alex Thompson', 'Maria Garcia', 'James Wilson', 'Anna Lee', 'Ryan Davis',
    'Jessica Taylor', 'Kevin Martinez', 'Rachel Brown', 'Daniel Lopez', 'Amy Wilson',
    'Chris Anderson', 'Nicole White', 'Matt Harris', 'Stephanie Clark', 'Jason Lewis',
    'Ashley Robinson', 'Brian Hall', 'Lauren Allen', 'Steve Young', 'Megan King',
    'Tyler Wright', 'Samantha Scott', 'Jordan Green', 'Hannah Adams', 'Nathan Baker',
    'Olivia Nelson', 'Connor Mitchell', 'Grace Roberts', 'Brandon Turner', 'Chloe Phillips',
    'Lucas Campbell', 'Madison Parker', 'Ethan Evans', 'Zoe Edwards', 'Caleb Collins',
    'Abigail Stewart', 'Isaiah Sanchez', 'Sophia Morris', 'Gabriel Rogers', 'Emma Reed',
    'Mason Cook', 'Isabella Bailey', 'William Howard', 'Ava Ward', 'Alexander Torres'
  ];
  
  // Define realistic pantry items and preferences
  const pantryItems = [
    ['olive oil', 'garlic', 'onions', 'pasta', 'canned tomatoes'],
    ['chicken breast', 'broccoli', 'rice', 'soy sauce', 'ginger'],
    ['ground beef', 'potatoes', 'cheese', 'milk', 'eggs'],
    ['salmon', 'quinoa', 'spinach', 'lemon', 'herbs'],
    ['tofu', 'bell peppers', 'coconut milk', 'curry powder', 'chickpeas']
  ];
  
  const preferences = [
    { dietType: 'omnivore', spiceLevel: 'medium', cookingTime: 30 },
    { dietType: 'vegetarian', spiceLevel: 'mild', cookingTime: 45 },
    { dietType: 'vegan', spiceLevel: 'hot', cookingTime: 60 },
    { dietType: 'keto', spiceLevel: 'medium', cookingTime: 20 },
    { dietType: 'paleo', spiceLevel: 'mild', cookingTime: 40 }
  ];
  
  // Create 50 contacts distributed across organizations
  for (let i = 0; i < 50; i++) {
    const org = orgs[i % orgs.length];
    
    // Simulate segment assignment with metadata (until segments are implemented)
    const segmentTypes = ['Weekly Meal Planners', 'Quick Recipe Seekers', 'Health-Conscious Cooks', 'Family Recipe Masters'];
    const assignedSegments = [segmentTypes[i % segmentTypes.length]];
    
    const contact: InsertContact = {
      orgId: org.id,
      email: `${names[i].toLowerCase().replace(' ', '.')}@example.com`,
      name: names[i],
      segmentIds: [],
      prefsJson: { 
        ...preferences[i % preferences.length],
        segments: assignedSegments
      },
      pantryJson: { items: pantryItems[i % pantryItems.length] },
      // Add attribution tracking for some contacts
      ...(i % 4 === 0 && {
        firstTouchUtmSource: ['google', 'facebook', 'email', 'direct'][i % 4],
        firstTouchUtmMedium: ['cpc', 'social', 'email', 'organic'][i % 4],
        firstTouchUtmCampaign: `campaign_${Math.floor(i / 10) + 1}`,
        firstTouchAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
      })
    };
    
    const created = await storage.createContact(contact);
    contacts.push(created);
  }
  
  return contacts;
}

/**
 * Creates a sample campaign (artifacts require storage implementation)
 */
async function createSampleCampaign(org: any) {
  console.log('📧 Creating sample campaign...');
  
  // Create the main campaign
  const campaign = await storage.createCampaign({
    orgId: org.id,
    type: 'multi',
    name: 'Holiday Recipe Collection Launch',
    status: 'draft',
    scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    metaJson: {
      description: 'Multi-channel campaign promoting our new holiday recipe collection',
      targetSegments: ['Weekly Meal Planners', 'Family Recipe Masters'],
      abTestEnabled: true,
      expectedReach: 1000,
      // Store campaign artifacts in metadata until storage interface is implemented
      artifacts: {
        email: {
          variantA: {
            subject: '🎄 Your Holiday Recipe Collection is Here!',
            preheader: 'Discover 25 festive recipes that will make your holidays magical'
          },
          variantB: {
            subject: '25 Holiday Recipes to Impress Your Family',
            preheader: 'Make this holiday season unforgettable with these chef-approved recipes'
          }
        },
        social: {
          instagram: 'Holiday magic starts in the kitchen! Our new recipe collection features 25 festive dishes...',
          facebook: 'Ready to create holiday magic? Our brand new Holiday Recipe Collection is here!',
          twitter: 'NEW: Holiday Recipe Collection is live! 25 festive recipes...'
        },
        blog: {
          title: 'The Ultimate Holiday Recipe Collection: 25 Dishes to Make Your Celebrations Unforgettable',
          slug: 'ultimate-holiday-recipe-collection-2024'
        },
        push: {
          title: '🎄 Holiday Recipes Are Here!',
          body: '25 festive recipes to make your celebrations magical. Get cooking now!'
        }
      }
    }
  });
  
  return campaign;
}

// Campaign artifacts functionality moved to campaign metaJson until storage interface is implemented

/**
 * Quick function to check if seed data already exists
 */
export async function checkSeedDataExists(): Promise<boolean> {
  try {
    const orgs = await storage.getOrganizations();
    return orgs.some(org => org.name === 'CookAIng Demo Kitchen');
  } catch (error) {
    console.error('Error checking seed data:', error);
    return false;
  }
}

/**
 * Clean up seed data (for testing purposes)
 */
export async function cleanupSeedData(): Promise<void> {
  try {
    console.log('🧹 Cleaning up seed data...');
    // Note: Due to cascade deletes, removing organizations will clean up all related data
    const orgs = await storage.getOrganizations();
    const seedOrgs = orgs.filter(org => 
      ['CookAIng Demo Kitchen', 'Gourmet Home Cooking', 'Quick Meal Solutions'].includes(org.name)
    );
    
    for (const org of seedOrgs) {
      await storage.deleteOrganization(org.id);
    }
    
    console.log('✅ Seed data cleanup complete!');
  } catch (error) {
    console.error('❌ Error cleaning up seed data:', error);
    throw error;
  }
}