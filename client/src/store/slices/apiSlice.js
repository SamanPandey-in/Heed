// slice to manage API interactions using RTK Query
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// In dev, Vite proxies /api/* to http://localhost:5000. In prod set VITE_API_BASE_URL.
const API_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    credentials: 'include',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Team', 'Project', 'Task', 'User', 'Comment'],
  endpoints: (builder) => ({
    // TEAM ENDPOINTS
    getTeams: builder.query({
      query: () => '/teams',
      providesTags: (result) =>
        result?.teams
          ? [
              ...result.teams.map(({ id }) => ({ type: 'Team', id })),
              { type: 'Team', id: 'LIST' },
            ]
          : [{ type: 'Team', id: 'LIST' }],
      transformResponse: (response) => response,
    }),
    
    getTeamById: builder.query({
      query: (id) => `/teams/${id}`,
      providesTags: (result, error, id) => [{ type: 'Team', id }],
      transformResponse: (response) => response,
    }),
    
    createTeam: builder.mutation({
      query: (data) => ({
        url: '/teams',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Team', id: 'LIST' }],
      transformResponse: (response) => response,
    }),
    
    updateTeam: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/teams/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Team', id },
        { type: 'Team', id: 'LIST' },
      ],
      transformResponse: (response) => response,
    }),
    
    deleteTeam: builder.mutation({
      query: (id) => ({
        url: `/teams/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Team', id: 'LIST' }],
    }),
    
    addTechnicianToTeam: builder.mutation({
      query: ({ teamId, technicianId }) => ({
        url: `/teams/${teamId}/technicians`,
        method: 'POST',
        body: { technicianId },
      }),
      invalidatesTags: (result, error, { teamId }) => [
        { type: 'Team', id: teamId },
        { type: 'Team', id: 'LIST' },
      ],
      transformResponse: (response) => response.data,
    }),
    
    removeTechnicianFromTeam: builder.mutation({
      query: ({ teamId, technicianId }) => ({
        url: `/teams/${teamId}/technicians`,
        method: 'DELETE',
        body: { technicianId },
      }),
      invalidatesTags: (result, error, { teamId }) => [
        { type: 'Team', id: teamId },
        { type: 'Team', id: 'LIST' },
      ],
      transformResponse: (response) => response.data,
    }),

    joinTeamByInviteCode: builder.mutation({
      query: (inviteCode) => ({
        url: '/teams/join',
        method: 'POST',
        body: { inviteCode },
      }),
      invalidatesTags: [{ type: 'Team', id: 'LIST' }],
    }),

    addTeamMember: builder.mutation({
      query: ({ teamId, userId, email }) => ({
        url: `/teams/${teamId}/members`,
        method: 'POST',
        body: { userId, email },
      }),
      invalidatesTags: (result, error, { teamId }) => [
        { type: 'Team', id: teamId },
        { type: 'Team', id: 'LIST' },
      ],
    }),

    removeTeamMember: builder.mutation({
      query: ({ teamId, userId }) => ({
        url: `/teams/${teamId}/members/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { teamId }) => [
        { type: 'Team', id: teamId },
        { type: 'Team', id: 'LIST' },
      ],
    }),

    // PROJECT ENDPOINTS
    getProjects: builder.query({
      query: () => '/projects',
      providesTags: (result) =>
        result?.projects
          ? [
              ...result.projects.map(({ id }) => ({ type: 'Project', id })),
              { type: 'Project', id: 'LIST' },
            ]
          : [{ type: 'Project', id: 'LIST' }],
      transformResponse: (response) => response,
    }),

    getProjectById: builder.query({
      query: (id) => `/projects/${id}`,
      providesTags: (result, error, id) => [{ type: 'Project', id }],
      transformResponse: (response) => response,
    }),

    createProject: builder.mutation({
      query: (data) => ({
        url: '/projects',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Project', id: 'LIST' }],
      transformResponse: (response) => response,
    }),

    updateProject: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/projects/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Project', id },
        { type: 'Project', id: 'LIST' },
      ],
      transformResponse: (response) => response,
    }),

    deleteProject: builder.mutation({
      query: (id) => ({
        url: `/projects/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Project', id: 'LIST' }],
    }),

    addProjectMember: builder.mutation({
      query: ({ projectId, userId, email }) => ({
        url: `/projects/${projectId}/members`,
        method: 'POST',
        body: { userId, email },
      }),
      invalidatesTags: (result, error, { projectId }) => [
        { type: 'Project', id: projectId },
        { type: 'Project', id: 'LIST' },
      ],
    }),

    removeProjectMember: builder.mutation({
      query: ({ projectId, userId }) => ({
        url: `/projects/${projectId}/members/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { projectId }) => [
        { type: 'Project', id: projectId },
        { type: 'Project', id: 'LIST' },
      ],
    }),

    // TASK ENDPOINTS
    getTasks: builder.query({
      query: () => '/tasks',
      providesTags: (result) =>
        result?.tasks
          ? [
              ...result.tasks.map(({ id }) => ({ type: 'Task', id })),
              { type: 'Task', id: 'LIST' },
            ]
          : [{ type: 'Task', id: 'LIST' }],
      transformResponse: (response) => response,
    }),

    getTaskById: builder.query({
      query: (id) => `/tasks/${id}`,
      providesTags: (result, error, id) => [{ type: 'Task', id }],
      transformResponse: (response) => response,
    }),

    createTask: builder.mutation({
      query: (data) => ({
        url: '/tasks',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Task', id: 'LIST' }],
      transformResponse: (response) => response,
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
      ],
      transformResponse: (response) => response,
    }),

    deleteTask: builder.mutation({
      query: (id) => ({
        url: `/tasks/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Task', id: 'LIST' }],
    }),

    // USER ENDPOINTS
    getCurrentUser: builder.query({
      query: () => '/users/me',
      providesTags: ['User'],
      transformResponse: (response) => response,
    }),

    updateCurrentUser: builder.mutation({
      query: (data) => ({
        url: '/users/me',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['User'],
      transformResponse: (response) => response,
    }),

    // COMMENT ENDPOINTS
    getComments: builder.query({
      query: (taskId) => `/tasks/${taskId}/comments`,
      providesTags: (result, error, taskId) => [
        { type: 'Comment', id: `task-${taskId}` },
      ],
      transformResponse: (response) => response,
    }),

    createComment: builder.mutation({
      query: ({ taskId, content, parentId }) => ({
        url: `/tasks/${taskId}/comments`,
        method: 'POST',
        body: { content, parentId },
      }),
      invalidatesTags: (result, error, { taskId }) => [
        { type: 'Comment', id: `task-${taskId}` },
      ],
      transformResponse: (response) => response,
    }),

    deleteComment: builder.mutation({
      query: ({ commentId }) => ({
        url: `/tasks/comments/${commentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { taskId }) => [
        { type: 'Comment', id: `task-${taskId}` },
      ],
    }),
  }),
});

// Export hooks for usage in components
export const {
  // Teams
  useGetTeamsQuery,
  useGetTeamByIdQuery,
  useCreateTeamMutation,
  useUpdateTeamMutation,
  useDeleteTeamMutation,
  useJoinTeamByInviteCodeMutation,
  useAddTeamMemberMutation,
  useRemoveTeamMemberMutation,

  // Projects
  useGetProjectsQuery,
  useGetProjectByIdQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useAddProjectMemberMutation,
  useRemoveProjectMemberMutation,

  // Tasks
  useGetTasksQuery,
  useGetTaskByIdQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,

  // User
  useGetCurrentUserQuery,
  useUpdateCurrentUserMutation,

  // Comments
  useGetCommentsQuery,
  useCreateCommentMutation,
  useDeleteCommentMutation,
} = apiSlice;