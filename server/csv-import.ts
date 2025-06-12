import { Readable } from 'stream';
import csv from 'csv-parser';
import { storage } from './storage';
import type { InsertBusiness } from '@shared/schema';

export interface ImportValidationError {
  row: number;
  field: string;
  value: any;
  message: string;
}

export interface ImportResult {
  success: number;
  errors: ImportValidationError[];
  warnings: string[];
  duplicatesSkipped: number;
  created: number;
  updated: number;
}

export interface ImportOptions {
  updateDuplicates: boolean;
  skipDuplicates: boolean;
  validateOnly: boolean;
  batchSize: number;
}

export class CSVImportService {
  private readonly REQUIRED_FIELDS = ['title', 'placeid'];
  private readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private readonly PHONE_REGEX = /^[\+]?[1-9][\d]{0,15}$/;
  private readonly URL_REGEX = /^https?:\/\/.+/;

  async parseCSV(buffer: Buffer): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const results: any[] = [];
      const stream = Readable.from(buffer);

      stream
        .pipe(csv())
        .on('data', (data) => {
          // Clean up data - trim whitespace and convert empty strings to null
          const cleanData: any = {};
          for (const [key, value] of Object.entries(data)) {
            cleanData[key.trim().toLowerCase()] = 
              typeof value === 'string' && value.trim() === '' ? null : 
              typeof value === 'string' ? value.trim() : value;
          }
          results.push(cleanData);
        })
        .on('end', () => resolve(results))
        .on('error', reject);
    });
  }

  async validateData(csvData: any[]): Promise<ImportValidationError[]> {
    const errors: ImportValidationError[] = [];
    const seenPlaceIds = new Set<string>();

    for (let i = 0; i < csvData.length; i++) {
      const row = csvData[i];
      const rowNumber = i + 1;

      // Check required fields
      for (const field of this.REQUIRED_FIELDS) {
        if (!row[field] || row[field] === null) {
          errors.push({
            row: rowNumber,
            field,
            value: row[field],
            message: `Required field '${field}' is missing or empty`
          });
        }
      }

      // Validate placeid uniqueness within CSV
      if (row.placeid) {
        if (seenPlaceIds.has(row.placeid)) {
          errors.push({
            row: rowNumber,
            field: 'placeid',
            value: row.placeid,
            message: 'Duplicate placeid found in CSV'
          });
        }
        seenPlaceIds.add(row.placeid);
      }

      // Validate email format
      if (row.email && !this.EMAIL_REGEX.test(row.email)) {
        errors.push({
          row: rowNumber,
          field: 'email',
          value: row.email,
          message: 'Invalid email format'
        });
      }

      // Validate phone format (basic validation)
      if (row.phone && row.phone.replace(/[\s\-\(\)\.]/g, '').length < 7) {
        errors.push({
          row: rowNumber,
          field: 'phone',
          value: row.phone,
          message: 'Phone number appears to be too short'
        });
      }

      // Validate website URL
      if (row.website && !this.URL_REGEX.test(row.website)) {
        errors.push({
          row: rowNumber,
          field: 'website',
          value: row.website,
          message: 'Invalid website URL format'
        });
      }

      // Validate JSON fields
      const jsonFields = ['categories', 'reviewsdistribution', 'reviews', 'imageurls', 'openinghours', 'amenities'];
      for (const field of jsonFields) {
        if (row[field] && typeof row[field] === 'string') {
          try {
            JSON.parse(row[field]);
          } catch {
            errors.push({
              row: rowNumber,
              field,
              value: row[field],
              message: 'Invalid JSON format'
            });
          }
        }
      }

      // Validate numeric fields
      const numericFields = ['lat', 'lng', 'totalscore', 'reviewscount'];
      for (const field of numericFields) {
        if (row[field] && isNaN(Number(row[field]))) {
          errors.push({
            row: rowNumber,
            field,
            value: row[field],
            message: 'Must be a valid number'
          });
        }
      }
    }

    return errors;
  }

  private generateSlug(title: string, placeid: string): string {
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    // Add part of placeid to ensure uniqueness
    const idSuffix = placeid.slice(-8);
    return `${baseSlug}-${idSuffix}`;
  }

  private async ensureUniqueSlug(baseSlug: string, excludePlaceId?: string): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await storage.getBusinessBySlug(slug);
      if (!existing || (excludePlaceId && existing.placeid === excludePlaceId)) {
        return slug;
      }
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  private transformCSVToBusiness(csvRow: any): Partial<InsertBusiness> {
    const business: any = {
      placeid: csvRow.placeid,
      title: csvRow.title || csvRow.name,
      subtitle: csvRow.subtitle,
      description: csvRow.description,
      categoryname: csvRow.categoryname || csvRow.category,
      website: csvRow.website,
      phone: csvRow.phone,
      phoneunformatted: csvRow.phoneunformatted,
      email: csvRow.email,
      address: csvRow.address,
      neighborhood: csvRow.neighborhood,
      street: csvRow.street,
      city: csvRow.city,
      postalcode: csvRow.postalcode,
      state: csvRow.state,
      countrycode: csvRow.countrycode || 'AU',
      lat: csvRow.lat ? parseFloat(csvRow.lat) : null,
      lng: csvRow.lng ? parseFloat(csvRow.lng) : null,
      totalscore: csvRow.totalscore ? parseFloat(csvRow.totalscore) : null,
      reviewscount: csvRow.reviewscount ? parseInt(csvRow.reviewscount) : null,
      featured: csvRow.featured === 'true' || csvRow.featured === true,
      permanentlyclosed: csvRow.permanentlyclosed === 'true' || csvRow.permanentlyclosed === true,
      temporarilyclosed: csvRow.temporarilyclosed === 'true' || csvRow.temporarilyclosed === true,
      imageurl: csvRow.imageurl,
      logo: csvRow.logo,
      status: 'approved',
      submittedBy: 'csv-import',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Handle JSON fields safely
    const jsonFields = ['categories', 'reviewsdistribution', 'reviews', 'imageurls', 'openinghours', 'amenities'];
    for (const field of jsonFields) {
      if (csvRow[field]) {
        try {
          business[field] = typeof csvRow[field] === 'string' ? JSON.parse(csvRow[field]) : csvRow[field];
        } catch {
          // Skip invalid JSON
        }
      }
    }

    // Generate SEO fields if missing
    if (!business.seotitle && business.title) {
      business.seotitle = `${business.title}${business.city ? ` - ${business.city}` : ''}${business.categoryname ? ` | ${business.categoryname}` : ''}`;
    }

    if (!business.seodescription && business.description) {
      business.seodescription = business.description.length > 160 
        ? business.description.substring(0, 157) + '...'
        : business.description;
    }

    return business;
  }

  async importBusinesses(csvData: any[], options: ImportOptions = {
    updateDuplicates: false,
    skipDuplicates: true,
    validateOnly: false,
    batchSize: 50
  }): Promise<ImportResult> {
    const result: ImportResult = {
      success: 0,
      errors: [],
      warnings: [],
      duplicatesSkipped: 0,
      created: 0,
      updated: 0
    };

    // Validate data first
    const validationErrors = await this.validateData(csvData);
    if (validationErrors.length > 0) {
      result.errors = validationErrors;
      if (options.validateOnly) return result;
      
      // If not validation-only, continue with valid rows
      result.warnings.push(`Found ${validationErrors.length} validation errors. Processing valid rows only.`);
    }

    if (options.validateOnly) {
      result.success = csvData.length - validationErrors.length;
      return result;
    }

    // Process data in batches
    const validRows = csvData.filter((_, index) => 
      !validationErrors.some(error => error.row === index + 1)
    );

    for (let i = 0; i < validRows.length; i += options.batchSize) {
      const batch = validRows.slice(i, i + options.batchSize);
      
      for (const csvRow of batch) {
        try {
          const businessData = this.transformCSVToBusiness(csvRow);
          
          // Generate unique slug
          const baseSlug = this.generateSlug(businessData.title!, businessData.placeid!);
          businessData.slug = await this.ensureUniqueSlug(baseSlug, businessData.placeid);

          // Check for existing business
          const existing = await storage.getBusinessById(businessData.placeid!);
          
          if (existing) {
            if (options.updateDuplicates) {
              await storage.updateBusiness(businessData.placeid!, businessData);
              result.updated++;
            } else if (options.skipDuplicates) {
              result.duplicatesSkipped++;
            } else {
              result.errors.push({
                row: csvData.indexOf(csvRow) + 1,
                field: 'placeid',
                value: businessData.placeid,
                message: 'Business with this placeid already exists'
              });
              continue;
            }
          } else {
            await storage.createBusiness(businessData as InsertBusiness);
            result.created++;
          }
          
          result.success++;
        } catch (error) {
          result.errors.push({
            row: csvData.indexOf(csvRow) + 1,
            field: 'general',
            value: csvRow,
            message: error instanceof Error ? error.message : 'Unknown error occurred'
          });
        }
      }
    }

    return result;
  }

  async previewImport(buffer: Buffer, maxRows: number = 10): Promise<{
    headers: string[];
    sampleData: any[];
    totalRows: number;
    validationErrors: ImportValidationError[];
  }> {
    const csvData = await this.parseCSV(buffer);
    const headers = csvData.length > 0 ? Object.keys(csvData[0]) : [];
    const sampleData = csvData.slice(0, maxRows);
    const validationErrors = await this.validateData(sampleData);

    return {
      headers,
      sampleData,
      totalRows: csvData.length,
      validationErrors
    };
  }
}

export const csvImportService = new CSVImportService();