import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TermsPage: React.FC = () => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-2 text-gray-800">Terms and Conditions</h1>
      <p className="text-gray-600 mb-6">Last updated: {currentDate}</p>
      
      <Card className="mb-8">
        <CardContent className="p-6 prose prose-sm sm:prose-base max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">1. Introduction</h2>
            <p>
              Welcome to GlowBot AI. These Terms and Conditions govern your use of our website and the services 
              offered by us.
            </p>
            <p>
              By accessing our website or using our services, you acknowledge that you have read, understood, and 
              agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, 
              you must not use our website or services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">2. Use of Our Services</h2>
            <p>When using our services, you agree to:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Provide accurate information when required</li>
              <li>Use the service only for lawful purposes and in accordance with these Terms</li>
              <li>Not to use the service in any way that could damage the service or impair its availability</li>
              <li>Not to attempt to gain unauthorized access to any part of the service</li>
              <li>Not to use any automated systems or software to extract data from the website for commercial purposes ('scraping')</li>
              <li>Comply with all applicable affiliate marketing regulations including FTC disclosure requirements</li>
              <li>Use AI-generated content responsibly and in accordance with platform-specific guidelines</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">3. Intellectual Property</h2>
            <p>
              The content on our website, including but not limited to text, graphics, logos, icons, images, audio 
              clips, digital downloads, and software, is the property of GlowBot AI or its content suppliers and 
              is protected by international copyright laws.
            </p>
            <p>
              The compilation of all content on this site is the exclusive property of GlowBot AI and is protected 
              by international copyright laws.
            </p>
            <p>
              Our trademarks and trade dress may not be used in connection with any product or service without the 
              prior written consent of GlowBot AI.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">4. AI-Generated Content and User Responsibilities</h2>
            <p>
              Our platform utilizes advanced AI models including Claude AI for content generation. When you use our 
              AI-powered services, you acknowledge and agree that:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>AI-generated content is provided as a starting point and should be reviewed before publication</li>
              <li>You are responsible for ensuring all generated content complies with applicable laws and platform policies</li>
              <li>You must verify accuracy of product claims and pricing information before publication</li>
              <li>Our Claude AI suggestions system learns from high-rated content to improve recommendations</li>
              <li>Content evaluations are performed by dual AI systems for quality assessment</li>
            </ul>
            <p>
              When you submit, upload, or generate content through our service, you grant us a worldwide, 
              non-exclusive, royalty-free license to use, reproduce, modify, adapt, publish, translate, create 
              derivative works from, distribute, and display such content for service improvement purposes.
            </p>
            <p>
              You represent and warrant that you own or control all rights to any content you submit, and that 
              all content is accurate, not confidential, and not in violation of any contractual restrictions or 
              other parties' rights.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">5. Limitation of Liability</h2>
            <p>
              GlowBot AI shall not be liable for any direct, indirect, incidental, special, consequential, or 
              exemplary damages, including but not limited to, damages for loss of profits, goodwill, use, data, 
              or other intangible losses, resulting from:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>The use or the inability to use the service</li>
              <li>Any content obtained from the service</li>
              <li>Unauthorized access to or alteration of your transmissions or data</li>
              <li>Statements or conduct of any third party on the service</li>
              <li>Any other matter relating to the service</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">6. Disclaimers</h2>
            <p>
              Our service is provided on an "AS IS" and "AS AVAILABLE" basis. GlowBot AI expressly disclaims all 
              warranties of any kind, whether express or implied, including but not limited to the implied warranties 
              of merchantability, fitness for a particular purpose, and non-infringement.
            </p>
            <p>
              GlowBot AI makes no warranty that the service will meet your requirements, be available on an 
              uninterrupted, timely, secure, or error-free basis, or that the results that may be obtained from the 
              use of the service will be accurate or reliable.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">7. Affiliate Marketing and Compliance</h2>
            <p>
              Our platform is designed to assist with compliant affiliate marketing content creation. We automatically 
              include appropriate FTC and Amazon Associates disclosures in generated content. However, you remain solely 
              responsible for:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Ensuring all affiliate disclosures are properly displayed and conspicuous</li>
              <li>Complying with FTC guidelines and platform-specific affiliate marketing policies</li>
              <li>Maintaining current Amazon Associates Program compliance</li>
              <li>Verifying that product information and pricing is accurate at time of publication</li>
            </ul>
            <p>
              Our service may contain affiliate links to third-party websites or services. We have no control over, 
              and assume no responsibility for, the content, privacy policies, or practices of any third-party websites 
              or services. All affiliate relationships are clearly disclosed in accordance with FTC guidelines.
            </p>
            <p>
              You acknowledge and agree that GlowBot AI shall not be responsible or liable for any damage or loss 
              caused by or in connection with affiliate link usage, product purchases, or third-party services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">8. Termination</h2>
            <p>
              We may terminate or suspend your access to our service immediately, without prior notice or liability, 
              for any reason whatsoever, including, without limitation, if you breach the Terms.
            </p>
            <p>
              All provisions of the Terms which by their nature should survive termination shall survive termination, 
              including, without limitation, ownership provisions, warranty disclaimers, indemnity, and limitations 
              of liability.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">9. Changes to Terms</h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a 
              revision is material we will try to provide at least 30 days' notice prior to any new terms taking 
              effect.
            </p>
            <p>
              By continuing to access or use our service after those revisions become effective, you agree to be 
              bound by the revised terms. If you do not agree to the new terms, please stop using the service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">10. AI Model Usage and Data Processing</h2>
            <p>
              Our platform utilizes multiple AI models and services to provide content generation capabilities:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li><strong>Claude AI:</strong> Primary content generation and optimization suggestions</li>
              <li><strong>Perplexity API:</strong> Trend discovery and viral content inspiration</li>
              <li><strong>Dual AI Evaluation:</strong> Content quality assessment and performance tracking</li>
              <li><strong>Smart Style System:</strong> Personalized content optimization based on your highest-rated content</li>
            </ul>
            <p>
              All AI processing is performed in accordance with our Privacy Policy and respective AI service 
              provider terms. Content generated through our platform may be used to improve AI model performance 
              and suggestion accuracy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">11. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at{' '}
              <a href="mailto:terms@glowbotai.com" className="text-blue-600 hover:text-blue-800">terms@glowbotai.com</a>
            </p>
          </section>
        </CardContent>
      </Card>

    </div>
  );
};

export default TermsPage;