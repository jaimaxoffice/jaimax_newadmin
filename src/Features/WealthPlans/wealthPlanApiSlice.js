import { apiSlice } from "../../api/jaimaxApiSlice";

export const wealthPlanApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        guarantededWealthPlanLogs: builder.mutation({
            query: ({ page, limit, search }) => ({
                url: `/Admin/guaranteed-wealth-plan-logs?page=${page}&limit=${limit}&search=${search}`,
                method: "GET",
            }),
        }),
        guaranteedWealthOrders: builder.mutation({
            query: ({ page, limit, search }) => ({
                url: `/Admin/guaranteed-wealth-orders?page=${page}&limit=${limit}&search=${search}`,
                method: "GET",
            }),
        }),
        guarantededWealthPlanLogs2O: builder.mutation({
            query: ({ page, limit, search }) => ({
                url: `/Admin/guaranteed-wealth-plan-logs-2?page=${page}&limit=${limit}&search=${search}`,
                method: "GET",
            }),
        }),
        guaranteedWealthOrders2O: builder.mutation({
            query: ({ page, limit, search }) => ({
                url: `/Admin/guaranteed-wealth-orders-2?page=${page}&limit=${limit}&search=${search}`,
                method: "GET",
            }),
        }),
        guarantededWealthPlanLogs3O: builder.mutation({
            query: ({ page, limit, search }) => ({
                url: `/Admin/guaranteed-wealth-plan-logs-3?page=${page}&limit=${limit}&search=${search}`,
                method: "GET",
            }),
        }),
        guaranteedWealthOrders3O: builder.mutation({
            query: ({ page, limit, search }) => ({
                url: `/Admin/guaranteed-wealth-orders-3?page=${page}&limit=${limit}&search=${search}`,
                method: "GET",
            }),
        }),
    }),
});

export const {
    useGuarantededWealthPlanLogsMutation,
    useGuaranteedWealthOrdersMutation,
    useGuarantededWealthPlanLogs2OMutation,
    useGuaranteedWealthOrders2OMutation,
    useGuarantededWealthPlanLogs3OMutation,
    useGuaranteedWealthOrders3OMutation,
} = wealthPlanApiSlice;