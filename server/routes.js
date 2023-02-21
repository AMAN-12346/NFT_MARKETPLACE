//v7 imports
import user from "./api/v1/controllers/user/routes";
import staticContent from "./api/v1/controllers/static/routes";
import admin from './api/v1/controllers/admin/routes';
import collection from './api/v1/controllers/collection/routes';
import nft from './api/v1/controllers/nft/routes';
import order from './api/v1/controllers/order/routes';
import bid from './api/v1/controllers/bid/routes';
import activity from './api/v1/controllers/activity/routes';
import history from './api/v1/controllers/history/routes';
import notification from './api/v1/controllers/notification/routes';
import brand from './api/v1/controllers/brand/routes';
import physicalNft from './api/v1/controllers/physicalNft/routes';
import tracking from './api/v1/controllers/tracking/routes';



/**
 *
 *
 * @export
 * @param {any} app
 */

export default function routes(app) {

  app.use("/api/v1/user", user);
  app.use('/api/v1/static', staticContent);
  app.use('/api/v1/admin', admin);
  app.use('/api/v1/collection', collection);
  app.use('/api/v1/nft', nft);
  app.use('/api/v1/order', order);
  app.use('/api/v1/bid', bid);
  app.use('/api/v1/activity', activity);
  app.use('/api/v1/history', history);
  app.use('/api/v1/notification', notification);
  app.use('/api/v1/brand', brand);
  app.use('/api/v1/physicalNft', physicalNft);
  app.use('/api/v1/tracking',tracking)





  return app;
}
