import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Key, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

export default function APIManagement() {
  const [openaiKey, setOpenaiKey] = useState("");
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const { toast } = useToast();

  // Fetch current API settings
  const { data: settings = {} } = useQuery({
    queryKey: ['/api/site-settings'],
    queryFn: async () => {
      const response = await fetch('/api/site-settings');
      if (!response.ok) throw new Error('Failed to fetch settings');
      return response.json();
    },
  });

  // Update OpenAI key mutation
  const updateKeyMutation = useMutation({
    mutationFn: async (key: string) => {
      const response = await fetch('/api/admin/site-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'openai_api_key', value: key }),
      });
      if (!response.ok) throw new Error('Failed to update API key');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/site-settings'] });
      toast({
        title: "Success",
        description: "OpenAI API key updated successfully",
      });
      setOpenaiKey("");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Test OpenAI connection
  const testConnection = async () => {
    setIsTestingConnection(true);
    try {
      const keyToTest = openaiKey || settings.openai_api_key;
      if (!keyToTest) {
        throw new Error('No API key provided');
      }

      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${keyToTest}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast({
          title: "Connection Successful",
          description: "OpenAI API key is working correctly",
        });
      } else {
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleUpdateKey = () => {
    if (!openaiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter an API key",
        variant: "destructive",
      });
      return;
    }
    updateKeyMutation.mutate(openaiKey);
  };

  const hasValidKey = settings.openai_api_key && settings.openai_api_key.startsWith('sk-');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
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
                      value={openaiKey}
                      onChange={(e) => setOpenaiKey(e.target.value)}
                    />
                    <Button 
                      onClick={handleUpdateKey}
                      disabled={updateKeyMutation.isPending}
                    >
                      {updateKeyMutation.isPending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Key className="h-4 w-4 mr-2" />
                      )}
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
                    <div className="text-sm text-muted-foreground">
                      {hasValidKey ? 'API key configured' : 'No valid API key'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasValidKey ? (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Configured
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Not Configured
                      </Badge>
                    )}
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={testConnection}
                      disabled={isTestingConnection || !hasValidKey}
                    >
                      {isTestingConnection ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : null}
                      Test Connection
                    </Button>
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