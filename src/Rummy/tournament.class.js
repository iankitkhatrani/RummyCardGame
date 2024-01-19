TournamnetClass = require('./tournament.class.js');
dashClass = require("./mecanismofdash.class.js");
const util = require("util");
module.exports = {
	/*  List Of betvalue   */
	LT: (data, client, callback) => {
		cdClass.UpdateUserData(client.uid.toString(), { $set: { "lgs": 0 } }, function () { });

		var bootvalue2 = (config.Bootvalue2 == undefined) ? [
			{ "bv": 1000, "winbv": 7000 },
			{ "bv": 10000, "winbv": 70000 },
			{ "bv": 50000, "winbv": 350000 },
			{ "bv": 100000, "winbv": 700000 },
			{ "bv": 500000, "winbv": 3500000 }
		] : config.Bootvalue2;


		var bootvalue3 = (config.Bootvalue3 == undefined) ? [
			{ "bv": 1000, "winbv": 8000 },
			{ "bv": 10000, "winbv": 80000 },
			{ "bv": 50000, "winbv": 400000 },
			{ "bv": 100000, "winbv": 800000 },
			{ "bv": 500000, "winbv": 4000000 }
		] : config.Bootvalue3;

		if (typeof callback == "function") {


			return callback({
				"flag": ErrorMsg.SUCCESS,
				"msg": ErrorMsg[client.lc + "_0000"],
				"data": {
					bootvalue2: bootvalue2, bootvalue3: bootvalue3, mode: config.MODE
				},
				"en": "LT",
				"errcode": "0000"
			})

		} else {
			cdClass.SendData(client, "LT", { bootvalue2: bootvalue2, bootvalue3: bootvalue3, mode: config.MODE }, 'error:0000');
		}
	},
	/*
		Play Tournament

		bv:1000
		mode:1 
		ms:2 || 3

	*/
	PT: (data, client) => {

		rclient.setnx("lock:" + client.uid, 1, function (err, uresp) {

			rclient.expire("lock:" + client.uid, 1);  //1

			if (uresp == 0) {

				cdClass.SendData(client, "PT", {}, 'error:3007');
				return false;
			}

			mechanismClass.CheckActiveSeat(client, (active) => {


				if (!active) {
					db.collection("game_users").find({ _id: MongoId(client.uid) }, { chips: 1 }).toArray((err, uData) => {
						if (!err && uData.length > 0 && uData[0].chips >= data.bv && data.winbv != undefined && data.bv != 0) {

							if (typeof data.touId != 'undefined' && data.touId != null && data.touId != "") {
								wh = { _id: MongoId(data.touId), bv: data.bv, "sts": "startup", ms: data.ms, mode: data.mode };
							} else {
								wh = { bv: data.bv, "sts": "startup", ms: data.ms, mode: data.mode };
							}

							if (data.ms == 2) {
								wh["count"] = {};
								wh["count"] = { $lt: 8 };
							} else {
								wh["count"] = {};
								wh["count"] = { $lt: 9 };
							}
							//count:{$lt:9},


							db.collection('tournament').find(wh).toArray(function (err, toudata) {


								if (!err && toudata.length > 0) {
									TournamnetClass.findSeatTournament(toudata[0]._id, client);
								} else {

									TournamnetClass.AutoCreateTour(data, function (id) {

										TournamnetClass.findSeatTournament(id, client);

									})
									//new tournamnet create
								}
							});
						} else {
							cdClass.SendData(client, "PT", {}, 'error:3005');
						}
					})
				}
			})
		})
	},
	findSeatTournament: (tbid, client) => {

		db.collection('tournament').find({
			_id: MongoId(tbid.toString())
		}).toArray(function (err, toudata) {

			if (!err && toudata.length > 0) {

				TournamnetClass.EmptySeatFindForTurna(toudata[0], function (obj) {
					//rn group and pi player index
					if ((toudata.ms == 3 && (typeof obj.rn == 'undefined' || obj.rn > 3 || typeof obj.pi == 'undefined' || obj.pi > 3)) ||
						(toudata.ms == 2 && (typeof obj.rn == 'undefined' || obj.rn > 4 || typeof obj.pi == 'undefined' || obj.pi > 2))
					) {
						//cdClass.SendData(client,"PT",{},'error:7003');

						if (parseInt(client._iscom) == 0) {
							TournamnetClass.AutoCreateTour(toudata[0], function (id) {
								TournamnetClass.findSeatTournament(id, client);
							});
						}

						return false;
					}

					cdClass.GetUserInfo(client.uid.toString(), { last: 1 }, function (udata) {


						db.collection('theme_game_users').find({ uid: MongoId(client.uid.toString()) }).project({ themeList: 1 }).toArray((err, userData) => {

							var remainning_card = 0;
							if (udata != undefined && udata.last != undefined && udata.last.remainning_card_date != -1 && com._getdatedifference(new Date(), udata.last.remainning_card_date) > 0) {
								remainning_card = 1
							}
							var theme = "";

							if (client._iscom == 1 && com.GetRandomInt(0, 1)) {
								var backcard = [
									"upload/themedata/Nature/card.png",
									"upload/themedata/Neon/card.png",
									"upload/themedata/Goofy/card.png",
									"upload/themedata/Lucky Charm/card.png",
									"upload/themedata/Galaxy/card.png",
									"upload/themedata/Parsodoble/card.png",
									"upload/themedata/God Father/card.png",
									"upload/themedata/Horror/card.png",
									"upload/themedata/Pirates/card.png"]

								theme = backcard[com.GetRandomInt(0, backcard.length - 1)]


							}


							var ui = {
								pn: client.pn,
								uid: MongoId(client.uid),
								_iscom: parseInt(client._iscom),
								si: obj.pi,
								socketid: client.socketid,
								pp: client.pp,
								viplvl: parseInt(client.viplvl),
								group: obj.rn,
								jt: new Date(),
								leave: 0,
								oldxp: (client.level != undefined && client.level != null) ? JSON.parse(client.level) : {},
								star_candy: {
									old_candy: 0,
									add_candy: 0,
									total_candy: 0,
								},
								backcard1: (userData.length > 0 && userData[0].themeList != undefined && userData[0].themeList.card != undefined) ? userData[0].themeList.card : theme,
								isTracker: remainning_card
							}


							var set = { $set: { la: new Date(), setrobot: false }, $inc: { count: 1 } };
							set["$set"]["round1." + obj.rn + ".player." + obj.pi + ""] = ui;
							set["$inc"]["round1." + obj.rn + ".count"] = 1;

							if (client._iscom == 1) {
								set["$set"]["larj"] = new Date();
							}


							var wh = { _id: MongoId(toudata[0]._id), count: { $lt: 9 }, "sts": "startup"/*,"round1.player.uid":{$ne:MongoId(client.uid)}*/ };
							wh["round1." + obj.rn + ".player." + obj.pi + ".si"] = { $exists: false };

							db.collection("tournament").findAndModify(wh, {}, set, { new: true }, function (err, ujoin) {

								if (err || ujoin.value == null) {

									if (parseInt(client._iscom) == 0) {
										TournamnetClass.AutoCreateTour(toudata[0], function (id) {

											TournamnetClass.findSeatTournament(id, client);

										})
									} else {

										compClass.CompForFreeTur(client.uid.toString());

									}

								} else {
									var table = ujoin.value;


									if (((table.ms == 3 && table.count < 9) || (table.ms == 2 && table.count < 8)) && config.ROBOT == true && table.count == 1 && toudata[0].setrobot == true) {

										compClass.PutCompToTournament(toudata[0]._id);

										/*setTimeout(function(){
												compClass.PutCompToTournament(toudata[0]._id);
										},40000)*/

									} else {


										if (ujoin.value.larj != undefined && parseInt(com._getdatedifference(ujoin.value.larj, new Date())) > 5) {
											compClass.PutCompToTournament(toudata[0]._id);
										}

									}



									if ((table.ms == 3 && table.count == 9) || (table.ms == 2 && table.count == 8)) {

										setTimeout(function () { // jo aa dealy hoi to last seat ma user aavi ne jato re to two time all event aave 6e 
											TournamnetClass.StartTimer(toudata[0]._id);
										}, 2000)
									}

									cdClass.SendData(client, "TD", table, 'succes:0000');

									//setTimeout(function () {
									cdClass.SendDataToTable(toudata[0]._id.toString(), {
										en: "TJ",
										data: {
											ui: ui
										}
									})
									//},500);

									dashClass.SendGlobelRoomTournament(table)


									//rclient.hmset('session:'+client.socketid,'si',parseInt(Eseat));
									rclient.hmset('session:' + client.socketid, 'toid', toudata[0]._id.toString());


									if (client._iscom == 0) {

										/*if(io.sockets.connected[client.socketid])
										{
											c("\n\n\n\nconnection:::::::::::::::::------------------>>>>>",toudata[0]._id)
											io.sockets.connected[client.socketid].leave(toudata[0]._id);
											io.sockets.connected[client.socketid].join(toudata[0]._id);
										}*/



										/*var sData = {en: 'JOIN', data: {tbid:toudata[0]._id.toString(),socketid: client.socketid}};
											  playExchange.publish('table.' + toudata[0]._id.toString(), sData);	
										*/

										io.of('/').adapter.remoteJoin(client.socketid, toudata[0]._id.toString(), (err) => {
											/*if (err) { console.log("Not Connect ",client.socketid) }*/

										});

										io.of('/').adapter.remoteLeave(client.socketid, "GLOBLEROOMTOUR", (err) => {
											/*if (err) { console.log("Not Connect ",client.socketid) }*/


										});


										db.collection('game_users').update({ _id: MongoId(client.uid) },
											{
												$set: {
													tuid: toudata[0]._id,
													tsi: obj.pi
												}
											}, function () {

											})


									} else {

										db.collection('game_users').update({ _id: MongoId(client.uid) },
											{
												$set: {
													tuid: toudata[0]._id,
													s: "busy",
													"flags._io": 1
												}
											}, function () {

											});
									}
								}
							});
						});
					})
				});

			}
		})
	},
	findSeatTournament_old: (tbid, client) => {

		db.collection('tournament').find({
			_id: MongoId(tbid.toString())
		}).toArray(function (err, toudata) {

			if (!err && toudata.length > 0) {

				TournamnetClass.EmptySeatFindForTurna(toudata[0], function (obj) {
					//rn group and pi player index
					if ((toudata.ms == 3 && (typeof obj.rn == 'undefined' || obj.rn > 3 || typeof obj.pi == 'undefined' || obj.pi > 3)) ||
						(toudata.ms == 2 && (typeof obj.rn == 'undefined' || obj.rn > 4 || typeof obj.pi == 'undefined' || obj.pi > 2))
					) {
						//cdClass.SendData(client,"PT",{},'error:7003');

						if (parseInt(client._iscom) == 0) {
							TournamnetClass.AutoCreateTour(toudata[0], function (id) {
								TournamnetClass.findSeatTournament(id, client);
							});
						}

						return false;
					}

					var ui = {
						pn: client.pn,
						uid: MongoId(client.uid),
						_iscom: parseInt(client._iscom),
						si: obj.pi,
						socketid: client.socketid,
						pp: client.pp,
						viplvl: parseInt(client.viplvl),
						group: obj.rn,
						jt: new Date(),
						leave: 0,
						oldxp: (client.level != undefined && client.level != null) ? JSON.parse(client.level) : {},
						star_candy: {
							old_candy: 0,
							add_candy: 0,
							total_candy: 0,
						},
					}


					var set = { $set: { la: new Date(), setrobot: false }, $inc: { count: 1 } };
					set["$set"]["round1." + obj.rn + ".player." + obj.pi + ""] = ui;
					set["$inc"]["round1." + obj.rn + ".count"] = 1;

					if (client._iscom == 1) {
						set["$set"]["larj"] = new Date();
					}


					var wh = { _id: MongoId(toudata[0]._id), count: { $lt: 9 }, "sts": "startup"/*,"round1.player.uid":{$ne:MongoId(client.uid)}*/ };
					wh["round1." + obj.rn + ".player." + obj.pi + ".si"] = { $exists: false };

					db.collection("tournament").findAndModify(wh, {}, set, { new: true }, function (err, ujoin) {

						if (err || ujoin.value == null) {

							if (parseInt(client._iscom) == 0) {
								TournamnetClass.AutoCreateTour(toudata[0], function (id) {

									TournamnetClass.findSeatTournament(id, client);

								})
							} else {

								compClass.CompForFreeTur(client.uid.toString());

							}

						} else {
							var table = ujoin.value;


							if (((table.ms == 3 && table.count < 9) || (table.ms == 2 && table.count < 8)) && config.ROBOT == true && table.count == 1 && toudata[0].setrobot == true) {

								compClass.PutCompToTournament(toudata[0]._id);

								/*setTimeout(function(){
										compClass.PutCompToTournament(toudata[0]._id);
								},40000)*/

							} else {


								if (ujoin.value.larj != undefined && parseInt(com._getdatedifference(ujoin.value.larj, new Date())) > 5) {
									compClass.PutCompToTournament(toudata[0]._id);
								}

							}



							if ((table.ms == 3 && table.count == 9) || (table.ms == 2 && table.count == 8)) {

								setTimeout(function () { // jo aa dealy hoi to last seat ma user aavi ne jato re to two time all event aave 6e 
									TournamnetClass.StartTimer(toudata[0]._id);
								}, 2000)
							}

							cdClass.SendData(client, "TD", table, 'succes:0000');

							//setTimeout(function () {
							cdClass.SendDataToTable(toudata[0]._id.toString(), {
								en: "TJ",
								data: {
									ui: ui
								}
							})
							//},500);

							dashClass.SendGlobelRoomTournament(table)


							//rclient.hmset('session:'+client.socketid,'si',parseInt(Eseat));
							rclient.hmset('session:' + client.socketid, 'toid', toudata[0]._id.toString());


							if (client._iscom == 0) {

								/*if(io.sockets.connected[client.socketid])
								{
									c("\n\n\n\nconnection:::::::::::::::::------------------>>>>>",toudata[0]._id)
									io.sockets.connected[client.socketid].leave(toudata[0]._id);
									io.sockets.connected[client.socketid].join(toudata[0]._id);
								}*/



								/*var sData = {en: 'JOIN', data: {tbid:toudata[0]._id.toString(),socketid: client.socketid}};
									  playExchange.publish('table.' + toudata[0]._id.toString(), sData);	
								*/

								io.of('/').adapter.remoteJoin(client.socketid, toudata[0]._id.toString(), (err) => {
									/*if (err) { console.log("Not Connect ",client.socketid) }*/

								});

								io.of('/').adapter.remoteLeave(client.socketid, "GLOBLEROOMTOUR", (err) => {
									/*if (err) { console.log("Not Connect ",client.socketid) }*/


								});


								db.collection('game_users').update({ _id: MongoId(client.uid) },
									{
										$set: {
											tuid: toudata[0]._id,
											tsi: obj.pi
										}
									}, function () {

									})


							} else {

								db.collection('game_users').update({ _id: MongoId(client.uid) },
									{
										$set: {
											tuid: toudata[0]._id,
											s: "busy",
											"flags._io": 1
										}
									}, function () {

									});
							}
						}
					});
				});

			} else {

			}
		})
	},
	EmptySeatFindForTurna: (data, callback) => {

		/*if(data.count < 9){
			for(var i=0;i<3;i++){

				if(data.round1[i].count < 3){

					for(var j=0;j<3;j++)
					{
						if(typeof data.round1[i].player[j].uid == 'undefined' && typeof data.round1[i].player[j] == 'object'){
							return callback({rn:i,pi:j})
							break;
						}
					}	
				}
			}
		}*/
		if (data.ms == 3) {
			if (data.count < 9) {
				/*for(var i=0;i<3;i++){

					if(data.round1[i].count < 3){

						for(var j=0;j<3;j++)
						{
							if(typeof data.round1[i].player[j].uid == 'undefined' && typeof data.round1[i].player[j] == 'object'){
								return callback({rn:i,pi:j})
								break;
							}
						}	
					}
				}*/

				var returnvar = {};

				async.forEach([0, 1, 2], function (i, callbacki) {

					if (data.round1[i].count < 3) {

						async.forEach([0, 1, 2], function (j, callbackj) {
							if (typeof data.round1[i].player[j].uid == 'undefined' && typeof data.round1[i].player[j] == 'object' && typeof returnvar.rn == "undefined" && typeof returnvar.pi == "undefined") {
								//return callback({rn:i,pi:j})
								//break;
								returnvar.rn = i;
								returnvar.pi = j;
								callbackj()
							} else {
								callbackj()
							}
						}, function () {
							callbacki()
						})
					} else {
						callbacki()
					}
				}, function () {
					return callback(returnvar)
				})
			} else {
				return callback({})
			}
		} else {
			if (data.count < 8) {

				var returnvar = {};

				async.forEach([0, 1, 2, 3], function (i, callbacki) {

					if (data.round1[i].count < 4) {

						async.forEach([0, 1], function (j, callbackj) {
							if (typeof data.round1[i].player[j].uid == 'undefined' && typeof data.round1[i].player[j] == 'object' && typeof returnvar.rn == "undefined" && typeof returnvar.pi == "undefined") {
								//return callback({rn:i,pi:j})
								//break;
								returnvar.rn = i;
								returnvar.pi = j;
								callbackj()
							} else {
								callbackj()
							}
						}, function () {
							callbacki()
						})
					} else {
						callbacki()
					}
				}, function () {
					return callback(returnvar)
				})
			} else {
				return callback({})
			}
		}
	},
	StartTimer: function (tuid) {

		db.collection('tournament').findAndModify({
			_id: MongoId(tuid),
			"sts": "startup" //aa status atle check karaviyu ke last seat ma user aavi ne jato re to pachu tournamnet start thai ane all event two time aave 
		},
			{},
			{
				$set: { "sts": "RoundTimerStart" }
			}, { new: true }, function (err, rounddata) {

				if (!err && rounddata.value != null) {

					/*for(var i=0;i<rounddata.value.round1.length;i++){

						for(var j=0;j<rounddata.value.round1[i].player.length;j++){
							
							cdClass.updateUserGold(rounddata.value.round1[i].player[j].uid, -rounddata.value.bv, 'CollectGoldForTour - ' + rounddata.value._id.toString());
							//CHECK USER IS ONLINE TO CUT CHIPS  ONLY 

						}
					}*/

					async.forEach(rounddata.value.round1, function (item, callback) {


						async.forEach(item.player, function (playeritem, callback) {


							// tell async that that particular element of the iterator is done
							if (typeof playeritem.uid != 'undefined') {
								cdClass.updateUserGold(playeritem.uid, -rounddata.value.bv, 'Collect For Tournament - ' + rounddata.value._id.toString(), 18);
								//trackClass.TournamentTracking(rounddata.value.mode,0,playeritem._iscom,rounddata.value.bv)  
								trackClass.TournamentTracking(rounddata.value.mode, 0, playeritem._iscom, rounddata.value.bv, rounddata.value.bv)

								if (playeritem._iscom == 0)
									trackClass.RoundTracking("tournament", playeritem.uid)

							}
							callback();
						}, function (err) {

							//tell async that that particular element of the iterator is done
							callback();
						});

					}, function (err) {

						cdClass.SendDataToTable(tuid.toString(), {
							en: "TIMER",
							data: {
								time: 5
							}
						})

						//SEND TIMER
						trackClass.RoundTracking("tournament")

						//for(var i= 0; i<rounddata[0].round1.length;i++){

						//if(rounddata[0].round1[i].winid == '' && rounddata[0].round1[i].winid.tbid == ''){
						setTimeout(function () {
							TournamnetClass.createTable(tuid)
						}, 5000)
						//TournamnetClass.CCT(rounddata[0].round1[i],i);

						//}	
						//}
					});//finish for item iterating done
				} 
			})
	},
	createTable: (tuid) => {


		db.collection('tournament').find({
			_id: MongoId(tuid.toString())
		}).toArray(function (err, turData) {


			if (!err && turData.length > 0) {
				if (turData[0].status == 1) {
					for (var i = 0; i < turData[0].round1.length; i++) {
						if (turData[0].round1[i].count <= 1) {
							var windata = {
								si: 0,
								points: 0,
								cards: [],
								pn: '',
								pp: '',
								uid: '',
								w: 0,
								knockerwinner: false,
								tonking: 1,
								rw: 200
							}
							for (var j = 0; j < turData[0].round1[i].player.length; j++) {
								if (typeof turData[0].round1[i].player[j] != 'undefined' && typeof turData[0].round1[i].player[j].uid != 'undefined' && turData[0].round1[i].player[j].uid != "") {
									windata.uid = turData[0].round1[i].player[j].uid;
									windata.pn = turData[0].round1[i].player[j].pn;
									windata.pp = turData[0].round1[i].player[j].pp;
									windata.w = 1;
									break;
								}
							}


							var sdata = {
								winner: [windata],
								group: i,
								touId: turData[0]._id.toString(),
								status: turData[0].status,
								round: 1
							}

							TournamnetClass.WinnerDecalre(sdata)

							db.collection("tournament").update({ _id: MongoId(tuid.toString()) }, { $push: { tableids: 1 } }, function () { })

						} else {
							var reluser = 0;

							for (var j = 0; j < turData[0].round1[i].player.length; j++) {


								if (typeof turData[0].round1[i].player[j] != 'undefined' && typeof turData[0].round1[i].player[j]._iscom != 'undefined' && turData[0].round1[i].player[j]._iscom == 0) {
									reluser++;
								}
							}

							if (reluser == 0) {
								//winer decalre 
								var windata = {
									si: 0,
									points: 0,
									cards: [],
									pn: '',
									pp: '',
									uid: '',
									w: 0,
									knockerwinner: false,
									tonking: 1,
									rw: 200
								}
								for (var j = 0; j < turData[0].round1[i].player.length; j++) {
									if (typeof turData[0].round1[i].player[j] != 'undefined' && typeof turData[0].round1[i].player[j]._iscom != 'undefined' && turData[0].round1[i].player[j]._iscom == 1) {
										windata.uid = turData[0].round1[i].player[j].uid;
										windata.pn = turData[0].round1[i].player[j].pn;
										windata.pp = turData[0].round1[i].player[j].pp;
										windata.w = 1;

										break;
									}
								}

								var sdata = {
									winner: [windata],
									group: i,
									touId: turData[0]._id,
									status: turData[0].status,
									round: 1
								}

								TournamnetClass.WinnerDecalre(sdata)


								db.collection("tournament").update({ _id: MongoId(turData[0]._id.toString()) }, { $push: { tableids: 1 } }, function (err, up) {

								})

							} else {
								var sdata = {
									status: turData[0].status,
									group: i,
									tuid: tuid,
									tourData: turData[0].round1[i],
									round: 1,
									bv: turData[0].bv,
									winbv: turData[0].winbv,
									ms: turData[0].ms,
									mode: turData[0].mode,
									point: turData[0].point,
								}

								TournamnetClass.CCT(sdata);
							}


						}

					}

					/*async.forEach(turData[0].round1, function (playeritem, callback){ 
						// print the key



						callback(); 

					}, function(err) {
						
					});*/

				} else if (turData[0].status == 2) {


					for (var i = 0; i < turData[0].round2.length; i++) {



						if (turData[0].round2[i].count <= 1) {

							//winer decalre 
							var windata = {
								si: 0,
								points: 0,
								cards: [],
								pn: '',
								pp: '',
								uid: '',
								w: 0,
								knockerwinner: false,
								tonking: 1,
								rw: 200
							}
							for (var j = 0; j < turData[0].round2[i].player.length; j++) {

								if (typeof turData[0].round2[i].player[j] != 'undefined' && typeof turData[0].round2[i].player[j].uid != 'undefined' && turData[0].round2[i].player[j].uid != "") {
									windata.uid = turData[0].round2[i].player[j].uid;
									windata.pn = turData[0].round2[i].player[j].pn;
									windata.pp = turData[0].round2[i].player[j].pp;
									windata.w = 1;

									break;
								}
							}


							var sdata = {
								winner: (typeof windata.uid != "undefined" && windata.uid != "") ? [windata] : [],
								group: i,
								touId: turData[0]._id.toString(),
								status: 2,
								round: 2
							}
							TournamnetClass.WinnerDecalre(sdata)

						} else {
							var reluser = 0;
							for (var j = 0; j < turData[0].round2[i].player.length; j++) {

								if (typeof turData[0].round2[i].player[j] != 'undefined' && typeof turData[0].round2[i].player[j]._iscom != 'undefined' && turData[0].round2[i].player[j]._iscom == 0) {
									reluser++;
								}
							}


							if (reluser == 0) {
								//winer decalre 
								var windata = {
									si: 0,
									points: 0,
									cards: [],
									pn: '',
									pp: '',
									uid: '',
									w: 0,
									knockerwinner: false,
									tonking: 1,
									rw: 200
								}
								for (var j = 0; j < turData[0].round2[i].player.length; j++) {
									if (typeof turData[0].round2[i].player[j] != 'undefined' && typeof turData[0].round2[i].player[j].uid != 'undefined' && turData[0].round2[i].player[j].uid != "") {
										windata.uid = turData[0].round2[i].player[j].uid;
										windata.pn = turData[0].round2[i].player[j].pn;
										windata.pp = turData[0].round2[i].player[j].pp;
										windata.w = 1;

										break;
									}
								}


								var sdata = {
									winner: [windata],
									group: i,
									touId: tuid,
									status: 2
								}




								TournamnetClass.WinnerDecalre(sdata)

							} else {
								var sdata = {
									status: turData[0].status,
									group: i,
									tuid: tuid,
									tourData: turData[0].round2[i],
									round: 2,
									bv: turData[0].bv,
									winbv: turData[0].winbv,
									ms: turData[0].ms,
									mode: turData[0].mode,
									point: turData[0].point,
								}



								TournamnetClass.CCT(sdata);
							}


						}
					}
				} else if (turData[0].status == 3) {

					if (turData[0].round3[0].count <= 1) {

						//winer decalre 
						var windata = {
							si: 0,
							points: 0,
							cards: [],
							pn: '',
							pp: '',
							uid: '',
							w: 0,
							knockerwinner: false,
							tonking: 1,
							rw: 200
						}
						for (var j = 0; j < turData[0].round3[0].player.length; j++) {
							if (typeof turData[0].round3[0].player[j] != 'undefined' && typeof turData[0].round3[0].player[j].uid != 'undefined' && turData[0].round3[0].player[j].uid != "") {
								windata.uid = turData[0].round3[0].player[j].uid;
								windata.pn = turData[0].round3[0].player[j].pn;
								windata.pp = turData[0].round3[0].player[j].pp;
								windata.w = 1;

								break;
							}
						}


						var sdata = {
							winner: (typeof windata.uid != "undefined" && windata.uid != "") ? [windata] : [],
							group: 0,
							touId: turData[0]._id.toString(),
							status: 2,
							round: 2
						}
						TournamnetClass.WinnerDecalre(sdata)

					} else {
						var reluser = 0;
						for (var j = 0; j < turData[0].round3[0].player.length; j++) {

							if (typeof turData[0].round3[0].player[j] != 'undefined' && typeof turData[0].round3[0].player[j]._iscom != 'undefined' && turData[0].round3[0].player[j]._iscom == 0) {
								reluser++;
							}
						}


						if (reluser == 0) {
							//winer decalre 
							var windata = {
								si: 0,
								points: 0,
								cards: [],
								pn: '',
								pp: '',
								uid: '',
								w: 0,
								knockerwinner: false,
								tonking: 1,
								rw: 200
							}
							for (var j = 0; j < turData[0].round3[0].player.length; j++) {
								if (typeof turData[0].round3[0].player[j] != 'undefined' && typeof turData[0].round3[0].player[j].uid != 'undefined') {
									windata.uid = turData[0].round3[0].player[j].uid;
									windata.pn = turData[0].round3[0].player[j].pn;
									windata.pp = turData[0].round3[0].player[j].pp;
									windata.w = 1;

									break;
								}
							}


							var sdata = {
								winner: [windata],
								group: 0,
								touId: tuid,
								status: 2
							}




							TournamnetClass.WinnerDecalre(sdata)

						} else {
							var sdata = {
								status: turData[0].status,
								group: 0,
								tuid: tuid,
								tourData: turData[0].round3[0],
								round: 2,
								bv: turData[0].bv,
								winbv: turData[0].winbv,
								ms: turData[0].ms,
								mode: turData[0].mode,
								point: turData[0].point,
							}


							TournamnetClass.CCT(sdata);
						}


					}
				}
			}
		});
	},
	CCT: async function (data) {


		var userInfo1 = {}; userInfo2 = {}; userInfo3 = {}
		var ap = 0;

		if (typeof data.tourData.player[0] != 'undefined' && typeof data.tourData.player[0].uid != 'undefined' && data.tourData.player[0].uid != "") {

			var userInfo1 = {
				cards: [],
				si: 0,
				jt: new Date(),
				ui: {
					pn: data.tourData.player[0].pn,
					uid: MongoId(data.tourData.player[0].uid),
					_iscom: parseInt(data.tourData.player[0]._iscom),
					si: 0,
					socketid: data.tourData.player[0].socketid,
					pp: data.tourData.player[0].pp,
					viplvl: data.tourData.player[0].viplvl,
					isTracker: data.tourData.player[0].isTracker
				},
				status: '',
				turn_miss_cont: 0,
				isplay: 0,
				spc: [],
				lpc: "",
				lodpc: "",
				giftImg: "",
				comp: 0,
				point: 0,
				ispass: 0,
				deadwood: 0,
				totalplay: 0,
				oldxp: (data.tourData.player[0].oldxp != undefined && data.tourData.player[0].oldxp != null) ? data.tourData.player[0].oldxp : {},
				Event_game_count: 0,
				v: 0,
				isads: 0,
				backcard1: data.tourData.player[0].backcard1
			};
			ap++;

			if (parseInt(data.tourData.player[0]._iscom) == 0) {
				cdClass.GetUserInfo(data.tourData.player[0].uid.toString(), { resultQuest: 1, Questdata: 1, last: 1 }, (udata) => {
					if (udata.resultQuest != undefined && udata.Questdata != undefined) {
						db.collection("quest_data").find({ status: 1 }).sort({ sort: 1 }).toArray((err, questdata) => {

							if (!err && questdata.length > 0) {
								var senddata = [];
								var lefttime = (typeof udata.last != 'undefined' && typeof udata.last.qdct != 'undefined') ? com.GetTimeDifference(new Date(), udata.last.qdct.setSeconds(udata.last.qdct.getSeconds() + 86400)) : 0;

								for (var i = 0; i < questdata.length; i++) {
									if (questdata[i].mode == "XP" || questdata[i].mode == "TAny") {
										questdata[i].claim = udata.resultQuest[questdata[i].quest]
										questdata[i].complete = udata.Questdata[questdata[i].quest]
										questdata[i].lefttime = lefttime

										senddata.push(questdata[i])
									}
								}

								setTimeout(() => {
									cdClass.SendDataToUser(data.tourData.player[0].uid.toString(), {
										en: "QD",
										data: {
											Questdata: senddata
										}
									}, true);
								}, 3000)
							}
						})
					}

				})
			}

		}

		if (typeof data.tourData.player[1] != 'undefined' && typeof data.tourData.player[1].uid != 'undefined' && data.tourData.player[1].uid != "") {

			var userInfo2 = {
				cards: [],
				si: 1,
				jt: new Date(),
				ui: {
					pn: data.tourData.player[1].pn,
					uid: MongoId(data.tourData.player[1].uid),
					_iscom: parseInt(data.tourData.player[1]._iscom),
					si: 1,
					socketid: data.tourData.player[1].socketid,
					pp: data.tourData.player[1].pp,
					viplvl: data.tourData.player[1].viplvl,
					isTracker: data.tourData.player[1].isTracker
				},
				status: '',
				turn_miss_cont: 0,
				isplay: 0,
				spc: [],
				lpc: "",
				lodpc: "",
				giftImg: "",
				comp: 0,
				point: 0,
				ispass: 0,
				deadwood: 0,
				totalplay: 0,
				oldxp: (data.tourData.player[1].oldxp != undefined && data.tourData.player[1].oldxp != null) ? data.tourData.player[1].oldxp : {},
				Event_game_count: 0,
				v: 0,
				isads: 0,
				backcard1: data.tourData.player[0].backcard1
			};
			ap++;

			if (parseInt(data.tourData.player[1]._iscom) == 0) {
				cdClass.GetUserInfo(data.tourData.player[1].uid.toString(), { resultQuest: 1, Questdata: 1, last: 1 }, (udata) => {
					if (udata.resultQuest != undefined && udata.Questdata != undefined) {
						db.collection("quest_data").find({ status: 1 }).sort({ sort: 1 }).toArray((err, questdata) => {

							if (!err && questdata.length > 0) {
								var senddata = [];
								var lefttime = (typeof udata.last != 'undefined' && typeof udata.last.qdct != 'undefined') ? com.GetTimeDifference(new Date(), udata.last.qdct.setSeconds(udata.last.qdct.getSeconds() + 86400)) : 0;

								for (var i = 0; i < questdata.length; i++) {
									if (questdata[i].mode == "XP" || questdata[i].mode == "TAny") {
										questdata[i].claim = udata.resultQuest[questdata[i].quest]
										questdata[i].complete = udata.Questdata[questdata[i].quest]
										questdata[i].lefttime = lefttime

										senddata.push(questdata[i])
									}
								}

								setTimeout(() => {
									cdClass.SendDataToUser(data.tourData.player[1].uid.toString(), {
										en: "QD",
										data: {
											Questdata: senddata
										}
									}, true);
								}, 3000)
							}
						})
					}

				})
			}

		}


		if (typeof data.tourData.player[2] != 'undefined' && typeof data.tourData.player[2].uid != 'undefined' && data.tourData.player[2].uid != "") {


			var userInfo3 = {
				cards: [],
				si: 2,
				jt: new Date(),
				ui: {
					pn: data.tourData.player[2].pn,
					uid: MongoId(data.tourData.player[2].uid),
					_iscom: parseInt(data.tourData.player[2]._iscom),
					si: 2,
					socketid: data.tourData.player[2].socketid,
					pp: data.tourData.player[2].pp,
					viplvl: data.tourData.player[2].viplvl,
					isTracker: data.tourData.player[2].isTracker
				},
				status: '',
				turn_miss_cont: 0,
				isplay: 0,
				spc: [],
				lpc: "",
				lodpc: "",
				giftImg: "",
				comp: 0,
				point: 0,
				ispass: 0,
				deadwood: 0,
				totalplay: 0,
				oldxp: (data.tourData.player[2].oldxp != undefined && data.tourData.player[2].oldxp != null) ? data.tourData.player[2].oldxp : {},
				Event_game_count: 0,
				v: 0,
				isads: 0,
				backcard1: data.tourData.player[0].backcard1
			};

			ap++;

			if (parseInt(data.tourData.player[2]._iscom) == 0) {
				cdClass.GetUserInfo(data.tourData.player[2].uid.toString(), { resultQuest: 1, Questdata: 1, last: 1 }, (udata) => {
					if (udata.resultQuest != undefined && udata.Questdata != undefined) {
						db.collection("quest_data").find({ status: 1 }).sort({ sort: 1 }).toArray((err, questdata) => {

							if (!err && questdata.length > 0) {
								var senddata = [];
								var lefttime = (typeof udata.last != 'undefined' && typeof udata.last.qdct != 'undefined') ? com.GetTimeDifference(new Date(), udata.last.qdct.setSeconds(udata.last.qdct.getSeconds() + 86400)) : 0;

								for (var i = 0; i < questdata.length; i++) {
									if (questdata[i].mode == "XP" || questdata[i].mode == "TAny") {
										questdata[i].claim = udata.resultQuest[questdata[i].quest]
										questdata[i].complete = udata.Questdata[questdata[i].quest]
										questdata[i].lefttime = lefttime

										senddata.push(questdata[i])
									}
								}

								setTimeout(() => {
									cdClass.SendDataToUser(data.tourData.player[2].uid.toString(), {
										en: "QD",
										data: {
											Questdata: senddata
										}
									}, true);
								}, 3000)
							}
						})
					}

				})
			}
		}

		var Json = {};

		Json.ap = ap;
		Json.bv = data.bv;
		Json.pv = data.winbv;
		Json.tpv = data.winbv;
		Json.mode = (typeof data.mode != "undefined") ? parseInt(data.mode) : 1;
		Json.point = (typeof data.point != "undefined") ? parseInt(data.point) : 1;
		Json.ms = data.ms;
		Json.round = 1;
		Json.pi = (data.ms == 2) ? [userInfo1, userInfo2] : [userInfo1, userInfo2, userInfo3];
		Json.open_deck = [];
		Json.t_status = "";
		Json._ip = 0;
		Json.jid = "";
		Json.close_deck = [];
		Json.ti = -1;
		Json.touId = data.tuid.toString();
		Json.tou = true;
		Json.group = data.group;
		Json.status = data.status;
		Json.la = new Date();
		Json.comp = 0;
		Json.maindeadwood = 0;
		Json.score = [];
		Json.PassUser = [];
		Json.closedecklock = 0;
		Json.opendecklock = 0;
		Json.isknock = 0;
		Json.turncount = -1;
		Json.isleague = 0;
		Json.isnotiid = "";
		Json.deduct = 0;
		Json.stargame = 0;
		Json.isgamewin = 0;
		Json.isleave = [];
		Json.trackercard = {
			l: [],
			c: [],
			k: [],
			f: [],
			j: []
		}

		db.collection("playing_table").save(Json, async function (err, table) {

			if (!err && table.ops.length > 0) {

				var table = table.ops[0]



				//var client={tbid:table._id,socketid: }

				//dashClass.TimeCofig(table,client);


				var p1 = await TournamnetClass.TableJoinInTur(table, table.pi[0], data)


				var p2 = await TournamnetClass.TableJoinInTur(table, table.pi[1], data)

				var p3 = await TournamnetClass.TableJoinInTur(table, table.pi[2], data)



				/*async.forEach(table.pi, function (item, callback){ 
					
					if(typeof item != 'undefined' && typeof item.ui != 'undefined' && typeof item.ui.socketid != 'undefined')
					{	

						db.collection('game_users').findAndModify({_id:MongoId(item.ui.uid)},{},
						{
							$set:{
								tbid:table._id,
								si:parseInt(item.si)
							}
						},{new:true},function(er,udata){

							if(!er && udata.value != null ){
								
							 	
								if(item.ui._iscom == 0){
											
										rclient.hmset('session:'+udata.value.socketid,'si',parseInt(item.si));
									rclient.hmset('session:'+udata.value.socketid,'tbid',table._id.toString());


									
									var sData = {en: 'LEAVE', data: {tbid:data.tuid.toString(),socketid: udata.value.socketid}};
									playExchange.publish('table.' + data.tuid.toString(), sData);	


									var sData = {en: 'JOIN', data: {tbid:table._id.toString(),socketid: udata.value.socketid}};
									playExchange.publish('table.' + table._id.toString(), sData);	

								}else{
									rclient.hmset('session:'+item.ui.uid.toString(),'si',parseInt(item.si));
									rclient.hmset('session:'+item.ui.uid.toString(),'tbid',table._id.toString());

								}

								

								callback()
							}
						});
					}else{
						callback()	
					}
				},function(err){*/



				if (data.status == 1) {
					var SetData = { $set: {} }

					SetData["$set"]["round1." + data.group + ".tbid"] = table._id.toString();
					//"round1."+obj.rn+".player."+obj.pi+".si"

					db.collection("tournament").update({ _id: MongoId(data.tuid) }, SetData, function () { })

				} else if (data.status == 2) {
					var SetData = { $set: {} }



					SetData["$set"]["round2." + data.group + ".tbid"] = table._id.toString();
					//"round1."+obj.rn+".player."+obj.pi+".si"
					db.collection("tournament").update({ _id: MongoId(data.tuid) }, SetData, function () { })


				} else if (data.status == 3) {
					var SetData = { $set: {} }

					SetData["$set"]["round3.0.tbid"] = table._id.toString();
					//"round1."+obj.rn+".player."+obj.pi+".si"
					db.collection("tournament").update({ _id: MongoId(data.tuid) }, SetData, function () { })


				}

				cdClass.SendDataToTable(table._id.toString(), {
					en: "GTI",
					data: table
				})

				//cdClass.SendData(client,"GTI",table,'succes:0000');

				//cdClass.SendData(client,"GTI",table,'succes:0000');


				if (table.ap >= 2) {

					setTimeout(function () {
						mechanismClass.LestsPlay(table._id.toString());
					}, 2000)
				}
				//})
			}
		});
	},
	TableJoinInTur: (table, item, data) => {
		return new Promise(resolve => {
			if (typeof item != 'undefined' && typeof item.ui != 'undefined' && typeof item.ui.uid != "undefined" && item.ui.uid != "") {

				db.collection('game_users').findAndModify({ _id: MongoId(item.ui.uid.toString()) }, {},
					{
						$set: {
							tbid: table._id,
							si: parseInt(item.si)
						}
					}, { new: true }, function (er, udata) {

						if (!er && udata.value != null) {


							if (parseInt(item.ui._iscom) == 0) {

								rclient.hmset('session:' + udata.value.socketid, 'si', parseInt(item.si));
								rclient.hmset('session:' + udata.value.socketid, 'tbid', table._id.toString());



								/*var sData = {en: 'LEAVE', data: {tbid:data.tuid.toString(),socketid: udata.value.socketid}};
								playExchange.publish('table.' + data.tuid.toString(), sData);*/

								io.of('/').adapter.remoteLeave(udata.value.socketid, data.tuid.toString(), (err) => {
									/*if (err) { console.log("Not Connect ",client.socketid) }*/

								});



								io.of('/').adapter.remoteJoin(udata.value.socketid, table._id.toString(), (err) => {
									/*if (err) { console.log("Not Connect ",client.socketid) }*/

								});




								/*var sData = {en: 'JOIN', data: {tbid:table._id.toString(),socketid: udata.value.socketid}};
								playExchange.publish('table.' + table._id.toString(), sData);	*/


								resolve(true)

							} else {
								rclient.hmset('session:' + item.ui.uid.toString(), 'si', parseInt(item.si));
								rclient.hmset('session:' + item.ui.uid.toString(), 'tbid', table._id.toString());


								resolve(true)

							}


						} else {
						
							resolve(false)
						}
					});
			} else {
				
				resolve(false);
			}
		});
	},
	//tournament create 
	AutoCreateTour: function (data, callback) {


		if (data.ms == 2) {
			var newTou = {
				"winid": "",
				"bv": data.bv,
				"winbv": data.winbv,
				"mode": data.mode,
				"ms": data.ms,
				"point": 1,
				"sts": "startup",
				"status": 1,
				"count": 0,
				"toujid": "",
				"tableids": [],
				"round1": [
					{
						"tbid": "",
						"winid": "",
						"count": 0,
						"player": [{}, {}]
					},
					{
						"tbid": "",
						"winid": "",
						"count": 0,
						"player": [{}, {}]
					},
					{
						"tbid": "",
						"winid": "",
						"count": 0,
						"player": [{}, {}]
					},
					{
						"tbid": "",
						"winid": "",
						"count": 0,
						"player": [{}, {}]
					}
				],
				"round2": [
					{
						"tbid": "",
						"winid": "",
						"count": 0,
						"player": [{}, {}]
					},
					{
						"tbid": "",
						"winid": "",
						"count": 0,
						"player": [{}, {}]
					}
				],
				"round3": [
					{
						"tbid": "",
						"winid": "",
						"count": 0,
						"player": [{}, {}]
					}
				],
				"la": new Date(),
				"larj": new Date(),
				"Tst": "",
				"setrobot": true
			}
		} else {
			var newTou = {
				"winid": "",
				"bv": data.bv,
				"winbv": data.winbv,
				"mode": data.mode,
				"ms": data.ms,
				"point": 1,
				"sts": "startup",
				"status": 1,
				"count": 0,
				"toujid": "",
				"tableids": [],
				"round1": [
					{
						"tbid": "",
						"winid": "",
						"count": 0,
						"player": [{}, {}, {}]
					},
					{
						"tbid": "",
						"winid": "",
						"count": 0,
						"player": [{}, {}, {}]
					},
					{
						"tbid": "",
						"winid": "",
						"count": 0,
						"player": [{}, {}, {}]
					}
				],
				"round2": [
					{
						"tbid": "",
						"winid": "",
						"count": 0,
						"player": [{}, {}, {}]
					}
				],
				"la": new Date(),
				"larj": new Date(),
				"Tst": "",
				"setrobot": true
			}
		}

		db.collection("tournament").save(newTou, function (err, inData) {
			callback(inData.ops[0]._id)
			//mechanismClass.FindSetAndJoin(inData.ops[0]._id,client);
		});
	},
	WinnerDecalre: (data) => {

		db.collection('tournament').find({
			_id: MongoId(data.touId)
		}).toArray(function (err, turData) {
			if (!err && turData.length > 0) {



				if (turData[0].status == 1) {

					if (data.winner.length == 0) { // jo  ek sathe badha EG mare to winner nathi thato atle winner length 0 mukine drow kariyu 
						//set in  drow
						//user winner 
						//compClass.ExitGameOfTable(data.tbid,data.winner.length);
						compClass.ExitGameOfTablestatus(data.tbid)

						var set = {
							$set: {}
						};
						set["$set"]["round1." + data.group + ".winid"] = 'drow';
						set["$set"]["round1." + data.group + ".tbid"] = "";


						TournamnetClass.Returngroupandsi({ ms: turData[0].ms, prvgroup: data.group, status: turData[0].status }, (obj) => {

							/*winData.group = obj.group;
							winData.si = obj.si;
							winData.status = 2;*/
							var leftuser = {
								pn: "",
								uid: "",
								_iscom: -1,
								si: obj.si,
								socketid: "",
								pp: "upload/user_left.png",
								viplvl: "",
								group: obj.group,
								jt: new Date(),
								leave: 1,
								status: 2
							}

							set["$set"]["round2." + obj.group + ".player." + obj.si] = leftuser;



							db.collection('tournament').findAndModify({
								_id: MongoId(data.touId)
							}, {}, set, { new: true }, function (err, upData) {

								cdClass.SendDataToTable(data.touId.toString(), {
									en: "SRJU",
									data: {
										isdraw: true,
										group: data.group,
										status: 1
									}
								})

								//round two mate ready ke te check karvanu have
								TournamnetClass.CheckSecondRoundReady(upData.value)
							})
						})
					} else {

						count = 0;
						var winData = {};
						var roundData = turData[0].round1[data.group];
						var lostuid = [];

						for (var i = 0; i < roundData.player.length; i++) {
							for (var j = 0; j < data.winner.length; j++) {
								if (data.winner[j].w == 1 && roundData.player[i].uid != undefined && data.winner[j].uid != undefined && roundData.player[i].uid.toString() == data.winner[j].uid.toString()) {
									count++;
									//winid=roundData.player[i].uid.toString();
									winData = roundData.player[i];
								}
							}
						}


						if (count == 1) {
							//user winner 
							compClass.ExitGameOfTable(data.tbid);
							for (var j = 0; j < data.winner.length; j++) {
								if (data.winner[j].w == 0 && typeof data.winner[j].uid != "undefined" && data.winner[j].uid != "") {

									//cdClass.UpdateUserData(, {$set:{lgs:2,"tuid":"",tsi:""}}, function () {});

									db.collection("game_users").update({ _id: MongoId(data.winner[j].uid.toString()), "flags._iscom": 0 }, { $set: { lgs: 2, "tuid": "", tsi: "" } }, function () { });
									trackClass.UserLastGameTrackTur(data.winner[j].uid.toString(), 'L');
								}
							}

							var set = {
								$set: {},
								$inc: {}
							};
							set["$set"]["round1." + data.group + ".winid"] = winData.uid;
							set["$set"]["round1." + data.group + ".tbid"] = "";


							//winData.si = data.group;
							TournamnetClass.Returngroupandsi({ ms: turData[0].ms, prvgroup: data.group, status: turData[0].status }, (obj) => {

								winData.group = obj.group;
								winData.si = obj.si;
								winData.status = 2;


								set["$set"]["round2." + obj.group + ".player." + obj.si] = winData;
								set["$inc"]["round2." + obj.group + ".count"] = 1;


								db.collection('tournament').findAndModify({
									_id: MongoId(data.touId)
								}, {}, set, { new: true }, function (err, upData) {


									cdClass.SendDataToTable(data.touId.toString(), {
										en: "SRJU",
										data: winData
									})

									db.collection("game_users").find({
										_id: MongoId(winData.uid.toString())
									}).toArray(function (err, udata) {


										if (winData._iscom == 0) {

											if (typeof data.tbid != 'undefined') {

												/*var sData = {en: 'LEAVE', data: {tbid:data.tbid.toString(),socketid: udata[0].socketid}};
										playExchange.publish('table.' +data.tbid.toString(), sData);
										*/
												io.of('/').adapter.remoteLeave(udata[0].socketid, data.tbid.toString(), (err) => {
													/*if (err) { console.log("Not Connect ",client.socketid) }*/

												});

											}

											/*var sData = {en: 'JOIN', data: {tbid:data.touId.toString(),socketid: udata[0].socketid}};
											playExchange.publish('table.' + data.touId.toString(), sData);	
											*/
											io.of('/').adapter.remoteJoin(udata[0].socketid, data.touId.toString(), (err) => {
												/*if (err) { console.log("Not Connect ",client.socketid) }*/

											});


										}

										//cdClass.SendData(winData.socketid,"TD",upData.value,'succes:0000');

										cdClass.SendDataToUser(winData.uid, {
											en: "TD",
											data: upData.value
										}); //publishing to exchange


										//round two mate ready ke te check karvanu have
										TournamnetClass.CheckSecondRoundReady(upData.value);

									})
								})
							})
							//round two mate ready ke te check karvanu have
							//TournamnetClass.CheckSecondRoundReady(data.touId)
						} else {
							//set in  drow
							//user winner 
							compClass.ExitGameOfTablestatus(data.tbid)

							var set = {
								$set: {}
							};
							set["$set"]["round1." + data.group + ".winid"] = 'drow';
							set["$set"]["round1." + data.group + ".tbid"] = "";

							TournamnetClass.Returngroupandsi({ ms: turData[0].ms, prvgroup: data.group, status: turData[0].status }, (obj) => {

								/*winData.group = obj.group;
								winData.si = obj.si;
								winData.status = 2;*/
								var leftuser = {
									pn: "",
									uid: "",
									_iscom: -1,
									si: obj.si,
									socketid: "",
									pp: "upload/user_left.png",
									viplvl: "",
									group: obj.group,
									jt: new Date(),
									leave: 1,
									status: 2
								}

								set["$set"]["round2." + obj.group + ".player." + obj.si] = leftuser;


								db.collection('tournament').findAndModify({
									_id: MongoId(data.touId)
								}, {}, set, { new: true }, function (err, upData) {

									for (var i = 0; i < roundData.player.length; i++) {
										/*if(roundData.player[i].uid != undefined){
											cdClass.updateUserGold(roundData.player[i].uid, turData[0].bv, 'ReturnAmountForDrawTournament-'+data.touId);// - '+tbId);
										}*/
										for (var j = 0; j < data.winner.length; j++) {
											if (data.winner[j].w == 1 && roundData.player[i].uid != undefined && data.winner[j].uid != undefined && roundData.player[i].uid.toString() == data.winner[j].uid.toString()) {
												cdClass.updateUserGold(roundData.player[i].uid, turData[0].bv, 'Refund Of Tournament-' + data.touId, 12);// - '+tbId);	
												//trackClass.TournamentTracking(upData.value.mode,2,roundData.player[i]._iscom,turData[0].bv)	
												trackClass.TournamentTracking(upData.value.mode, 2, roundData.player[i]._iscom, turData[0].bv, -turData[0].bv)
											}
										}
									}


									//var round_timer = parseInt(240) - com._getdatedifference(upData.value.Tst, new Date(), 'second');

									cdClass.SendDataToTable(data.touId.toString(), {
										en: "SRJU",
										data: {
											isdraw: true,
											group: data.group,
											status: 1
										}
									})

									//round two mate ready ke te check karvanu have
									TournamnetClass.CheckSecondRoundReady(upData.value)
								})
							})
						}

					}
				} else if (turData[0].status == 2) {
					// MS 3 hoi to status 2 after 

					if (turData[0].ms == 3) {  // MS ni winner logic 
						compClass.ExitGameOfTablestatus(data.tbid);
						var winData = {};


						if (data.winner.length == 0) { // jo  ek sathe badha EG mare to winner nathi thato atle winner length 0 mukine drow kariyu 

							var set = {
								$set: {
									sts: "WinnerDecalre",
									winid: "draw"
								},
								//$inc:{}
							};

							set["$set"]["round2.0.winid"] = 'draw';
							set["$set"]["round2.0.tbid"] = "";


							db.collection('tournament').findAndModify({
								_id: MongoId(data.touId.toString())
							}, {}, set, { new: true }, function () {

								cdClass.SendDataToTable(data.touId, {
									en: 'WINTOUR',
									data: winData,
									winbv: turData[0].winbv,
									tourdata: turData[0],
									tbid: data.touId,
									isdraw: true
								});
								//db.collection("tournament").remove({_id:MongoId(data.touId.toString())},function(){})
								compClass.FreeRobotForTournamnet(turData[0]);
							})
						} else {

							var roundData = turData[0].round2[0]
							//winId="";
							count = 0;


							for (var i = 0; i < roundData.player.length; i++) {
								for (var j = 0; j < data.winner.length; j++) {

									if (data.winner[j].w == true && typeof roundData.player[i] != 'undefined' && typeof roundData.player[i].uid != 'undefined' && typeof data.winner[j] != 'undefined' && typeof data.winner[j].uid != 'undefined' && roundData.player[i].uid.toString() == data.winner[j].uid.toString()) {
										count++;
										//winid=roundData.player[i].uid.toString();
										cdClass.UpdateUserData(roundData.player[i].uid.toString(), { $set: { "lgs": 2 } }, function () { });

										winData = roundData.player[i];
									}/*else{
											if(typeof roundData.player[i] != 'undefined' && typeof roundData.player[i].uid != 'undefined' && roundData.player[i].uid != ''  ){
									
				                            	trackClass.UserLastGameTrackTur(roundData.player[i].uid.toString(),'L');
												cdClass.UpdateUserData(roundData.player[i].uid.toString(), {$set:{"lgs":2}}, function () {});

											}
										}*/
								}
							}

							if (count == 1) {


								for (var j = 0; j < data.winner.length; j++) {
									if (data.winner[j].w == 0 && typeof data.winner[j].uid != "undefined" && data.winner[j].uid != "") {

										cdClass.UpdateUserData(data.winner[j].uid.toString(), { $set: { "lgs": 2 } }, function () { });
										trackClass.UserLastGameTrackTur(data.winner[j].uid.toString(), 'L');
									}
								}

								var set = {
									$set: {
										sts: "WinnerDecalre",
										winid: winData.uid
									}
								};

								set["$set"]["round2.0.winid"] = winData.uid;
								set["$set"]["round2.0.tbid"] = "";


								db.collection('tournament').findAndModify({
									_id: MongoId(data.touId.toString())
								}, {}, set, { new: true }, function (err, update) {


									if (!err && update.value != null) {


										cdClass.updateUserGold(winData.uid, turData[0].winbv, 'Win From Tournament - ' + data.touId, 19);// - '+tbId);
										//trackClass.TournamentTracking(update.value.mode,1,winData._iscom,turData[0].winbv)
										trackClass.TournamentTracking(update.value.mode, 1, winData._iscom, turData[0].bv, -turData[0].winbv)

										cdClass.CountHandsWinTournament(winData.uid, update.value.jokermode); //counting Winners hand
										db.collection("game_users").update({ _id: MongoId(winData.uid.toString()), "flags._iscom": 0 }, { $set: { "lgs": 1, tuid: "", tsi: "" } }, function () { });
										//tuid atle  "" hoi bcz win thai ne reconnect thai to problem no aave 

										//cdClass.UpdateUserData(winData.uid.toString(), {$set:{"track.Closs":0},$inc:{"track.Cwin":1}}, function () {});

										trackClass.UserLastGameTrackTur(winData.uid.toString(), 'W');

										if (winData._iscom == 0) {
											trackClass.TrackSpinGame(winData.uid.toString(), 24, 1)
										}

										/*if(winData._iscom == 0){
											if(io.sockets.connected[winData.socketid])
											{
												io.sockets.connected[winData.socketid].join(data.touId.toString());
												  }
										}

										cdClass.SendDataToTable(data.touId, {
											en: 'WINTOUR',
											data: winData,
											winbv : turData[0].winbv,
											tourdata:turData[0],
											tbid:data.touId,
											isdraw:false
										});*/

										cdClass.SendDataToUser(winData.uid, {
											en: "WINTOUR",
											data: winData,
											winbv: turData[0].winbv,
											tourdata: turData[0],
											tbid: data.touId,
											isdraw: false
										}); //publishing to exchange

										//db.collection("tournament").remove({_id:MongoId(data.touId.toString())},function(){})
										compClass.FreeRobotForTournamnet(update.value);
									}
								})
								//chips credit and to user 
								//and finish to user round
							} else {

								var set = {
									$set: {
										sts: "WinnerDecalre",
										winid: winData.uid
									},
									//$inc:{}
								};

								set["$set"]["round2.0.winid"] = 'draw';
								set["$set"]["round2.0.tbid"] = "";


								db.collection('tournament').findAndModify({
									_id: MongoId(data.touId.toString())
								}, {}, set, { new: true }, function (err, upData) {

									for (var i = 0; i < roundData.player.length; i++) {
										for (var j = 0; j < data.winner.length; j++) {
											if (data.winner[j].w == 1 && roundData.player[i].uid != undefined && data.winner[j].uid != undefined && roundData.player[i].uid.toString() == data.winner[j].uid.toString()) {
												cdClass.updateUserGold(roundData.player[i].uid, turData[0].bv, 'Refund Of Tournament-' + data.touId, 12);// - '+tbId);
												//trackClass.TournamentTracking(upData.value.mode,2,roundData.player[i]._iscom,turData[0].bv)	
												trackClass.TournamentTracking(upData.value.mode, 2, roundData.player[i]._iscom, turData[0].bv, -turData[0].bv)
											}
										}
									}

									cdClass.SendDataToTable(data.touId, {
										en: 'WINTOUR',
										data: winData,
										winbv: turData[0].winbv,
										tourdata: turData[0],
										tbid: data.touId,
										isdraw: true
									});
									//db.collection("tournament").remove({_id:MongoId(data.touId.toString())},function(){})
									compClass.FreeRobotForTournamnet(turData[0]);
								})
							}
						}
					} else {
						if (data.winner.length == 0) { // jo  ek sathe badha EG mare to winner nathi thato atle winner length 0 mukine drow kariyu 
							//set in  drow
							//user winner 
							//compClass.ExitGameOfTable(data.tbid,data.winner.length);
							compClass.ExitGameOfTablestatus(data.tbid)

							var set = {
								$set: {}
							};
							set["$set"]["round2." + data.group + ".winid"] = 'drow';
							set["$set"]["round2." + data.group + ".tbid"] = "";

							TournamnetClass.Returngroupandsi({ ms: turData[0].ms, prvgroup: data.group, status: turData[0].status }, (obj) => {

								/*winData.group = obj.group;
								winData.si = obj.si;
								winData.status = 2;*/
								var leftuser = {
									pn: "",
									uid: "",
									_iscom: -1,
									si: obj.si,
									socketid: "",
									pp: "upload/user_left.png",
									viplvl: "",
									group: obj.group,
									jt: new Date(),
									leave: 1,
									status: 3
								}

								set["$set"]["round3." + obj.group + ".player." + obj.si] = leftuser;

								db.collection('tournament').findAndModify({
									_id: MongoId(data.touId)
								}, {}, set, { new: true }, function (err, upData) {

									//var round_timer = parseInt(240) - com._getdatedifference(upData.value.Tst,new Date(), 'second');

									cdClass.SendDataToTable(data.touId.toString(), {
										en: "SRJU",
										data: {
											isdraw: true,
											group: data.group,
											status: 2
										}
									})

									//round two mate ready ke te check karvanu have
									TournamnetClass.CheckthirdRoundReady(upData.value)
								})
							})
						} else {

							count = 0;
							var winData = {};
							var roundData = turData[0].round2[data.group];
							var lostuid = [];

							for (var i = 0; i < roundData.player.length; i++) {
								for (var j = 0; j < data.winner.length; j++) {
									if (data.winner[j].w == 1 && roundData.player[i].uid != undefined && data.winner[j].uid != undefined && roundData.player[i].uid.toString() == data.winner[j].uid.toString()) {
										count++;
										//winid=roundData.player[i].uid.toString();
										winData = roundData.player[i];
									}
								}
							}


							if (count == 1) {
								//user winner 
								compClass.ExitGameOfTable(data.tbid);
								for (var j = 0; j < data.winner.length; j++) {
									if (data.winner[j].w == 0 && typeof data.winner[j].uid != "undefined" && data.winner[j].uid != "") {

										//cdClass.UpdateUserData(, {$set:{lgs:2,"tuid":"",tsi:""}}, function () {});

										db.collection("game_users").update({ _id: MongoId(data.winner[j].uid.toString()), "flags._iscom": 0 }, { $set: { lgs: 2, "tuid": "", tsi: "" } }, function () { });
										trackClass.UserLastGameTrackTur(data.winner[j].uid.toString(), 'L');
									}
								}

								var set = {
									$set: {},
									$inc: {}
								};
								set["$set"]["round2." + data.group + ".winid"] = winData.uid;
								set["$set"]["round2." + data.group + ".tbid"] = "";


								//winData.si = data.group;
								TournamnetClass.Returngroupandsi({ ms: turData[0].ms, prvgroup: data.group, status: turData[0].status }, (obj) => {
									winData.group = obj.group;
									winData.si = obj.si;
									winData.status = 3;


									set["$set"]["round3." + obj.group + ".player." + obj.si] = winData;
									set["$inc"]["round3." + obj.group + ".count"] = 1;


									db.collection('tournament').findAndModify({
										_id: MongoId(data.touId)
									}, {}, set, { new: true }, function (err, upData) {






										cdClass.SendDataToTable(data.touId.toString(), {
											en: "SRJU",
											data: winData
										})

										db.collection("game_users").find({
											_id: MongoId(winData.uid.toString())
										}).toArray(function (err, udata) {




											if (winData._iscom == 0) {



												/*if(typeof data.tbid != 'undefined'){
											
													var sData = {en: 'LEAVE', data: {tbid:data.tbid.toString(),socketid: udata[0].socketid}};
											playExchange.publish('table.' +data.tbid.toString(), sData);	
										}

										var sData = {en: 'JOIN', data: {tbid:data.touId.toString(),socketid: udata[0].socketid}};
										playExchange.publish('table.' + data.touId.toString(), sData);	*/

												if (typeof data.tbid != 'undefined') {
													io.of('/').adapter.remoteLeave(udata[0].socketid, data.tbid.toString(), (err) => {
														/*if (err) { console.log("Not Connect ",client.socketid) }*/

													});

												}

												io.of('/').adapter.remoteJoin(udata[0].socketid, data.touId.toString(), (err) => {
													/*if (err) { console.log("Not Connect ",client.socketid) }*/

												});



											}

											//cdClass.SendData(winData.socketid,"TD",upData.value,'succes:0000');

											cdClass.SendDataToUser(winData.uid, {
												en: "TD",
												data: upData.value
											}); //publishing to exchange


											//round two mate ready ke te check karvanu have
											TournamnetClass.CheckthirdRoundReady(upData.value);

										})
									})
								})
								//round two mate ready ke te check karvanu have
								//TournamnetClass.CheckSecondRoundReady(data.touId)
							} else {
								//set in  drow
								//user winner 
								compClass.ExitGameOfTablestatus(data.tbid)

								var set = {
									$set: {}
								};
								set["$set"]["round2." + data.group + ".winid"] = 'drow';
								set["$set"]["round2." + data.group + ".tbid"] = "";

								TournamnetClass.Returngroupandsi({ ms: turData[0].ms, prvgroup: data.group, status: turData[0].status }, (obj) => {

									/*winData.group = obj.group;
									winData.si = obj.si;
									winData.status = 2;*/
									var leftuser = {
										pn: "",
										uid: "",
										_iscom: -1,
										si: obj.si,
										socketid: "",
										pp: "upload/user_left.png",
										viplvl: "",
										group: obj.group,
										jt: new Date(),
										leave: 1,
										status: 3
									}

									set["$set"]["round3." + obj.group + ".player." + obj.si] = leftuser;

									db.collection('tournament').findAndModify({
										_id: MongoId(data.touId)
									}, {}, set, { new: true }, function (err, upData) {

										//var round_timer = parseInt(240) - com._getdatedifference(upData.value.Tst, new Date(), 'second');
										for (var i = 0; i < roundData.player.length; i++) {
											for (var j = 0; j < data.winner.length; j++) {
												if (data.winner[j].w == 1 && roundData.player[i].uid != undefined && data.winner[j].uid != undefined && roundData.player[i].uid.toString() == data.winner[j].uid.toString()) {
													cdClass.updateUserGold(roundData.player[i].uid, turData[0].bv, 'Refund Of Tournament-' + data.touId, 12);// - '+tbId);
													//trackClass.TournamentTracking(upData.value.mode,2,roundData.player[i]._iscom,turData[0].bv)	
													trackClass.TournamentTracking(upData.value.mode, 2, roundData.player[i]._iscom, turData[0].bv, -turData[0].bv)
												}
											}
										}

										cdClass.SendDataToTable(data.touId.toString(), {
											en: "SRJU",
											data: {
												isdraw: true,
												group: data.group,
												status: 2
											}
										})

										//round two mate ready ke te check karvanu have
										TournamnetClass.CheckthirdRoundReady(upData.value)
									})
								})
							}

						}
					}
				} else if (turData[0].status == 3) { // ms 2 nu winner logic 

					compClass.ExitGameOfTablestatus(data.tbid);
					var winData = {};


					if (data.winner.length == 0) { // jo  ek sathe badha EG mare to winner nathi thato atle winner length 0 mukine drow kariyu 

						var set = {
							$set: {
								sts: "WinnerDecalre",
								winid: "draw"
							},
							//$inc:{}
						};

						set["$set"]["round3.0.winid"] = 'draw';
						set["$set"]["round3.0.tbid"] = "";


						db.collection('tournament').findAndModify({
							_id: MongoId(data.touId.toString())
						}, {}, set, { new: true }, function () {

							cdClass.SendDataToTable(data.touId, {
								en: 'WINTOUR',
								data: winData,
								winbv: turData[0].winbv,
								tourdata: turData[0],
								tbid: data.touId,
								isdraw: true
							});
							//db.collection("tournament").remove({_id:MongoId(data.touId.toString())},function(){})
							compClass.FreeRobotForTournamnet(turData[0]);
						})
					} else {

						var roundData = turData[0].round3[0]
						//winId="";
						count = 0;


						for (var i = 0; i < roundData.player.length; i++) {
							for (var j = 0; j < data.winner.length; j++) {

								if (data.winner[j].w == true && typeof roundData.player[i] != 'undefined' && typeof roundData.player[i].uid != 'undefined' && typeof data.winner[j] != 'undefined' && typeof data.winner[j].uid != 'undefined' && roundData.player[i].uid.toString() == data.winner[j].uid.toString()) {
									count++;
									//winid=roundData.player[i].uid.toString();
									roundData.player[i].newxp = userClass.ManageUserLevel_update_get(roundData.player[i].oldxp, 15, "TWIN", roundData.player[i].doublexp)

									cdClass.UpdateUserData(roundData.player[i].uid.toString(), { $set: { "lgs": 2 } }, function () { });

									winData = roundData.player[i];
								}/*else{
									if(typeof roundData.player[i] != 'undefined' && typeof roundData.player[i].uid != 'undefined' && roundData.player[i].uid != ''  ){
							
		                            	trackClass.UserLastGameTrackTur(roundData.player[i].uid.toString(),'L');
										cdClass.UpdateUserData(roundData.player[i].uid.toString(), {$set:{"lgs":2}}, function () {});

									}
								}*/
							}
						}

						if (count == 1) {


							for (var j = 0; j < data.winner.length; j++) {
								if (data.winner[j].w == 0 && typeof data.winner[j].uid != "undefined" && data.winner[j].uid != "") {

									cdClass.UpdateUserData(data.winner[j].uid.toString(), { $set: { "lgs": 2 } }, function () { });
									trackClass.UserLastGameTrackTur(data.winner[j].uid.toString(), 'L');
								}
							}

							var set = {
								$set: {
									sts: "WinnerDecalre",
									winid: winData.uid
								}
							};

							set["$set"]["round3.0.winid"] = winData.uid;
							set["$set"]["round3.0.tbid"] = "";


							db.collection('tournament').findAndModify({
								_id: MongoId(data.touId.toString())
							}, {}, set, { new: true }, function (err, update) {


								if (!err && update.value != null) {


									cdClass.updateUserGold(winData.uid, turData[0].winbv, 'Win From Tournament - ' + data.touId, 19);// - '+tbId);
									//trackClass.TournamentTracking(update.value.mode,1,winData._iscom,turData[0].winbv)	
									trackClass.TournamentTracking(update.value.mode, 1, winData._iscom, turData[0].bv, -turData[0].winbv)


									cdClass.CountHandsWinTournament(winData.uid, update.value.jokermode); //counting Winners hand
									db.collection("game_users").update({ _id: MongoId(winData.uid.toString()), "flags._iscom": 0 }, { $set: { "lgs": 1, tuid: "", tsi: "" } }, function () { });
									//tuid atle  "" hoi bcz win thai ne reconnect thai to problem no aave 

									//cdClass.UpdateUserData(winData.uid.toString(), {$set:{"track.Closs":0},$inc:{"track.Cwin":1}}, function () {});

									trackClass.UserLastGameTrackTur(winData.uid.toString(), 'W');

									if (winData._iscom == 0) {
										trackClass.TrackSpinGame(winData.uid.toString(), 24, 1)
										// trackClass.TrackSpinGame(winData.uid.toString(), 33, 1)
										// trackClass.TrackSpinGame(winData.uid.toString(), 47, turData[0].bv, -turData[0].winbv)
									}

									/*if(winData._iscom == 0){
										if(io.sockets.connected[winData.socketid])
										{
											io.sockets.connected[winData.socketid].join(data.touId.toString());
											  }
									}

									cdClass.SendDataToTable(data.touId, {
										en: 'WINTOUR',
										data: winData,
										winbv : turData[0].winbv,
										tourdata:turData[0],
										tbid:data.touId,
										isdraw:false
									});*/
									cdClass.SendDataToUser(winData.uid, {
										en: "WINTOUR",
										data: winData,
										winbv: turData[0].winbv,
										tourdata: turData[0],
										tbid: data.touId,
										isdraw: false
									}); //publishing to exchange

									//db.collection("tournament").remove({_id:MongoId(data.touId.toString())},function(){})
									compClass.FreeRobotForTournamnet(update.value);
								}
							})
							//chips credit and to user 
							//and finish to user round
						} else {

							var set = {
								$set: {
									sts: "WinnerDecalre",
									winid: winData.uid
								},
								//$inc:{}
							};

							set["$set"]["round3.0.winid"] = 'draw';
							set["$set"]["round3.0.tbid"] = "";


							db.collection('tournament').findAndModify({
								_id: MongoId(data.touId.toString())
							}, {}, set, { new: true }, function (err, upData) {

								for (var i = 0; i < roundData.player.length; i++) {
									for (var j = 0; j < data.winner.length; j++) {
										if (data.winner[j].w == 1 && roundData.player[i].uid != undefined && data.winner[j].uid != undefined && roundData.player[i].uid.toString() == data.winner[j].uid.toString()) {
											cdClass.updateUserGold(roundData.player[i].uid, turData[0].bv, 'Refund Of Tournament-' + data.touId, 12);// - '+tbId);
											//trackClass.TournamentTracking(upData.value.mode,2,winData._iscom,turData[0].bv)
											trackClass.TournamentTracking(upData.value.mode, 2, winData._iscom, turData[0].bv, -turData[0].bv)
										}
									}
								}

								cdClass.SendDataToTable(data.touId, {
									en: 'WINTOUR',
									data: winData,
									winbv: turData[0].winbv,
									tourdata: turData[0],
									tbid: data.touId,
									isdraw: true
								});
								//db.collection("tournament").remove({_id:MongoId(data.touId.toString())},function(){})
								compClass.FreeRobotForTournamnet(turData[0]);
							})
						}
					}
				}

			}
		});
	},
	Returngroupandsi: (data, callback) => {

		var obj = {
			group: -1,
			si: -1
		}
		if (data.ms == 3) {
			switch (data.prvgroup) {
				case 0:
					obj.group = 0;
					obj.si = 0;

					break;

				case 1:
					obj.group = 0;
					obj.si = 1;

					break;

				case 2:
					obj.group = 0;
					obj.si = 2;

					break;
			}
		} else {
			if (data.status == 1) {
				switch (data.prvgroup) {
					case 0:
						obj.group = 0;
						obj.si = 0;

						break;

					case 1:
						obj.group = 0;
						obj.si = 1;

						break;

					case 2:
						obj.group = 1;
						obj.si = 0;

						break

					case 3:
						obj.group = 1;
						obj.si = 1;
						break

				}

			} else if (data.status == 2) {
				switch (data.prvgroup) {
					case 0:
						obj.group = 0;
						obj.si = 0;

						break;

					case 1:
						obj.group = 0;
						obj.si = 1;

						break;

					case 2:
						obj.group = 1;
						obj.si = 0;

						break

					case 3:
						obj.group = 1;
						obj.si = 1;
						break

				}
			}
		}

		return callback(obj)

	},
	CheckSecondRoundReady: (tourData) => {
		if (typeof tourData == 'undefined') {

			return false;
		}

		/*db.collection('tournament').find({
			_id:MongoId(tuid)
		}).toArray(function(err,tourData){*/

		//if(!err && tourData.length > 0){

		count = 0;

		for (var i = 0; i < tourData.round1.length; i++) {
			if ((typeof tourData.round1[i].tbid == 'undefined' || tourData.round1[i].tbid == '') && (typeof tourData.round1[i].winid != 'undefined' && tourData.round1[i].winid != '')) {
				count++;
			}
		}



		if ((count == 3 && tourData.ms == 3) || (count == 4 && tourData.ms == 2)) { // ms 3 == 3 || ms 2 == 4

			setTimeout(function () { //last user ne  td pachi direct Timer event jati hati aatle 

				//com.CancelScheduleJobOnServer(tourData._id.toString(), tourData.toujid);

				db.collection("tournament").update({
					_id: MongoId(tourData._id.toString())
				}, {
					$set: {
						status: 2
					}
				}, function () {

					cdClass.SendDataToTable(tourData._id.toString(), {
						en: "TIMER",
						data: {
							time: 5,
							status: 2
						}
					})

					setTimeout(function () {
						TournamnetClass.createTable(tourData._id.toString())
					}, 5000);

				})
			}, 500)
		}

		//}
		//})
	},
	CheckthirdRoundReady: (tourData) => {
		if (typeof tourData == 'undefined') {
			return false;
		}

		/*db.collection('tournament').find({
			_id:MongoId(tuid)
		}).toArray(function(err,tourData){*/

		/*


		if(!err && tourData.length > 0){*/

		count = 0;

		for (var i = 0; i < tourData.round2.length; i++) {
			if ((typeof tourData.round2[i].tbid == 'undefined' || tourData.round2[i].tbid == '') && (typeof tourData.round2[i].winid != 'undefined' && tourData.round2[i].winid != '')) {
				count++;
			}
		}

		if (count == 2) {

			setTimeout(function () { //last user ne  td pachi direct Timer event jati hati aatle 


				db.collection("tournament").update({
					_id: MongoId(tourData._id.toString())
				}, {
					$set: {
						status: 3
					}
				}, function () {

					cdClass.SendDataToTable(tourData._id.toString(), {
						en: "TIMER",
						data: {
							time: 5
						}
					})

					setTimeout(function () {
						TournamnetClass.createTable(tourData._id.toString())
					}, 5000);

				})
			}, 500)
		}

		//}
		//})
	},
	/*
		data:{
			uid:""
			touId:""
		}
	*/
	EGT: (data, client) => {

		if (typeof data.touId != 'undefined' && data.touId != "") {
			db.collection("playing_table").find({
				"pi.ui.uid": MongoId(client.uid.toString())
			}).toArray(function (err, ftb) {


				if (err || ftb.length == 0) {

					db.collection("tournament").find({
						_id: MongoId(data.touId)
					}).toArray(function (err, TouData) {

						if (!err && TouData.length > 0) {
							var urdata = {}
							if (TouData[0].round3 != undefined && TouData[0].round3.length > 0) {
								for (var i = 0; i < TouData[0].round3[0].player.length; i++) {
									if (typeof TouData[0].round3[0] != 'undefined' && typeof TouData[0].round1[0].player[i] != "undefined" && typeof TouData[0].round3[0].player[i].uid != 'undefined' && TouData[0].round3[0].player[i].uid.toString() == client.uid.toString()) {

										urdata = TouData[0].round3[0].player[i];
										break;
									}
								}
							}

							if (typeof urdata != 'undefined' && typeof urdata.si != 'undefined') {

								var set = { $set: {}, $inc: {} };
								var leftuser1 = {
									pn: "",
									uid: "",
									_iscom: -1,
									si: urdata.si,
									socketid: "",
									pp: "upload/user_left.png",
									viplvl: "",
									group: urdata.group,
									jt: new Date(),
									leave: 1
								};

								set["$set"]["round3.0.player." + urdata.si + ""] = leftuser1;
								set["$inc"]["round3.0.count"] = -1;



								db.collection("tournament").findAndModify({
									_id: MongoId(data.touId),
									"round3.player.uid": MongoId(client.uid.toString())
								}, {}, set, { new: true }, function (err, update) {

									urdata["status"] = 3;
									leftuser1["status"] = 3;


									trackClass.UserLastGameTrackTur(client.uid.toString(), 'L');

									//Exit Game Tour
									cdClass.SendDataToTable(TouData[0]._id.toString(), {
										en: "EGT",
										data: leftuser1
									})

									rclient.hdel('session:' + urdata.socketid.toString(), "toid");


									db.collection("game_users").update({
										_id: MongoId(client.uid.toString())
									}, {
										$set: {
											tsi: "",
											tuid: ""
										}
									}, function () { })

									//cdClass.SendData(client,"EGT",urdata,'succes:0000');
									//aa time out mathi Table ni sathe tournamnet mathi pan  nikal vano hoi tyare bija server mathi ave tle 
									cdClass.SendDataToUser(client.uid.toString(), {
										en: 'EGT',
										data: urdata
									});


									/*if(io.sockets.connected[client.socketid])
									{
										io.sockets.connected[client.socketid].leave(TouData[0]._id.toString());
									}*/

									/*var sData = {en: 'LEAVE', data: {tbid:TouData[0]._id.toString(),socketid: client.socketid}};
									playExchange.publish('table.' + TouData[0]._id.toString(), sData);	
									*/

									io.of('/').adapter.remoteLeave(client.socketid, TouData[0]._id.toString(), (err) => {
										/*if (err) { console.log("Not Connect ",client.socketid) }*/

									});

									var urdata2 = {}
									for (var i = 0; i < TouData[0].round2.length; i++) {
										for (var j = 0; j < TouData[0].round2[i].player.length; j++) {

											if (typeof TouData[0].round2[i] != 'undefined' && typeof TouData[0].round1[i].player[j] != "undefined" && typeof TouData[0].round2[i].player[j].uid != 'undefined' && TouData[0].round2[i].player[j].uid.toString() == client.uid.toString()) {

												urdata2 = TouData[0].round2[i].player[j];
												break;
											}
										}
									}

									if (typeof urdata2 != 'undefined' && typeof urdata2.si != 'undefined') {

										var set = { $set: {}, $inc: {} };

										var leftuser2 = {
											pn: "",
											uid: "",
											_iscom: -1,
											si: urdata2.si,
											socketid: "",
											pp: "upload/user_left.png",
											viplvl: "",
											group: urdata2.group,
											jt: new Date(),
											leave: 1
										};

										set["$set"]["round2." + urdata2.group + ".player." + urdata2.si + ""] = leftuser2;
										set["$inc"]["round2." + urdata2.group + ".count"] = -1;

										db.collection("tournament").findAndModify({
											_id: MongoId(data.touId),
											"round2.player.uid": MongoId(client.uid.toString())
										}, {}, set, { new: true }, function (err, update) {

											urdata2["status"] = 2;
											leftuser2["status"] = 2;


											trackClass.UserLastGameTrackTur(client.uid.toString(), 'L');

											//Exit Game Tour
											cdClass.SendDataToTable(TouData[0]._id.toString(), {
												en: "EGT",
												data: leftuser2
											})

											rclient.hdel('session:' + urdata2.socketid.toString(), "toid");


											db.collection("game_users").update({
												_id: MongoId(client.uid.toString())
											}, {
												$set: {
													tsi: "",
													tuid: ""
												}
											}, function () { })

											//cdClass.SendData(client,"EGT",urdata2,'succes:0000');
											//aa time out mathi Table ni sathe tournamnet mathi pan  nikal vano hoi tyare bija server mathi ave tle 
											cdClass.SendDataToUser(client.uid.toString(), {
												en: 'EGT',
												data: urdata2
											});



											/*if(io.sockets.connected[client.socketid])
											{
												io.sockets.connected[client.socketid].leave(TouData[0]._id.toString());
											}*/

											/*var sData = {en: 'LEAVE', data: {tbid:TouData[0]._id.toString(),socketid: client.socketid}};
											playExchange.publish('table.' + TouData[0]._id.toString(), sData);	*/

											io.of('/').adapter.remoteLeave(client.socketid, TouData[0]._id.toString(), (err) => {
												/*if (err) { console.log("Not Connect ",client.socketid) }*/

											});

											//Round 1 mate app kill kari de and same time paar pach aave to rejoin ma tuid male a tle tya check karaviyu 6e ke all a comp add karo 
											var urdata1 = {}
											for (var i = 0; i < TouData[0].round1.length; i++) {
												for (var j = 0; j < TouData[0].round1[i].player.length; j++) {

													if (typeof TouData[0].round1[i] != 'undefined' && typeof TouData[0].round1[i].player[j] != "undefined" && typeof TouData[0].round1[i].player[j].uid != 'undefined' && TouData[0].round1[i].player[j].uid.toString() == client.uid.toString()) {
														//urdata={group:i,seat:j}
														urdata1 = TouData[0].round1[i].player[j];
														break;
													}
												}
											}

											if (typeof urdata1 != 'undefined' && typeof urdata1.si != 'undefined') {

												var set = { $set: {} };
												/*ui.group = urdata1.group;
												ui.si    = urdata1.si;*/

												set["$set"]["round1." + urdata1.group + ".player." + urdata1.si + ""] = {
													pn: "",
													uid: "",
													_iscom: -1,
													si: urdata1.si,
													socketid: "",
													pp: "upload/user_left.png",
													viplvl: "",
													group: urdata1.group,
													jt: new Date(),
													leave: 1
												};

												db.collection('tournament').findAndModify({
													_id: MongoId(data.touId)
												}, {}, set, { new: true }, function () {

												})
											}


										});
									}

								});
							} else {


								var urdata = {}
								for (var i = 0; i < TouData[0].round2.length; i++) {
									for (var j = 0; j < TouData[0].round2[i].player.length; j++) {

										if (typeof TouData[0].round2[i] != 'undefined' && typeof TouData[0].round1[i].player[j] != "undefined" && typeof TouData[0].round2[i].player[j].uid != 'undefined' && TouData[0].round2[i].player[j].uid.toString() == client.uid.toString()) {

											urdata = TouData[0].round2[i].player[j];
											break;
										}
									}
								}

								if (typeof urdata != 'undefined' && typeof urdata.si != 'undefined') {

									var set = { $set: {}, $inc: {} };

									var leftuser = {
										pn: "",
										uid: "",
										_iscom: -1,
										si: urdata.si,
										socketid: "",
										pp: "upload/user_left.png",
										viplvl: "",
										group: urdata.group,
										jt: new Date(),
										leave: 1
									};

									set["$set"]["round2." + urdata.group + ".player." + urdata.si + ""] = leftuser;
									set["$inc"]["round2." + urdata.group + ".count"] = -1;


									db.collection("tournament").findAndModify({
										_id: MongoId(data.touId),
										"round2.player.uid": MongoId(client.uid.toString())
									}, {}, set, { new: true }, function (err, update) {


										urdata["status"] = 2;
										leftuser["status"] = 2;


										trackClass.UserLastGameTrackTur(client.uid.toString(), 'L');

										//Exit Game Tour
										cdClass.SendDataToTable(TouData[0]._id.toString(), {
											en: "EGT",
											data: leftuser
										})

										rclient.hdel('session:' + urdata.socketid.toString(), "toid");

										db.collection("game_users").update({
											_id: MongoId(client.uid.toString())
										}, {
											$set: {
												tsi: "",
												tuid: ""
											}
										}, function () { })

										//cdClass.SendData(client,"EGT",urdata,'succes:0000');
										//aa time out mathi Table ni sathe tournamnet mathi pan  nikal vano hoi tyare bija server mathi ave tle 
										cdClass.SendDataToUser(client.uid.toString(), {
											en: 'EGT',
											data: urdata
										});



										/*if(io.sockets.connected[client.socketid])
										{
											io.sockets.connected[client.socketid].leave(TouData[0]._id.toString());
										}*/

										/*var sData = {en: 'LEAVE', data: {tbid:TouData[0]._id.toString(),socketid: client.socketid}};
										playExchange.publish('table.' + TouData[0]._id.toString(), sData);	*/

										io.of('/').adapter.remoteLeave(client.socketid, TouData[0]._id.toString(), (err) => {
											/*if (err) { console.log("Not Connect ",client.socketid) }*/

										});

										//Round 1 mate app kill kari de and same time paar pach aave to rejoin ma tuid male a tle tya check karaviyu 6e ke all a comp add karo 
										var urdata1 = {}
										for (var i = 0; i < TouData[0].round1.length; i++) {
											for (var j = 0; j < TouData[0].round1[i].player.length; j++) {

												if (typeof TouData[0].round1[i] != 'undefined' && typeof TouData[0].round1[i].player[j] != "undefined" && typeof TouData[0].round1[i].player[j].uid != 'undefined' && TouData[0].round1[i].player[j].uid.toString() == client.uid.toString()) {
													//urdata={group:i,seat:j}
													urdata1 = TouData[0].round1[i].player[j];
													break;
												}
											}
										}

										if (typeof urdata1 != 'undefined' && typeof urdata1.si != 'undefined') {

											var set = { $set: {} };
											/*ui.group = urdata1.group;
											ui.si    = urdata1.si;*/

											set["$set"]["round1." + urdata1.group + ".player." + urdata1.si + ""] = {
												pn: "",
												uid: "",
												_iscom: -1,
												si: urdata1.si,
												socketid: "",
												pp: "upload/user_left.png",
												viplvl: "",
												group: urdata1.group,
												jt: new Date(),
												leave: 1
											};

											db.collection('tournament').findAndModify({
												_id: MongoId(data.touId)
											}, {}, set, { new: true }, function () {

											})
										}


									});
								} else {


									//remove room from turnmant 
									//send turnament 
									var urdata1 = {}
									for (var i = 0; i < TouData[0].round1.length; i++) {
										for (var j = 0; j < TouData[0].round1[i].player.length; j++) {

											if (typeof TouData[0].round1[i] != 'undefined' && typeof TouData[0].round1[i].player[j] != "undefined" && typeof TouData[0].round1[i].player[j].uid != 'undefined' && TouData[0].round1[i].player[j].uid.toString() == client.uid.toString()) {
												//urdata={group:i,seat:j}
												urdata1 = TouData[0].round1[i].player[j];
												break;
											}
										}
									}

									//if(TouData[0].sts == "startup"){
									/*var urdata1={}
									for(var i=0;i<TouData[0].round1.length;i++){
										for(var j=0;i<TouData[0].round1[i].player.length;j++)
										{
											if(typeof TouData[0].round1[i].player[j].uid == 'undefined' && typeof TouData[0].round1[i].player[j].uid.toString() == data.uid.toString()){
												urdata1={group:i,seat:j}
												break;
											}
										}
									}*/
									if (typeof urdata1 != 'undefined' && typeof urdata1.si != 'undefined') {
										var set = { $set: {}, $inc: {} };

										var wh = { _id: MongoId(data.touId) }
										wh["round1." + urdata1.group + ".player.uid"] = MongoId(urdata1.uid.toString());

										set["$inc"]["round1." + urdata1.group + ".count"] = -1;
										var leftuser = {}
										if (TouData[0].sts == 'startup') {
											set["$set"]["round1." + urdata1.group + ".player." + urdata1.si + ""] = {};
											set["$inc"]["count"] = -1;
										} else {
											var leftuser = {
												pn: "",
												uid: "",
												_iscom: -1,
												si: urdata1.si,
												socketid: "",
												pp: "upload/user_left.png",
												viplvl: "",
												group: urdata1.group,
												jt: new Date(),
												leave: 1
											};
											set["$set"]["round1." + urdata1.group + ".player." + urdata1.si + ""] = leftuser;
										}

										db.collection('tournament').findAndModify(wh, {}, set, { new: true }, function (err, findnew) {

											urdata1["status"] = 1;
											leftuser["status"] = 1;


											cdClass.SendDataToTable(TouData[0]._id.toString(), {
												en: "EGT",
												data: (typeof leftuser.si != "undefined") ? leftuser : urdata1
											})

											if (TouData[0].sts == 'startup' && !err && findnew.value != null)
												dashClass.SendGlobelRoomTournament(findnew.value)

											rclient.hdel('session:' + urdata1.socketid.toString(), "toid");

											db.collection("game_users").update({
												_id: MongoId(urdata1.uid.toString())
											}, {
												$set: {
													tsi: "",
													tuid: ""
												}
											}, function () { })

											//cdClass.SendData(client,"EGT",urdata1,'succes:0000');

											cdClass.SendDataToUser(client.uid.toString(), {
												en: 'EGT',
												data: urdata1
											});


											/*if(io.sockets.connected[client.socketid])
											{
												io.sockets.connected[client.socketid].leave(TouData[0]._id.toString());
												*/
											/*var sData = {en: 'LEAVE', data: {tbid:TouData[0]._id.toString(),socketid:client.socketid}};
											playExchange.publish('table.' + TouData[0]._id.toString(), sData);	
											*/

											io.of('/').adapter.remoteLeave(client.socketid, TouData[0]._id.toString(), (err) => {
												/*if (err) { console.log("Not Connect ",client.socketid) }*/

											});


											//}
										})
										//remove only data 

										/*}else{
											//Start Playing for 
											

											if(TouData[0].status == 1){




											}


										}*/
									}

								}
							}
						}
					})
				} else {
					console.log("Table ma User HATO ::::::::::::::::::::::::::::::::::::::::::::::::::------------------>>>")
				}
			})
		}
	},
	/*
		touId	
		compData:compData
		
		//Only partner mode bcz user exit game time winner declare ma comp aave tournament na data ma comp no hoi atle 
		//
	*/
	ExitTimeCompSeat: (data, client, callback) => {

		if (typeof data.touId != 'undefined' && data.touId.length == 24) {
			db.collection("tournament").find({
				_id: MongoId(data.touId)
			}).toArray(function (err, TouData) {

				if (!err && TouData.length > 0 /*&& TouData.ms == 3*/) {

					var urdata = {}
					if (TouData[0].round3 != undefined && TouData[0].round3[0] != undefined) {
						for (var j = 0; j < TouData[0].round3[0].player.length; j++) {
							if (typeof TouData[0].round3[0] != 'undefined' && typeof TouData[0].round3[0].player[j] != "undefined" && typeof TouData[0].round3[0].player[j].uid != 'undefined' && TouData[0].round3[0].player[j].uid.toString() == client.uid.toString()) {

								urdata = TouData[0].round3[0].player[j];
								break;
							}
						}
					}
					if (typeof urdata != 'undefined' && typeof urdata.si != 'undefined') {


						var ui = {
							pn: data.compData.pn,
							uid: (data.compData.uid != "") ? MongoId(data.compData.uid) : "",
							_iscom: parseInt(data.compData._iscom),
							si: urdata.si,
							group: 0,
							socketid: data.compData.socketid,
							pp: data.compData.pp,
							viplvl: (data.compData.uid != "") ? parseInt(data.compData.viplvl) : ""
						};

						var set = { $set: {} };

						set["$set"]["round3.0.player." + urdata.si + ""] = ui;
						//set["$inc"]["round3.0.count"]=-1;



						db.collection("tournament").findAndModify({
							_id: MongoId(data.touId),
							"round3.player.uid": MongoId(client.uid.toString())
						}, {}, set, { new: true }, function (err, update) {



							if (typeof callback == "function") {
								return callback(true)
							}
						});


					} else {

						var urdata = {}

						for (var i = 0; i < TouData[0].round2.length; i++) {

							for (var j = 0; j < TouData[0].round2[i].player.length; j++) {



								if (typeof TouData[0].round2[i] != 'undefined' && typeof TouData[0].round2[i].player[j] != "undefined" && typeof TouData[0].round2[i].player[j].uid != 'undefined' && TouData[0].round2[i].player[j].uid.toString() == client.uid.toString()) {
									urdata = TouData[0].round2[i].player[j];
									break;
								}
							}
						}

						if (typeof urdata != 'undefined' && typeof urdata.si != 'undefined') {

							var ui = {
								pn: data.compData.pn,
								uid: (data.compData.uid != "") ? MongoId(data.compData.uid) : "",
								_iscom: parseInt(data.compData._iscom),
								si: urdata.si,
								group: urdata.group,
								socketid: data.compData.socketid,
								pp: data.compData.pp,
								viplvl: (data.compData.uid != "") ? parseInt(data.compData.viplvl) : "",
								leave: (typeof data.compData.leave != "undefined") ? data.compData.leave : 0
							};


							var set = { $set: {} };

							set["$set"]["round2." + urdata.group + ".player." + urdata.si + ""] = ui;
							//set["$inc"]["round2.0.count"]=-1;



							db.collection("tournament").findAndModify({
								_id: MongoId(data.touId),
								"round2.player.uid": MongoId(client.uid.toString())
							}, {}, set, { new: true }, function (err, update) {

								/*if(typeof callback == "function"){
									return callback(true)
								}*/
							});

							//First round group ma seat karavo 
							//remove room from turnmant 
							//send turnament 
							var urdata1 = {}
							for (var i = 0; i < TouData[0].round1.length; i++) {
								for (var j = 0; j < TouData[0].round1[i].player.length; j++) {

									if (typeof TouData[0].round1[i] != 'undefined' && typeof TouData[0].round1[i].player[j] != "undefined" && typeof TouData[0].round1[i].player[j].uid != 'undefined' && TouData[0].round1[i].player[j].uid.toString() == client.uid.toString()) {
										//urdata={group:i,seat:j}
										urdata1 = TouData[0].round1[i].player[j];
										break;
									}
								}
							}


							if (typeof urdata1 != 'undefined' && typeof urdata1.si != 'undefined') {

								var ui = {
									pn: data.compData.pn,
									uid: (data.compData.uid != "") ? MongoId(data.compData.uid) : "",
									_iscom: parseInt(data.compData._iscom),
									si: urdata1.si,
									group: urdata1.group,
									socketid: data.compData.socketid,
									pp: data.compData.pp,
									viplvl: (data.compData.uid != "") ? parseInt(data.compData.viplvl) : "",
									leave: (typeof data.compData.leave != "undefined") ? data.compData.leave : 0
								};

								var set = { $set: {} };

								set["$set"]["round1." + urdata1.group + ".player." + urdata1.si + ""] = ui;

								db.collection('tournament').findAndModify({
									_id: MongoId(data.touId)
								}, {}, set, { new: true }, function () {

									if (typeof callback == "function") {
										return callback(true)
									}
								})

							} else {
								if (typeof callback == "function") {
									return callback(true)
								}
							}


						} else {

							if (TouData[0].sts != 'startup') {


								//remove room from turnmant 
								//send turnament 
								var urdata1 = {}
								for (var i = 0; i < TouData[0].round1.length; i++) {
									for (var j = 0; j < TouData[0].round1[i].player.length; j++) {

										if (typeof TouData[0].round1[i] != 'undefined' && typeof TouData[0].round1[i].player[j] != "undefined" && typeof TouData[0].round1[i].player[j].uid != 'undefined' && TouData[0].round1[i].player[j].uid.toString() == client.uid.toString()) {
											//urdata={group:i,seat:j}
											urdata1 = TouData[0].round1[i].player[j];
											break;
										}
									}
								}

								if (typeof urdata1 != 'undefined' && typeof urdata1.si != 'undefined') {

									var ui = {
										pn: data.compData.pn,
										uid: (data.compData.uid != "") ? MongoId(data.compData.uid) : "",
										_iscom: parseInt(data.compData._iscom),
										si: urdata1.si,
										group: urdata1.group,
										socketid: data.compData.socketid,
										pp: data.compData.pp,
										viplvl: (data.compData.uid != "") ? parseInt(data.compData.viplvl) : "",
										leave: (typeof data.compData.leave != "undefined") ? data.compData.leave : 0
									};

									var set = { $set: {} };

									set["$set"]["round1." + urdata1.group + ".player." + urdata1.si + ""] = ui;

									db.collection('tournament').findAndModify({
										_id: MongoId(data.touId)
									}, {}, set, { new: true }, function () {

										if (typeof callback == "function") {
											return callback(true)
										}
									})

								} else {
									if (typeof callback == "function") {
										return callback(true)
									}

								}
							} else {
								if (typeof callback == "function") {
									return callback(true)
								}
							}
						}
					}

				}
			})
		} else {
			if (typeof callback == "function") {
				return callback(true)
			}
		}


	},
	ULGS: (data, client) => {
		cdClass.UpdateUserData(client.uid.toString(), { $set: { "lgs": 0 } }, function () { });
	}
}