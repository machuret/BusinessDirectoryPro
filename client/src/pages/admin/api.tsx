import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code, Key, Database, Activity } from 'lucide-react';

export default function AdminAPIPage() {
  const [testEndpoint, setTestEndpoint] = useState('/api/businesses');
  const [testResponse, setTestResponse] = useState('');

  const endpoints = [
    { path: '/api/businesses', method: 'GET', description: 'List all businesses' },
    { path: '/api/categories', method: 'GET', description: 'List all categories' },
    { path: '/api/businesses/featured', method: 'GET', description: 'Get featured businesses' },
    { path: '/api/auth/user', method: 'GET', description: 'Get current user' },
    { path: '/api/admin/stats', method: 'GET', description: 'Get admin statistics' },
  ];

  const testAPI = async () => {
    try {
      const response = await fetch(testEndpoint);
      const data = await response.json();
      setTestResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      setTestResponse(`Error: ${error.message}`);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">API Management</h1>
        <Badge variant="secondary">
          <Activity className="w-4 h-4 mr-2" />
          API Active
        </Badge>
      </div>

      <Tabs defaultValue="endpoints" className="space-y-6">
        <TabsList>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="testing">API Testing</TabsTrigger>
          <TabsTrigger value="keys">API Keys</TabsTrigger>
          <TabsTrigger value="logs">Request Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="endpoints">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Code className="w-5 h-5 mr-2" />
                Available Endpoints
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {endpoints.map((endpoint, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant={endpoint.method === 'GET' ? 'default' : 'secondary'}>
                          {endpoint.method}
                        </Badge>
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                          {endpoint.path}
                        </code>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{endpoint.description}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Test
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testing">
          <Card>
            <CardHeader>
              <CardTitle>API Testing Console</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={testEndpoint}
                    onChange={(e) => setTestEndpoint(e.target.value)}
                    placeholder="/api/endpoint"
                    className="flex-1"
                  />
                  <Button onClick={testAPI}>
                    Test Endpoint
                  </Button>
                </div>
                {testResponse && (
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto max-h-96">
                    <pre className="text-xs">{testResponse}</pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="keys">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Key className="w-5 h-5 mr-2" />
                API Key Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">Master API Key</h3>
                      <p className="text-sm text-gray-600">Full access to all endpoints</p>
                    </div>
                    <Badge>Active</Badge>
                  </div>
                </div>
                <Button>
                  <Key className="w-4 h-4 mr-2" />
                  Generate New Key
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="w-5 h-5 mr-2" />
                Recent API Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-xs text-gray-500 grid grid-cols-4 gap-4 p-2">
                  <span>Time</span>
                  <span>Method</span>
                  <span>Endpoint</span>
                  <span>Status</span>
                </div>
                <div className="text-sm grid grid-cols-4 gap-4 p-2 border-b">
                  <span>17:45:23</span>
                  <span>GET</span>
                  <span>/api/businesses</span>
                  <Badge variant="default" className="w-fit">200</Badge>
                </div>
                <div className="text-sm grid grid-cols-4 gap-4 p-2 border-b">
                  <span>17:45:18</span>
                  <span>GET</span>
                  <span>/api/categories</span>
                  <Badge variant="default" className="w-fit">200</Badge>
                </div>
                <div className="text-sm grid grid-cols-4 gap-4 p-2 border-b">
                  <span>17:45:15</span>
                  <span>GET</span>
                  <span>/api/auth/user</span>
                  <Badge variant="destructive" className="w-fit">401</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}