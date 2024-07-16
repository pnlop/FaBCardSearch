import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      on('task', {
        setStoreData(listingData) {
          global.listingData = listingData;
          return null;
        },
      })
    },
  },
});
