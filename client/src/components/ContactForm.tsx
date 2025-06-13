import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, Phone, MapPin } from 'lucide-react';

interface ContactFormProps {
  title?: string;
  showContactInfo?: boolean;
}

export default function ContactForm({ title = "Contact Us", showContactInfo = true }: ContactFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const contactMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Message Sent",
        description: "Thank you for your message. We'll get back to you soon!",
      });
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Send",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    contactMutation.mutate(formData);
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev: any) => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium after:content-['*'] after:text-destructive after:ml-1">
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={handleChange("name")}
                  required
                  aria-describedby="name-helper"
                  className="focus-visible:ring-primary"
                />
                <p id="name-helper" className="text-xs text-muted-foreground">Enter your full name</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium after:content-['*'] after:text-destructive after:ml-1">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange("email")}
                  required
                  aria-describedby="email-helper"
                  className="focus-visible:ring-primary"
                />
                <p id="email-helper" className="text-xs text-muted-foreground">We'll use this to contact you</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange("phone")}
                  aria-describedby="phone-helper"
                  className="focus-visible:ring-primary"
                />
                <p id="phone-helper" className="text-xs text-muted-foreground">Optional - for urgent inquiries</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-sm font-medium after:content-['*'] after:text-destructive after:ml-1">
                  Subject
                </Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={handleChange("subject")}
                  required
                  aria-describedby="subject-helper"
                  className="focus-visible:ring-primary"
                />
                <p id="subject-helper" className="text-xs text-muted-foreground">Brief topic of your message</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message" className="text-sm font-medium after:content-['*'] after:text-destructive after:ml-1">
                Message
              </Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={handleChange("message")}
                rows={5}
                required
                aria-describedby="message-helper"
                className="focus-visible:ring-primary resize-none"
              />
              <p id="message-helper" className="text-xs text-muted-foreground">Please provide details about your inquiry</p>
            </div>

            <Button 
              type="submit" 
              disabled={contactMutation.isPending}
              className="w-full"
              size="lg"
              aria-describedby={contactMutation.isPending ? "submit-status" : undefined}
            >
              {contactMutation.isPending ? "Sending..." : "Send Message"}
            </Button>
            {contactMutation.isPending && (
              <p id="submit-status" className="text-sm text-muted-foreground text-center">
                Please wait while we send your message...
              </p>
            )}
          </form>
        </CardContent>
      </Card>

      {showContactInfo && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Get in Touch</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">contact@businesshub.com</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Phone</p>
                  <p className="text-sm text-muted-foreground">+1 (555) 123-4567</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Address</p>
                  <p className="text-sm text-muted-foreground">
                    123 Business Street<br />
                    Suite 100<br />
                    Business City, BC 12345
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold mb-2">Business Hours</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Monday - Friday:</span>
                  <span>9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday:</span>
                  <span>10:00 AM - 4:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday:</span>
                  <span>Closed</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}