import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface CityData {
  city: string;
  count: number;
}

export default function CitiesManagement() {
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch cities data from the API
  const { data: cities = [], isLoading } = useQuery<CityData[]>({
    queryKey: ["/api/admin/cities"],
    queryFn: async () => {
      const response = await fetch("/api/admin/cities");
      if (!response.ok) {
        throw new Error("Failed to fetch cities");
      }
      return response.json();
    },
  });

  const filteredCities = cities.filter(city =>
    city.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          View cities with business listings and their counts
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cities Overview</CardTitle>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search cities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading cities...</div>
          ) : filteredCities.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm ? "No cities found matching your search." : "No cities found."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>City</TableHead>
                  <TableHead>Business Count</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCities.map((cityData, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{cityData.city}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {cityData.count} businesses
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Navigate to businesses in this city
                            window.location.href = `/admin/businesses?city=${encodeURIComponent(cityData.city)}`;
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Businesses
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          
          {!isLoading && cities.length > 0 && (
            <div className="mt-4 text-sm text-muted-foreground">
              Showing {filteredCities.length} of {cities.length} cities
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}