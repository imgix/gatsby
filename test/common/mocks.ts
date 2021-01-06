import { Reporter } from 'gatsby';

export const createMockReporter = (): Reporter =>
  ({
    panic: jest.fn(),
  } as any);
