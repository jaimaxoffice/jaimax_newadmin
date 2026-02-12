import { apiSlice } from "../../api/jaimaxApiSlice";

export const zoomMeetingApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createZoomMeeting: builder.mutation({
      query: (meetingData) => {
        return {
          url: `/zoom-meetings/create-zoom-meeting`,
          method: "POST",
          body: meetingData,
        };
      },
    }),

    getAllZoomMeetings: builder.query({
      query: (queryParams) => ({
        url: `/zoom-meetings/all-zoom-videos?${queryParams}`,
        method: "GET",
      }),
    }),

    getZoomMeetingById: builder.query({
      query: (meetingId) => {
        return {
          url: `/zoom-meetings/${meetingId}`,
          method: "GET",
        };
      },
    }),

    updateZoomMeeting: builder.mutation({
      query: (meetingData) => {
        return {
          url: `/zoom-meetings/update-zoom-video`,
          method: "POST",
          body: meetingData,
        };
      },
    }),

    deleteZoomMeeting: builder.mutation({
      query: (meetingId) => {
        return {
          url: `/zoom-meetings/delete-zoom-video`,
          method: "POST",
          body: { id: meetingId },
        };
      },
    }),
  }),
});

export const {
  useCreateZoomMeetingMutation,
  useGetAllZoomMeetingsQuery,
  useGetZoomMeetingByIdQuery,
  useUpdateZoomMeetingMutation,
  useDeleteZoomMeetingMutation,
} = zoomMeetingApiSlice;


