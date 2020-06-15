FROM node:14.4.0-alpine
LABEL maintainer="Samuel Magondu <samuel@maskani.co.ke>"

WORKDIR /www

ADD application/package.json application/yarn.lock /www/
RUN yarn install \
	&& yarn cache clean;

ADD application /www

CMD ["yarn", "start"]