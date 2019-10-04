require('../env');

const http = require('http');
const next = require('next');
const routes = require('next-routes');

const env = process.env.NODE_ENV;
const port = process.env.PORT;

const app = next({ dev: env === 'development' });

const pages = routes()
  .add('home', '/', 'index')
  .add('collective', '/:slug', 'new-collective-page')
  .add('editCollective', '/:slug/edit/:section?');

const handler = pages.getRequestHandler(app);

console.info(`Starting the alt app, preparing Next.js`);

app.prepare().then(() => {
  console.info(`Next.js is prepared`);

  const httpServer = http.createServer(handler);

  httpServer.on('error', err => {
    console.error(`Can't start server on http://localhost:${port} in ${env} environment. %s`, err);
  });

  httpServer.listen(port, () => {
    console.info(`Ready on http://localhost:${port} in ${env} environment`);
  });
});
