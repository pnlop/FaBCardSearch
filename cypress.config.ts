import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      on('task', {
        returnListingData(listingData) {
          console.log(listingData);
          return listingData;
        },
      })
    },
  },
});
