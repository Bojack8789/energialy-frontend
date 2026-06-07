import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { urlProduction } from '@/app/data/dataGeneric';

export const companiesApi = createApi({
  reducerPath: 'companies',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
    prepareHeaders: (headers) => {
      // Get token from sessionStorage
      const token = typeof window !== 'undefined' ? sessionStorage.getItem('accessToken') : null;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getCompanies: builder.query({
      query: () => '/companies',
    }),
    getCompaniesById: builder.query({
      query: (id) => `/companies/${id}`,
    }),
  }),
});

export const { useGetCompaniesQuery, useGetCompaniesByIdQuery } = companiesApi;
