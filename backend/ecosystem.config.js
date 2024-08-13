module.exports = {
    apps : [
        {
          name: "index",
          script: "./index.js",
          watch: true,
          env: {
              "PORT": 3000,
              "NODE_ENV": "development"
          }
        }
    ]
  }