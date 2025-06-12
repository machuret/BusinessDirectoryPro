import { useQuery } from "@tanstack/react-query";

export default function WelcomeSection() {
  const { data: siteSettings } = useQuery<Record<string, any>>({
    queryKey: ["/api/site-settings"],
  });

  const welcomeTitle = siteSettings?.welcome_title || "Welcome to Our Business Directory";
  const welcomeContent = siteSettings?.welcome_content || "Discover amazing local businesses in your area. Browse our comprehensive directory to find the services you need, read authentic reviews, and connect with trusted local providers.";

  return (
    <div className="bg-white py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          {welcomeTitle}
        </h2>
        <p className="text-lg text-gray-600 leading-relaxed">
          {welcomeContent}
        </p>
      </div>
    </div>
  );
}