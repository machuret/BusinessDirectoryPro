import { db } from "../server/db";
import { contentStrings } from "../shared/schema";

/**
 * Creates the content_strings table for centralized text management
 * This migration establishes the foundation for admin-controlled content
 */
export async function createContentStringsTable() {
  try {
    console.log("Creating content_strings table...");
    
    // Create the table using raw SQL for better control
    await db.execute(`
      CREATE TABLE IF NOT EXISTS content_strings (
        id SERIAL PRIMARY KEY,
        string_key VARCHAR(255) UNIQUE NOT NULL,
        default_value TEXT NOT NULL,
        translations JSONB DEFAULT '{}',
        category VARCHAR(100) NOT NULL,
        description TEXT,
        is_html BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create indexes for optimal performance
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_content_strings_key 
      ON content_strings(string_key);
    `);

    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_content_strings_category 
      ON content_strings(category);
    `);

    console.log("Successfully created content_strings table with indexes");
    return true;
  } catch (error) {
    console.error("Error creating content_strings table:", error);
    throw error;
  }
}

/**
 * Seeds the content_strings table with initial high-priority strings
 * Based on the Content Management Strategy Document analysis
 */
export async function seedInitialContentStrings() {
  try {
    console.log("Seeding initial content strings...");

    const initialStrings = [
      // Navigation & Branding
      {
        stringKey: "header.siteTitle",
        defaultValue: "BusinessHub",
        category: "navigation",
        description: "Main site title in header",
        translations: { en: "BusinessHub", es: "CentroNegocios" }
      },
      {
        stringKey: "header.navigation.home",
        defaultValue: "Home",
        category: "navigation",
        description: "Home navigation link",
        translations: { en: "Home", es: "Inicio" }
      },
      {
        stringKey: "header.navigation.categories",
        defaultValue: "Categories",
        category: "navigation",
        description: "Categories navigation link",
        translations: { en: "Categories", es: "Categorías" }
      },
      {
        stringKey: "header.navigation.featured",
        defaultValue: "Featured",
        category: "navigation",
        description: "Featured businesses navigation link",
        translations: { en: "Featured", es: "Destacados" }
      },
      {
        stringKey: "header.auth.signIn",
        defaultValue: "Sign In",
        category: "navigation",
        description: "Sign in button text",
        translations: { en: "Sign In", es: "Iniciar Sesión" }
      },
      {
        stringKey: "header.auth.addBusiness",
        defaultValue: "Add Your Business",
        category: "navigation",
        description: "Add business button text",
        translations: { en: "Add Your Business", es: "Agregar Tu Negocio" }
      },

      // Search & Discovery
      {
        stringKey: "search.placeholder.query",
        defaultValue: "What are you looking for?",
        category: "search",
        description: "Search input placeholder text",
        translations: { en: "What are you looking for?", es: "¿Qué estás buscando?" }
      },
      {
        stringKey: "search.placeholder.location",
        defaultValue: "City, State",
        category: "search",
        description: "Location search placeholder",
        translations: { en: "City, State", es: "Ciudad, Estado" }
      },
      {
        stringKey: "search.button.search",
        defaultValue: "Search",
        category: "search",
        description: "Search button text",
        translations: { en: "Search", es: "Buscar" }
      },

      // Forms
      {
        stringKey: "forms.required",
        defaultValue: "This field is required",
        category: "forms",
        description: "Required field validation message",
        translations: { en: "This field is required", es: "Este campo es obligatorio" }
      },
      {
        stringKey: "forms.submit",
        defaultValue: "Submit",
        category: "forms",
        description: "Generic submit button text",
        translations: { en: "Submit", es: "Enviar" }
      },
      {
        stringKey: "forms.cancel",
        defaultValue: "Cancel",
        category: "forms",
        description: "Generic cancel button text",
        translations: { en: "Cancel", es: "Cancelar" }
      },

      // Error Messages
      {
        stringKey: "errors.network.title",
        defaultValue: "Connection Error",
        category: "errors",
        description: "Network error title",
        translations: { en: "Connection Error", es: "Error de Conexión" }
      },
      {
        stringKey: "errors.network.message",
        defaultValue: "Please check your internet connection",
        category: "errors",
        description: "Network error message",
        translations: { en: "Please check your internet connection", es: "Por favor verifica tu conexión a internet" }
      },

      // Business Cards
      {
        stringKey: "business.contact.phone",
        defaultValue: "Call",
        category: "business",
        description: "Phone contact button text",
        translations: { en: "Call", es: "Llamar" }
      },
      {
        stringKey: "business.contact.website",
        defaultValue: "Visit Website",
        category: "business",
        description: "Website link button text",
        translations: { en: "Visit Website", es: "Visitar Sitio Web" }
      },
      {
        stringKey: "business.featured.badge",
        defaultValue: "Featured",
        category: "business",
        description: "Featured business badge text",
        translations: { en: "Featured", es: "Destacado" }
      },

      // Homepage Content
      {
        stringKey: "homepage.seo.title",
        defaultValue: "Business Directory - Find Local Businesses",
        category: "homepage",
        description: "Homepage SEO title",
        translations: { en: "Business Directory - Find Local Businesses", es: "Directorio de Negocios - Encuentra Negocios Locales" }
      },
      {
        stringKey: "homepage.seo.description",
        defaultValue: "Discover and connect with local businesses in your area. Browse categories, read reviews, and find exactly what you're looking for.",
        category: "homepage",
        description: "Homepage SEO description",
        translations: { en: "Discover and connect with local businesses in your area. Browse categories, read reviews, and find exactly what you're looking for.", es: "Descubre y conecta con negocios locales en tu área. Navega categorías, lee reseñas y encuentra exactamente lo que buscas." }
      },
      {
        stringKey: "homepage.hero.title",
        defaultValue: "Find Local Businesses",
        category: "homepage",
        description: "Main hero section title",
        translations: { en: "Find Local Businesses", es: "Encuentra Negocios Locales" }
      },
      {
        stringKey: "homepage.hero.subtitle",
        defaultValue: "Discover and connect with trusted local businesses in your area. From restaurants to services, we've got you covered.",
        category: "homepage",
        description: "Hero section subtitle",
        translations: { en: "Discover and connect with trusted local businesses in your area. From restaurants to services, we've got you covered.", es: "Descubre y conecta con negocios locales confiables en tu área. Desde restaurantes hasta servicios, te tenemos cubierto." }
      },
      {
        stringKey: "homepage.categories.title",
        defaultValue: "Browse by Category",
        category: "homepage",
        description: "Categories section title",
        translations: { en: "Browse by Category", es: "Navegar por Categoría" }
      },
      {
        stringKey: "homepage.categories.subtitle",
        defaultValue: "Explore businesses across different industries and find exactly what you need.",
        category: "homepage",
        description: "Categories section subtitle",
        translations: { en: "Explore businesses across different industries and find exactly what you need.", es: "Explora negocios en diferentes industrias y encuentra exactamente lo que necesitas." }
      },
      {
        stringKey: "homepage.categories.error.title",
        defaultValue: "Unable to load categories",
        category: "homepage",
        description: "Categories error fallback title",
        translations: { en: "Unable to load categories", es: "No se pudieron cargar las categorías" }
      },
      {
        stringKey: "homepage.categories.error.message",
        defaultValue: "We're having trouble loading business categories. Please try again.",
        category: "homepage",
        description: "Categories error fallback message",
        translations: { en: "We're having trouble loading business categories. Please try again.", es: "Tenemos problemas cargando las categorías de negocios. Inténtalo de nuevo." }
      },
      {
        stringKey: "homepage.categories.error.unable",
        defaultValue: "Unable to load categories",
        category: "homepage",
        description: "Categories error unable message",
        translations: { en: "Unable to load categories", es: "No se pudieron cargar las categorías" }
      },
      {
        stringKey: "homepage.categories.error.retry",
        defaultValue: "Try Again",
        category: "homepage",
        description: "Categories error retry button",
        translations: { en: "Try Again", es: "Intentar de Nuevo" }
      },
      {
        stringKey: "homepage.features.title",
        defaultValue: "Why Choose BusinessHub?",
        category: "homepage",
        description: "Features section title",
        translations: { en: "Why Choose BusinessHub?", es: "¿Por qué Elegir BusinessHub?" }
      },
      {
        stringKey: "homepage.features.feature1.title",
        defaultValue: "Verified Businesses",
        category: "homepage",
        description: "Feature 1 title",
        translations: { en: "Verified Businesses", es: "Negocios Verificados" }
      },
      {
        stringKey: "homepage.features.feature1.description",
        defaultValue: "All businesses on our platform are verified and trusted by our community of users.",
        category: "homepage",
        description: "Feature 1 description",
        translations: { en: "All businesses on our platform are verified and trusted by our community of users.", es: "Todos los negocios en nuestra plataforma están verificados y son confiables por nuestra comunidad de usuarios." }
      },
      {
        stringKey: "homepage.features.feature2.title",
        defaultValue: "Real Reviews",
        category: "homepage",
        description: "Feature 2 title",
        translations: { en: "Real Reviews", es: "Reseñas Reales" }
      },
      {
        stringKey: "homepage.features.feature2.description",
        defaultValue: "Read authentic reviews from real customers to make informed decisions about local services.",
        category: "homepage",
        description: "Feature 2 description",
        translations: { en: "Read authentic reviews from real customers to make informed decisions about local services.", es: "Lee reseñas auténticas de clientes reales para tomar decisiones informadas sobre servicios locales." }
      },
      {
        stringKey: "homepage.features.feature3.title",
        defaultValue: "Top Quality",
        category: "homepage",
        description: "Feature 3 title",
        translations: { en: "Top Quality", es: "Máxima Calidad" }
      },
      {
        stringKey: "homepage.features.feature3.description",
        defaultValue: "We only feature high-quality businesses that meet our strict standards for excellence.",
        category: "homepage",
        description: "Feature 3 description",
        translations: { en: "We only feature high-quality businesses that meet our strict standards for excellence.", es: "Solo presentamos negocios de alta calidad que cumplen con nuestros estrictos estándares de excelencia." }
      },
      {
        stringKey: "homepage.featured.title",
        defaultValue: "Featured Businesses",
        category: "homepage",
        description: "Featured section title",
        translations: { en: "Featured Businesses", es: "Negocios Destacados" }
      },
      {
        stringKey: "homepage.featured.subtitle",
        defaultValue: "Discover top-rated businesses handpicked for their exceptional service and quality.",
        category: "homepage",
        description: "Featured section subtitle",
        translations: { en: "Discover top-rated businesses handpicked for their exceptional service and quality.", es: "Descubre negocios mejor calificados seleccionados por su servicio excepcional y calidad." }
      },
      {
        stringKey: "homepage.featured.error.title",
        defaultValue: "Unable to load featured businesses",
        category: "homepage",
        description: "Featured error title",
        translations: { en: "Unable to load featured businesses", es: "No se pudieron cargar los negocios destacados" }
      },
      {
        stringKey: "homepage.featured.error.message",
        defaultValue: "We're having trouble loading featured businesses. Please try again.",
        category: "homepage",
        description: "Featured error message",
        translations: { en: "We're having trouble loading featured businesses. Please try again.", es: "Tenemos problemas cargando los negocios destacados. Inténtalo de nuevo." }
      },
      {
        stringKey: "homepage.featured.error.unable",
        defaultValue: "Unable to load featured businesses",
        category: "homepage",
        description: "Featured error unable message",
        translations: { en: "Unable to load featured businesses", es: "No se pudieron cargar los negocios destacados" }
      },
      {
        stringKey: "homepage.featured.error.retry",
        defaultValue: "Try Again",
        category: "homepage",
        description: "Featured error retry button",
        translations: { en: "Try Again", es: "Intentar de Nuevo" }
      },
      {
        stringKey: "homepage.featured.empty",
        defaultValue: "No featured businesses available",
        category: "homepage",
        description: "Featured empty state message",
        translations: { en: "No featured businesses available", es: "No hay negocios destacados disponibles" }
      },
      {
        stringKey: "homepage.latest.title",
        defaultValue: "Latest Businesses",
        category: "homepage",
        description: "Latest businesses section title",
        translations: { en: "Latest Businesses", es: "Negocios Recientes" }
      },
      {
        stringKey: "homepage.latest.subtitle",
        defaultValue: "Discover amazing businesses from our directory with excellent reviews and service.",
        category: "homepage",
        description: "Latest businesses section subtitle",
        translations: { en: "Discover amazing businesses from our directory with excellent reviews and service.", es: "Descubre negocios increíbles de nuestro directorio con excelentes reseñas y servicio." }
      },
      {
        stringKey: "homepage.latest.button",
        defaultValue: "View All Businesses",
        category: "homepage",
        description: "Latest businesses view all button",
        translations: { en: "View All Businesses", es: "Ver Todos los Negocios" }
      },
      {
        stringKey: "homepage.cta.title",
        defaultValue: "Are You a Business Owner?",
        category: "homepage",
        description: "Business owner CTA title",
        translations: { en: "Are You a Business Owner?", es: "¿Eres Propietario de un Negocio?" }
      },
      {
        stringKey: "homepage.cta.subtitle",
        defaultValue: "Join thousands of businesses already listed on BusinessHub. Increase your visibility and connect with more customers today.",
        category: "homepage",
        description: "Business owner CTA subtitle",
        translations: { en: "Join thousands of businesses already listed on BusinessHub. Increase your visibility and connect with more customers today.", es: "Únete a miles de negocios ya listados en BusinessHub. Aumenta tu visibilidad y conecta con más clientes hoy." }
      },
      {
        stringKey: "homepage.cta.primaryButton",
        defaultValue: "List Your Business",
        category: "homepage",
        description: "CTA primary button text",
        translations: { en: "List Your Business", es: "Lista Tu Negocio" }
      },
      {
        stringKey: "homepage.cta.secondaryButton",
        defaultValue: "Learn More",
        category: "homepage",
        description: "CTA secondary button text",
        translations: { en: "Learn More", es: "Aprender Más" }
      },
      {
        stringKey: "homepage.stats.businesses.label",
        defaultValue: "Local Businesses",
        category: "homepage",
        description: "Stats businesses label",
        translations: { en: "Local Businesses", es: "Negocios Locales" }
      },
      {
        stringKey: "homepage.stats.reviews.label",
        defaultValue: "Customer Reviews",
        category: "homepage",
        description: "Stats reviews label",
        translations: { en: "Customer Reviews", es: "Reseñas de Clientes" }
      },
      {
        stringKey: "homepage.stats.reviews.value",
        defaultValue: "89,234",
        category: "homepage",
        description: "Stats reviews value",
        translations: { en: "89,234", es: "89,234" }
      },
      {
        stringKey: "homepage.stats.categories.label",
        defaultValue: "Business Categories",
        category: "homepage",
        description: "Stats categories label",
        translations: { en: "Business Categories", es: "Categorías de Negocios" }
      },
      {
        stringKey: "homepage.stats.cities.label",
        defaultValue: "Cities Covered",
        category: "homepage",
        description: "Stats cities label",
        translations: { en: "Cities Covered", es: "Ciudades Cubiertas" }
      },
      {
        stringKey: "homepage.stats.cities.value",
        defaultValue: "150+",
        category: "homepage",
        description: "Stats cities value",
        translations: { en: "150+", es: "150+" }
      }
    ];

    // Insert initial strings using Drizzle ORM
    for (const stringData of initialStrings) {
      await db.insert(contentStrings)
        .values({
          stringKey: stringData.stringKey,
          defaultValue: stringData.defaultValue,
          category: stringData.category,
          description: stringData.description,
          translations: stringData.translations,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .onConflictDoNothing();
    }

    console.log(`Successfully seeded ${initialStrings.length} initial content strings`);
    return true;
  } catch (error) {
    console.error("Error seeding content strings:", error);
    throw error;
  }
}

// Run migration if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createContentStringsTable()
    .then(() => seedInitialContentStrings())
    .then(() => {
      console.log("Content strings migration completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Migration failed:", error);
      process.exit(1);
    });
}