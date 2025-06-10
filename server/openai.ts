import OpenAI from "openai";
import { storage } from "./storage";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user

async function getOpenAIClient(): Promise<OpenAI> {
  // Try to get API key from site settings first, fallback to environment
  const setting = await storage.getSiteSetting('openai_api_key');
  const apiKey = setting?.value || process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OpenAI API key not configured. Please add it in the Admin API Keys section.');
  }
  
  return new OpenAI({ apiKey });
}

export async function optimizeBusinessDescription(business: any): Promise<string> {
  try {
    const openai = await getOpenAIClient();
    
    const prompt = `
You are a professional business content writer. Optimize the following business description to be more engaging, professional, and SEO-friendly while maintaining all factual information.

Business Details:
- Name: ${business.title}
- Category: ${business.categoryname || 'General Business'}
- City: ${business.city || 'Unknown'}
- Current Description: ${business.description || 'No description available'}
- Address: ${business.address || 'No address provided'}
- Phone: ${business.phone || 'No phone provided'}
- Website: ${business.website || 'No website provided'}

Please create an optimized description that:
1. Is 2-3 sentences long
2. Highlights key services/products
3. Mentions the location
4. Is professional and engaging
5. Includes relevant keywords for SEO

Respond with only the optimized description, no additional text or formatting.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 200,
      temperature: 0.7,
    });

    return response.choices[0].message.content?.trim() || business.description || '';
  } catch (error) {
    console.error('Error optimizing description:', error);
    throw new Error('Failed to optimize description');
  }
}

export async function generateBusinessFAQ(business: any): Promise<any[]> {
  try {
    const openai = await getOpenAIClient();
    
    const prompt = `
You are a customer service expert. Generate 4 frequently asked questions and answers for this business.

Business Details:
- Name: ${business.title}
- Category: ${business.categoryname || 'General Business'}
- City: ${business.city || 'Unknown'}
- Description: ${business.description || 'No description available'}
- Address: ${business.address || 'No address provided'}
- Phone: ${business.phone || 'No phone provided'}
- Website: ${business.website || 'No website provided'}
- Opening Hours: ${business.openinghours ? JSON.stringify(business.openinghours) : 'Not specified'}

Create 4 relevant FAQ items that potential customers would ask. Focus on:
1. Services/products offered
2. Location and hours
3. Contact information
4. Pricing or booking information

Respond with JSON in this exact format:
[
  {"question": "What services do you offer?", "answer": "We offer..."},
  {"question": "What are your hours?", "answer": "Our hours are..."},
  {"question": "Where are you located?", "answer": "We are located at..."},
  {"question": "How can I contact you?", "answer": "You can reach us..."}
]
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that generates FAQ content for businesses. Always respond with valid JSON format."
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      max_tokens: 500,
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content || '[]');
    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.error('Error generating FAQ:', error);
    throw new Error('Failed to generate FAQ');
  }
}

export async function optimizeBusinesses(businessIds: string[], type: 'descriptions' | 'faqs') {
  const results = { 
    success: 0, 
    errors: [] as any[],
    details: [] as any[]
  };
  
  for (let i = 0; i < businessIds.length; i++) {
    const businessId = businessIds[i];
    let business = null;
    
    try {
      business = await storage.getBusinessById(businessId);
      if (!business) {
        results.errors.push({ businessId, error: 'Business not found' });
        continue;
      }

      console.log(`Processing ${i + 1}/${businessIds.length}: ${business.title}`);

      if (type === 'descriptions') {
        const originalDescription = business.description || 'No description';
        const optimizedDescription = await optimizeBusinessDescription(business);
        
        await storage.updateBusiness(businessId, { description: optimizedDescription });
        
        results.details.push({
          businessId,
          businessName: business.title,
          type: 'description',
          before: originalDescription,
          after: optimizedDescription,
          status: 'optimized'
        });
        
      } else if (type === 'faqs') {
        const originalFaq = business.faq;
        const hasFaq = originalFaq && (
          (typeof originalFaq === 'string' && originalFaq.trim() !== '' && originalFaq !== '[]') ||
          (Array.isArray(originalFaq) && originalFaq.length > 0)
        );
        
        if (!hasFaq) {
          const faqData = await generateBusinessFAQ(business);
          await storage.updateBusiness(businessId, { faq: JSON.stringify(faqData) });
          
          results.details.push({
            businessId,
            businessName: business.title,
            type: 'faq',
            before: 'No FAQ',
            after: `Generated ${faqData.length} FAQ items`,
            faqItems: faqData,
            status: 'created'
          });
        } else {
          results.details.push({
            businessId,
            businessName: business.title,
            type: 'faq',
            before: 'FAQ already exists',
            after: 'Skipped - FAQ already exists',
            status: 'skipped'
          });
        }
      }

      results.success++;
    } catch (error) {
      console.error(`Error processing business ${businessId}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      results.errors.push({ 
        businessId, 
        businessName: business?.title || 'Unknown',
        error: errorMessage
      });
      
      results.details.push({
        businessId,
        businessName: business?.title || 'Unknown',
        type,
        status: 'error',
        error: errorMessage
      });
    }
  }

  return results;
}