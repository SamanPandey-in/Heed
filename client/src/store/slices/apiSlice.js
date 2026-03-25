import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { acquireChatSocket, releaseChatSocket } from '../../lib/chatSocket';

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
  tagTypes: ['Team', 'Project', 'Task', 'User', 'Comment', 'Notification', 'Search', 'ProjectNoteMessage', 'TeamNoteMessage', 'TeamChatMessage'],
  endpoints: (builder) => ({
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
      query: ({ teamId, userId }) => ({
        url: `/teams/${teamId}/members`,
        method: 'POST',
        body: { userId },
      }),
      invalidatesTags: (result, error, { teamId }) => [
        { type: 'Team', id: teamId },
        { type: 'Team', id: 'LIST' },
      ],
      transformResponse: (response) => response.data,
    }),
    
    removeTechnicianFromTeam: builder.mutation({
      query: ({ teamId, userId }) => ({
        url: `/teams/${teamId}/members/${userId}`,
        method: 'DELETE',
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

    getTeamNotesMessages: builder.query({
      query: (teamId) => `/teams/${teamId}/notes/messages`,
      providesTags: (result, error, teamId) => [
        { type: 'TeamNoteMessage', id: `team-notes-${teamId}` },
      ],
      transformResponse: (response) => response,
      async onCacheEntryAdded(teamId, { cacheDataLoaded, cacheEntryRemoved, updateCachedData }) {
        if (!teamId) return;

        await cacheDataLoaded;

        const socket = acquireChatSocket();

        const handleMessageCreated = (payload) => {
          if (payload?.teamId !== teamId || !payload?.noteMessage) return;

          updateCachedData((draft) => {
            if (!Array.isArray(draft.messages)) {
              draft.messages = [];
            }

            const alreadyExists = draft.messages.some((item) => item.id === payload.noteMessage.id);
            if (!alreadyExists) {
              draft.messages.push(payload.noteMessage);
            }
          });
        };

        socket.on('teamNotes:message:created', handleMessageCreated);
        socket.emit('teamNotes:join', { teamId });

        await cacheEntryRemoved;

        socket.off('teamNotes:message:created', handleMessageCreated);
        socket.emit('teamNotes:leave', { teamId });
        releaseChatSocket();
      },
    }),

    createTeamNotesMessage: builder.mutation({
      query: ({ teamId, content }) => ({
        url: `/teams/${teamId}/notes/messages`,
        method: 'POST',
        body: { content },
      }),
      invalidatesTags: (result, error, { teamId }) => [
        { type: 'TeamNoteMessage', id: `team-notes-${teamId}` },
      ],
      transformResponse: (response) => response,
    }),

    getTeamChatMessages: builder.query({
      query: (teamId) => `/teams/${teamId}/chat/messages`,
      providesTags: (result, error, teamId) => [
        { type: 'TeamChatMessage', id: `team-chat-${teamId}` },
      ],
      transformResponse: (response) => response,
      async onCacheEntryAdded(teamId, { cacheDataLoaded, cacheEntryRemoved, updateCachedData }) {
        if (!teamId) return;

        await cacheDataLoaded;

        const socket = acquireChatSocket();

        const handleMessageCreated = (payload) => {
          if (payload?.teamId !== teamId || !payload?.chatMessage) return;

          updateCachedData((draft) => {
            if (!Array.isArray(draft.messages)) {
              draft.messages = [];
            }

            const alreadyExists = draft.messages.some((item) => item.id === payload.chatMessage.id);
            if (!alreadyExists) {
              draft.messages.push(payload.chatMessage);
            }
          });
        };

        socket.on('teamChat:message:created', handleMessageCreated);
        socket.emit('teamChat:join', { teamId });

        await cacheEntryRemoved;

        socket.off('teamChat:message:created', handleMessageCreated);
        socket.emit('teamChat:leave', { teamId });
        releaseChatSocket();
      },
    }),

    createTeamChatMessage: builder.mutation({
      query: ({ teamId, content }) => ({
        url: `/teams/${teamId}/chat/messages`,
        method: 'POST',
        body: { content },
      }),
      invalidatesTags: (result, error, { teamId }) => [
        { type: 'TeamChatMessage', id: `team-chat-${teamId}` },
      ],
      transformResponse: (response) => response,
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

    getProjectNotesMessages: builder.query({
      query: (projectId) => `/projects/${projectId}/notes/messages`,
      providesTags: (result, error, projectId) => [
        { type: 'ProjectNoteMessage', id: `project-${projectId}` },
      ],
      transformResponse: (response) => response,
      async onCacheEntryAdded(projectId, { cacheDataLoaded, cacheEntryRemoved, updateCachedData }) {
        if (!projectId) return;

        await cacheDataLoaded;

        const socket = acquireChatSocket();

        const handleMessageCreated = (payload) => {
          if (payload?.projectId !== projectId || !payload?.noteMessage) return;

          updateCachedData((draft) => {
            if (!Array.isArray(draft.messages)) {
              draft.messages = [];
            }

            const alreadyExists = draft.messages.some((item) => item.id === payload.noteMessage.id);
            if (!alreadyExists) {
              draft.messages.push(payload.noteMessage);
            }
          });
        };

        socket.on('projectNotes:message:created', handleMessageCreated);
        socket.emit('projectNotes:join', { projectId });

        await cacheEntryRemoved;

        socket.off('projectNotes:message:created', handleMessageCreated);
        socket.emit('projectNotes:leave', { projectId });
        releaseChatSocket();
      },
    }),

    createProjectNotesMessage: builder.mutation({
      query: ({ projectId, content }) => ({
        url: `/projects/${projectId}/notes/messages`,
        method: 'POST',
        body: { content },
      }),
      invalidatesTags: (result, error, { projectId }) => [
        { type: 'ProjectNoteMessage', id: `project-${projectId}` },
      ],
      transformResponse: (response) => response,
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
      async onCacheEntryAdded(taskId, { cacheDataLoaded, cacheEntryRemoved, updateCachedData }) {
        if (!taskId) return;

        await cacheDataLoaded;

        const socket = acquireChatSocket();

        const handleCommentCreated = (payload) => {
          if (payload?.taskId !== taskId || !payload?.comment) return;

          updateCachedData((draft) => {
            if (!Array.isArray(draft.comments)) {
              draft.comments = [];
            }

            const alreadyExists = draft.comments.some((item) => item.id === payload.comment.id);
            if (!alreadyExists) {
              draft.comments.push(payload.comment);
            }
          });
        };

        const handleCommentDeleted = (payload) => {
          if (payload?.taskId !== taskId || !payload?.commentId) return;

          updateCachedData((draft) => {
            if (!Array.isArray(draft.comments)) {
              draft.comments = [];
              return;
            }

            draft.comments = draft.comments.filter((item) => item.id !== payload.commentId);
          });
        };

        socket.on('task:comment:created', handleCommentCreated);
        socket.on('task:comment:deleted', handleCommentDeleted);
        socket.emit('task:join', { taskId });

        await cacheEntryRemoved;

        socket.off('task:comment:created', handleCommentCreated);
        socket.off('task:comment:deleted', handleCommentDeleted);
        socket.emit('task:leave', { taskId });
        releaseChatSocket();
      },
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

    getNotifications: builder.query({
      query: () => '/notifications',
      providesTags: ['Notification'],
      transformResponse: (response) => response,
    }),

    markNotificationRead: builder.mutation({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Notification'],
    }),

    markAllNotificationsRead: builder.mutation({
      query: () => ({
        url: '/notifications/read-all',
        method: 'PATCH',
      }),
      invalidatesTags: ['Notification'],
    }),

    clearAllNotifications: builder.mutation({
      query: () => ({
        url: '/notifications',
        method: 'DELETE',
      }),
      invalidatesTags: ['Notification'],
    }),

    // SEARCH ENDPOINTS
    searchAll: builder.query({
      query: (q) => `/search?q=${encodeURIComponent(q)}`,
      transformResponse: (res) => res,
    }),

    // ACTIVITY ENDPOINTS
    getProjectActivity: builder.query({
      query: (projectId) => `/projects/${projectId}/activity`,
      transformResponse: (res) => res,
      providesTags: ['Activity'],
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
  useGetTeamNotesMessagesQuery,
  useCreateTeamNotesMessageMutation,
  useGetTeamChatMessagesQuery,
  useCreateTeamChatMessageMutation,

  // Projects
  useGetProjectsQuery,
  useGetProjectByIdQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useAddProjectMemberMutation,
  useRemoveProjectMemberMutation,
  useGetProjectNotesMessagesQuery,
  useCreateProjectNotesMessageMutation,

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

  // Notifications
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useClearAllNotificationsMutation,

  // Search
  useSearchAllQuery,

  // Activity
  useGetProjectActivityQuery,
} = apiSlice;