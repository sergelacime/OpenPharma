module.exports = {
  apps: [
      {
          name: "find-pharma-app",
          script: "npm",
          args: "start",
          env: {
              NODE_ENV: "production",
              PORT: 3000,
          }
      },
      {
          name: "pharmacy-scheduler",
          script: "node",
          args: "scripts/update-pharmacies.js",
          env: {
              NODE_ENV: "production"
          },
          restart_delay: 5000,
          max_restarts: 10,
          min_uptime: "10s"
      }
  ]
};
