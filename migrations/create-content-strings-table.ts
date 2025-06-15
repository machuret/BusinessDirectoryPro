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

      // Dashboard Content
      {
        stringKey: "dashboard.page.title",
        defaultValue: "Business Dashboard",
        category: "dashboard",
        description: "Main dashboard page title",
        translations: { en: "Business Dashboard", es: "Panel de Negocios" }
      },
      {
        stringKey: "dashboard.page.subtitle",
        defaultValue: "Manage your businesses and ownership claims",
        category: "dashboard",
        description: "Main dashboard page subtitle",
        translations: { en: "Manage your businesses and ownership claims", es: "Gestiona tus negocios y reclamos de propiedad" }
      },
      {
        stringKey: "dashboard.access.denied.title",
        defaultValue: "Access Denied",
        category: "dashboard",
        description: "Access denied card title",
        translations: { en: "Access Denied", es: "Acceso Denegado" }
      },
      {
        stringKey: "dashboard.access.denied.message",
        defaultValue: "Please log in to access your dashboard.",
        category: "dashboard",
        description: "Access denied message",
        translations: { en: "Please log in to access your dashboard.", es: "Por favor inicia sesión para acceder a tu panel." }
      },
      {
        stringKey: "dashboard.tabs.businesses",
        defaultValue: "My Businesses",
        category: "dashboard",
        description: "Businesses tab label",
        translations: { en: "My Businesses", es: "Mis Negocios" }
      },
      {
        stringKey: "dashboard.tabs.claims",
        defaultValue: "Ownership Claims",
        category: "dashboard",
        description: "Claims tab label",
        translations: { en: "Ownership Claims", es: "Reclamos de Propiedad" }
      },
      {
        stringKey: "dashboard.tabs.featured",
        defaultValue: "Featured Requests",
        category: "dashboard",
        description: "Featured requests tab label",
        translations: { en: "Featured Requests", es: "Solicitudes Destacadas" }
      },
      {
        stringKey: "dashboard.businesses.title",
        defaultValue: "Your Businesses",
        category: "dashboard",
        description: "Businesses section title",
        translations: { en: "Your Businesses", es: "Tus Negocios" }
      },
      {
        stringKey: "dashboard.businesses.description",
        defaultValue: "Manage your business listings",
        category: "dashboard",
        description: "Businesses section description",
        translations: { en: "Manage your business listings", es: "Gestiona tus listados de negocios" }
      },
      {
        stringKey: "dashboard.businesses.loading",
        defaultValue: "Loading your businesses...",
        category: "dashboard",
        description: "Businesses loading message",
        translations: { en: "Loading your businesses...", es: "Cargando tus negocios..." }
      },
      {
        stringKey: "dashboard.businesses.table.name",
        defaultValue: "Business Name",
        category: "dashboard",
        description: "Business table name column",
        translations: { en: "Business Name", es: "Nombre del Negocio" }
      },
      {
        stringKey: "dashboard.businesses.table.location",
        defaultValue: "Location",
        category: "dashboard",
        description: "Business table location column",
        translations: { en: "Location", es: "Ubicación" }
      },
      {
        stringKey: "dashboard.businesses.table.rating",
        defaultValue: "Rating",
        category: "dashboard",
        description: "Business table rating column",
        translations: { en: "Rating", es: "Calificación" }
      },
      {
        stringKey: "dashboard.businesses.table.status",
        defaultValue: "Status",
        category: "dashboard",
        description: "Business table status column",
        translations: { en: "Status", es: "Estado" }
      },
      {
        stringKey: "dashboard.businesses.table.actions",
        defaultValue: "Actions",
        category: "dashboard",
        description: "Business table actions column",
        translations: { en: "Actions", es: "Acciones" }
      },
      {
        stringKey: "dashboard.businesses.rating.none",
        defaultValue: "No ratings",
        category: "dashboard",
        description: "No ratings available text",
        translations: { en: "No ratings", es: "Sin calificaciones" }
      },
      {
        stringKey: "dashboard.businesses.status.featured",
        defaultValue: "Featured",
        category: "dashboard",
        description: "Featured business status",
        translations: { en: "Featured", es: "Destacado" }
      },
      {
        stringKey: "dashboard.businesses.status.standard",
        defaultValue: "Standard",
        category: "dashboard",
        description: "Standard business status",
        translations: { en: "Standard", es: "Estándar" }
      },
      {
        stringKey: "dashboard.businesses.action.edit",
        defaultValue: "Edit",
        category: "dashboard",
        description: "Edit business button",
        translations: { en: "Edit", es: "Editar" }
      },
      {
        stringKey: "dashboard.businesses.edit.title",
        defaultValue: "Edit Business",
        category: "dashboard",
        description: "Edit business dialog title prefix",
        translations: { en: "Edit Business", es: "Editar Negocio" }
      },
      {
        stringKey: "dashboard.businesses.tabs.basic",
        defaultValue: "Basic Info",
        category: "dashboard",
        description: "Basic info tab",
        translations: { en: "Basic Info", es: "Información Básica" }
      },
      {
        stringKey: "dashboard.businesses.tabs.contact",
        defaultValue: "Contact & Hours",
        category: "dashboard",
        description: "Contact and hours tab",
        translations: { en: "Contact & Hours", es: "Contacto y Horarios" }
      },
      {
        stringKey: "dashboard.businesses.tabs.photos",
        defaultValue: "Photos",
        category: "dashboard",
        description: "Photos tab",
        translations: { en: "Photos", es: "Fotos" }
      },
      {
        stringKey: "dashboard.businesses.tabs.faqs",
        defaultValue: "FAQs",
        category: "dashboard",
        description: "FAQs tab",
        translations: { en: "FAQs", es: "Preguntas Frecuentes" }
      },
      {
        stringKey: "dashboard.businesses.form.name.label",
        defaultValue: "Business Name",
        category: "dashboard",
        description: "Business name form label",
        translations: { en: "Business Name", es: "Nombre del Negocio" }
      },
      {
        stringKey: "dashboard.businesses.form.name.placeholder",
        defaultValue: "Enter your business name",
        category: "dashboard",
        description: "Business name form placeholder",
        translations: { en: "Enter your business name", es: "Ingresa el nombre de tu negocio" }
      },
      {
        stringKey: "dashboard.businesses.form.description.label",
        defaultValue: "Business Description",
        category: "dashboard",
        description: "Business description form label",
        translations: { en: "Business Description", es: "Descripción del Negocio" }
      },
      {
        stringKey: "dashboard.businesses.form.description.placeholder",
        defaultValue: "Describe your business, services, and what makes you unique...",
        category: "dashboard",
        description: "Business description form placeholder",
        translations: { en: "Describe your business, services, and what makes you unique...", es: "Describe tu negocio, servicios y lo que te hace único..." }
      },
      {
        stringKey: "dashboard.businesses.form.address.label",
        defaultValue: "Business Address",
        category: "dashboard",
        description: "Business address form label",
        translations: { en: "Business Address", es: "Dirección del Negocio" }
      },
      {
        stringKey: "dashboard.businesses.form.address.placeholder",
        defaultValue: "123 Main Street, City, State ZIP",
        category: "dashboard",
        description: "Business address form placeholder",
        translations: { en: "123 Main Street, City, State ZIP", es: "Calle Principal 123, Ciudad, Estado, CP" }
      },
      {
        stringKey: "dashboard.businesses.form.phone.label",
        defaultValue: "Phone Number",
        category: "dashboard",
        description: "Phone number form label",
        translations: { en: "Phone Number", es: "Número de Teléfono" }
      },
      {
        stringKey: "dashboard.businesses.form.phone.placeholder",
        defaultValue: "(555) 123-4567",
        category: "dashboard",
        description: "Phone number form placeholder",
        translations: { en: "(555) 123-4567", es: "(555) 123-4567" }
      },
      {
        stringKey: "dashboard.businesses.form.website.label",
        defaultValue: "Website URL",
        category: "dashboard",
        description: "Website URL form label",
        translations: { en: "Website URL", es: "URL del Sitio Web" }
      },
      {
        stringKey: "dashboard.businesses.form.website.placeholder",
        defaultValue: "https://yourwebsite.com",
        category: "dashboard",
        description: "Website URL form placeholder",
        translations: { en: "https://yourwebsite.com", es: "https://tusitio.com" }
      },
      {
        stringKey: "dashboard.businesses.hours.title",
        defaultValue: "Business Hours & Contact Info",
        category: "dashboard",
        description: "Business hours section title",
        translations: { en: "Business Hours & Contact Info", es: "Horarios y Contacto del Negocio" }
      },
      {
        stringKey: "dashboard.businesses.hours.description",
        defaultValue: "To update your business hours, contact information, and other detailed information, please contact our support team. Basic business details can be edited here.",
        category: "dashboard",
        description: "Business hours section description",
        translations: { en: "To update your business hours, contact information, and other detailed information, please contact our support team. Basic business details can be edited here.", es: "Para actualizar los horarios, información de contacto y otros detalles, por favor contacta a nuestro equipo de soporte. Los detalles básicos se pueden editar aquí." }
      },
      {
        stringKey: "dashboard.businesses.photos.title",
        defaultValue: "Photo Gallery",
        category: "dashboard",
        description: "Photo gallery title",
        translations: { en: "Photo Gallery", es: "Galería de Fotos" }
      },
      {
        stringKey: "dashboard.businesses.photos.description",
        defaultValue: "Manage your business photos to showcase your services and location.",
        category: "dashboard",
        description: "Photo gallery description",
        translations: { en: "Manage your business photos to showcase your services and location.", es: "Gestiona las fotos de tu negocio para mostrar tus servicios y ubicación." }
      },
      {
        stringKey: "dashboard.businesses.photos.upload",
        defaultValue: "Upload Photos",
        category: "dashboard",
        description: "Upload photos button",
        translations: { en: "Upload Photos", es: "Subir Fotos" }
      },
      {
        stringKey: "dashboard.businesses.photos.uploading",
        defaultValue: "Uploading...",
        category: "dashboard",
        description: "Uploading photos status",
        translations: { en: "Uploading...", es: "Subiendo..." }
      },
      {
        stringKey: "dashboard.businesses.photos.empty.title",
        defaultValue: "No photos yet",
        category: "dashboard",
        description: "Empty photos state title",
        translations: { en: "No photos yet", es: "Sin fotos aún" }
      },
      {
        stringKey: "dashboard.businesses.photos.empty.description",
        defaultValue: "Upload photos to showcase your business",
        category: "dashboard",
        description: "Empty photos state description",
        translations: { en: "Upload photos to showcase your business", es: "Sube fotos para mostrar tu negocio" }
      },
      {
        stringKey: "dashboard.businesses.photos.first",
        defaultValue: "Upload Your First Photo",
        category: "dashboard",
        description: "Upload first photo button",
        translations: { en: "Upload Your First Photo", es: "Sube Tu Primera Foto" }
      },
      {
        stringKey: "dashboard.businesses.photos.alt",
        defaultValue: "Business photo",
        category: "dashboard",
        description: "Business photo alt text prefix",
        translations: { en: "Business photo", es: "Foto del negocio" }
      },
      {
        stringKey: "dashboard.businesses.photos.tips.title",
        defaultValue: "Photo Management Tips",
        category: "dashboard",
        description: "Photo tips section title",
        translations: { en: "Photo Management Tips", es: "Consejos para Gestión de Fotos" }
      },
      {
        stringKey: "dashboard.businesses.photos.tips.quality",
        defaultValue: "High-quality photos help attract more customers",
        category: "dashboard",
        description: "Photo tip 1",
        translations: { en: "High-quality photos help attract more customers", es: "Las fotos de alta calidad ayudan a atraer más clientes" }
      },
      {
        stringKey: "dashboard.businesses.photos.tips.showcase",
        defaultValue: "Show your business interior, exterior, products, and services",
        category: "dashboard",
        description: "Photo tip 2",
        translations: { en: "Show your business interior, exterior, products, and services", es: "Muestra el interior, exterior, productos y servicios de tu negocio" }
      },
      {
        stringKey: "dashboard.businesses.photos.tips.recent",
        defaultValue: "Keep photos recent and representative of your current business",
        category: "dashboard",
        description: "Photo tip 3",
        translations: { en: "Keep photos recent and representative of your current business", es: "Mantén las fotos recientes y representativas de tu negocio actual" }
      },
      {
        stringKey: "dashboard.businesses.photos.tips.quality_control",
        defaultValue: "Remove any photos that are outdated or low quality",
        category: "dashboard",
        description: "Photo tip 4",
        translations: { en: "Remove any photos that are outdated or low quality", es: "Elimina las fotos desactualizadas o de baja calidad" }
      },
      {
        stringKey: "dashboard.businesses.faqs.title",
        defaultValue: "Frequently Asked Questions",
        category: "dashboard",
        description: "FAQs section title",
        translations: { en: "Frequently Asked Questions", es: "Preguntas Frecuentes" }
      },
      {
        stringKey: "dashboard.businesses.faqs.description",
        defaultValue: "Help customers by answering common questions about your business.",
        category: "dashboard",
        description: "FAQs section description",
        translations: { en: "Help customers by answering common questions about your business.", es: "Ayuda a los clientes respondiendo preguntas comunes sobre tu negocio." }
      },
      {
        stringKey: "dashboard.businesses.faqs.add",
        defaultValue: "Add FAQ",
        category: "dashboard",
        description: "Add FAQ button",
        translations: { en: "Add FAQ", es: "Agregar Pregunta" }
      },
      {
        stringKey: "dashboard.businesses.faqs.empty.title",
        defaultValue: "No FAQs added yet",
        category: "dashboard",
        description: "Empty FAQs state title",
        translations: { en: "No FAQs added yet", es: "Sin preguntas frecuentes aún" }
      },
      {
        stringKey: "dashboard.businesses.faqs.empty.description",
        defaultValue: "Click \"Add FAQ\" to create your first question and answer",
        category: "dashboard",
        description: "Empty FAQs state description",
        translations: { en: "Click \"Add FAQ\" to create your first question and answer", es: "Haz clic en \"Agregar Pregunta\" para crear tu primera pregunta y respuesta" }
      },
      {
        stringKey: "dashboard.businesses.faqs.question.label",
        defaultValue: "Question",
        category: "dashboard",
        description: "FAQ question label",
        translations: { en: "Question", es: "Pregunta" }
      },
      {
        stringKey: "dashboard.businesses.faqs.question.placeholder",
        defaultValue: "Enter your question (e.g., What are your business hours?)",
        category: "dashboard",
        description: "FAQ question placeholder",
        translations: { en: "Enter your question (e.g., What are your business hours?)", es: "Ingresa tu pregunta (ej: ¿Cuáles son los horarios del negocio?)" }
      },
      {
        stringKey: "dashboard.businesses.faqs.answer.label",
        defaultValue: "Answer",
        category: "dashboard",
        description: "FAQ answer label",
        translations: { en: "Answer", es: "Respuesta" }
      },
      {
        stringKey: "dashboard.businesses.faqs.answer.placeholder",
        defaultValue: "Provide a helpful answer to this question...",
        category: "dashboard",
        description: "FAQ answer placeholder",
        translations: { en: "Provide a helpful answer to this question...", es: "Proporciona una respuesta útil a esta pregunta..." }
      },
      {
        stringKey: "dashboard.businesses.actions.cancel",
        defaultValue: "Cancel",
        category: "dashboard",
        description: "Cancel button",
        translations: { en: "Cancel", es: "Cancelar" }
      },
      {
        stringKey: "dashboard.businesses.actions.update",
        defaultValue: "Update Business",
        category: "dashboard",
        description: "Update business button",
        translations: { en: "Update Business", es: "Actualizar Negocio" }
      },
      {
        stringKey: "dashboard.businesses.actions.updating",
        defaultValue: "Updating...",
        category: "dashboard",
        description: "Updating business status",
        translations: { en: "Updating...", es: "Actualizando..." }
      },
      {
        stringKey: "dashboard.businesses.empty.title",
        defaultValue: "No businesses found",
        category: "dashboard",
        description: "Empty businesses state title",
        translations: { en: "No businesses found", es: "No se encontraron negocios" }
      },
      {
        stringKey: "dashboard.businesses.empty.description",
        defaultValue: "You don't own any business listings yet.",
        category: "dashboard",
        description: "Empty businesses state description",
        translations: { en: "You don't own any business listings yet.", es: "Aún no tienes listados de negocios." }
      },
      {
        stringKey: "dashboard.claims.title",
        defaultValue: "Ownership Claims",
        category: "dashboard",
        description: "Claims section title",
        translations: { en: "Ownership Claims", es: "Reclamos de Propiedad" }
      },
      {
        stringKey: "dashboard.claims.description",
        defaultValue: "Track your business ownership claim requests",
        category: "dashboard",
        description: "Claims section description",
        translations: { en: "Track your business ownership claim requests", es: "Rastrea tus solicitudes de reclamo de propiedad" }
      },
      {
        stringKey: "dashboard.claims.status.pending",
        defaultValue: "Pending",
        category: "dashboard",
        description: "Pending claim status",
        translations: { en: "Pending", es: "Pendiente" }
      },
      {
        stringKey: "dashboard.claims.status.approved",
        defaultValue: "Approved",
        category: "dashboard",
        description: "Approved claim status",
        translations: { en: "Approved", es: "Aprobado" }
      },
      {
        stringKey: "dashboard.claims.status.rejected",
        defaultValue: "Rejected",
        category: "dashboard",
        description: "Rejected claim status",
        translations: { en: "Rejected", es: "Rechazado" }
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