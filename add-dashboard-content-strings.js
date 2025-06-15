/**
 * Script to add dashboard component content strings to the database
 * This ensures all the new CMS strings for ClaimsSection and FeaturedRequestsSection work properly
 */

import { Pool } from 'pg';

async function addDashboardContentStrings() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Adding dashboard component content strings...');

    const newStrings = [
      // ClaimsSection strings
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
        translations: { en: "Track your business ownership claim requests", es: "Rastrea tus solicitudes de reclamo de propiedad de negocio" }
      },
      {
        stringKey: "dashboard.claims.status.pending",
        defaultValue: "Pending",
        category: "dashboard",
        description: "Claims status pending",
        translations: { en: "Pending", es: "Pendiente" }
      },
      {
        stringKey: "dashboard.claims.status.approved",
        defaultValue: "Approved",
        category: "dashboard",
        description: "Claims status approved",
        translations: { en: "Approved", es: "Aprobado" }
      },
      {
        stringKey: "dashboard.claims.status.rejected",
        defaultValue: "Rejected",
        category: "dashboard",
        description: "Claims status rejected",
        translations: { en: "Rejected", es: "Rechazado" }
      },
      {
        stringKey: "dashboard.claims.table.business",
        defaultValue: "Business Name",
        category: "dashboard",
        description: "Claims table business column",
        translations: { en: "Business Name", es: "Nombre del Negocio" }
      },
      {
        stringKey: "dashboard.claims.table.date",
        defaultValue: "Submitted Date",
        category: "dashboard",
        description: "Claims table date column",
        translations: { en: "Submitted Date", es: "Fecha de Envío" }
      },
      {
        stringKey: "dashboard.claims.table.status",
        defaultValue: "Status",
        category: "dashboard",
        description: "Claims table status column",
        translations: { en: "Status", es: "Estado" }
      },
      {
        stringKey: "dashboard.claims.table.message",
        defaultValue: "Message",
        category: "dashboard",
        description: "Claims table message column",
        translations: { en: "Message", es: "Mensaje" }
      },
      {
        stringKey: "dashboard.claims.table.unknown",
        defaultValue: "Unknown",
        category: "dashboard",
        description: "Claims table unknown value",
        translations: { en: "Unknown", es: "Desconocido" }
      },
      {
        stringKey: "dashboard.claims.table.nomessage",
        defaultValue: "No message",
        category: "dashboard",
        description: "Claims table no message value",
        translations: { en: "No message", es: "Sin mensaje" }
      },
      {
        stringKey: "dashboard.claims.empty.title",
        defaultValue: "No ownership claims",
        category: "dashboard",
        description: "Claims empty state title",
        translations: { en: "No ownership claims", es: "Sin reclamos de propiedad" }
      },
      {
        stringKey: "dashboard.claims.empty.description",
        defaultValue: "You haven't submitted any business ownership claims yet.",
        category: "dashboard",
        description: "Claims empty state description",
        translations: { en: "You haven't submitted any business ownership claims yet.", es: "Aún no has enviado ningún reclamo de propiedad de negocio." }
      },

      // FeaturedRequestsSection strings
      {
        stringKey: "dashboard.featured.title",
        defaultValue: "Featured Requests",
        category: "dashboard",
        description: "Featured requests section title",
        translations: { en: "Featured Requests", es: "Solicitudes Destacadas" }
      },
      {
        stringKey: "dashboard.featured.description",
        defaultValue: "Request to have your businesses featured in our directory for increased visibility.",
        category: "dashboard",
        description: "Featured requests section description",
        translations: { en: "Request to have your businesses featured in our directory for increased visibility.", es: "Solicita que tus negocios aparezcan destacados en nuestro directorio para mayor visibilidad." }
      },
      {
        stringKey: "dashboard.featured.request.success.title",
        defaultValue: "Request Submitted",
        category: "dashboard",
        description: "Featured request success toast title",
        translations: { en: "Request Submitted", es: "Solicitud Enviada" }
      },
      {
        stringKey: "dashboard.featured.request.success.description",
        defaultValue: "Your featured request has been submitted for review.",
        category: "dashboard",
        description: "Featured request success toast description",
        translations: { en: "Your featured request has been submitted for review.", es: "Tu solicitud destacada ha sido enviada para revisión." }
      },
      {
        stringKey: "dashboard.featured.request.error.title",
        defaultValue: "Request Failed",
        category: "dashboard",
        description: "Featured request error toast title",
        translations: { en: "Request Failed", es: "Solicitud Fallida" }
      },
      {
        stringKey: "dashboard.featured.status.pending",
        defaultValue: "Pending",
        category: "dashboard",
        description: "Featured request status pending",
        translations: { en: "Pending", es: "Pendiente" }
      },
      {
        stringKey: "dashboard.featured.status.approved",
        defaultValue: "Approved",
        category: "dashboard",
        description: "Featured request status approved",
        translations: { en: "Approved", es: "Aprobado" }
      },
      {
        stringKey: "dashboard.featured.status.rejected",
        defaultValue: "Rejected",
        category: "dashboard",
        description: "Featured request status rejected",
        translations: { en: "Rejected", es: "Rechazado" }
      },
      {
        stringKey: "dashboard.featured.request.title",
        defaultValue: "Request Featured Status",
        category: "dashboard",
        description: "Featured request dialog title",
        translations: { en: "Request Featured Status", es: "Solicitar Estado Destacado" }
      },
      {
        stringKey: "dashboard.featured.request.new",
        defaultValue: "New Request",
        category: "dashboard",
        description: "New featured request button",
        translations: { en: "New Request", es: "Nueva Solicitud" }
      },
      {
        stringKey: "dashboard.featured.request.description",
        defaultValue: "Select a business and provide a message explaining why it should be featured.",
        category: "dashboard",
        description: "Featured request dialog description",
        translations: { en: "Select a business and provide a message explaining why it should be featured.", es: "Selecciona un negocio y proporciona un mensaje explicando por qué debería ser destacado." }
      },
      {
        stringKey: "dashboard.featured.form.business",
        defaultValue: "Select Business",
        category: "dashboard",
        description: "Featured request form business label",
        translations: { en: "Select Business", es: "Seleccionar Negocio" }
      },
      {
        stringKey: "dashboard.featured.form.choose",
        defaultValue: "Choose a business...",
        category: "dashboard",
        description: "Featured request form business placeholder",
        translations: { en: "Choose a business...", es: "Elegir un negocio..." }
      },
      {
        stringKey: "dashboard.featured.form.message",
        defaultValue: "Message (Optional)",
        category: "dashboard",
        description: "Featured request form message label",
        translations: { en: "Message (Optional)", es: "Mensaje (Opcional)" }
      },
      {
        stringKey: "dashboard.featured.form.placeholder",
        defaultValue: "Explain why this business should be featured...",
        category: "dashboard",
        description: "Featured request form message placeholder",
        translations: { en: "Explain why this business should be featured...", es: "Explica por qué este negocio debería ser destacado..." }
      },
      {
        stringKey: "dashboard.featured.form.submitting",
        defaultValue: "Submitting...",
        category: "dashboard",
        description: "Featured request form submitting state",
        translations: { en: "Submitting...", es: "Enviando..." }
      },
      {
        stringKey: "dashboard.featured.form.submit",
        defaultValue: "Submit Request",
        category: "dashboard",
        description: "Featured request form submit button",
        translations: { en: "Submit Request", es: "Enviar Solicitud" }
      },
      {
        stringKey: "dashboard.featured.eligible",
        defaultValue: "You have {{count}} business{{count === 1 ? '' : 'es'}} eligible for featured status.",
        category: "dashboard",
        description: "Featured request eligible businesses count",
        translations: { 
          en: "You have {{count}} business{{count === 1 ? '' : 'es'}} eligible for featured status.",
          es: "Tienes {{count}} negocio{{count === 1 ? '' : 's'}} elegible{{count === 1 ? '' : 's'}} para estado destacado."
        }
      },
      {
        stringKey: "dashboard.featured.empty.noeligible.title",
        defaultValue: "No Eligible Businesses",
        category: "dashboard",
        description: "Featured request no eligible businesses title",
        translations: { en: "No Eligible Businesses", es: "Sin Negocios Elegibles" }
      },
      {
        stringKey: "dashboard.featured.empty.noeligible.description",
        defaultValue: "All your businesses are either already featured or have pending requests.",
        category: "dashboard",
        description: "Featured request no eligible businesses description",
        translations: { en: "All your businesses are either already featured or have pending requests.", es: "Todos tus negocios ya están destacados o tienen solicitudes pendientes." }
      },
      {
        stringKey: "dashboard.featured.empty.nobusinesses.title",
        defaultValue: "No Businesses Found",
        category: "dashboard",
        description: "Featured request no businesses title",
        translations: { en: "No Businesses Found", es: "Sin Negocios Encontrados" }
      },
      {
        stringKey: "dashboard.featured.empty.nobusinesses.description",
        defaultValue: "You need to own businesses before you can request featured status.",
        category: "dashboard",
        description: "Featured request no businesses description",
        translations: { en: "You need to own businesses before you can request featured status.", es: "Necesitas ser propietario de negocios antes de poder solicitar estado destacado." }
      },
      {
        stringKey: "dashboard.featured.requests.title",
        defaultValue: "Your Featured Requests",
        category: "dashboard",
        description: "Featured requests list title",
        translations: { en: "Your Featured Requests", es: "Tus Solicitudes Destacadas" }
      },
      {
        stringKey: "dashboard.featured.requests.business",
        defaultValue: "Business",
        category: "dashboard",
        description: "Featured requests business fallback",
        translations: { en: "Business", es: "Negocio" }
      },
      {
        stringKey: "dashboard.featured.requests.yourmessage",
        defaultValue: "Your message",
        category: "dashboard",
        description: "Featured requests your message label",
        translations: { en: "Your message", es: "Tu mensaje" }
      },
      {
        stringKey: "dashboard.featured.requests.adminresponse",
        defaultValue: "Admin response",
        category: "dashboard",
        description: "Featured requests admin response label",
        translations: { en: "Admin response", es: "Respuesta del administrador" }
      },
      {
        stringKey: "dashboard.featured.requests.submitted",
        defaultValue: "Submitted",
        category: "dashboard",
        description: "Featured requests submitted label",
        translations: { en: "Submitted", es: "Enviado" }
      },
      {
        stringKey: "dashboard.featured.requests.reviewed",
        defaultValue: "Reviewed",
        category: "dashboard",
        description: "Featured requests reviewed label",
        translations: { en: "Reviewed", es: "Revisado" }
      },
      {
        stringKey: "dashboard.featured.empty.norequests.title",
        defaultValue: "No Featured Requests",
        category: "dashboard",
        description: "Featured requests empty title",
        translations: { en: "No Featured Requests", es: "Sin Solicitudes Destacadas" }
      },
      {
        stringKey: "dashboard.featured.empty.norequests.description",
        defaultValue: "You haven't submitted any featured requests yet.",
        category: "dashboard",
        description: "Featured requests empty description",
        translations: { en: "You haven't submitted any featured requests yet.", es: "Aún no has enviado ninguna solicitud destacada." }
      }
    ];

    for (const stringData of newStrings) {
      try {
        await pool.query(
          `INSERT INTO content_strings (string_key, default_value, category, description, translations)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (string_key) DO UPDATE SET
           default_value = EXCLUDED.default_value,
           category = EXCLUDED.category,
           description = EXCLUDED.description,
           translations = EXCLUDED.translations`,
          [
            stringData.stringKey,
            stringData.defaultValue,
            stringData.category,
            stringData.description,
            JSON.stringify(stringData.translations)
          ]
        );
        console.log(`✓ Added/Updated: ${stringData.stringKey}`);
      } catch (error) {
        console.error(`✗ Error adding ${stringData.stringKey}:`, error.message);
      }
    }

    console.log(`\n✓ Successfully processed ${newStrings.length} dashboard content strings`);
    console.log('\nDashboard component CMS migration completed successfully!');
    
  } catch (error) {
    console.error('Error adding dashboard content strings:', error);
  } finally {
    await pool.end();
  }
}

addDashboardContentStrings();