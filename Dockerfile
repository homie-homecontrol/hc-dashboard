FROM --platform=$BUILDPLATFORM node:16-alpine as serverbuild
ARG BUILDPLATFORM
ENV NODE_OPTIONS=--max-old-space-size=4096

COPY backend /backend/
WORKDIR /backend/
RUN yarn --pure-lockfile
RUN yarn run gulp prod

COPY frontend /frontend/
WORKDIR /frontend
RUN yarn --pure-lockfile
RUN yarn run build


FROM node:16-alpine
COPY --from=serverbuild /backend/dist/ /backend/
COPY --from=serverbuild /frontend/dist/* /backend/public_html/
WORKDIR /backend/
RUN yarn --pure-lockfile  --production=true


ENV HCDASH_HOST=0.0.0.0
ENV HCDASH_PORT=8443

EXPOSE 8443

WORKDIR /backend/
CMD ["node", "service.js"]

