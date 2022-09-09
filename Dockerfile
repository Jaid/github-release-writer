# syntax=docker/dockerfile:1
FROM jaidchen/node-app:main

RUN apt-get --option Acquire::Retries=60 --option Acquire::http::Timeout=180 update
RUN apt-get --option Acquire::Retries=60 --option Acquire::http::Timeout=180 --yes --quiet install g++ make libpng-dev zlib1g-dev

COPY . src
RUN chown --recursive $userName .
ARG nodeEnv=production

WORKDIR $userHome/src
USER $userName
RUN mkdir --parents .config/github-release-writer
RUN NODE_ENV=development npm install
RUN NODE_ENV=$nodeEnv node_modules/.bin/webpack
WORKDIR $userHome
RUN cp --recursive dist/package/$nodeEnv dist
RUN rm --recursive --force src

VOLUME $userHome/.config/github-release-writer
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 CMD wget -q --spider "localhost:39411/github-release-writer/health" || exit 1

CMD NODE_ENV=$nodeEnv node dist/main.js