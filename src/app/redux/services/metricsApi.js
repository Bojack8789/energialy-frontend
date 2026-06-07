import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { urlProduction } from "@/app/data/dataGeneric";

export const metricsApi = createApi({
  reducerPath: "metrics",
  baseQuery: fetchBaseQuery({
    baseUrl: urlProduction,
    prepareHeaders: (headers) => {
      // Get token from sessionStorage
      const token = typeof window !== 'undefined' ? sessionStorage.getItem('accessToken') : null;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Metrics'],
  endpoints: (builder) => ({
    // Métricas de empresa
    getCompanyMetrics: builder.query({
      query: ({ companyId, days = 30 }) => `/companies/${companyId}/metrics?days=${days}`,
      providesTags: ['Metrics'],
    }),
    // Métricas de admin
    getAdminMetrics: builder.query({
      query: (days = 30) => `/admin/metrics?days=${days}`,
      providesTags: ['Metrics'],
    }),
  }),
});

export const {
  useGetCompanyMetricsQuery,
  useGetAdminMetricsQuery,
} = metricsApi;
