import { Route } from "wouter";
import { lazy, Suspense } from "react";
import { LoadingState } from "@/components/loading/LoadingState";

// Lazy load components for better performance
const Home = lazy(() => import("@/pages/home"));
const Categories = lazy(() => import("@/pages/categories"));
const Cities = lazy(() => import("@/pages/cities"));
const BusinessesPage = lazy(() => import("@/pages/businesses"));
const Featured = lazy(() => import("@/pages/featured"));
const SearchResults = lazy(() => import("@/pages/search-results"));
const PageDisplay = lazy(() => import("@/pages/page-display"));
const Login = lazy(() => import("@/pages/login"));
const AddBusiness = lazy(() => import("@/pages/add-business"));

function PublicSuspense({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<LoadingState variant="spinner" size="lg" message="Loading page..." />}>
      {children}
    </Suspense>
  );
}

export function PublicRoutes() {
  return (
    <>
      {/* Home page */}
      <Route path="/">
        <PublicSuspense>
          <Home />
        </PublicSuspense>
      </Route>

      {/* Categories pages */}
      <Route path="/categories">
        <PublicSuspense>
          <Categories />
        </PublicSuspense>
      </Route>
      <Route path="/categories/:categorySlug">
        <PublicSuspense>
          <Categories />
        </PublicSuspense>
      </Route>

      {/* Cities pages */}
      <Route path="/cities">
        <PublicSuspense>
          <Cities />
        </PublicSuspense>
      </Route>
      <Route path="/cities/:cityName">
        <PublicSuspense>
          <Cities />
        </PublicSuspense>
      </Route>

      {/* Business directory pages */}
      <Route path="/businesses">
        <PublicSuspense>
          <BusinessesPage />
        </PublicSuspense>
      </Route>
      <Route path="/businesses/:categorySlug">
        <PublicSuspense>
          <BusinessesPage />
        </PublicSuspense>
      </Route>

      {/* Dynamic city/category routing */}
      <Route path="/:cityName" nest>
        {(params) => (
          <Route path="/businesses/:categorySlug">
            <PublicSuspense>
              <BusinessesPage />
            </PublicSuspense>
          </Route>
        )}
      </Route>

      <Route path="/:cityName">
        {(params) => (
          <PublicSuspense>
            <BusinessesPage />
          </PublicSuspense>
        )}
      </Route>

      {/* Other public pages */}
      <Route path="/featured">
        <PublicSuspense>
          <Featured />
        </PublicSuspense>
      </Route>
      <Route path="/search">
        <PublicSuspense>
          <SearchResults />
        </PublicSuspense>
      </Route>
      <Route path="/page/:slug">
        <PublicSuspense>
          <PageDisplay />
        </PublicSuspense>
      </Route>
      <Route path="/login">
        <PublicSuspense>
          <Login />
        </PublicSuspense>
      </Route>
      <Route path="/add-business">
        <PublicSuspense>
          <AddBusiness />
        </PublicSuspense>
      </Route>
    </>
  );
}