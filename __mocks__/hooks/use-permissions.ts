// Mock for the usePermissions hook
const mockCan = jest.fn().mockReturnValue(false);
const mockCanAny = jest.fn().mockReturnValue(false);
const mockCanAll = jest.fn().mockReturnValue(false);
const mockIs = jest.fn().mockReturnValue(false);
const mockIsAny = jest.fn().mockReturnValue(false);
const mockIsAll = jest.fn().mockReturnValue(false);

export const usePermissions = jest.fn().mockReturnValue({
  can: mockCan,
  canAny: mockCanAny,
  canAll: mockCanAll,
  is: mockIs,
  isAny: mockIsAny,
  isAll: mockIsAll,
  roles: [],
  session: null,
});