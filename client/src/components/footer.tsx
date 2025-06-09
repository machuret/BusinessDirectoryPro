import { Building } from "lucide-react";
import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-secondary text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <Building className="text-accent text-2xl mr-3" />
              <h3 className="text-2xl font-bold">BusinessHub</h3>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              Your trusted local business directory connecting customers with quality service providers across the nation.
            </p>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="text-gray-300 hover:text-accent transition-colors"
                aria-label="Facebook"
              >
                <i className="fab fa-facebook-f text-xl"></i>
              </a>
              <a 
                href="#" 
                className="text-gray-300 hover:text-accent transition-colors"
                aria-label="Twitter"
              >
                <i className="fab fa-twitter text-xl"></i>
              </a>
              <a 
                href="#" 
                className="text-gray-300 hover:text-accent transition-colors"
                aria-label="Instagram"
              >
                <i className="fab fa-instagram text-xl"></i>
              </a>
              <a 
                href="#" 
                className="text-gray-300 hover:text-accent transition-colors"
                aria-label="LinkedIn"
              >
                <i className="fab fa-linkedin-in text-xl"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">For Businesses</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/api/login" className="text-gray-300 hover:text-white transition-colors">
                  List Your Business
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">
                  Business Dashboard
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Pricing Plans
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Success Stories
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-600 mt-8 pt-8 text-center">
          <p className="text-gray-300">&copy; 2024 BusinessHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
