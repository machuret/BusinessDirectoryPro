import { Building } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useContent } from "@/contexts/ContentContext";

export default function Footer() {
  const { t } = useContent();
  
  // Fetch footer menu items from database
  const { data: footer1Items } = useQuery({
    queryKey: ["/api/menu-items/footer1"],
    queryFn: async () => {
      const response = await fetch("/api/menu-items?location=footer1");
      if (!response.ok) return [];
      return response.json();
    }
  });

  const { data: footer2Items } = useQuery({
    queryKey: ["/api/menu-items/footer2"],
    queryFn: async () => {
      const response = await fetch("/api/menu-items?location=footer2");
      if (!response.ok) return [];
      return response.json();
    }
  });

  return (
    <footer className="bg-secondary text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <Building className="text-accent text-2xl mr-3" />
              <h3 className="text-2xl font-bold">{t('footer.company.name')}</h3>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              {t('footer.company.description')}
            </p>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="text-gray-300 hover:text-accent transition-colors"
                aria-label={t('footer.social.facebook')}
              >
                <i className="fab fa-facebook-f text-xl"></i>
              </a>
              <a 
                href="#" 
                className="text-gray-300 hover:text-accent transition-colors"
                aria-label={t('footer.social.twitter')}
              >
                <i className="fab fa-twitter text-xl"></i>
              </a>
              <a 
                href="#" 
                className="text-gray-300 hover:text-accent transition-colors"
                aria-label={t('footer.social.instagram')}
              >
                <i className="fab fa-instagram text-xl"></i>
              </a>
              <a 
                href="#" 
                className="text-gray-300 hover:text-accent transition-colors"
                aria-label={t('footer.social.linkedin')}
              >
                <i className="fab fa-linkedin-in text-xl"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">
              {footer1Items && footer1Items.length > 0 ? t('footer.sections.quickLinks') : t('footer.sections.forBusinesses')}
            </h4>
            <ul className="space-y-2">
              {footer1Items && footer1Items.length > 0 ? (
                footer1Items.map((item: any) => (
                  <li key={item.id}>
                    <Link href={item.url} className="text-gray-300 hover:text-white transition-colors">
                      {item.name}
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  <li>
                    <Link href="/add-business" className="text-gray-300 hover:text-white transition-colors">
                      {t('footer.links.listBusiness')}
                    </Link>
                  </li>
                  <li>
                    <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">
                      {t('footer.links.businessDashboard')}
                    </Link>
                  </li>
                  <li>
                    <Link href="/featured" className="text-gray-300 hover:text-white transition-colors">
                      {t('footer.links.featuredBusinesses')}
                    </Link>
                  </li>
                  <li>
                    <Link href="/categories" className="text-gray-300 hover:text-white transition-colors">
                      {t('footer.links.allCategories')}
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">
              {footer2Items && footer2Items.length > 0 ? t('footer.sections.resources') : t('footer.sections.support')}
            </h4>
            <ul className="space-y-2">
              {footer2Items && footer2Items.length > 0 ? (
                footer2Items.map((item: any) => (
                  <li key={item.id}>
                    <Link href={item.url} className="text-gray-300 hover:text-white transition-colors">
                      {item.name}
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  <li>
                    <Link href="/pages/contact-us" className="text-gray-300 hover:text-white transition-colors">
                      {t('footer.links.contactUs')}
                    </Link>
                  </li>
                  <li>
                    <Link href="/pages/about-us" className="text-gray-300 hover:text-white transition-colors">
                      {t('footer.links.aboutUs')}
                    </Link>
                  </li>
                  <li>
                    <Link href="/pages/privacy-policy" className="text-gray-300 hover:text-white transition-colors">
                      {t('footer.links.privacyPolicy')}
                    </Link>
                  </li>
                  <li>
                    <Link href="/pages/terms-of-service" className="text-gray-300 hover:text-white transition-colors">
                      {t('footer.links.termsOfService')}
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-600 mt-8 pt-8 text-center">
          <p className="text-gray-300">{t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  );
}
