// AnnouncementsApiSlice.js
import { apiSlice } from "../../api/jaimaxApiSlice";

export const announcementApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAnnouncements: builder.query({
      query: () => ({
        url: "announcements/get",
        method: "GET",
      }),
      // Return the whole response so we can access data, success, message etc.
      transformResponse: (response) => response,
      providesTags: ["Announcements"],
    }),
createAnnouncement: builder.mutation({
  query: (data) => ({
    url: "announcements/post",
    method: "POST",
    body: data, // send JSON, not FormData
    headers: { "Content-Type": "application/json" },
  }),
  invalidatesTags: ["Announcements"],
}),


    
updateAnnouncement: builder.mutation({
  query: ({ id, data }) => ({
    url: `announcements/${id}`,
    method: "PUT",
    body: data,  // Send as JSON, not FormData
    headers: {
      "Content-Type": "application/json",
    },
  }),
  invalidatesTags: ["Announcements"],
}),
    
    toggleAnnouncementStatus: builder.mutation({
      query: (id) => ({
        url: `announcements/${id}/toggle`,
        method: "PATCH",
      }),
      invalidatesTags: ["Announcements"],
    }),
    
    deleteAnnouncement: builder.mutation({
      query: (id) => ({
        url: `announcements/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Announcements"],
    }),
  }),
});

export const {
  useGetAnnouncementsQuery,
  useCreateAnnouncementMutation,
  useUpdateAnnouncementMutation,
  useToggleAnnouncementStatusMutation,
  useDeleteAnnouncementMutation,
} = announcementApiSlice;