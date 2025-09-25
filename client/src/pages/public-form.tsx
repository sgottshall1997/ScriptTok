import React, { useState } from 'react';
import AboutThisPage from '@/components/AboutThisPage';
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle, Loader2 } from "lucide-react";

// Form submission schema
const submissionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  message: z.string().optional(),
});

type SubmissionData = z.infer<typeof submissionSchema>;

interface FormType {
  id: number;
  slug: string;
  orgId: number;
  schemaJson: any;
  rulesJson?: any;
  createdAt: string;
  updatedAt: string;
}

export default function PublicForm() {
  const [match, params] = useRoute("/forms/:slug");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const slug = params?.slug;

  // Fetch form data by slug
  const { data: form, isLoading, error } = useQuery<FormType>({
    queryKey: [`/api/forms/by-slug/${slug}`],
    enabled: !!slug,
  });

  const form_hook = useForm<SubmissionData>({
    resolver: zodResolver(submissionSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
    },
  });

  // Submit form mutation
  const submitMutation = useMutation({
    mutationFn: async (data: SubmissionData) => {
      if (!form || !form.id) throw new Error("Form not found");
      
      const response = await fetch(`/api/forms/${form.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contactId: null,
          dataJson: data,
          utmJson: {},
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit form');
      }

      return response.json();
    },
    onSuccess: () => {
      setIsSubmitted(true);
      form_hook.reset();
    },
  });

  const onSubmit = (data: SubmissionData) => {
    submitMutation.mutate(data);
  };

  if (!match) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Alert>
              <AlertDescription>
                Form not found. Please check the URL and try again.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading form...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Alert data-testid="error-form-not-found">
              <AlertDescription>
                Form not found. This form may not exist or may have been removed.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center" data-testid="success-message">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Thank you!</h2>
            <p className="text-muted-foreground">
              Your form has been submitted successfully. We'll be in touch soon.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Contact Form</CardTitle>
          <p className="text-center text-muted-foreground">
            Please fill out the form below and we'll get back to you shortly.
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form_hook}>
            <form onSubmit={form_hook.handleSubmit(onSubmit)} className="space-y-6" data-testid="public-form">
              <FormField
                control={form_hook.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-name" placeholder="Enter your full name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form_hook.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address *</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-email" type="email" placeholder="Enter your email address" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form_hook.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-phone" type="tel" placeholder="Enter your phone number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form_hook.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        data-testid="input-message"
                        placeholder="Tell us how we can help you..."
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full" 
                disabled={submitMutation.isPending}
                data-testid="button-submit-form"
              >
                {submitMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Form'
                )}
              </Button>

              {submitMutation.error && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {submitMutation.error instanceof Error 
                      ? submitMutation.error.message 
                      : 'An error occurred while submitting the form'
                    }
                  </AlertDescription>
                </Alert>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>

      <AboutThisPage 
        title="Public Form Submission"
        whatItDoes="Dynamic public form system that allows external users to submit information through custom forms created by organizations. Supports flexible field configurations, validation rules, and secure data collection with automated processing and notification workflows."
        setupRequirements={[
          "Valid form URL provided by the organization",
          "Required form fields completed accurately",
          "Understanding of form purpose and data usage policies"
        ]}
        usageInstructions={[
          "Access the form through the provided link or QR code",
          "Fill in all required fields with accurate information",
          "Review your submission before clicking Submit Form",
          "Wait for confirmation message after successful submission",
          "Save submission confirmation for your records",
          "Contact the organization if you experience submission issues"
        ]}
        relatedLinks={[
          {name: "Contact Support", path: "/contact"},
          {name: "Privacy Policy", path: "/privacy"},
          {name: "Terms & Conditions", path: "/terms"}
        ]}
        notes={[
          "Forms are securely processed and data is protected according to privacy policies",
          "Required fields must be completed for successful submission",
          "Submission confirmation provides verification of successful form processing",
          "Organizations may contact you based on the information provided",
          "Technical issues should be reported to the organization or platform support"
        ]}
      />
    </div>
  );
}