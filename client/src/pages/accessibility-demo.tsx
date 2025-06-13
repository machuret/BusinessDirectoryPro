import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Phone, ExternalLink, Crown } from 'lucide-react';
import { TabGroup } from '@/components/accessibility/TabGroup';
import { AccessibleModal } from '@/components/accessibility/AccessibleModal';
import { SkipNavigation } from '@/components/accessibility/SkipNavigation';

export default function AccessibilityDemo() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const demoTabs = [
    {
      id: 'overview',
      label: 'Overview',
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Accessibility Implementation</h3>
          <p className="text-muted-foreground">
            This page demonstrates the comprehensive accessibility features implemented 
            throughout the application, including keyboard navigation, screen reader 
            support, and WCAG 2.1 AA compliance standards.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  Implemented Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Keyboard navigation support</li>
                  <li>• Screen reader optimization</li>
                  <li>• Focus management in modals</li>
                  <li>• Descriptive alt text for images</li>
                  <li>• ARIA labels and landmarks</li>
                  <li>• Skip navigation links</li>
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <XCircle className="w-5 h-5 text-red-500 mr-2" />
                  Issues Fixed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Missing image alt attributes</li>
                  <li>• Unlabeled form inputs</li>
                  <li>• Poor keyboard navigation</li>
                  <li>• Icon-only buttons without context</li>
                  <li>• Focus trapping in modals</li>
                  <li>• Color contrast issues</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      id: 'keyboard',
      label: 'Keyboard Navigation',
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Keyboard Navigation Standards</h3>
          <Alert>
            <AlertDescription>
              Try navigating this tab group using your keyboard: Use Arrow keys to move between tabs, 
              Home/End to jump to first/last tab, and Enter/Space to activate.
            </AlertDescription>
          </Alert>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline">Tab</Badge>
              <span className="text-sm">Move focus to next element</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Shift + Tab</Badge>
              <span className="text-sm">Move focus to previous element</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Arrow Keys</Badge>
              <span className="text-sm">Navigate within tab groups</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Enter/Space</Badge>
              <span className="text-sm">Activate buttons and links</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Escape</Badge>
              <span className="text-sm">Close modals and dropdowns</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'buttons',
      label: 'Button Accessibility',
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Accessible Button Examples</h3>
          <p className="text-muted-foreground">
            All buttons include proper ARIA labels and screen reader support.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button 
              aria-label="Call business at (555) 123-4567"
              variant="outline"
              size="icon"
            >
              <Phone className="w-4 h-4" aria-hidden="true" />
              <span className="sr-only">Call Business</span>
            </Button>
            
            <Button 
              aria-label="View details for Demo Business"
              className="bg-yellow-500 hover:bg-yellow-600 text-yellow-900"
            >
              View Details
              <Crown className="w-4 h-4 ml-2" aria-hidden="true" />
            </Button>
            
            <Button 
              onClick={() => setIsModalOpen(true)}
              aria-label="Open accessibility demo modal"
            >
              Open Modal Demo
            </Button>
          </div>
        </div>
      )
    },
    {
      id: 'images',
      label: 'Image Accessibility',
      content: (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Descriptive Alt Text Examples</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Good Alt Text</CardTitle>
              </CardHeader>
              <CardContent>
                <img 
                  src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop"
                  alt="Modern restaurant interior with warm lighting, wooden tables, and comfortable seating"
                  className="w-full h-32 object-cover rounded mb-2"
                />
                <code className="text-xs bg-muted p-2 rounded block">
                  alt="Modern restaurant interior with warm lighting, wooden tables, and comfortable seating"
                </code>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Business Context Alt Text</CardTitle>
              </CardHeader>
              <CardContent>
                <img 
                  src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300&h=200&fit=crop"
                  alt="Joe's Diner - Family restaurant located in downtown Springfield"
                  className="w-full h-32 object-cover rounded mb-2"
                />
                <code className="text-xs bg-muted p-2 rounded block">
                  alt="Joe's Diner - Family restaurant located in downtown Springfield"
                </code>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SkipNavigation />
      
      <header className="bg-primary text-primary-foreground p-4" role="banner">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">Accessibility Implementation Demo</h1>
          <p className="text-primary-foreground/80">WCAG 2.1 AA Compliance Standards</p>
        </div>
      </header>

      <nav className="bg-muted p-4" role="navigation" id="navigation">
        <div className="container mx-auto">
          <ul className="flex space-x-4" role="menubar">
            <li role="none">
              <a 
                href="#main-content" 
                className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring"
                role="menuitem"
              >
                Main Content
              </a>
            </li>
            <li role="none">
              <a 
                href="#keyboard-demo" 
                className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring"
                role="menuitem"
              >
                Keyboard Demo
              </a>
            </li>
            <li role="none">
              <a 
                href="#button-demo" 
                className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring"
                role="menuitem"
              >
                Button Demo
              </a>
            </li>
          </ul>
        </div>
      </nav>

      <main className="container mx-auto p-4 space-y-8" id="main-content" role="main">
        <section aria-labelledby="demo-heading">
          <h2 id="demo-heading" className="text-xl font-semibold mb-4">
            Interactive Accessibility Demonstration
          </h2>
          
          <TabGroup 
            tabs={demoTabs}
            defaultTab="overview"
            className="mb-8"
          />
        </section>

        <section aria-labelledby="compliance-heading" className="space-y-4">
          <h2 id="compliance-heading" className="text-xl font-semibold">
            WCAG 2.1 Compliance Status
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  Level A
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Basic accessibility features implemented across all components.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  Level AA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Enhanced accessibility with color contrast and keyboard navigation.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <XCircle className="w-5 h-5 text-orange-500 mr-2" />
                  Level AAA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Advanced features planned for future implementation.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <aside className="bg-muted/50 p-4" role="complementary" aria-labelledby="resources-heading">
        <div className="container mx-auto">
          <h2 id="resources-heading" className="text-lg font-semibold mb-4">
            Accessibility Resources
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-2">Testing Tools</h3>
                <ul className="text-sm space-y-1">
                  <li>• axe-core automated testing</li>
                  <li>• Manual keyboard navigation</li>
                  <li>• Screen reader testing</li>
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-2">Standards</h3>
                <ul className="text-sm space-y-1">
                  <li>• WCAG 2.1 AA compliance</li>
                  <li>• Section 508 standards</li>
                  <li>• ARIA best practices</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </aside>

      <footer className="bg-primary text-primary-foreground p-4 mt-8" role="contentinfo">
        <div className="container mx-auto text-center">
          <p>&copy; 2025 Business Directory - Accessible by Design</p>
        </div>
      </footer>

      <AccessibleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Accessibility Modal Demo"
        description="This modal demonstrates proper focus management and keyboard navigation."
      >
        <div className="space-y-4">
          <p>
            This modal shows proper accessibility implementation:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Focus is automatically moved to the modal when opened</li>
            <li>Focus is trapped within the modal boundaries</li>
            <li>Escape key closes the modal</li>
            <li>Focus returns to the trigger button when closed</li>
            <li>Screen readers announce the modal properly</li>
          </ul>
          <div className="flex gap-2">
            <Button onClick={() => setIsModalOpen(false)}>
              Close Modal
            </Button>
            <Button variant="outline">
              Another Action
            </Button>
          </div>
        </div>
      </AccessibleModal>
    </div>
  );
}