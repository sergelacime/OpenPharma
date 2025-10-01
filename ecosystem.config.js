module.exports = {
  apps: [
      {
          name: "starsged",
          script: "pnpm",
          args: "start",
          env: {
              NODE_ENV: "production",
              PORT: 3000,
          }
      }
  ]
};
