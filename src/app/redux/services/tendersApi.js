import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { urlProduction } from "@/app/data/dataGeneric";

export const tendersApi = createApi({
  reducerPath: "tenders",
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
  tagTypes: ['Tender', 'TenderInvitation'],
  endpoints: (builder) => ({
    getTenders: builder.query({
      query: () => "/tenders",
      providesTags: ['Tender'],
    }),
    getTenderid: builder.query({
      query: (id) => "/tenders",
    }),
    getTenderById: builder.query({
      query: (id) => `/tenders/${id}`,
      providesTags: (result, error, id) => [{ type: 'Tender', id }],
    }),
    inviteUsersToTender: builder.mutation({
      query: ({ tenderId, invitations }) => ({
        url: `/tenders/${tenderId}/invitations`,
        method: 'POST',
        body: { invitations },
      }),
      invalidatesTags: (result, error, { tenderId }) => [
        { type: 'TenderInvitation', id: tenderId }
      ],
    }),
    getTenderInvitations: builder.query({
      query: (tenderId) => `/tenders/${tenderId}/invitations`,
      providesTags: (result, error, tenderId) => [
        { type: 'TenderInvitation', id: tenderId }
      ],
    }),
  }),
});

export const { 
  useGetTendersQuery,
  useGetTenderidQuery, 
  useGetTenderByIdQuery,
  useInviteUsersToTenderMutation,
  useGetTenderInvitationsQuery
} = tendersApi;

