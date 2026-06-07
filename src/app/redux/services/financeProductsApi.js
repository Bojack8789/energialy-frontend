import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { urlProduction } from "@/app/data/dataGeneric";



export const financeProductsApi = createApi({
  reducerPath: "financeProducts",
  baseQuery: fetchBaseQuery({
    baseUrl: urlProduction,
    prepareHeaders: (headers) => {
      const token = typeof window !== 'undefined' ? sessionStorage.getItem('accessToken') : null;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    }
  }),
  endpoints: (builder) => ({
    getFinanceProducts: builder.query({
      query: () => "/financeProducts",
    }),
    getFinanceProductsById: builder.query({
      query: (id) => `/financeProducts/${id}`,
    }),
  }),
});

export const { useGetFinanceProductsQuery, useGetFinanceProductsByIdQuery } = financeProductsApi;

