FROM node:22

WORKDIR /app

RUN yarn global add npm@latest pnpm pm2

RUN groupmod -g 1000 node
RUN usermod -u 1000 -g node node

COPY --chown=node:node package.json pnpm-lock.yaml ./
COPY --chown=node:node ecosystem.config.js ./

# Install dependencies
RUN pnpm install 

# Copy the rest of the application
COPY --chown=node:node . .

# Build the application
RUN pnpm run build

RUN chown node:node -R /app

USER node