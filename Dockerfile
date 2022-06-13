# syntax=docker/dockerfile:1
FROM jaidchen/node-app
COPY . .
RUN chown --recursive $userName .
USER $userName
ARG nodeEnv=production
RUN mkdir --parents /home/$userName/.config/$(package-field-cli name)
RUN NODE_ENV=development npm install
RUN NODE_ENV=$nodeEnv node_modules/.bin/webpack
CMD NODE_ENV=$nodeEnv node dist/package/production/main.js
VOLUME /home/$userName/.config/$(package-field-cli name)