FROM node:12.10.0-alpine
LABEL maintainer="Samuel Magondu <samuel@flatspad.com>"

WORKDIR /www

ADD application/package.json application/yarn.lock /www/
RUN yarn install \
	&& yarn cache clean;

ADD application /www

CMD ["yarn", "start"]