import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle, User, Shield, FileCheck } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface UserVerificationSetupProps {
  onVerificationComplete?: (data: any) => void;
}

export const UserVerificationSetup: React.FC<UserVerificationSetupProps> = ({
  onVerificationComplete
}) => {
  const [formData, setFormData] = useState({
    email: '',
    websiteUrl: '',
    socialMediaHandles: [''],
    amazonAssociateId: '',
    businessName: '',
    taxId: '',
    phoneNumber: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States'
    },
    complianceAgreementAccepted: false,
    affiliatePrograms: ['amazon']
  });

  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSocialMediaChange = (index: number, value: string) => {
    const newHandles = [...formData.socialMediaHandles];
    newHandles[index] = value;
    setFormData(prev => ({ ...prev, socialMediaHandles: newHandles }));
  };

  const addSocialMediaHandle = () => {
    setFormData(prev => ({
      ...prev,
      socialMediaHandles: [...prev.socialMediaHandles, '']
    }));
  };

  const removeSocialMediaHandle = (index: number) => {
    const newHandles = formData.socialMediaHandles.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, socialMediaHandles: newHandles }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/compliance/user/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          socialMediaHandles: formData.socialMediaHandles.filter(handle => handle.trim() !== '')
        })
      });

      const data = await response.json();

      if (data.success) {
        setVerificationResult(data);
        if (data.eligibility.eligible) {
          toast({
            title: "Verification Successful",
            description: "Your account is eligible for Amazon Associates compliance.",
          });
          onVerificationComplete?.(data);
        } else {
          toast({
            title: "Verification Issues Found",
            description: "Please address the issues below to complete verification.",
            variant: "destructive",
          });
        }
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateProgress = () => {
    const requiredFields = [
      formData.email,
      formData.websiteUrl || formData.socialMediaHandles.some(h => h.trim()),
      formData.complianceAgreementAccepted
    ];
    const completed = requiredFields.filter(Boolean).length;
    return (completed / requiredFields.length) * 100;
  };

  const progress = calculateProgress();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Amazon Associates Verification Setup
          </CardTitle>
          <CardDescription>
            Complete your verification to ensure compliance with Amazon Associates Operating Agreement
          </CardDescription>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        </CardHeader>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Basic Information</CardTitle>
            <CardDescription>Required information for account verification</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="websiteUrl">Website URL</Label>
              <Input
                id="websiteUrl"
                type="url"
                value={formData.websiteUrl}
                onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
                placeholder="https://yourwebsite.com"
              />
            </div>

            <div>
              <Label>Social Media Handles</Label>
              {formData.socialMediaHandles.map((handle, index) => (
                <div key={index} className="flex gap-2 mt-2">
                  <Input
                    value={handle}
                    onChange={(e) => handleSocialMediaChange(index, e.target.value)}
                    placeholder="@yourusername or https://platform.com/profile"
                    className="flex-1"
                  />
                  {formData.socialMediaHandles.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => removeSocialMediaHandle(index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addSocialMediaHandle}
                className="mt-2"
              >
                Add Social Media Handle
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Affiliate Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Affiliate Information</CardTitle>
            <CardDescription>Your Amazon Associates details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="amazonAssociateId">Amazon Associate ID</Label>
              <Input
                id="amazonAssociateId"
                value={formData.amazonAssociateId}
                onChange={(e) => handleInputChange('amazonAssociateId', e.target.value)}
                placeholder="yourname-20"
              />
              <p className="text-xs text-gray-500 mt-1">
                Format: yourname-20 (for US accounts)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Business Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Business Information</CardTitle>
            <CardDescription>Optional but recommended for tax compliance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                value={formData.businessName}
                onChange={(e) => handleInputChange('businessName', e.target.value)}
                placeholder="Your Business LLC"
              />
            </div>

            <div>
              <Label htmlFor="taxId">Tax ID / EIN</Label>
              <Input
                id="taxId"
                value={formData.taxId}
                onChange={(e) => handleInputChange('taxId', e.target.value)}
                placeholder="XX-XXXXXXX"
              />
            </div>

            <div>
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Address Information</CardTitle>
            <CardDescription>Required for international compliance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="street">Street Address</Label>
              <Input
                id="street"
                value={formData.address.street}
                onChange={(e) => handleInputChange('address.street', e.target.value)}
                placeholder="123 Main Street"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.address.city}
                  onChange={(e) => handleInputChange('address.city', e.target.value)}
                  placeholder="New York"
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.address.state}
                  onChange={(e) => handleInputChange('address.state', e.target.value)}
                  placeholder="NY"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="zipCode">ZIP Code</Label>
                <Input
                  id="zipCode"
                  value={formData.address.zipCode}
                  onChange={(e) => handleInputChange('address.zipCode', e.target.value)}
                  placeholder="10001"
                />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.address.country}
                  onChange={(e) => handleInputChange('address.country', e.target.value)}
                  placeholder="United States"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Compliance Agreement */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Compliance Agreement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start space-x-2">
              <Checkbox
                id="compliance"
                checked={formData.complianceAgreementAccepted}
                onCheckedChange={(checked) => 
                  handleInputChange('complianceAgreementAccepted', checked)
                }
              />
              <div className="text-sm">
                <Label htmlFor="compliance" className="cursor-pointer">
                  I agree to comply with Amazon Associates Operating Agreement
                </Label>
                <p className="text-gray-500 mt-1">
                  By checking this box, you agree to follow all Amazon Associates policies,
                  include proper disclosures, and maintain compliance with FTC guidelines.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Verification Results */}
        {verificationResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="w-5 h-5" />
                Verification Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              {verificationResult.eligibility.eligible ? (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Congratulations! Your account is eligible for Amazon Associates compliance.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Please address the following issues to complete verification:
                    </AlertDescription>
                  </Alert>
                  
                  <div className="space-y-2">
                    {verificationResult.eligibility.issues.map((issue: string, index: number) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-red-600">
                        <AlertTriangle className="w-4 h-4" />
                        {issue}
                      </div>
                    ))}
                  </div>

                  {verificationResult.eligibility.recommendations.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium text-sm mb-2">Recommendations:</h4>
                      <div className="space-y-1">
                        {verificationResult.eligibility.recommendations.map((rec: string, index: number) => (
                          <div key={index} className="text-sm text-blue-600">
                            • {rec}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Button 
          type="submit" 
          className="w-full" 
          disabled={isSubmitting || progress < 100}
        >
          {isSubmitting ? 'Verifying...' : 'Complete Verification'}
        </Button>
      </form>
    </div>
  );
};