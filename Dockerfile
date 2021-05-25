FROM node:14-slim
LABEL maintainer="Samuel Magondu <samuel@maskani.co.ke>"

WORKDIR /www

ADD application/package.json application/yarn.lock /www/
RUN yarn;
RUN yarn global add pm2

ADD application /www

CMD ["yarn", "start"]
