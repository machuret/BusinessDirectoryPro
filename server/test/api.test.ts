import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import express from 'express'
import { registerRoutes } from '../routes'

describe('API Integration Tests', () => {
  let app: express.Application
  let server: any

  beforeAll(async () => {
    app = express()
    app.use(express.json())
    server = await registerRoutes(app)
  })

  afterAll(() => {
    server?.close()
  })

  describe('Authentication Endpoints', () => {
    it('GET /api/auth/user - should return user when authenticated', async () => {
      const response = await request(app)
        .get('/api/auth/user')
        .expect(200)

      expect(response.body).toHaveProperty('id')
      expect(response.body).toHaveProperty('email')
    })

    it('POST /api/login - should authenticate user with valid credentials', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          username: 'admin@businesshub.com',
          password: 'admin123'
        })
        .expect(200)

      expect(response.body).toHaveProperty('id')
      expect(response.body).toHaveProperty('email')
    })

    it('POST /api/logout - should logout user', async () => {
      await request(app)
        .post('/api/logout')
        .expect(200)
    })
  })

  describe('Business Endpoints', () => {
    it('GET /api/businesses - should return list of businesses', async () => {
      const response = await request(app)
        .get('/api/businesses')
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('placeid')
        expect(response.body[0]).toHaveProperty('title')
      }
    })

    it('GET /api/businesses/featured - should return featured businesses', async () => {
      const response = await request(app)
        .get('/api/businesses/featured')
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)
    })

    it('GET /api/businesses/random - should return random businesses', async () => {
      const response = await request(app)
        .get('/api/businesses/random')
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)
    })

    it('GET /api/businesses/:id - should return specific business', async () => {
      // First get a list to find a valid ID
      const listResponse = await request(app).get('/api/businesses')
      
      if (listResponse.body.length > 0) {
        const businessId = listResponse.body[0].placeid
        
        const response = await request(app)
          .get(`/api/businesses/${businessId}`)
          .expect(200)

        expect(response.body).toHaveProperty('placeid', businessId)
        expect(response.body).toHaveProperty('title')
      }
    })

    it('GET /api/businesses/slug/:slug - should return business by slug', async () => {
      // Test with a known slug from the system
      const response = await request(app)
        .get('/api/businesses/slug/divine-smiles')

      if (response.status === 200) {
        expect(response.body).toHaveProperty('slug', 'divine-smiles')
        expect(response.body).toHaveProperty('title')
      } else {
        expect(response.status).toBe(404)
      }
    })
  })

  describe('Category Endpoints', () => {
    it('GET /api/categories - should return list of categories', async () => {
      const response = await request(app)
        .get('/api/categories')
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)
      if (response.body.length > 0) {
        expect(response.body[0]).toHaveProperty('id')
        expect(response.body[0]).toHaveProperty('name')
        expect(response.body[0]).toHaveProperty('slug')
      }
    })

    it('GET /api/categories/:slug - should return specific category', async () => {
      // First get categories to find a valid slug
      const listResponse = await request(app).get('/api/categories')
      
      if (listResponse.body.length > 0) {
        const categorySlug = listResponse.body[0].slug
        
        const response = await request(app)
          .get(`/api/categories/${categorySlug}`)
          .expect(200)

        expect(response.body).toHaveProperty('slug', categorySlug)
        expect(response.body).toHaveProperty('name')
      }
    })
  })

  describe('Review Endpoints', () => {
    it('GET /api/businesses/:id/reviews - should return business reviews', async () => {
      // Get a business first
      const businessResponse = await request(app).get('/api/businesses')
      
      if (businessResponse.body.length > 0) {
        const businessId = businessResponse.body[0].placeid
        
        const response = await request(app)
          .get(`/api/businesses/${businessId}/reviews`)
          .expect(200)

        expect(Array.isArray(response.body)).toBe(true)
      }
    })

    it('POST /api/businesses/:id/reviews - should create new review when authenticated', async () => {
      // This would require authentication setup
      const businessResponse = await request(app).get('/api/businesses')
      
      if (businessResponse.body.length > 0) {
        const businessId = businessResponse.body[0].placeid
        
        const reviewData = {
          rating: 5,
          comment: 'Excellent service!',
          authorName: 'Test User'
        }

        const response = await request(app)
          .post(`/api/businesses/${businessId}/reviews`)
          .send(reviewData)

        // Expect either success (201) or unauthorized (401)
        expect([201, 401]).toContain(response.status)
      }
    })
  })

  describe('Search Endpoints', () => {
    it('GET /api/businesses/search - should return search results', async () => {
      const response = await request(app)
        .get('/api/businesses/search')
        .query({ q: 'restaurant', limit: 10 })
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)
    })

    it('GET /api/businesses/search - should handle empty query', async () => {
      const response = await request(app)
        .get('/api/businesses/search')
        .query({ q: '', limit: 10 })
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)
    })
  })

  describe('Error Handling', () => {
    it('should return 404 for non-existent business', async () => {
      await request(app)
        .get('/api/businesses/non-existent-id')
        .expect(404)
    })

    it('should return 404 for non-existent category', async () => {
      await request(app)
        .get('/api/categories/non-existent-slug')
        .expect(404)
    })

    it('should handle malformed requests gracefully', async () => {
      const response = await request(app)
        .post('/api/businesses/invalid-id/reviews')
        .send({ invalid: 'data' })

      expect([400, 401, 404]).toContain(response.status)
    })
  })

  describe('Performance Tests', () => {
    it('should respond to business list within acceptable time', async () => {
      const start = Date.now()
      
      await request(app)
        .get('/api/businesses')
        .expect(200)
        
      const duration = Date.now() - start
      expect(duration).toBeLessThan(1000) // Should respond within 1 second
    })

    it('should handle concurrent requests', async () => {
      const requests = Array(5).fill(null).map(() => 
        request(app).get('/api/businesses')
      )

      const responses = await Promise.all(requests)
      
      responses.forEach(response => {
        expect(response.status).toBe(200)
        expect(Array.isArray(response.body)).toBe(true)
      })
    })
  })
})