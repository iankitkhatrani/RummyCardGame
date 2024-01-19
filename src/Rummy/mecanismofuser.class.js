

const _ = require("underscore");

jokerCalss = require('./jokermode.class.js');
gamelogicClass = require('./gamelogic.class.js');
com = require('./comm_function_class.js');
mechanismClass = require('./mechanismofPlaying.class.js');
userClass = require('./mecanismofuser.class.js');
TournamnetClass = require('./tournament.class.js');

const fs = require('fs')

module.exports = {
	/*
		MyProfile :-->>
		data:{}
		User Profile list
	*/
	MP: (data, client, callback) => {


		db.collection('game_users').find({ _id: MongoId(client.uid.toString()) }).project({
			pn: 1, pp: 1, ccf: 1, unique_id: 1, cd: 1, chips: 1, gems: 1, counters: 1, friend: 1, NormalEntryGold: 1, level: 1, vip_level: 1, "track.lastWL": 1, "track.lastTWL": 1
		}).toArray((err, uData) => {
			if (!err && uData.length > 0) {
				uData[0].cd = com.CreateDate(uData[0].cd);

				uData[0].counters.fc = uData[0].friend.length;

				if (typeof callback == "function") {

					return callback({
						"flag": ErrorMsg.SUCCESS,
						"msg": ErrorMsg[client.lc + "_0000"],
						"data": uData[0],
						"en": "MP",
						"errcode": "0000"
					})
				}

			} else {
				if (typeof callback == "function") {
					return callback({
						"flag": ErrorMsg.FAIL,
						"msg": ErrorMsg[client.lc + "_1010"],
						"data": {},
						"en": "MP",
						"errcode": "1010"
					})
				}
			}
		});
	},
	ROBOTPLAY: (i) => {

		db.collection('game_users').find({ "flags._iscom": 1, s: 'free' }).toArray((err, robotData) => {


			if (!err && robotData.length > 0) {

				var upData = { $set: { s: "busy", "flags._io": 1 } };

				db.collection("game_users").findAndModify({ _id: MongoId(robotData[0]._id) }, {},
                	/*{$set:{s:"busy",tbid:tbid,"flags._io":1}}*/upData, { new: true }, (err, rbdata) => {


					if (!err && rbdata.value != null) {

						rclient.hmset('session:' + rbdata.value._id, 'socketid', rbdata.value._id.toString());
						rclient.hmset('session:' + rbdata.value._id, 'pn', rbdata.value.pn);
						rclient.hmset('session:' + rbdata.value._id, 'pp', rbdata.value.pp);
						rclient.hmset('session:' + rbdata.value._id, 'ult', rbdata.value.ult);
						rclient.hmset('session:' + rbdata.value._id, 'uid', rbdata.value._id.toString());
						rclient.hmset('session:' + rbdata.value._id, '_iscom', rbdata.value.flags._iscom);
						rclient.hmset('session:' + rbdata.value._id, 'v', parseInt(rbdata.value.version.aVersion));
						rclient.hmset('session:' + rbdata.value._id, 'viplvl', parseInt(rbdata.value.vip_level.vip_lvl));


						rclient.srem("Robot_free_6", rbdata.value._id.toString());
						rclient.sadd("robots_busy", rbdata.value._id.toString());



						rclient.hgetall('session:' + rbdata.value._id, (err, ct) => {
							// mechanismClass.FindSetAndJoin(tbid,ct)
							mechanismClass.PLAYGAME({ knock: 1, jokermode: 0, bv: 100 }, ct)
							i++;

							if (i < 150) {
								setTimeout(() => {
									userClass.ROBOTPLAY(i);
								}, 5000);
							}
						});
					}
				});

			}
		});

	},
	/*
		Opp User Profile
		data:oppid//Opp User _id
	*/
	OUP: (data, client, callback) => {

		if (data.oppid == undefined || data.oppid.length != 24 || data.oppid == null) {
			if (typeof callback == "function") {
				return callback({
					"flag": ErrorMsg.FAIL,
					"msg": ErrorMsg[client.lc + "_1010"],
					"data": {},
					"en": "OUP",
					"errcode": "1010"
				})
			}

		}

		cdClass.GetUserInfo(client.uid.toString(), { block: 1, friend: 1/*,request:1*/ }, (uData) => {
			if (uData) {
				db.collection('game_users').find({ _id: MongoId(data.oppid) }).project({ pn: 1, pp: 1, friend: 1, "flags._iscom": 1, unique_id: 1, cd: 1, ccf: 1, chips: 1, gems: 1, counters: 1, level: 1, vip_level: 1, block: 1, "track.lastWL": 1, "track.lastTWL": 1 }).toArray((err, oppData) => {
					if (!err && oppData.length > 0) {
						if (oppData[0].flags._iscom == 0)
							oppData[0].counters.fc = oppData[0].friend.length;

						oppData[0].OppUserBlock = false;
						var oub = "";


						oub = _.find(oppData[0].block, function (num) { return num.toString() == client.uid.toString() });


						if (typeof oub != 'undefined' && oub.toString() == client.uid.toString()) {
							oppData[0].OppUserBlock = true
						}

						oppData[0].IBlockOppUser = false;

						var ibo = "";

						ibo = _.find(uData.block, function (num) { return num.toString() == data.oppid.toString() });


						if (typeof ibo != 'undefined' && ibo.toString() == data.oppid.toString()) {
							oppData[0].IBlockOppUser = true
						}


						oppData[0].SendFreindRequest = false;
						/*var sfr="";

						
						sfr= _.find(uData.request, function(num){  return num.toString() == data.oppid.toString()});

					
						if(typeof sfr != 'undefined' && sfr.toString() == data.oppid.toString()){
							oppData[0].SendFreindRequest=true
						}*/
						db.collection("notification").find({
							s: client.uid,
							r: oppData[0]._id.toString(),
							t: "friend_req"
						}).toArray((err, findfriendreq) => {

							if (!err && findfriendreq.length > 0) {
								oppData[0].SendFreindRequest = true;
							}


							oppData[0].MyFreind = false;
							var mf = "";

							mf = _.find(uData.friend, function (num) { return num.toString() == data.oppid.toString() });


							if (typeof mf != 'undefined' && mf.toString() == data.oppid.toString()) {
								oppData[0].MyFreind = true
							}



							oppData[0].cd = com.CreateDate(oppData[0].cd);

							if (typeof callback == "function") {
								return callback({
									"flag": ErrorMsg.SUCCESS,
									"msg": ErrorMsg[client.lc + "_0000"],
									"data": oppData[0],
									"en": "OUP",
									"errcode": "0000"
								})
							}
						})
					} else {
						if (typeof callback == "function") {
							return callback({
								"flag": ErrorMsg.FAIL,
								"msg": ErrorMsg[client.lc + "_1010"],
								"data": {},
								"en": "OUP",
								"errcode": "1010"
							})
						}
					}
				});
			} else {
				if (typeof callback == "function") {
					return callback({
						"flag": ErrorMsg.FAIL,
						"msg": ErrorMsg[client.lc + "_1010"],
						"data": {},
						"en": "OUP",
						"errcode": "1010"
					})
				}
			}
		});
	},
	/*
		UpDate User Profile
	*/
	UUP: (data, client, callback) => {
		var updata = {
			$set: {}
		}

		if (typeof data.pn != "undefined" && data.pn != "") {
			updata['$set']['pn'] = data.pn;
			rclient.hmset('session:' + client.socketid, 'pn', data.pn);
		}

		if (typeof data.pp != "undefined" && data.pp != "") {
			updata['$set']['pp'] = data.pp;
			//upload\UserUpload\1568374068284.jpg

			if(data.pp.indexOf('UserUpload') != -1 ){
				db.collection('update_user_profile').insert({
					cd : new Date(),
					pp :config.BU+data.pp,
					uid:client.uid.toString()
				},()=>{})
			}
			
			if (client.pp != undefined && client.pp.indexOf('UserUpload') != -1) {
				fs.unlink("public/" + client.pp, () => {

				})
			}

			rclient.hmset('session:' + client.socketid, 'pp', data.pp);

		}

		if (typeof data._pn != "undefined" && data._pn != "") {
			updata['$set']['flags._pn'] = data._pn;
		}

		//Chalange 1 atle koi moklai nai sake and 0 atle mokli sake 
		if (typeof data._ch != "undefined") {
			updata['$set']['flags._ch'] = data._ch;
		}

		if (typeof data.drw != "undefined") {
			updata['$set']['reward.drw'] = {};
		}

		if (typeof data.wrw != "undefined") {
			updata['$set']['reward.wrw'] = {};
		}

		if (typeof data.lr != "undefined") {
			updata['$set']['reward.lr'] = {};
		}

		if (typeof data.tew != "undefined") {
			updata['$set']['reward.tew'] = {};
		}

		if (typeof data.tmr != "undefined") {
			updata['$set']['reward.tmr'] = {};
		}

		if (typeof data.llw != "undefined") {
			updata['$set']['reward.llw'] = {};
		}

		if (typeof data.srw != "undefined") {
			updata['$set']['reward.srw'] = {};
		}
		if (typeof data.mge != "undefined") {
			updata['$set']['reward.mge'] = {};
		}

		if (typeof data.fge != "undefined") {
			updata['$set']['reward.fge'] = {};
		}


		if (typeof updata != 'undefined') {
			db.collection("game_users").findAndModify({ _id: MongoId(client.uid.toString()) }, {}, updata, { new: true }, (err, newdata) => {
				if (!err && newdata.value != null) {

					if (typeof data.tmr != "undefined" || typeof data.llw != "undefined" || typeof data.drw != "undefined" || typeof data.wrw != "undefined" || typeof data.lr != "undefined" || typeof data.tew != "undefined") {
						return false;
					}

					newdata.value.cd = com.CreateDate(newdata.value.cd);
					newdata.value.counters.fc = newdata.value.friend.length;

					if (typeof callback == "function") {

						return callback({
							"flag": ErrorMsg.SUCCESS,
							"msg": ErrorMsg[client.lc + "_0000"],
							"data": newdata.value,
							"en": "UUP",
							"errcode": "0000"
						})
					}
				} else {
					if (typeof callback == "function") {

						return callback({
							"flag": ErrorMsg.FAIL,
							"msg": ErrorMsg[client.lc + "_1010"],
							"data": {},
							"en": "UUP",
							"errcode": "1010"
						})
					}

				}
			});
		} else {
			if (typeof callback == "function") {

				return callback({
					"flag": ErrorMsg.FAIL,
					"msg": ErrorMsg[client.lc + "_1010"],
					"data": {},
					"en": "UUP",
					"errcode": "1010"
				})
			}

		}
	},

	// Manage update profile
	MUP: (data, client, callback) => {
		var updata = {
			$set: {}
		}

		if (typeof data.Mode_introduction != "undefined" && data.Mode_introduction != "") {
			updata['$set']['Tutorial.Mode_introduction'] = data.Mode_introduction;
		}

		if (typeof data.Special_Mode != "undefined" && data.Special_Mode != "") {
			updata['$set']['Tutorial.Special_Mode'] = data.Special_Mode;
		}

		if (typeof data.Star_Player != "undefined" && data.Star_Player != "") {
			updata['$set']['Tutorial.Star_Player'] = data.Star_Player;
		}

		if (typeof data.Private_Table != "undefined" && data.Private_Table != "") {
			updata['$set']['Tutorial.Private_Table'] = data.Private_Table;
		}

		if (typeof data.Live_Table != "undefined" && data.Live_Table != "") {
			updata['$set']['Tutorial.Live_Table'] = data.Live_Table;
		}

		if (typeof data.Tournament != "undefined" && data.Tournament != "") {
			updata['$set']['Tutorial.Tournament'] = data.Tournament;
		}

		if (typeof data.Daily_Spin != "undefined" && data.Daily_Spin != "") {
			updata['$set']['Tutorial.Daily_Spin'] = data.Daily_Spin;
		}

		if (typeof data.Event_10 != "undefined" && data.Event_10 != "") {
			updata['$set']['Tutorial.Event_10'] = data.Event_10;
		}

		if (typeof data.Champion_League != "undefined" && data.Champion_League != "") {
			updata['$set']['Tutorial.Champion_League'] = data.Champion_League;
		}

		if (typeof data.Gin_Master != "undefined" && data.Gin_Master != "") {
			updata['$set']['Tutorial.Gin_Master'] = data.Gin_Master;
		}

		if (typeof data.Mini_Game != "undefined" && data.Mini_Game != "") {
			updata['$set']['Tutorial.Mini_Game'] = data.Mini_Game;
		}

		if (typeof data.Free_Gold != "undefined" && data.Free_Gold != "") {
			updata['$set']['Tutorial.Free_Gold'] = data.Free_Gold;
		}

		if (typeof updata != 'undefined') {
			db.collection("game_users").findAndModify({ _id: MongoId(client.uid.toString()) }, {}, updata, { new: true }, (err, newdata) => {
				if (!err && newdata.value != null) {

					if (typeof callback == "function") {

						return callback({
							"flag": ErrorMsg.SUCCESS,
							"msg": ErrorMsg[client.lc + "_0000"],
							"data": newdata.value,
							"en": "MUP",
							"errcode": "0000"
						})
					}
				} else {
					if (typeof callback == "function") {

						return callback({
							"flag": ErrorMsg.FAIL,
							"msg": ErrorMsg[client.lc + "_1010"],
							"data": {},
							"en": "MUP",
							"errcode": "1010"
						})
					}

				}
			});
		} else {
			if (typeof callback == "function") {

				return callback({
					"flag": ErrorMsg.FAIL,
					"msg": ErrorMsg[client.lc + "_1010"],
					"data": {},
					"en": "MUP",
					"errcode": "1010"
				})
			}

		}
	},
	/*
		find user to which boot value to PALY
		NormalEntryGold
	*/
	FindUserPlayBoot: (data, callback) => {
		if (typeof data.chips == 'undefined' && data.chips == null && data.chips == '') {
			return callback([100]);
		}
		var ts = config.TABLE_SLOT;
		var array = [];

		var max = data.chips / 10;
		var min = max / 10;


		if (max <= ts[0])
			array.push(ts[0]);

		for (var i = 0; i < ts.length; i++) {
			if (ts[i] <= max && ts[i] >= min)
				array.push(ts[i])
		}


		if (min >= ts[ts.length - 1]) {
			array.push(ts[ts.length - 1]);
		}

		if (array.length == 0) {
			array.push(ts[0]);
		}

		callback(array)
	},
	ManageUserLevel_update_get: (ulevel, xp, type, extraadd) => {


		extraadd = (typeof extraadd != "undefined" || extraadd != undefined) ? extraadd : 1;


		/*switch(key){
			case 'thp':
				xp=2;
				break;
			case 'WIN':
				xp=5;
				break;
			case "thpit":
				xp=5;
				break;
			case "TWIN":
				xp=10;
				break;
			default:
				return false;
		}*/

		var level = {};
		var vip_level = {};

		if (typeof ulevel == 'undefined') {

			level = {
				"clvl": 1,
				"cp": 0,
				"per": 0,
			}
		} else {
			level = ulevel;
		}
		var into = 50;
		var plus = 20;

		switch (parseInt(level.clvl)) {
			case 1:
				into = 1;
				plus = 10; //5
				break;
			case 2:
				into = 1;
				plus = 20; //10
				break;
			case 3:
			case 4:
			case 5:
			case 6:
			case 7:
				into = 1;
				plus = 30; //15 every 15 game level up
				break;
		}


		var cp = xp + parseInt(level.cp);

		var nlvp = parseInt(level.clvl) * into + plus;

		var nlvl = (nlvp <= cp) ? parseInt(level.clvl) + 1 : parseInt(level.clvl);

		var np = (nlvp <= cp) ? cp - nlvp : cp;

		var into = 50;
		var plus = 20;

		switch (parseInt(nlvl)) {
			case 1:
				into = 1;
				plus = 10; //5
				break;
			case 2:
				into = 1;
				plus = 20; //10
				break;
			case 3:
			case 4:
			case 5:
			case 6:
			case 7:
				into = 1;
				plus = 30; //15 every 15 game level up
				break;
		}


		var nlvp = (parseInt(nlvl) != parseInt(level.clvl)) ? parseInt(nlvl) * into + plus : nlvp;


		var per = Math.round((np * 100) / nlvp);
		var xp = 0;

		switch (type) {
			case 'loss':
				xp = 2 * extraadd;
				break;
			case 'WIN':
				xp = 7 * extraadd;
				break;
			case "losst":
				xp = 5 * extraadd;
				break;
			case "TWIN":
				xp = 15 * extraadd;
				break;
		}
		var up_level = {
			clvl: nlvl,
			cp: np,
			per: per,
			xp: xp
		};

		return up_level;
	},
	/*
	Manege user Level :---and update progress bar
	*/
	ManageUserLevel: (key, id, isleague, total) => {


		cdClass.GetUserInfo(id.toString(), { "flags": 1, level: 1, vip_level: 1, unlock: 1, version: 1 }, (uData) => {
			if (uData) {

				rclient.get("Usercard:" + id.toString() + ":double_xp_coupon", function (err, card_extra) {

					var extraadd = 1;
					if (!err && card_extra != null) {
						extraadd = card_extra
					}
					var xp = 0;
					//If Robot 
					if (uData.flags._iscom == 1) {
						switch (key) {
							case 'thp':
								xp = 1 * extraadd;
								break;
							case 'WIN':
							case "thpit":
							case "TWIN":
								xp = 2 * extraadd;
								break;
							default:
								return false;
						}
					} else {

						switch (key) {
							case 'thp':
								xp = 2 * extraadd;
								break;
							case 'WIN':
								xp = 5 * extraadd;
								break;
							case "thpit":
								xp = 5 * extraadd;
								break;
							case "TWIN":
								xp = 10 * extraadd;
								TonkMasterClass.track_point(3, id.toString(), "Tournament")
								break;
							case "xp":
								xp = config.popupforxp * extraadd;
								break;
							case "xpchest":
								xp = total;
								break;
							case "xpHOL":
								xp = total;
								break;
							default:
								return false;
						}
					}

					var level = {};
					var vip_level = {};

					if (typeof uData.level == 'undefined') {
						level = {
							"clvl": 1,
							"cp": 0,
							"per": 0,
						}
					} else {
						level = uData.level;
					}
					var into = 50;
					var plus = 20;

					switch (level.clvl) {
						case 1:
							into = 1;
							plus = 10; //5
							break;
						case 2:
							into = 1;
							plus = 20; //10
							break;
						case 3:
						case 4:
						case 5:
						case 6:
						case 7:
							into = 1;
							plus = 30; //15 every 15 game level up
							break;
					}

					var cp = xp + level.cp;

					var nlvp = level.clvl * into + plus;

					var nlvl = (nlvp <= cp) ? level.clvl + 1 : level.clvl;

					var np = (nlvp <= cp) ? cp - nlvp : cp;

					var into = 50;
					var plus = 20;

					switch (parseInt(nlvl)) {
						case 1:
							into = 1;
							plus = 10; //5
							break;
						case 2:
							into = 1;
							plus = 20; //10
							break;
						case 3:
						case 4:
						case 5:
						case 6:
						case 7:
							into = 1;
							plus = 30; //15 every 15 game level up
							break;
					}


					var nlvp = (parseInt(nlvl) != parseInt(level.clvl)) ? parseInt(nlvl) * into + plus : nlvp;

					var per = Math.round((np * 100) / nlvp);


					var up_level = {
						clvl: nlvl,
						cp: np,
						per: per,
					};


					if (isleague == undefined || isleague == 0)
						trackClass.TrackGemsQuestGame(id.toString(), 4, xp)

					cdClass.SendDataToUser(id.toString(), { en: "LINFO", data: { level_info: up_level, xp: xp } });

					if (uData.flags._iscom == 0)
						trackClass.TrackSpinGame(id.toString(), 14, xp)


					if (nlvl != level.clvl) {


						//send Level up Screen up update
						var Bonus = 5000;
						var vbonus = 2500;

						if (level.clvl <= 10) {
							Bonus = level.clvl * 500;
							if (level.clvl <= 5)
								vbonus = level.clvl * 500
						}
						// divyesh kidhu tu type add krvanu bug ma javabdar divyesh rehs
						cdClass.SendDataToUser(id.toString(), { en: "LUP", data: { type: key, new_level: nlvl, chips: Bonus } });

						cdClass.updateUserGold(id.toString(), Bonus, "level UP - " + level.clvl, 10);

						if (uData.flags._iscom == 0) {
							trackClass.TrackSpinGame(id, 18, 1)
						}

						if (uData.version.aVersion != undefined && parseInt(uData.version.aVersion) >= parseInt(config.VIDEONOTIVERSION)) {
							notiClass.sendvideonoti({
								uid: id.toString(), chips: vbonus,
								hmsg: "<center><big><font color=#ffda2c>Get more Level up Bonus</font></big><br><font color=#ffffff>Earn More chips For watch video.</font></center>",
								t: "levelUP",
								img: "upload/notiimage/levelup.png"
							})
						}

						var vip_level = {};
						if (typeof uData.vip_level == 'undefined') {
							vip_level = { "vip_lvl": 0 };
						} else {
							vip_level = uData.vip_level;
						}

						//up_level.cp=np;
						//up_level.per=0;


						var SetData = {
							$set: { level: up_level,/*vip_level:up_vip_level,*/ }
						}

						//var isvip=0;
						if (nlvl >= 7 && uData.flags._vip == 0) {
							//isvip=1;
							SetData["$set"]["flags._vip"] = 1
						}

						if (uData.flags._iscom == 0 && uData.version.aVersion != undefined && parseInt(uData.version.aVersion) >= 36) {
							SetData["$set"]["last.xut"] = new Date()
							SetData["$inc"] = {};
							SetData["$inc"] = { "wxp": xp, "dxp": xp }

						}

						if (nlvl >= 5 && uData.unlock.converter == 0) {
							//isvip=1;
							SetData["$set"]["unlock.converter"] = 1
						}

						if (nlvl >= 15 && uData.unlock.hollywood == 0) {
							//isvip=1;
							SetData["$set"]["unlock.hollywood"] = 1
							cdClass.SendDataToUser(id.toString(), { en: "UHT", data: {} });

						}


						userClass.UpdateVipLevel(1, id)

						db.collection('game_users').update({ _id: MongoId(id.toString()) },
							SetData, (err, up) => {

							});

					} else {
						if (typeof id == 'string' && id.length == 24) {

							/*db.collection('game_users').update({_id:MongoId(id.toString())},
								{
									$set:{level:up_level}
								},(err,up)=>{
							});*/

							var SetData = {
								$set: { level: up_level }
							}

							if (uData.flags._iscom == 0 && uData.version.aVersion != undefined && parseInt(uData.version.aVersion) >= 36) {
								SetData["$set"]["last.xut"] = new Date()
								SetData["$inc"] = {};
								SetData["$inc"] = { "wxp": xp, "dxp": xp }
							}

							db.collection('game_users').update({ _id: MongoId(id.toString()) }, SetData, function (err, up) {

							});

						}
					}
				})
			}
		});
	},
	AL: (data, client) => {
		cdClass.GetUserInfo(client.uid.toString(), {}, (uData) => {
			var avatarList = [];
			var otherprofile = [];
			if (typeof uData.avatarList != 'undefined') {
				avatarList = uData.avatarList;
			}

			if (typeof uData.otherprofile != 'undefined' && uData.otherprofile.length > 0) {
				otherprofile = uData.otherprofile;
			}


			db.collection('avatar').find({
			}).sort({ price: 1 }).toArray((err, findAL) => {
				if (!err && findAL.length > 0) {

					for (var i = 0; i < findAL.length; i++) {

						if (avatarList.indexOf(findAL[i]._id.toString()) >= 0) {
							findAL[i].price = 0;
						}
					}

					findAL = findAL.concat(otherprofile)

					findAL.sort(function (e, f) {
						return parseInt(e.price) - parseInt(f.price);
					})

					cdClass.SendData(client, 'AL', findAL, "success:0000");

				} else {
					cdClass.SendData(client, 'AL', {}, "success:0000");
					//Not avatar 
				}
			});
		});
	},
	/*
		data:{
			image:""
		}
	*/
	AFGI: (data, client) => {

		db.collection('game_users').update({
			_id: MongoId(client.uid.toString()),
			"otherprofile.image": { $ne: data.image }
		}, {
			$addToSet: {
				otherprofile: {
					price: -1,
					img: data.image,
					isavatar: 0
				}
			}
		}, (err) => {
			cdClass.SendData(client, 'AFGI', { flags: true }, "success:0000");
		})

	},
	/*
		Purchase Avatar List
		Data:{
			aid:''
		}
	*/
	PA: (data, client) => {
		if (!data.aid) {
			cdClass.SendData(client, 'PA', {}, "error:1010");
		}


		db.collection('avatar').find({
			_id: MongoId(data.aid.toString())
		}).toArray((err, paData) => {
			if (!err && paData.length > 0) {

				db.collection("game_users").find({
					_id: MongoId(client.uid),
					avatarList: data.aid.toString()
				}).toArray((ferr, uData) => {
					if (!ferr && uData.length > 0) {

						cdClass.SendData(client, 'PA', paData[0], "success:0000");

					} else {
						db.collection("game_users").find({ _id: MongoId(client.uid) }).toArray((ferr, uData) => {

							if (!ferr && uData.length > 0 && uData[0].chips >= paData[0].price) {

								cdClass.updateUserGold(client.uid.toString(), -paData[0].price, "Purchase Avatar", 11);

								db.collection('game_users').update({
									_id: MongoId(client.uid.toString()),
								}, {
									$addToSet: {
										avatarList: data.aid.toString()
									}
								}, (err) => {
									cdClass.SendData(client, 'PA', paData[0], "success:0000");
								})
							} else {
								cdClass.SendData(client, 'PA', {}, "error:3011");
							}
						})
					}
				});
			} else {
				cdClass.SendData(client, 'PA', {}, "error:1010");
			}
		})

	},
};