import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { urlProduction } from "@/app/data/dataGeneric";

export const bankAccountApi = createApi({
  reducerPath: "bankAccounts",
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
    getBankAccount: builder.query({
      query: () => "/bankAccounts",
    }),
    getBankAccountById: builder.query({
      query: (id) => `/bankAccounts/${id}`,
    }),
  }),
});

export const { useGetBankAccountQuery, useGetBankAccountByIdQuery } = bankAccountApi;