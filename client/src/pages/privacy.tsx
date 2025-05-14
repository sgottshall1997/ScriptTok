import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PrivacyPolicyPage: React.FC = () => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-2 text-gray-800">Privacy Policy</h1>
      <p className="text-gray-600 mb-6">Last updated: {currentDate}</p>
      
      <Card className="mb-8">
        <CardContent className="p-6 prose prose-sm sm:prose-base max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">1. Introduction</h2>
            <p>
              Welcome to GlowBot AI. We respect your privacy and are committed to protecting your personal data. 
              This privacy policy will inform you about how we look after your personal data when you visit our website 
              and tell you about your privacy rights and how the law protects you.
            </p>
            <p>
              This privacy policy applies to all information collected through our website, as well as any related 
              services, sales, marketing, or events.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">2. The Data We Collect</h2>
            <p>
              We collect several different types of information for various purposes to provide and improve our 
              service to you.
            </p>
            <h3 className="text-lg font-medium mt-4 mb-2">Personal Data</h3>
            <p>While using our service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you. This may include:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>Email address</li>
              <li>First name and last name</li>
              <li>Usage data</li>
            </ul>
            
            <h3 className="text-lg font-medium mt-4 mb-2">Usage Data</h3>
            <p>
              We may also collect information on how the service is accessed and used. This usage data may include 
              information such as your computer's Internet Protocol address (e.g., IP address), browser type, browser 
              version, the pages of our service that you visit, the time and date of your visit, the time spent on those 
              pages, unique device identifiers, and other diagnostic data.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">3. How We Use Your Data</h2>
            <p>We use the collected data for various purposes:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>To provide and maintain our service</li>
              <li>To notify you about changes to our service</li>
              <li>To provide customer support</li>
              <li>To gather analysis or valuable information so that we can improve our service</li>
              <li>To monitor the usage of our service</li>
              <li>To detect, prevent and address technical issues</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">4. Retention of Data</h2>
            <p>
              We will retain your personal data only for as long as is necessary for the purposes set out in this 
              privacy policy. We will retain and use your personal data to the extent necessary to comply with our 
              legal obligations, resolve disputes, and enforce our legal agreements and policies.
            </p>
            <p>
              We will also retain usage data for internal analysis purposes. Usage data is generally retained for a 
              shorter period of time, except when this data is used to strengthen the security or to improve the 
              functionality of our service, or we are legally obligated to retain this data for longer time periods.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">5. Transfer of Data</h2>
            <p>
              Your information, including personal data, may be transferred to — and maintained on — computers located 
              outside of your state, province, country, or other governmental jurisdiction where the data protection 
              laws may differ from those of your jurisdiction.
            </p>
            <p>
              Your consent to this privacy policy followed by your submission of such information represents your 
              agreement to that transfer.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">6. Your Data Protection Rights</h2>
            <p>You have certain data protection rights. These include:</p>
            <ul className="list-disc pl-6 mb-4">
              <li>The right to access, update, or delete the information we have on you</li>
              <li>The right of rectification</li>
              <li>The right to object</li>
              <li>The right of restriction</li>
              <li>The right to data portability</li>
              <li>The right to withdraw consent</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">7. Service Providers</h2>
            <p>
              We may employ third-party companies and individuals to facilitate our service ("Service Providers"), 
              provide the service on our behalf, perform service-related services, or assist us in analyzing how our 
              service is used.
            </p>
            <p>
              These third parties have access to your personal data only to perform these tasks on our behalf and are 
              obligated not to disclose or use it for any other purpose.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">8. Changes to This Privacy Policy</h2>
            <p>
              We may update our privacy policy from time to time. We will notify you of any changes by posting the 
              new privacy policy on this page.
            </p>
            <p>
              We will let you know via email and/or a prominent notice on our service, prior to the change becoming 
              effective and update the "Last updated" date at the top of this privacy policy.
            </p>
            <p>
              You are advised to review this privacy policy periodically for any changes. Changes to this privacy policy 
              are effective when they are posted on this page.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">9. Contact Us</h2>
            <p>
              If you have any questions about this privacy policy, please contact us by email at: 
              <a href="mailto:privacy@glowbotai.com" className="text-blue-600 hover:text-blue-800"> privacy@glowbotai.com</a>
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrivacyPolicyPage;