import { expect, test, describe, jest, beforeEach, afterEach } from '@jest/globals';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/auth/register/route';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';

// Mock the prisma client
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    organization: {
      create: jest.fn(),
    },
    userOrganization: {
      create: jest.fn(),
    },
  },
}));

// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
}));

// Mock nodemailer
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' }),
  }),
}));

describe('Registration API Route', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock environment variables
    process.env.NEXTAUTH_URL = 'http://localhost:3000';
    process.env.EMAIL_SERVER_HOST = 'smtp.example.com';
    process.env.EMAIL_SERVER_PORT = '587';
    process.env.EMAIL_SERVER_USER = 'test@example.com';
    process.env.EMAIL_SERVER_PASSWORD = 'password';
    process.env.EMAIL_FROM = 'noreply@example.com';
  });

  afterEach(() => {
    // Reset environment variables
    delete process.env.NEXTAUTH_URL;
    delete process.env.EMAIL_SERVER_HOST;
    delete process.env.EMAIL_SERVER_PORT;
    delete process.env.EMAIL_SERVER_USER;
    delete process.env.EMAIL_SERVER_PASSWORD;
    delete process.env.EMAIL_FROM;
  });

  test('successfully registers a new user', async () => {
    // Mock prisma.user.findUnique to return null (user doesn't exist)
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    
    // Mock prisma.user.create to return a new user
    (prisma.user.create as jest.Mock).mockResolvedValue({
      id: 'user-123',
      name: 'Test User',
      email: 'test@example.com',
      emailVerified: null,
      createdAt: new Date(),
    });
    
    // Mock prisma.organization.create to return a new organization
    (prisma.organization.create as jest.Mock).mockResolvedValue({
      id: 'org-123',
      name: 'Test Organization',
      slug: 'test-organization',
      createdAt: new Date(),
    });
    
    // Mock prisma.userOrganization.create to return a new user-organization relationship
    (prisma.userOrganization.create as jest.Mock).mockResolvedValue({
      id: 'user-org-123',
      userId: 'user-123',
      organizationId: 'org-123',
      roles: ['admin'],
      isDefault: true,
      createdAt: new Date(),
    });

    // Create a request with valid registration data
    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
        organizationName: 'Test Organization',
        acceptTerms: true,
      }),
    });

    // Call the API route handler
    const response = await POST(request);
    
    // Check that the response is successful
    expect(response.status).toBe(200);
    
    // Check that the response body contains the expected data
    const responseData = await response.json();
    expect(responseData).toEqual({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
    });
    
    // Check that the prisma methods were called with the correct arguments
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'test@example.com' },
    });
    
    expect(bcrypt.hash).toHaveBeenCalledWith('Password123!', 10);
    
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        name: 'Test User',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
      },
    });
    
    expect(prisma.organization.create).toHaveBeenCalledWith({
      data: {
        name: 'Test Organization',
        slug: expect.any(String),
      },
    });
    
    expect(prisma.userOrganization.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-123',
        organizationId: 'org-123',
        roles: ['admin'],
        isDefault: true,
      },
    });
  });

  test('returns error when user already exists', async () => {
    // Mock prisma.user.findUnique to return an existing user
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: 'user-123',
      name: 'Existing User',
      email: 'test@example.com',
      emailVerified: null,
      createdAt: new Date(),
    });

    // Create a request with valid registration data
    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
        organizationName: 'Test Organization',
        acceptTerms: true,
      }),
    });

    // Call the API route handler
    const response = await POST(request);
    
    // Check that the response is an error
    expect(response.status).toBe(400);
    
    // Check that the response body contains the expected error message
    const responseData = await response.json();
    expect(responseData).toEqual({
      success: false,
      message: 'Email already registered',
    });
    
    // Check that only the findUnique method was called
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'test@example.com' },
    });
    
    expect(prisma.user.create).not.toHaveBeenCalled();
    expect(prisma.organization.create).not.toHaveBeenCalled();
    expect(prisma.userOrganization.create).not.toHaveBeenCalled();
  });

  test('returns error when validation fails', async () => {
    // Create a request with invalid registration data (missing required fields)
    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        // Missing password
        organizationName: 'Test Organization',
        acceptTerms: true,
      }),
    });

    // Call the API route handler
    const response = await POST(request);
    
    // Check that the response is an error
    expect(response.status).toBe(400);
    
    // Check that the response body contains validation errors
    const responseData = await response.json();
    expect(responseData.success).toBe(false);
    expect(responseData.message).toContain('Validation error');
    
    // Check that no prisma methods were called
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
    expect(prisma.user.create).not.toHaveBeenCalled();
    expect(prisma.organization.create).not.toHaveBeenCalled();
    expect(prisma.userOrganization.create).not.toHaveBeenCalled();
  });

  test('returns error when terms are not accepted', async () => {
    // Create a request with invalid registration data (terms not accepted)
    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
        organizationName: 'Test Organization',
        acceptTerms: false, // Terms not accepted
      }),
    });

    // Call the API route handler
    const response = await POST(request);
    
    // Check that the response is an error
    expect(response.status).toBe(400);
    
    // Check that the response body contains the expected error message
    const responseData = await response.json();
    expect(responseData).toEqual({
      success: false,
      message: 'You must accept the terms and conditions',
    });
    
    // Check that no prisma methods were called
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
    expect(prisma.user.create).not.toHaveBeenCalled();
    expect(prisma.organization.create).not.toHaveBeenCalled();
    expect(prisma.userOrganization.create).not.toHaveBeenCalled();
  });
});