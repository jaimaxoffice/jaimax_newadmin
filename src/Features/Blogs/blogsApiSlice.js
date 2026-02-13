import { apiSlice } from "../../api/jaimaxApiSlice";

// Helper functions
const createTagTypes = (postId) => [
  { type: "BlogPosts", id: postId },
  "BlogPosts",
];

const handleFileUpload = (formData) => ({
  body: formData,
  formData: true,
  prepareHeaders: (headers) => {
    headers.delete("Content-Type");
    return headers;
  },
});

export const blogApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // POST MANAGEMENT
    // ---------------
    getPosts: builder.query({
      query: (params = {}) => ({
        url: "blog/posts",
        method: "GET",
        params,
      }),
      transformResponse: (response) => {
        if (!response.success) return { posts: [], pagination: {}, stats: {} };
        return response.data;
      },
      providesTags: (result) => {
        // Generate tags for all posts plus a general tag
        const postTags =
          result?.posts?.map((post) => ({ type: "BlogPosts", id: post._id })) ||
          [];
        return [...postTags, "BlogPosts", "BlogDashboard"];
      },
    }),

    getPostById: builder.query({
      query: (id) => ({
        url: `blog/posts/${id}`,
        method: "GET",
      }),
      transformResponse: (response) => {
        if (!response.success) return null;
        return response.data;
      },
      providesTags: (result, error, id) => [
        { type: "BlogPosts", id },
        { type: "PostDetail", id },
      ],
    }),

    createPost: builder.mutation({
      query: (postData) => ({
        url: "blog/posts",
        method: "POST",
        body: postData,
      }),
      transformResponse: (response) => {
        if (!response.success)
          throw new Error(response.message || "Failed to create post");
        return response.data;
      },
      // Invalidate all post lists but not specific post details
      invalidatesTags: [
        "BlogPosts",
        "BlogDashboard",
        "BlogCategories",
        "BlogTags",
      ],
    }),

    updatePost: builder.mutation({
      query: ({ id, ...postData }) => ({
        url: `blog/posts/${id}`,
        method: "PUT",
        body: postData,
      }),
      transformResponse: (response) => {
        if (!response.success)
          throw new Error(response.message || "Failed to update post");
        return response.data;
      },
      // Invalidate this specific post and post lists
      invalidatesTags: (result, error, { id }) => [
        { type: "BlogPosts", id },
        { type: "PostDetail", id },
        "BlogPosts",
        "BlogDashboard",
      ],
    }),

    deletePost: builder.mutation({
      query: (id) => ({
        url: `blog/posts/${id}`,
        method: "DELETE",
      }),
      transformResponse: (response) => {
        if (!response.success)
          throw new Error(response.message || "Failed to delete post");
        return response.data;
      },
      // Invalidate all post lists and the specific post
      invalidatesTags: (result, error, id) => [
        { type: "BlogPosts", id },
        "BlogPosts",
        "BlogDashboard",
        "BlogCategories",
        "BlogTags",
      ],
    }),

    // MEDIA UPLOADS
    // -------------
    uploadImage: builder.mutation({
      query: (imageData) => {
        // Handle both FormData and base64 uploads
        if (imageData instanceof FormData) {
          return {
            url: "blog/upload",
            method: "POST",
            ...handleFileUpload(imageData),
          };
        }

        // Handle base64 string upload
        if (
          typeof imageData === "string" ||
          (imageData && imageData.imageBase64)
        ) {
          return {
            url: "blog/upload",
            method: "POST",
            body:
              typeof imageData === "string"
                ? { imageBase64: imageData }
                : imageData,
          };
        }

        throw new Error("Invalid image data format");
      },
      transformResponse: (response) => {
        if (!response.success)
          throw new Error(response.message || "Image upload failed");
        return response.data;
      },
    }),

    uploadMultipleImages: builder.mutation({
      query: (imagesData) => {
        // Handle FormData uploads
        if (imagesData instanceof FormData) {
          return {
            url: "blog/upload/multiple",
            method: "POST",
            ...handleFileUpload(imagesData),
          };
        }

        // Handle array of base64 strings
        if (
          Array.isArray(imagesData) ||
          (imagesData && imagesData.imagesBase64)
        ) {
          return {
            url: "blog/upload/multiple",
            method: "POST",
            body: Array.isArray(imagesData)
              ? { imagesBase64: imagesData }
              : imagesData,
          };
        }

        throw new Error("Invalid image data format");
      },
      transformResponse: (response) => {
        if (!response.success)
          throw new Error(response.message || "Multiple image upload failed");
        return response.data;
      },
    }),

    // TAXONOMY (CATEGORIES & TAGS)
    // ----------------------------
    getCategories: builder.query({
      query: () => ({
        url: "blog/categories",
        method: "GET",
      }),
      transformResponse: (response) => {
        if (!response.success) return { categories: [], count: 0 };
        return response.data;
      },
      providesTags: ["BlogCategories"],
    }),

    getTags: builder.query({
      query: () => ({
        url: "blog/tags",
        method: "GET",
      }),
      transformResponse: (response) => {
        if (!response.success) return { tags: [], count: 0 };
        return response.data;
      },
      providesTags: ["BlogTags"],
    }),

    // USERS/COLLABORATORS
    // -------------------
    getAvailableUsers: builder.query({
      query: () => ({
        url: "blog/users",
        method: "GET",
      }),
      transformResponse: (response) => {
        if (!response.success) return { users: [], count: 0 };
        return response.data;
      },
      providesTags: ["BlogUsers"],
    }),

    // EDITOR CONFIGURATION
    // --------------------
    getTinyMCEKey: builder.query({
      query: () => ({
        url: "blog/editor/tinymce-key",
        method: "GET",
      }),
      transformResponse: (response) => {
        if (!response.success) return { apiKey: "", config: {} };
        return response.data;
      },
      // Keep this for a long time since it rarely changes
      keepUnusedDataFor: 3600,
    }),

    // PUBLICATION STATUS MANAGEMENT
    // -----------------------------
    publishPost: builder.mutation({
      query: (id) => ({
        url: `blog/posts/${id}/publish`,
        method: "PUT",
      }),
      transformResponse: (response) => {
        if (!response.success)
          throw new Error(response.message || "Failed to publish post");
        return response.data;
      },
      invalidatesTags: (result, error, id) => createTagTypes(id),
    }),

    unpublishPost: builder.mutation({
      query: (id) => ({
        url: `blog/posts/${id}/unpublish`,
        method: "PUT",
      }),
      transformResponse: (response) => {
        if (!response.success)
          throw new Error(response.message || "Failed to unpublish post");
        return response.data;
      },
      invalidatesTags: (result, error, id) => createTagTypes(id),
    }),

    schedulePost: builder.mutation({
      query: ({ id, scheduledFor }) => ({
        url: `blog/posts/${id}/schedule`,
        method: "PUT",
        body: { scheduledFor },
      }),
      transformResponse: (response) => {
        if (!response.success)
          throw new Error(response.message || "Failed to schedule post");
        return response.data;
      },
      invalidatesTags: (result, error, { id }) => createTagTypes(id),
    }),

    // VERSION CONTROL/HISTORY
    // -----------------------
    getPostHistory: builder.query({
      query: () => ({
        url: "blog/history",
        method: "GET",
      }),
      transformResponse: (response) => {
        if (!response.success) return { posts: [], count: 0 };

        // Group posts by month and year
        const posts = response.data.posts || [];
        const groupedPosts = {};

        posts.forEach((post) => {
          const date = new Date(post.createdAt);
          const year = date.getFullYear();
          const month = date.getMonth();

          if (!groupedPosts[year]) {
            groupedPosts[year] = {};
          }

          if (!groupedPosts[year][month]) {
            groupedPosts[year][month] = [];
          }

          groupedPosts[year][month].push(post);
        });

        return {
          posts,
          groupedPosts,
          count: posts.length,
        };
      },
      providesTags: ["BlogHistory"],
    }),

    restoreRevision: builder.mutation({
      query: ({ postId, revisionId }) => ({
        url: `blog/posts/${postId}/restore/${revisionId}`,
        method: "PUT",
      }),
      transformResponse: (response) => {
        if (!response.success)
          throw new Error(response.message || "Failed to restore revision");
        return response.data;
      },
      invalidatesTags: (result, error, { postId }) => [
        { type: "BlogPosts", id: postId },
        { type: "PostDetail", id: postId },
        "BlogHistory",
      ],
    }),
    getRevisionById: builder.query({
      query: ({ postId, revisionId }) =>
        `/blog/posts/${postId}/revisions/${revisionId}`,
      transformResponse: (response) => {
        if (!response.success) return null;
        return response.data;
      },
      providesTags: (result, error, { postId, revisionId }) => [
        { type: "PostRevision", id: revisionId },
        { type: "BlogPosts", id: postId },
      ],
    }),
    compareRevisions: builder.query({
      query: ({ postId, sourceVersion, targetVersion }) => ({
        url: `blog/posts/${postId}/compare/${sourceVersion}/${targetVersion}`,
        method: "GET",
      }),
      transformResponse: (response) => {
        if (!response.success) return null;
        return response.data;
      },
      providesTags: (result, error, { postId }) => [
        { type: "RevisionCompare", id: postId },
      ],
    }),
  }),
});

export const {
  // Post CRUD
  useGetPostsQuery,
  useGetPostByIdQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,

  // Media
  useUploadImageMutation,
  useUploadMultipleImagesMutation,

  // Categories & Tags
  useGetCategoriesQuery,
  useGetTagsQuery,

  // Users
  useGetAvailableUsersQuery,

  // Editor config
  useGetTinyMCEKeyQuery,

  // Publication status
  usePublishPostMutation,
  useUnpublishPostMutation,
  useSchedulePostMutation,

  // History & Version Control
  useGetPostHistoryQuery,
  useRestoreRevisionMutation,
  useCompareRevisionsQuery,
  useGetRevisionByIdQuery,
} = blogApiSlice;
