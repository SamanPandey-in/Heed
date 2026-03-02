// ============================================================================
// DATABASE - Backward Compatibility Module
// ============================================================================
// This file is kept for backward compatibility.
// The actual Prisma Client is now in src/db.js

import { prisma, testConnection } from '../db.js';

export { prisma, testConnection };
export default prisma;