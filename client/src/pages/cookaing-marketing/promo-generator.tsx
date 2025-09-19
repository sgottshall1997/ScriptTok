import { Helmet } from 'react-helmet';
import PromoGeneratorUI from '@/cookaing-marketing/components/PromoGeneratorUI';

export default function PromoGeneratorPage() {
  return (
    <>
      <Helmet>
        <title>CookAIng Promo Generator - Spartan Format Content | CookAIng Marketing</title>
        <meta 
          name="description" 
          content="Generate professional promotional content for CookAIng using proven Spartan format. Create channel-specific content optimized for conversion across TikTok, Instagram, LinkedIn, email, and more."
        />
        <meta property="og:title" content="CookAIng Promo Generator - Spartan Format Content" />
        <meta property="og:description" content="Generate professional promotional content for CookAIng using proven Spartan format. Create channel-specific content optimized for conversion." />
        <meta property="og:type" content="website" />
      </Helmet>
      
      <div className="container mx-auto px-4 py-6" data-testid="promo-generator-page">
        <PromoGeneratorUI />
      </div>
    </>
  );
}