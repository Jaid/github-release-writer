# syntax=docker/dockerfile:1
FROM jaidchen/node-app
COPY . .
RUN chown -R app /opt/app
USER app
ENV NODE_ENV=production
RUN npm install
RUN npx webpack
CMD [ "node", "dist/package/production/index.js" ]