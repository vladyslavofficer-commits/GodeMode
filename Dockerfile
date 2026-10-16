FROM node:24-alpine
WORKDIR /app
COPY package.json auth.mjs engine.mjs mrkt.mjs server.mjs ./
COPY public ./public
ENV HOST=0.0.0.0 PORT=3000
USER node
EXPOSE 3000
CMD ["node", "server.mjs"]
