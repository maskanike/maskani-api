FROM node:16.14.2-slim
LABEL maintainer="Samuel Magondu <samuel@maskani.co.ke>"

WORKDIR /www

ADD application/package.json application/yarn.lock /www/
RUN yarn && yarn cache clean;
RUN yarn global add pm2

ADD application /www

CMD ["yarn", "start"]
