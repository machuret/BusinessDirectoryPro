import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Props interface - always define props interface
interface ComponentTemplateProps {
  children?: ReactNode;
  title?: string;
  className?: string;
}

// Main component - use named export
export function ComponentTemplate({ 
  children, 
  title = "Default Title",
  className = ""
}: ComponentTemplateProps) {
  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}

// Sub-components for compound component pattern
ComponentTemplate.Header = function ComponentTemplateHeader({ 
  children 
}: { children: ReactNode }) {
  return <CardHeader>{children}</CardHeader>;
};

ComponentTemplate.Content = function ComponentTemplateContent({ 
  children 
}: { children: ReactNode }) {
  return <CardContent>{children}</CardContent>;
};

ComponentTemplate.Title = function ComponentTemplateTitle({ 
  children 
}: { children: ReactNode }) {
  return <CardTitle>{children}</CardTitle>;
};

// Default export for backward compatibility if needed
export default ComponentTemplate;