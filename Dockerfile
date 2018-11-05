FROM node:8-slim

WORKDIR /home/nodeuser/app

COPY package*.json ./

COPY . .

RUN groupadd -r nodeuser && useradd -r -g nodeuser -G audio,video nodeuser \
    && mkdir -p /home/nodeuser/Downloads \
    && mkdir -p /home/nodeuser/app \
    && chown -R nodeuser:nodeuser /home/nodeuser

USER nodeuser

RUN npm install --only=production

COPY . .

CMD ["npm", "start"]