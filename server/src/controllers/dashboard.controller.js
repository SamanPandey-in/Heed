// ============================================================================
// CONTROLLERS - Dashboard Controller
// ============================================================================

import * as dashboardService from '../services/dashboard.service.js';
import { successResponse } from '../utils/apiResponse.js';

export const getDashboard = async (req, res) => {
  const stats = await dashboardService.getDashboardStats(req.user.id);
  return successResponse(res, 'Dashboard stats retrieved', stats);
};

export const getRecentActivity = async (req, res) => {
  const activity = await dashboardService.getRecentActivity(req.user.id);
  return successResponse(res, 'Recent activity retrieved', activity);
};

export default { getDashboard, getRecentActivity };
