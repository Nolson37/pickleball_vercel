// Mock for the auth module
import { Session } from 'next-auth';

// Create a properly typed mock function
export const auth = jest.fn() as jest.Mock<Promise<Session | null>>;