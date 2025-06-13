import React from 'react';
import { Link } from 'wouter';
import { cn } from '@/lib/utils';
import { Building2, Mail, Phone, MapPin } from 'lucide-react';

interface FooterProps {
  variant?: 'default' | 'minimal';
  className?: string;
}

export function Footer({ variant = 'default', className }: FooterProps) {
  const currentYear = new Date().getFullYear();

  if (variant === 'minimal') {
    return (
      <footer className={cn('border-t bg-background', className)}>
        <div className="container flex h-14 items-center justify-between">
          <p className="text-sm text-muted-foreground">
            © {currentYear} Business Directory. All rights reserved.
          </p>
        </div>
      </footer>
    );
  }

  return (
    <footer className={cn('border-t bg-background', className)}>
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <div className="flex flex-col space-y-3">
            <Link href="/" className="flex items-center space-x-2">
              <Building2 className="h-6 w-6" />
              <span className="font-bold">Business Directory</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Connecting businesses with customers through our comprehensive directory platform.
            </p>
            <div className="flex flex-col space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>hello@businessdirectory.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>1-800-BUSINESS</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>123 Business St, Suite 100</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col space-y-3">
            <h3 className="text-sm font-semibold">Quick Links</h3>
            <div className="flex flex-col space-y-2 text-sm">
              <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                Home
              </Link>
              <Link href="/businesses" className="text-muted-foreground hover:text-foreground transition-colors">
                Browse Businesses
              </Link>
              <Link href="/categories" className="text-muted-foreground hover:text-foreground transition-colors">
                Categories
              </Link>
              <Link href="/add-business" className="text-muted-foreground hover:text-foreground transition-colors">
                Add Your Business
              </Link>
            </div>
          </div>

          {/* For Business Owners */}
          <div className="flex flex-col space-y-3">
            <h3 className="text-sm font-semibold">For Business Owners</h3>
            <div className="flex flex-col space-y-2 text-sm">
              <Link href="/add-business" className="text-muted-foreground hover:text-foreground transition-colors">
                List Your Business
              </Link>
              <Link href="/claim-business" className="text-muted-foreground hover:text-foreground transition-colors">
                Claim Your Business
              </Link>
              <Link href="/business-tools" className="text-muted-foreground hover:text-foreground transition-colors">
                Business Tools
              </Link>
              <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </Link>
            </div>
          </div>

          {/* Support & Legal */}
          <div className="flex flex-col space-y-3">
            <h3 className="text-sm font-semibold">Support</h3>
            <div className="flex flex-col space-y-2 text-sm">
              <Link href="/help" className="text-muted-foreground hover:text-foreground transition-colors">
                Help Center
              </Link>
              <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                Contact Us
              </Link>
              <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between border-t pt-8 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © {currentYear} Business Directory. All rights reserved.
          </p>
          <div className="mt-4 flex space-x-4 md:mt-0">
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terms
            </Link>
            <Link href="/cookies" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;