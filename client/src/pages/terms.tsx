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
            <h2 className="text-xl font-semibold mb-4">4. User-Generated Content</h2>
            <p>
              When you submit, upload, or otherwise make available any content through our service, you grant us 
              a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, adapt, publish, translate, 
              create derivative works from, distribute, and display such content.
            </p>
            <p>
              You represent and warrant that you own or control all rights to the content you submit, and that the 
              content is accurate, not confidential, and not in violation of any contractual restrictions or other 
              parties' rights.
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
            <h2 className="text-xl font-semibold mb-4">7. Affiliate Links and Third-Party Content</h2>
            <p>
              Our service may contain affiliate links to third-party websites or services that are not owned or 
              controlled by GlowBot AI. We have no control over, and assume no responsibility for, the content, 
              privacy policies, or practices of any third-party websites or services.
            </p>
            <p>
              You acknowledge and agree that GlowBot AI shall not be responsible or liable, directly or indirectly, 
              for any damage or loss caused or alleged to be caused by or in connection with the use of or reliance 
              on any such content, goods, or services available on or through any such websites or services.
            </p>
            <p>
              We strongly advise you to read the terms and conditions and privacy policies of any third-party 
              websites or services that you visit.
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

          <section>
            <h2 className="text-xl font-semibold mb-4">10. Contact Us</h2>
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