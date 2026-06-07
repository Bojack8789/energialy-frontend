import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { urlProduction } from "@/app/data/dataGeneric";

export const locationApi = createApi({
    reducerPath: "locations",
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
      getLocations: builder.query({
        query: () => "/locations",
      }),
    })
})

export const { useGetLocationsQuery } = locationApi;