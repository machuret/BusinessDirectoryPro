import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Key } from "lucide-react";

export default function APIManagement() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>API Key Management</CardTitle>
          <CardDescription>Manage external API keys and integrations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">OpenAI Integration</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="openai-key">OpenAI API Key</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="openai-key" 
                      type="password" 
                      placeholder="sk-..." 
                      className="font-mono"
                    />
                    <Button>
                      <Key className="h-4 w-4 mr-2" />
                      Update
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Used for AI-powered business descriptions and content optimization
                  </p>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium">Connection Status</div>
                    <div className="text-sm text-muted-foreground">Last tested: 2 hours ago</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="default">Connected</Badge>
                    <Button size="sm" variant="outline">Test Connection</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}