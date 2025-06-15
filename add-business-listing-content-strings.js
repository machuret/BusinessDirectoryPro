/**
 * Script to add business listing page content strings to the database
 * This ensures all the new CMS strings for business listing components work properly
 */

import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function addBusinessListingContentStrings() {
  console.log('Adding business listing content strings...');
  
  const contentStrings = [
    // BusinessHeader component
    { key: 'business.header.featured', value_en: 'Featured', value_es: 'Destacado' },
    { key: 'business.header.directions', value_en: 'Directions', value_es: 'Direcciones' },
    { key: 'business.header.share', value_en: 'Share', value_es: 'Compartir' },
    { key: 'business.header.save', value_en: 'Save', value_es: 'Guardar' },
    { key: 'business.header.claimBusiness', value_en: 'Claim Business', value_es: 'Reclamar Negocio' },
    { key: 'business.header.noRating', value_en: 'No rating', value_es: 'Sin calificación' },
    
    // BusinessContent component
    { key: 'business.content.aboutThisBusiness', value_en: 'About This Business', value_es: 'Acerca de Este Negocio' },
    { key: 'business.content.photoGallery', value_en: 'Photo Gallery', value_es: 'Galería de Fotos' },
    { key: 'business.content.amenitiesFeatures', value_en: 'Amenities & Features', value_es: 'Comodidades y Características' },
    { key: 'business.content.contactInformation', value_en: 'Contact Information', value_es: 'Información de Contacto' },
    { key: 'business.content.visitWebsite', value_en: 'Visit Website', value_es: 'Visitar Sitio Web' },
    { key: 'business.content.openingHours', value_en: 'Opening Hours', value_es: 'Horarios de Atención' },
    { key: 'business.content.accessibility', value_en: 'Accessibility', value_es: 'Accesibilidad' },
    { key: 'business.content.closed', value_en: 'Closed', value_es: 'Cerrado' },
    
    // BusinessInteractions component
    { key: 'business.reviews.title', value_en: 'Customer Reviews', value_es: 'Reseñas de Clientes' },
    { key: 'business.reviews.writeReview', value_en: 'Write Review', value_es: 'Escribir Reseña' },
    { key: 'business.reviews.noReviewsYet', value_en: 'No reviews yet', value_es: 'Aún no hay reseñas' },
    { key: 'business.reviews.beFirstToReview', value_en: 'Be the first to review this business!', value_es: '¡Sé el primero en reseñar este negocio!' },
    { key: 'business.reviews.writeFirstReview', value_en: 'Write First Review', value_es: 'Escribir Primera Reseña' },
    { key: 'business.reviews.anonymous', value_en: 'Anonymous', value_es: 'Anónimo' },
    { key: 'business.reviews.unknownDate', value_en: 'Unknown date', value_es: 'Fecha desconocida' },
    
    // BusinessContactInfo component
    { key: 'business.contact.title', value_en: 'Contact Information', value_es: 'Información de Contacto' },
    { key: 'business.contact.category', value_en: 'Category', value_es: 'Categoría' },
    { key: 'business.contact.address', value_en: 'Address', value_es: 'Dirección' },
    { key: 'business.contact.getDirections', value_en: 'Get Directions', value_es: 'Obtener Direcciones' },
    { key: 'business.contact.phone', value_en: 'Phone', value_es: 'Teléfono' },
    { key: 'business.contact.website', value_en: 'Website', value_es: 'Sitio Web' },
    { key: 'business.contact.email', value_en: 'Email', value_es: 'Correo Electrónico' },
    { key: 'business.contact.visitWebsite', value_en: 'Visit Website', value_es: 'Visitar Sitio Web' },
    
    // BusinessHours component
    { key: 'business.hours.title', value_en: 'Hours of Operation', value_es: 'Horarios de Operación' },
    { key: 'business.hours.monday', value_en: 'Monday', value_es: 'Lunes' },
    { key: 'business.hours.tuesday', value_en: 'Tuesday', value_es: 'Martes' },
    { key: 'business.hours.wednesday', value_en: 'Wednesday', value_es: 'Miércoles' },
    { key: 'business.hours.thursday', value_en: 'Thursday', value_es: 'Jueves' },
    { key: 'business.hours.friday', value_en: 'Friday', value_es: 'Viernes' },
    { key: 'business.hours.saturday', value_en: 'Saturday', value_es: 'Sábado' },
    { key: 'business.hours.sunday', value_en: 'Sunday', value_es: 'Domingo' },
    { key: 'business.hours.closed', value_en: 'Closed', value_es: 'Cerrado' },
    
    // BusinessFAQ component
    { key: 'business.faq.title', value_en: 'Frequently Asked Questions', value_es: 'Preguntas Frecuentes' },
    { key: 'business.faq.noFaqYet', value_en: 'No FAQ available yet', value_es: 'Aún no hay preguntas frecuentes disponibles' },
    
    // BusinessReviews component
    { key: 'business.reviews.rating', value_en: 'Rating', value_es: 'Calificación' },
    { key: 'business.reviews.outOfFive', value_en: 'out of 5', value_es: 'de 5' },
    { key: 'business.reviews.reviewsCount', value_en: 'reviews', value_es: 'reseñas' },
    { key: 'business.reviews.oneReview', value_en: 'review', value_es: 'reseña' },
    
    // Loading and error states
    { key: 'business.loading.businessDetails', value_en: 'Loading business details...', value_es: 'Cargando detalles del negocio...' },
    { key: 'business.error.businessNotFound', value_en: 'Business not found', value_es: 'Negocio no encontrado' },
    { key: 'business.error.loadingFailed', value_en: 'Failed to load business information', value_es: 'Error al cargar información del negocio' },
    
    // Photo gallery
    { key: 'business.gallery.photoAlt', value_en: 'Photo', value_es: 'Foto' },
    { key: 'business.gallery.viewImage', value_en: 'View image', value_es: 'Ver imagen' },
    
    // Action buttons
    { key: 'business.actions.callNow', value_en: 'Call Now', value_es: 'Llamar Ahora' },
    { key: 'business.actions.viewMenu', value_en: 'View Menu', value_es: 'Ver Menú' },
    { key: 'business.actions.bookNow', value_en: 'Book Now', value_es: 'Reservar Ahora' },
    
    // Business description
    { key: 'business.description.title', value_en: 'About', value_es: 'Acerca de' },
    { key: 'business.description.readMore', value_en: 'Read More', value_es: 'Leer Más' },
    { key: 'business.description.readLess', value_en: 'Read Less', value_es: 'Leer Menos' }
  ];

  try {
    for (const content of contentStrings) {
      await pool.query(`
        INSERT INTO content_strings (key, value_en, value_es, category, description)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (key) DO UPDATE SET
          value_en = EXCLUDED.value_en,
          value_es = EXCLUDED.value_es,
          updated_at = CURRENT_TIMESTAMP
      `, [
        content.key,
        content.value_en,
        content.value_es,
        'business_listing',
        `Business listing page content: ${content.key}`
      ]);
    }

    console.log(`✅ Successfully added ${contentStrings.length} business listing content strings`);
    
    // Verify the strings were added
    const result = await pool.query(
      "SELECT COUNT(*) as count FROM content_strings WHERE category = 'business_listing'"
    );
    
    console.log(`📊 Total business listing strings in database: ${result.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Error adding business listing content strings:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the script
addBusinessListingContentStrings();