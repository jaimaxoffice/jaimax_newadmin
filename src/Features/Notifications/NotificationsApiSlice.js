// notificationApiSlice.js
import { apiSlice } from "../../api/jaimaxApiSlice";

export const notificationApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    sendBulkNotification: builder.mutation({
      query: ({
        category,
        title,
        message,
        notificationLink,
        notificationType,
      }) => ({
        url: `/notifications/send-bulk-notification`,
        method: "POST",
        body: {
          category,
          title,
          message,
          notificationLink,
          notificationType,
          // type,
        },
      }),
    }),
    sendSingleNotification: builder.mutation({
      query: ({ token, title, message, data = {} }) => ({
        url: `/Admin/send-notification`,
        method: "POST",
        body: {
          token,
          title,
          message,
          data,
        },
      }),
    }),
    getNotificationHistory: builder.query({
      query: ({ page = 1, limit = 20 }) => ({
        url: `/Admin/notification-history?page=${page}&limit=${limit}`,
        method: "GET",
      }),
    }),
    getNotificationStats: builder.query({
      query: () => ({
        url: `/Admin/notification-stats`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useSendBulkNotificationMutation,
  useSendSingleNotificationMutation,
  useGetNotificationHistoryQuery,
  useGetNotificationStatsQuery,
} = notificationApiSlice;
