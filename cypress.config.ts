import { defineConfig } from "cypress";
let storeData : any[] = [];
let listingsData : any[] = [];

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      on('task', {
        setStoreData: (listingData) => {
          return storeData.push(listingData);
        },
        getStoreData: () => {
          return storeData;
        },
        setListingData: (listingData) => {
          return listingsData.push(listingData);
        },
        getListingData: () => {
          return listingsData;
        },
        resetListingData: () => {
          listingsData = [];
          return null;
        },
      })
    },
  },
});
