/*process.on('uncaughtException', (err) => {
	console.log("err::---->>>>",err);
});*/
singupClass = require('./singup_class.js');
com = require('./comm_function_class.js');
cdClass = require('./common.class.js');
dashClass = require("./mecanismofdash.class.js");
trackClass = require('./tracking.class.js');

const _ = require("underscore");
module.exports = {


	HDD: function (data, client) {


		db.collection('game_users').findAndModify({ _id: MongoId(client.uid) }, {},
			{
				$set: {
					is_first: 0,
					socketid: client.socketid,
					sid: SERVERID,
					lgs: 0,
					lgsn: 0,
					reConnID: ""
				}
			}, { new: true }, function (err, udata) {


			});
	}
};