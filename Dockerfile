# syntax=docker/dockerfile:1
FROM jaidchen/node-app:main
COPY . .
RUN chown --recursive $userName .
USER $userName
ARG nodeEnv=production
RUN mkdir --parents /home/$userName/.config/$(package-field-cli name)
RUN NODE_ENV=development npm install
RUN NODE_ENV=$nodeEnv node_modules/.bin/webpack
CMD NODE_ENV=$nodeEnv node dist/package/production/main.js
VOLUME /home/$userName/.config/$(package-field-cli name)
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 CMD wget -q --spider "localhost:39411/github-release-writer/health" || exit 1