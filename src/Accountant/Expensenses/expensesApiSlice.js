

import { apiSlice } from "../../api/jaimaxApiSlice";

export const documentApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        uploadDocument: builder.mutation({
            query: (formData) => ({
                url: "/internalexpenes/upload",
                method: "POST",
                body: formData,
            }),
            invalidatesTags: ["documentsList"],
        }),

        updateDocument: builder.mutation({
            query: ({ id, data }) => ({
                url: `/internalexpenes/update/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: ["documentsList"],
        }),

        deleteDocument: builder.mutation({
            query: (id) => ({
                url: `/internalexpenes/delete/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["documentsList"],
        }),

        getDocuments: builder.query({
            query: (queryParams = "") => {
                // Convert queryParams to string safely
                let paramsString = "";

                if (typeof queryParams === "object" && queryParams !== null) {
                    // Convert object to query string
                    const queryString = new URLSearchParams(queryParams).toString();
                    paramsString = queryString ? `?${queryString}` : "";
                } else if (typeof queryParams === "string") {
                    // Remove leading '?' if present
                    const cleanParams = queryParams.startsWith('?') ? queryParams.slice(1) : queryParams;
                    paramsString = cleanParams ? `?${cleanParams}` : "";
                }

                // Apply default limit=10 if no limit is provided
                if (!paramsString.includes("limit=")) {
                    paramsString += paramsString ? "&limit=10" : "?limit=10";
                }

                const url = `/internalexpenes/get_list${paramsString}`;
                console.log("API Call URL:", url); // ✅ Debug log

                return {
                    url,
                    method: "GET",
                };
            },
            providesTags: ["documentsList"],
        }),
    }),
});

export const { 
    useUploadDocumentMutation, 
    useGetDocumentsQuery,
    useUpdateDocumentMutation,
    useDeleteDocumentMutation 
} = documentApiSlice;


