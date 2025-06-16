import { BlobServiceClient, StorageSharedKeyCredential } from '@azure/storage-blob';
import { db } from './db';
import { siteSettings, type SiteSetting } from '@shared/schema';
import { eq } from 'drizzle-orm';

interface AzureConfig {
  accountName: string;
  accountKey: string;
  containerName: string;
  connectionString: string;
}

class AzureBlobService {
  private blobServiceClient: BlobServiceClient | null = null;

  async getConfig(): Promise<AzureConfig> {
    const settings = await db.select().from(siteSettings);
    
    return {
      accountName: settings.find((s: SiteSetting) => s.key === 'azure_blob_account_name')?.value || '',
      accountKey: settings.find((s: SiteSetting) => s.key === 'azure_blob_account_key')?.value || '',
      containerName: settings.find((s: SiteSetting) => s.key === 'azure_blob_container')?.value || 'uploads',
      connectionString: settings.find((s: SiteSetting) => s.key === 'azure_blob_connection_string')?.value || '',
    };
  }

  async initializeClient(): Promise<BlobServiceClient> {
    if (this.blobServiceClient) {
      return this.blobServiceClient;
    }

    const config = await this.getConfig();

    if (!config.accountName || !config.accountKey) {
      throw new Error('Azure Blob Storage configuration is incomplete. Please configure account name and key.');
    }

    try {
      // Try connection string first, then fall back to account name/key
      if (config.connectionString) {
        this.blobServiceClient = BlobServiceClient.fromConnectionString(config.connectionString);
      } else {
        const sharedKeyCredential = new StorageSharedKeyCredential(
          config.accountName,
          config.accountKey
        );
        this.blobServiceClient = new BlobServiceClient(
          `https://${config.accountName}.blob.core.windows.net`,
          sharedKeyCredential
        );
      }

      return this.blobServiceClient;
    } catch (error) {
      console.error('Failed to initialize Azure Blob client:', error);
      throw new Error('Failed to connect to Azure Blob Storage. Please check your configuration.');
    }
  }

  async uploadFile(
    buffer: Buffer,
    fileName: string,
    contentType: string = 'application/octet-stream'
  ): Promise<string> {
    try {
      const blobServiceClient = await this.initializeClient();
      const config = await this.getConfig();
      
      const containerClient = blobServiceClient.getContainerClient(config.containerName);
      
      // Ensure container exists
      await containerClient.createIfNotExists({
        access: 'blob' // Public read access for uploaded images
      });

      const blockBlobClient = containerClient.getBlockBlobClient(fileName);
      
      await blockBlobClient.upload(buffer, buffer.length, {
        blobHTTPHeaders: {
          blobContentType: contentType,
        },
      });

      // Return the public URL
      return blockBlobClient.url;
    } catch (error) {
      console.error('Azure blob upload error:', error);
      throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteFile(fileName: string): Promise<boolean> {
    try {
      const blobServiceClient = await this.initializeClient();
      const config = await this.getConfig();
      
      const containerClient = blobServiceClient.getContainerClient(config.containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(fileName);
      
      const response = await blockBlobClient.deleteIfExists();
      return response.succeeded;
    } catch (error) {
      console.error('Azure blob delete error:', error);
      return false;
    }
  }

  generateFileName(originalName: string, type: 'logo' | 'background'): string {
    const timestamp = Date.now();
    const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
    return `${type}/${timestamp}-${type}.${extension}`;
  }
}

export const azureBlobService = new AzureBlobService();