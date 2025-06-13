import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import type { BusinessWithCategory } from "@shared/schema";

interface BusinessHoursProps {
  business: BusinessWithCategory;
}

export function BusinessHours({ business }: BusinessHoursProps) {
  // Parse hours data from business object - check multiple possible field names
  let hoursData = [];
  try {
    // Check for hours in different possible fields based on schema
    const hoursField = (business as any).openinghours || (business as any).operatinghours || (business as any).businesshours || (business as any).hours;
    
    if (Array.isArray(hoursField)) {
      hoursData = hoursField;
    } else if (hoursField && typeof hoursField === 'string') {
      hoursData = JSON.parse(hoursField);
    } else if (hoursField && typeof hoursField === 'object') {
      // If it's already an object, convert to array format
      hoursData = Object.entries(hoursField).map(([day, hours]) => ({
        day,
        hours
      }));
    }
  } catch (e) {
    console.error('Error parsing hours data:', e);
  }

  if (!hoursData || hoursData.length === 0) return null;

  const getCurrentDay = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  };

  const currentDay = getCurrentDay();

  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center text-black">
          <Clock className="w-5 h-5 mr-2" />
          Business Hours
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {hoursData.map((hour: any, index: number) => {
            const day = hour.day || hour.dayOfWeek || `Day ${index + 1}`;
            const hours = hour.hours || hour.time || hour.open_close || 'Closed';
            const isToday = day === currentDay;
            
            return (
              <div 
                key={index} 
                className={`flex justify-between py-2 px-3 rounded ${
                  isToday ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                }`}
              >
                <span className={`font-medium ${isToday ? 'text-blue-900' : 'text-black'}`}>
                  {day}
                  {isToday && <span className="ml-2 text-xs text-blue-600">(Today)</span>}
                </span>
                <span className={isToday ? 'text-blue-900 font-medium' : 'text-gray-600'}>
                  {hours}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}