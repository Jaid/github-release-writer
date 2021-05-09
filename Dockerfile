# syntax=docker/dockerfile:1
FROM jaidchen/node-app
ENV NODE_ENV=production
COPY . .
RUN chown --recursive app /opt/app && mkdir --parents /home/app/.config/github-release-writer && chown --recursive app /home/app/.config/github-release-writer
USER app
RUN NODE_ENV=development npm install
RUN node_modules/.bin/webpack
CMD ["/bin/bash", "-c", "node $(npx find-by-extension-cli js --fullPath --cwd dist/package/production)"]
VOLUME /home/app/.config/github-release-writer
