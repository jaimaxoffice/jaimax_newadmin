import { apiSlice } from "../../api/jaimaxApiSlice";



export const icoApiSlice  = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getRound: builder.query({
            query: () => ({
              url: '/icoRound/getRounds',
              method: 'GET', 
            }),
          }),
          getExchange: builder.query({
            query: () => ({
              url: 'icoRound/exchange',
              method: 'GET', 
            }),
          }),

          updateRound: builder.mutation({
            query: (formData) => ({
              url: 'icoRound/updateRound',
              method: "PUT",
              body: { ...formData },
            }),
          }), 
    })
})

export const { useGetRoundQuery , useUpdateRoundMutation , useGetExchangeQuery } = icoApiSlice;


