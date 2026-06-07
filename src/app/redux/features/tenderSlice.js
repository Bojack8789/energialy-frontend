import { createSlice } from "@reduxjs/toolkit";

const tendersReducer = createSlice({
  name: "tenders",
  initialState: {
    tenders: [],
    filterTenders: [],
  },
  reducers: {
    setAllTenders: (state, action) => {
      // Ordenar por fecha de creación (más reciente primero)
      const sortedTenders = [...action.payload].sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      state.tenders = sortedTenders;
      state.filterTenders = sortedTenders;
    },
    filterTendersByName: (state, action) => {
      state.filterTenders = state.tenders.filter((tender) =>
        tender.company?.name?.toLowerCase().includes(action.payload.toLowerCase())
      );
    },
    filterTendersByCompanyId: (state, action) => {
      if (action.payload) {
        state.filterTenders = state.tenders.filter(
          (tender) => tender.company?.id !== action.payload
        );
      }
    },
    fiterTendersByLocation: (state, action) => {
      if (action.payload.length === 0) {
        state.filterTenders = [...state.tenders];
      } else {
        state.filterTenders = state.tenders.filter((tender) =>
          action.payload.some((locId) => tender.location?.id === locId)
        );
      }
    },
    filterTendersByCategorie: (state, action) => {
      if (!action.payload) {
        state.filterTenders = [...state.tenders];
      } else {
        state.filterTenders = state.tenders.filter((tender) =>
          tender.subcategories?.some((subcat) => subcat.CategoryId === action.payload)
        );
      }
    },
    filterTendersBySubcategorie: (state, action) => {
      if (!action.payload) {
        state.filterTenders = [...state.tenders];
      } else {
        state.filterTenders = state.tenders.filter((tender) =>
          tender.subcategories?.some((subcat) => subcat.id === action.payload)
        );
      }
    },
  },
});

export const {
  setAllTenders,
  filterTendersByName,
  fiterTendersByLocation,
  filterTendersByCategorie,
  filterTendersBySubcategorie,
  filterTendersByCompanyId,
} = tendersReducer.actions;
export default tendersReducer.reducer;
