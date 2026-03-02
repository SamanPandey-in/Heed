// ============================================================================
// API SLICE - RTK Query endpoints for backend API
// ============================================================================

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const rawBaseQuery = fetchBaseQuery({
  baseURL: API_URL,
  credentials: 'include',
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // try to get a new token
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      const refreshResult = await rawBaseQuery(
        {
          url: '/auth/refresh-token',
          method: 'POST',
          body: { refreshToken },
        },
        api,
        extraOptions
      );

      if (refreshResult.data && refreshResult.data.accessToken) {
        // store the new token
        localStorage.setItem('accessToken', refreshResult.data.accessToken);
        // retry the initial query
        result = await rawBaseQuery(args, api, extraOptions);
      } else {
        // refresh failed - force logout
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        api.dispatch(apiSlice.util.resetApiState());
      }
    }
  }
  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'Workspace', 'Project', 'Task', 'Notification'],
  endpoints: (builder) => ({
    // ============================================================================
    // AUTH ENDPOINTS
    // ============================================================================

    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      transformResponse: (response) => response.data,
    }),

    register: builder.mutation({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
      transformResponse: (response) => response.data,
    }),

    logout: builder.mutation({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      transformResponse: (response) => response.data,
    }),

    getProfile: builder.query({
      query: () => '/auth/profile',
      providesTags: (result) => result ? [{ type: 'User', id: result.id }] : ['User'],
      transformResponse: (response) => response.data,
    }),

    updateProfile: builder.mutation({
      query: (data) => ({
        url: '/auth/profile',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
      transformResponse: (response) => response.data,
    }),

    refreshToken: builder.mutation({
      query: (refreshToken) => ({
        url: '/auth/refresh-token',
        method: 'POST',
        body: { refreshToken },
      }),
      transformResponse: (response) => response.data,
    }),

    requestPasswordReset: builder.mutation({
      query: (email) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body: { email },
      }),
      transformResponse: (response) => response.data,
    }),

    resetPassword: builder.mutation({
      query: ({ token, password }) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body: { token, password },
      }),
      transformResponse: (response) => response.data,
    }),

    // ============================================================================
    // WORKSPACE ENDPOINTS
    // ============================================================================

    getWorkspaces: builder.query({
      query: () => '/workspaces',
      providesTags: (result) =>
        Array.isArray(result)
          ? [
            ...result.map(({ id }) => ({ type: 'Workspace', id })),
            { type: 'Workspace', id: 'LIST' },
          ]
          : [{ type: 'Workspace', id: 'LIST' }],
      transformResponse: (response) => response.data,
    }),

    getWorkspaceById: builder.query({
      query: (id) => `/workspaces/${id}`,
      providesTags: (result, error, id) => [{ type: 'Workspace', id }],
      transformResponse: (response) => response.data,
    }),

    createWorkspace: builder.mutation({
      query: (data) => ({
        url: '/workspaces',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Workspace', id: 'LIST' }],
      transformResponse: (response) => response.data,
    }),

    updateWorkspace: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/workspaces/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Workspace', id },
        { type: 'Workspace', id: 'LIST' },
      ],
      transformResponse: (response) => response.data,
    }),

    deleteWorkspace: builder.mutation({
      query: (id) => ({
        url: `/workspaces/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Workspace', id: 'LIST' }],
    }),

    // ============================================================================
    // PROJECT ENDPOINTS
    // ============================================================================

    getProjects: builder.query({
      query: (workspaceId) => `/projects/workspace/${workspaceId}`,
      providesTags: (result) =>
        Array.isArray(result)
          ? [
            ...result.map(({ id }) => ({ type: 'Project', id })),
            { type: 'Project', id: 'LIST' },
          ]
          : [{ type: 'Project', id: 'LIST' }],
      transformResponse: (response) => response.data,
    }),

    getProjectById: builder.query({
      query: (id) => `/projects/${id}`,
      providesTags: (result, error, id) => [{ type: 'Project', id }],
      transformResponse: (response) => response.data,
    }),

    createProject: builder.mutation({
      query: (data) => ({
        url: '/projects',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Project', id: 'LIST' }],
      transformResponse: (response) => response.data,
    }),

    updateProject: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/projects/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Project', id },
        { type: 'Project', id: 'LIST' },
      ],
      transformResponse: (response) => response.data,
    }),

    deleteProject: builder.mutation({
      query: (id) => ({
        url: `/projects/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Project', id: 'LIST' }],
    }),

    // ============================================================================
    // TASK ENDPOINTS
    // ============================================================================

    getTasks: builder.query({
      query: (params) => ({
        url: '/tasks',
        params,
      }),
      providesTags: (result) =>
        Array.isArray(result)
          ? [
            ...result.map(({ id }) => ({ type: 'Task', id })),
            { type: 'Task', id: 'LIST' },
          ]
          : [{ type: 'Task', id: 'LIST' }],
      transformResponse: (response) => response.data,
    }),

    getTaskById: builder.query({
      query: (id) => `/tasks/${id}`,
      providesTags: (result, error, id) => [{ type: 'Task', id }],
      transformResponse: (response) => response.data,
    }),

    createTask: builder.mutation({
      query: (data) => ({
        url: '/tasks',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Task', id: 'LIST' }],
      transformResponse: (response) => response.data,
    }),

    updateTask: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/tasks/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Task', id },
        { type: 'Task', id: 'LIST' },
        { type: 'Project', id: 'LIST' },
      ],
      transformResponse: (response) => response.data,
    }),

    deleteTask: builder.mutation({
      query: (id) => ({
        url: `/tasks/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Task', id: 'LIST' }, { type: 'Project', id: 'LIST' }],
    }),

    // ============================================================================
    // DASHBOARD ENDPOINTS
    // ============================================================================

    getDashboardStats: builder.query({
      query: () => '/dashboard/stats',
      transformResponse: (response) => response.data,
    }),

    getRecentActivity: builder.query({
      query: () => '/dashboard/activity',
      transformResponse: (response) => response.data,
    }),

    // ============================================================================
    // NOTIFICATION ENDPOINTS
    // ============================================================================

    getNotifications: builder.query({
      query: () => '/notifications',
      providesTags: (result) =>
        Array.isArray(result)
          ? [
            ...result.map(({ id }) => ({ type: 'Notification', id })),
            { type: 'Notification', id: 'LIST' },
          ]
          : [{ type: 'Notification', id: 'LIST' }],
      transformResponse: (response) => response.data,
    }),

    getUnreadNotificationCount: builder.query({
      query: () => '/notifications/unread-count',
      providesTags: [{ type: 'Notification', id: 'LIST' }],
      transformResponse: (response) => response.data,
    }),

    markNotificationRead: builder.mutation({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Notification', id },
        { type: 'Notification', id: 'LIST' },
      ],
      transformResponse: (response) => response.data,
    }),

    markAllNotificationsRead: builder.mutation({
      query: () => ({
        url: '/notifications/read-all',
        method: 'PATCH',
      }),
      invalidatesTags: [{ type: 'Notification', id: 'LIST' }],
      transformResponse: (response) => response.data,
    }),

    // ============================================================================
    // TASK COMMENTS ENDPOINTS
    // ============================================================================

    getTaskComments: builder.query({
      query: (taskId) => `/messages/task/${taskId}`,
      providesTags: (result, error, taskId) =>
        Array.isArray(result)
          ? [
            ...result.map(({ id }) => ({ type: 'Comment', id })),
            { type: 'Comment', id: `TASK-${taskId}` },
          ]
          : [{ type: 'Comment', id: `TASK-${taskId}` }],
      transformResponse: (response) => {
        // Transform author to user for frontend compatibility
        const data = response.data || [];
        return data.map(comment => ({
          ...comment,
          user: {
            id: comment.author.id,
            name: comment.author.name,
            image: comment.author.imageUrl
          },
          replies: (comment.replies || []).map(reply => ({
            ...reply,
            user: {
              id: reply.author.id,
              name: reply.author.name,
              image: reply.author.imageUrl
            }
          }))
        }));
      },
    }),

    addTaskComment: builder.mutation({
      query: ({ taskId, content, parentId }) => ({
        url: `/messages/task/${taskId}`,
        method: 'POST',
        body: { content, parentId },
      }),
      invalidatesTags: (result, error, { taskId }) => [
        { type: 'Comment', id: `TASK-${taskId}` },
      ],
      transformResponse: (response) => response.data,
    }),
  }),
});

// Export hooks for usage in components
export const {
  // Auth
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useRefreshTokenMutation,
  useRequestPasswordResetMutation,
  useResetPasswordMutation,

  // Workspaces
  useGetWorkspacesQuery,
  useGetWorkspaceByIdQuery,
  useCreateWorkspaceMutation,
  useUpdateWorkspaceMutation,
  useDeleteWorkspaceMutation,

  // Projects
  useGetProjectsQuery,
  useGetProjectByIdQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,

  // Tasks
  useGetTasksQuery,
  useGetTaskByIdQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,

  // Dashboard
  useGetDashboardStatsQuery,
  useGetRecentActivityQuery,

  // Notifications
  useGetNotificationsQuery,
  useGetUnreadNotificationCountQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,

  // Task Comments
  useGetTaskCommentsQuery,
  useAddTaskCommentMutation,
} = apiSlice;