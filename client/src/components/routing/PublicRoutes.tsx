import { Route } from "wouter";
import Home from "@/pages/home";
import Categories from "@/pages/categories";
import Cities from "@/pages/cities";
import Featured from "@/pages/featured";
import BusinessDetailRefactored from "@/pages/business-detail-refactored";
import BusinessListing from "@/pages/business-listing";
import SearchResults from "@/pages/search-results";
import PageDisplay from "@/pages/page-display";
import Login from "@/pages/login-migrated";
import AddBusiness from "@/pages/add-business";
import BusinessesPage from "@/pages/businesses";
import SlugRouter from "@/components/SlugRouter";

// Common Australian cities for direct routing
const COMMON_CITIES = [
  'Brisbane', 'Sydney', 'Melbourne', 'Adelaide', 'Perth', 'Darwin', 'Hobart', 'Canberra',
  'Gold-Coast', 'Sunshine-Coast', 'Newcastle', 'Wollongong', 'Geelong', 'Townsville',
  'Cairns', 'Toowoomba', 'Ballarat', 'Bendigo', 'Albury', 'Launceston', 'Mackay',
  'Rockhampton', 'Bunbury', 'Bundaberg', 'Coffs-Harbour', 'Wagga-Wagga', 'Hervey-Bay',
  'Mildura', 'Shepparton', 'Port-Macquarie', 'Gladstone', 'Tamworth', 'Traralgon',
  'Orange', 'Bowral', 'Geraldton', 'Dubbo', 'Nowra', 'Warrnambool', 'Kalgoorlie',
  'Whyalla', 'Murray-Bridge', 'Devonport', 'Burnie', 'Alice-Springs', 'Mount-Gambier',
  'Lismore', 'Nelson-Bay', 'Victor-Harbor', 'Goulburn', 'Taree', 'Coorparoo',
  'Woolloongabba', 'South-Brisbane', 'Fortitude-Valley', 'New-Farm', 'Paddington',
  'Milton', 'Toowong', 'St-Lucia', 'Indooroopilly', 'Chermside', 'Carindale', 'Garden-City'
];

export function PublicRoutes() {
  return (
    <>
      {/* Core public routes */}
      <Route path="/" component={Home} />
      <Route path="/categories" component={Categories} />
      <Route path="/categories/:slug" component={Categories} />
      <Route path="/cities" component={Cities} />
      <Route path="/cities/:city" component={Cities} />
      
      {/* Clean URLs for categories and cities */}
      <Route path="/businesses/category/:categorySlug" component={BusinessesPage} />
      <Route path="/businesses/city/:cityName" component={BusinessesPage} />
      
      {/* Direct city access - e.g., /Coorparoo, /Brisbane */}
      <Route path="/:cityName" component={(props) => {
        const cityName = props.params.cityName;
        
        if (COMMON_CITIES.includes(cityName) || cityName.includes('-')) {
          return <BusinessesPage />;
        }
        
        // If not a recognized city, let it fall through to SlugRouter
        return null;
      }} />
      
      {/* Business and search routes */}
      <Route path="/featured" component={Featured} />
      <Route path="/businesses" component={BusinessesPage} />
      <Route path="/search" component={SearchResults} />
      <Route path="/pages/:slug" component={PageDisplay} />
      <Route path="/login" component={Login} />
      <Route path="/add-business" component={AddBusiness} />
      
      {/* Business detail routes */}
      <Route path="/business/:slug" component={BusinessDetailRefactored} />
      <Route path="/listing/:id" component={BusinessListing} />
      
      {/* Slug router for remaining routes */}
      <Route component={SlugRouter} />
    </>
  );
}