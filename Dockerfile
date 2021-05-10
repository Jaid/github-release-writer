# syntax=docker/dockerfile:1
FROM jaidchen/node-app
COPY . .
RUN chown --recursive $userName .
USER $userName
RUN mkdir --parents /home/$userName/.config/$(package-field-cli name)
RUN NODE_ENV=development npm install
RUN node_modules/.bin/webpack
CMD node $(find-by-extension-cli js --fullPath --cwd dist/package/production)
VOLUME /home/$userName/.config/github-release-writer