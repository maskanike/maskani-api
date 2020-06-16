FROM node:14.4.0-alpine
LABEL maintainer="Samuel Magondu <samuel@maskani.co.ke>"

WORKDIR /www

ADD application/package.json application/yarn.lock /www/
RUN apk --no-cache add --virtual builds-deps build-base python
RUN yarn && yarn cache clean;
RUN npm rebuild bcrypt --build-from-source .
RUN yarn global add pm2

ADD application /www

CMD ["yarn", "start"]