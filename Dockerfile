# syntax=docker/dockerfile:1
FROM jaidchen/node-app:main

COPY . .
ARG nodeEnv=production
RUN mkdir --parents .config/github-release-writer
RUN NODE_ENV=development npm install
RUN NODE_ENV=$nodeEnv node_modules/.bin/webpack
RUN chown --recursive $userName .

VOLUME $userHome/.config/github-release-writer
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 CMD wget -q --spider "localhost:39411/github-release-writer/health" || exit 1

USER $userName
CMD NODE_ENV=$nodeEnv node dist/package/production/main.js
