import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { urlProduction } from "@/app/data/dataGeneric";

export const proposalsApi = createApi({
  reducerPath: "proposal",
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
  tagTypes: ['Proposals'],
  endpoints: (builder) => ({
    getProposals: builder.query({
      query: (companyId) => {
        if (companyId) {
          return `/proposals?companyId=${companyId}`;
        }
        return "/proposals";
      },
      providesTags: ['Proposals'],
    }),
    getProposalById: builder.query({
      query: (id) => `/proposals/${id}`,
      providesTags: ['Proposals'],
    }),
    updateProposalStatus: builder.mutation({
      query: ({ id, status, isActive }) => ({
        url: `/proposals/${id}`,
        method: 'PUT',
        body: { status, isActive },
      }),
      invalidatesTags: ['Proposals'],
    }),
  }),
});

export const {
  useGetProposalsQuery,
  useGetProposalByIdQuery,
  useUpdateProposalStatusMutation
} = proposalsApi;
