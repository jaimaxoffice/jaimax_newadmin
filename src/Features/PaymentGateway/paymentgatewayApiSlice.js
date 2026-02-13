// paymentGatewayApiSlice.js
import { apiSlice } from "../../api/jaimaxApiSlice";

export const paymentGatewayApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // GET all payment gateways
    getAllPaymentGateways: builder.query({
      query: () => ({
        url: `/payment-gateway/payment-gateways`,
        method: 'GET',
      }),
      providesTags: ['PaymentGateway']
    }),

    // GET active payment gateway
    getActivePaymentGateway: builder.query({
      query: () => ({
        url: `/payment-gateway/payment-gateways/active`,
        method: 'GET',
      }),
      providesTags: ['PaymentGateway']
    }),

    // GET payment gateway stats
    getPaymentGatewayStats: builder.query({
      query: () => ({
        url: `/payment-gateway/payment-gateways/stats`,
        method: 'GET',
      }),
      providesTags: ['PaymentGateway']
    }),

    // GET payment gateway by ID
    getPaymentGatewayById: builder.query({
      query: (id) => ({
        url: `/payment-gateway/payment-gateways/${id}`,
        method: 'GET',
      }),
      providesTags: ['PaymentGateway']
    }),

    // CREATE new payment gateway
    createPaymentGateway: builder.mutation({
      query: (gatewayData) => ({
        url: `/payment-gateway/payment-gateways`,
        method: 'POST',
        body: gatewayData,
      }),
      invalidatesTags: ['PaymentGateway']
    }),

    // UPDATE payment gateway
    updatePaymentGateway: builder.mutation({
      query: ({ id, ...updateData }) => ({
        url: `/payment-gateway/payment-gateways/${id}`,
        method: 'PUT',
        body: updateData,
      }),
      invalidatesTags: ['PaymentGateway']
    }),

    // ACTIVATE specific payment gateway
    activatePaymentGateway: builder.mutation({
      query: (id) => ({
        url: `/payment-gateway/payment-gateways/${id}/activate`,
        method: 'PUT',
      }),
      invalidatesTags: ['PaymentGateway']
    }),

    // DEACTIVATE all payment gateways
    deactivateAllPaymentGateways: builder.mutation({
      query: () => ({
        url: `/payment-gateway/payment-gateways/deactivate-all`,
        method: 'PUT',
      }),
      invalidatesTags: ['PaymentGateway']
    }),

    // DELETE payment gateway
    deletePaymentGateway: builder.mutation({
      query: (id) => ({
        url: `/payment-gateway/payment-gateways/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['PaymentGateway']
    }),

    // BULK CREATE payment gateways
    bulkCreatePaymentGateways: builder.mutation({
      query: (gatewaysData) => ({
        url: `/payment-gateway/payment-gateways/bulk-create`,
        method: 'POST',
        body: gatewaysData,
      }),
      invalidatesTags: ['PaymentGateway']
    }),
  })
});

export const { 
  useGetAllPaymentGatewaysQuery,
  useGetActivePaymentGatewayQuery,
  useGetPaymentGatewayStatsQuery,
  useGetPaymentGatewayByIdQuery,
  useCreatePaymentGatewayMutation,
  useUpdatePaymentGatewayMutation,
  useActivatePaymentGatewayMutation,
  useDeactivateAllPaymentGatewaysMutation,
  useDeletePaymentGatewayMutation,
  useBulkCreatePaymentGatewaysMutation
} = paymentGatewayApiSlice;