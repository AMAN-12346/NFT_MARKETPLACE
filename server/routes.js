//v7 imports
import userV1 from "./api/v1/controllers/user/routes";
import adminV1 from "./api/v1/controllers/admin/routes";
import staticV1 from "./api/v1/controllers/static/routes";
import petstoreV1 from "./api/v1/controllers/petstore/routes";
import circuitV1 from "./api/v1/controllers/circuit/routes";
import practiceV1 from "./api/v1/controllers/practice/routes";
import eventV1 from "./api/v1/controllers/event/routes";
import nftV1 from "./api/v1/controllers/nft/routes";
import chatController from "./api/v1/controllers/chat/routes";
import group from "./api/v1/controllers/group/routes";


/**
 *
 *
 * @export
 * @param {any} app
 */

export default function routes(app) {
	var unless = function (middleware, ...paths) {
		return function (req, res, next) {
			const pathCheck = paths.some((path) => path === req.path);
			pathCheck ? next() : middleware(req, res, next);
		};
	};

	/*------------v1 routes--------------------*/

	app.use("/api/v1/user", userV1)
	app.use("/api/v1/admin", adminV1)
	app.use("/api/v1/static", staticV1)
	app.use("/api/v1/petstore", petstoreV1)
	app.use("/api/v1/circuit", circuitV1)
	app.use("/api/v1/practice", practiceV1)
	app.use("/api/v1/event", eventV1)
	app.use("/api/v1/nft", nftV1)
	app.use('/api/v1/chat',chatController)
	app.use('/api/v1/group', group);


	return app;
}
