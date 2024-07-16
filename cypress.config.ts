import { defineConfig } from "cypress";
let storeData : any[] = [];

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
      })
    },
  },
});
