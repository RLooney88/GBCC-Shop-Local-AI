import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Phone, Mail, Globe } from "lucide-react";
import type { BusinessInfo } from "@shared/schema";

interface BusinessCardProps {
  business: BusinessInfo;
}

export function BusinessCard({ business }: BusinessCardProps) {
  // Function to get domain from URL
  const getDomain = (url: string) => {
    try {
      const domain = new URL(url.startsWith('http') ? url : `https://${url}`);
      return domain.hostname;
    } catch {
      return url;
    }
  };

  return (
    <Card className="bg-white shadow-md">
      <CardHeader>
        <h3 className="text-xl font-semibold text-gray-900">{business.name}</h3>
        <p className="text-sm text-gray-600">{business.primaryServices}</p>
      </CardHeader>
      <CardContent className="space-y-2">
        {business.phone && (
          <div className="flex items-center space-x-2 text-gray-600">
            <Phone className="h-4 w-4" />
            <a href={`tel:${business.phone}`} className="hover:text-[#00A7B7]">
              {business.phone}
            </a>
          </div>
        )}
        {business.email && (
          <div className="flex items-center space-x-2 text-gray-600">
            <Mail className="h-4 w-4" />
            <a href={`mailto:${business.email}`} className="hover:text-[#00A7B7]">
              {business.email}
            </a>
          </div>
        )}
        {business.website && (
          <div className="flex items-center space-x-2 text-gray-600">
            <Globe className="h-4 w-4" />
            <a 
              href={business.website.startsWith('http') ? business.website : `https://${business.website}`}
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-[#00A7B7]"
            >
              {getDomain(business.website)}
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}