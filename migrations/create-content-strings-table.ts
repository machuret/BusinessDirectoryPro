import { db } from "../server/db";
import { contentStrings } from "@shared/schema";

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