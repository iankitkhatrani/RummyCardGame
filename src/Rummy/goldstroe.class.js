
/*process.on('uncaughtException', (err) => {
	console.log("err::---->>>>",err);
});*/

GoldStroeClass = require('./goldstroe.class.js');
com = require('./comm_function_class.js');
cdClass = require('./common.class.js');
userClass = require('./mecanismofuser.class.js');
const _ = require("underscore");

const IABVerifier = require('iab_verifier')

var Verifier = require('google-play-billing-validator');

var googleplay_private_key = "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCEzTViE8zIKbcp\nTooU2+yZXx5o56DuGhXO2RdsBlKo+ZwXHkm1aloA7kQHh+CnNt0e6p6w0sErtf5j\noalkzcy6ZxyRDzEh+cM885Q++G6kLAJ5B0P/58AVjFRECYElnaGLnxvkTvwbKBX+\nBY0N//8ujGBZzYoWgDQum1HvpUH08aK3fka4Gv0LaqIW9DBcpTH63XGIiJZIJcmY\nzwtsJ2iQczse6QfFka8nDFOrf8P/ZKTGoa612Q9td06M/U9iy3i1DTQtszAtwjR+\nHsBQUVNZCPuNBX6NHvGbj0OZ2C8GCgli5IL3CHUi3YuUcvddDoI8IuxPeQkVUaXW\nzNljxpGHAgMBAAECggEAA3mnQvjHrBlDXMZcYK1cpKrTjeU51eFC3tXZgg8sTJWz\nmvtE7IVq84lIqHXK0DVkVfHH01LAkVdC3/KUDzo/eEVIfxdJrtztWgP5xigUJSGt\nsuMYyXKUGTxB3EHvaj+UwaWZQkE64a8L3Eji5xHi6KHtx4vUaEBUnT+dRkspzbIX\nbHNWHtO/X4NJV8WyJ0E43iu4gUff/VRT7xgcjEbmAGyeCdGD+zYnz6MeXgGVkGzB\nCvYxJkyBbO55CIwVf3+3lvBHL7Zqf8ZJXOe4YAGx2DRldXt2uxOv+QSOeITDGf25\nAoM70KourvBon8y7N1J5Jsv04KHMTAS/D42ObiNToQKBgQC56umhV2EWqhJjnRXw\nLfEue6UZ7911YhMZ7tOkTuO/wcUK/iQlnXxuje1kFsep6Q5GY47IJE29juZK75G8\n3qpDAGt2oIwpOmDB1BxAQakJJpVPLnAl3MunCghKd+itYPlixSXtfowij8p6CVpC\npIV36vsVtnWowvBy2E7X7SHQ0QKBgQC23JamjC8MQZnLrYKb/dXhQVV/mc5Q7vtc\nTsVFUjBcoYIVfiFP6V5kTgxGvJTwJAXXfQMPsbBhVA7a3GUlnEePK57iuKZS5rl/\nUtKxDxhD8VVr5wdbl+6GnpWHYHIGrqUGtjBHkPdrVdwNe162NKBBgc1HghLpOxZA\n1OcYWPmS1wKBgQCyShTCJIl2sqHv5TSkn2oqqWgq91votaSbuew8JWtC+Q98+zqu\n19f8LR76XN4ckuKdndvPEwF6Rw+RzSx1cxLULhLgMBY5c0JWnpJ5DH6Nx/JnfKEP\nri2egoBw6Yy4t8ZwcZ9toW3BtyL05QMp5ZwY477lk5RBwq/Tcpwpdb54AQKBgCJp\nXpxW8x+eVL/klhie6xnpvpo1qoLGhlz3od4KunkkF6PNyZ0NMKs1mM/S+0A5tzO3\nHdVdPfEC7Yy4PvyV7U1/CvZlgz9ElhHk1ytkyM84YjfdESBmdge1XjRMrQie4wVh\nUbKWEEmNrcyHs+ob+zB4qdXUH5TufqCSsC5/x++fAoGBAKyXqnjPMeTv1CcKM4vo\n42oaRhr1qAwU8/wmKbP4lmaa04bb8Xs1tvPW4hDvO4Js/x37761H/Z1oPlwue1SM\nR3KiG1NI5fiaD1jmKcSayn2haCOH50UXTyoYFHZCxsI20az11wmxG9ELmc9LU0Ss\nbDa7c13SYZ4vEdKluvPcMnzb\n-----END PRIVATE KEY-----\n";

var options = {
	"email": 'ginrummy@api-7586816541499054395-488034.iam.gserviceaccount.com',
	"key": googleplay_private_key,
};

var verifier = new Verifier(options);


module.exports = {

	FGS: (data, client) => {

		GoldStroeClass.NBS({ inside: 1, data: data }, client, (goldandBooster) => {

			GoldStroeClass.GEMSS(data, client, (Gemsstroe) => {

				GoldStroeClass.NOTESS(data, client, (Notesstroe) => {

					cdClass.SendData(client, 'FGS', {
						type: data.type,
						boosterstore: (goldandBooster.boosterstroe != undefined) ? goldandBooster.boosterstroe : [],
						goldstore: (goldandBooster.goldstroe != undefined) ? goldandBooster.goldstroe : [],
						promo: (goldandBooster.promo != undefined) ? goldandBooster.promo : {},
						gemsstore: (Gemsstroe.data.Gemsstroe != undefined) ? Gemsstroe.data.Gemsstroe : [],
						gemspromo: (Gemsstroe.promo != undefined) ? Gemsstroe.promo : [],
						notesstore: (Notesstroe.Notesstroe != undefined) ? Notesstroe.Notesstroe : [],
						offer: []
					}, "success:0000");

				})
			})
		})
	},
	/*
		Gold store
	*/
	GS: (data, client, callback) => {
		db.collection('gold_store').find({
			status: 1,
			isoffer: 0,
			iscombo: 0,
			isother: 0
		}).sort({
			price: -1
		}).toArray(function (err, goldstroe) {
			if (!err && goldstroe.length > 0) {

				db.collection('game_users').find({ _id: MongoId(client.uid) }).project({ track: 1 }).toArray(function (err, uData) {

					if (!err && uData.length > 0) {

						GoldStroeClass.OfferData(uData[0].track.buy_gold, function (prooffer) {

							if (data.inside != undefined && data.inside == 1) {
								if (typeof callback == "function") {
									return callback({ goldstroe: goldstroe, promo: prooffer })
								}
							} else {
								if (typeof callback == "function") {
									return callback({
										"flag": ErrorMsg.SUCCESS,
										"msg": ErrorMsg[client.lc + "_0000"],
										"data": { goldstroe: goldstroe, promo: prooffer },
										"en": "GS",
										"errcode": "0000"
									})
								}
							}
						})
					} else {
						if (data.inside != undefined && data.inside == 1) {
							if (typeof callback == "function") {
								return callback({ goldstroe: goldstroe, promo: {} })
							}
						} else {
							if (typeof callback == "function") {
								return callback({
									"flag": ErrorMsg.SUCCESS,
									"msg": ErrorMsg[client.lc + "_0000"],
									"data": { goldstroe: goldstroe, promo: {} },
									"en": "GS",
									"errcode": "0000"
								})
							}
						}
					}
				})
			} else {
				if (data.inside != undefined && data.inside == 1) {
					if (typeof callback == "function") {
						return callback({})
					}
				} else {

					if (typeof callback == "function") {
						return callback({
							"flag": ErrorMsg.SUCCESS,
							"msg": ErrorMsg[client.lc + "_0000"],
							"data": {},
							"en": "GS",
							"errcode": "0000"
						})
					}
				}
			}
		})
	},
	NBS: (data, client, callback) => {
		db.collection('gold_store').find({
			iscombo: 0,
			status: 1,
			isoffer: 0,
			isother: 0
		}).sort({
			price: -1
		}).toArray(function (err, goldstroe) {
			if (!err && goldstroe.length > 0) {

				db.collection('game_users').find({ _id: MongoId(client.uid) }, { track: 1, version: 1 }).toArray(function (err, uData) {

					if (!err && uData.length > 0) {

						GoldStroeClass.OfferData(uData[0].track.buy_gold, function (prooffer) {


							db.collection('gold_store').find({
								status: 1,
								isoffer: 0,
								iscombo: 1,
								isother: 0
							}).sort({
								price: 1
							}).toArray(function (err, combostroe) {
								if (!err && combostroe.length > 0) {

									if (data.inside != undefined && data.inside == 1) {

										if (typeof callback == "function") {

											callback({ boosterstroe: combostroe, goldstroe: goldstroe, promo: prooffer })
										}
									}
									else {
										if (typeof callback == "function") {

											return callback({
												"flag": ErrorMsg.SUCCESS,
												"msg": ErrorMsg[client.lc + "_0000"],
												"data": { boosterstroe: combostroe, goldstroe: goldstroe, promo: prooffer },
												"en": "NBS",
												"errcode": "0000"
											})
										}

									}
								}
							})

						})
					} else {

						if (data.inside != undefined && data.inside == 1) {

							if (typeof callback == "function") {

								callback({ boosterstroe: [], goldstroe: goldstroe, promo: {} })
							}
						}
						else {

							if (typeof callback == "function") {

								return callback({
									"flag": ErrorMsg.SUCCESS,
									"msg": ErrorMsg[client.lc + "_0000"],
									"data": { boosterstroe: [], goldstroe: goldstroe, promo: {} },
									"en": "NBS",
									"errcode": "0000"
								})
							}
						}
					}


					/*db.collection('gold_store').find({
						status:1,
						isoffer:1,
					}).toArray(function(err,promooffer){
	
						if(!err && promooffer.length > 0){
	
							cdClass.SendData(client,'GS',{goldstroe:goldstroe,promo:promooffer[0]},"success:0000");
						}else{
							cdClass.SendData(client,'GS',{goldstroe:goldstroe,promo:{}},"success:0000");
	
						}
					});*/
				})
			} else {
				if (typeof callback == "function") {
					callback({})

					return callback({
						"flag": ErrorMsg.SUCCESS,
						"msg": ErrorMsg[client.lc + "_0000"],
						"data": {},
						"en": "NBS",
						"errcode": "0000"
					})

				} else {
					cdClass.SendData(client, 'NBS', {}, "success:0000");
				}
			}
		})
	},
	LSD: (data, client) => {
		db.collection("leaf_store").find({ status: 1 }).toArray((err, leafstone) => {

			if (!err && leafstone.length > 0) {
				cdClass.SendData(client, 'LSD', { leafstone: leafstone }, "success:0000");
			} else {
				cdClass.SendData(client, 'LSD', { leafstone: [] }, "success:0000");
			}

		})
	},
	/*
		Gems store 
	
	*/
	GEMSS: (data, client, callback) => {

		db.collection('gems_store').find({
			status: 1,
			isoffer: 0
		}).sort({
			price: -1
		}).toArray(function (err, Gemsstroe) {
			if (!err && Gemsstroe.length > 0) {
				db.collection('game_users').find({ _id: MongoId(client.uid) }).project({ track: 1 }).toArray(function (err, uData) {

					if (!err && uData.length > 0) {
						GoldStroeClass.OfferDataForGems(uData[0].track.buy_gold, function (prooffer) {

							if (data.inside != undefined && data.inside == 1) {
								if (typeof callback == "function") {
									return callback({ Gemsstroe: Gemsstroe, promo: prooffer })
								}
							} else {
								if (typeof callback == "function") {
									return callback({
										"flag": ErrorMsg.SUCCESS,
										"msg": ErrorMsg[client.lc + "_0000"],
										"data": { Gemsstroe: Gemsstroe, promo: prooffer },
										"en": "GEMSS",
										"errcode": "0000"
									})
								}
							}
						})
					} else {
						if (data.inside != undefined && data.inside == 1) {
							if (typeof callback == "function") {
								return callback({ Gemsstroe: Gemsstroe, promo: {} })
							}
						} else {
							if (typeof callback == "function") {
								return callback({
									"flag": ErrorMsg.SUCCESS,
									"msg": ErrorMsg[client.lc + "_0000"],
									"data": { Gemsstroe: Gemsstroe, promo: {} },
									"en": "GEMSS",
									"errcode": "0000"
								})
							}
						}
					}
				});
			} else {
				if (data.inside != undefined && data.inside == 1) {
					if (typeof callback == "function") {
						return callback({})
					}
				} else {
					if (typeof callback == "function") {
						return callback({
							"flag": ErrorMsg.SUCCESS,
							"msg": ErrorMsg[client.lc + "_0000"],
							"data": {},
							"en": "GEMSS",
							"errcode": "0000"
						})
					}
				}
			}
		})
	},
	NOTESS: (data, client, callback) => {
		db.collection('notes_store').find({
			status: 1,
			isoffer: 0
		}).sort({
			price: -1
		}).toArray(function (err, Notesstroe) {
			if (!err && Notesstroe.length > 0) {
				if (typeof callback == "function") {
					callback({ Notesstroe: Notesstroe })
				} else {
					cdClass.SendData(client, 'NOTESS', { Notesstroe: Notesstroe }, "success:0000");
				}
			} else {
				if (typeof callback == "function") {
					callback({ Notesstroe: Notesstroe })
				} else {
					cdClass.SendData(client, 'NOTESS', {}, "success:0000");
				}
			}
		})
	},
	OfferData: (usertrack, callback) => {

		var maxpayment = _.max(usertrack, function (d) { return d });

		db.collection('gold_store').find({
			status: 1,
			isoffer: 1,
			isdayoffer: 1,
			sd: { $lte: new Date() },
			ed: { $gte: new Date() },
			//offercode:config.OFFERCODE
		}).toArray(function (err, promooffer) {

			if (!err && promooffer.length > 0) {
				return callback(promooffer[0]);
			} else {
				if (usertrack.length == 0) { //non pyaee user 

					db.collection('gold_store').find({
						status: 1,
						isoffer: 1,
						from: { $lte: 0 },
						to: { $gt: 0 },
						sd: { $lte: new Date() },
						ed: { $gte: new Date() },
						//offercode:config.OFFERCODE
					}).toArray(function (err, promooffer) {

						if (!err && promooffer.length > 0) {
							return callback(promooffer[0]);
						} else {
							return callback({});
						}
					});
				} else {
					db.collection('gold_store').find({
						status: 1,
						isoffer: 1,
						from: { $lte: maxpayment },
						to: { $gt: maxpayment },
						sd: { $lte: new Date() },
						ed: { $gte: new Date() },
						//offercode:config.OFFERCODE
					}).toArray(function (err, promooffer) {

						if (!err && promooffer.length > 0) {
							return callback(promooffer[0]);
						} else {
							return callback({});
						}
					});
				}
			}
		})
	},
	EO: (data, client) => {
		cdClass.GetUserInfo(client.uid.toString(), {
			track: 1
		}, (userData) => {
			if (userData.track.buy_gold != undefined) {
				GoldStroeClass.ExtraOfferData(userData.track.buy_gold, (ofData) => {
					db.collection('gold_store').find({
						sd: { $lte: new Date() },
						ed: { $gte: new Date() },
						"inapp": "firsttimepurchaseginrummy",
						isother: 1,
						status: 1
					}).toArray(function (err, OtherPack) {


						if (client.v != undefined && parseInt(client.v) > 36 && !err && OtherPack.length > 0) {
							ofData = ofData.concat(OtherPack)
						}

						cdClass.SendData(client, 'EO', { data: ofData }, "success:0000");
					})
				})
			} else {
				cdClass.SendData(client, 'EO', { data: [] }, "success:0000");
			}
		})
	},
	ExtraOfferData: (usertrack, callback) => {

		var maxpayment = _.max(usertrack, function (d) { return d });
		var ExtraofferData = []

		db.collection('gold_store').find({
			status: 1,
			"inapp": "ginrummybebygoldofferpack",
			sd: { $lte: new Date() },
			ed: { $gte: new Date() },
		}).project({ inapp: 1, price: 1, gold: 1, free_gold: 1, free_gems: 1, offerimg: 1 }).toArray(function (err, promooffer) {

			if (!err && promooffer.length > 0) {
				ExtraofferData.push(promooffer[0])
			}

			db.collection('gold_store').find({
				status: 1,
				isdayoffer: 1,
				sd: { $lte: new Date() },
				ed: { $gte: new Date() },
			}).project({ inapp: 1, price: 1, gold: 1, free_gold: 1, free_gems: 1, offerimg: 1 }).toArray(function (err, promooffer) {

				if (!err && promooffer.length > 0) {
					ExtraofferData.push(promooffer[0])
					return callback(ExtraofferData);
				} else {
					if (usertrack.length == 0) { //non pyaee user 

						db.collection('gold_store').find({
							status: 1,
							exfrom: { $lte: 0 },
							exto: { $gt: 0 },
							sd: { $lte: new Date() },
							ed: { $gte: new Date() },
						}).project({ inapp: 1, price: 1, gold: 1, free_gold: 1, free_gems: 1, offerimg: 1 }).toArray(function (err, promooffer) {

							if (!err && promooffer.length > 0) {
								ExtraofferData.push(promooffer[0])
								return callback(ExtraofferData);
							} else {
								return callback(ExtraofferData);
							}
						});
					} else {
						db.collection('gold_store').find({
							status: 1,
							exfrom: { $lte: maxpayment },
							exto: { $gt: maxpayment },
							sd: { $lte: new Date() },
							ed: { $gte: new Date() },
						}).project({ inapp: 1, price: 1, gold: 1, free_gold: 1, free_gems: 1, offerimg: 1 }).toArray(function (err, promooffer) {

							if (!err && promooffer.length > 0) {
								ExtraofferData.push(promooffer[0])
								return callback(ExtraofferData);
							} else {
								return callback(ExtraofferData);
							}
						});
					}
				}
			});

		})
	},
	GSEO: (data, client) => {
		cdClass.GetUserInfo(client.uid.toString(), {
			track: 1
		}, (userData) => {
			if (userData.track.buy_gold != undefined) {
				GoldStroeClass.GoldStoreExitOfferData(userData.track.buy_gold, (ofData) => {

					var firstTimeOfr = _.filter(userData.track.buy_gold, function (num) { return num == 0.69; })

					if (false && firstTimeOfr.length != 0) {

						var maxpayment = (userData.track.buy_booster_eo.length != 0) ? _.max(userData.track.buy_booster_eo) : 0
						

						db.collection('gold_store').find({
							iscombo: 1,
							from: { $lte: maxpayment },
							to: { $gt: maxpayment },
						}).toArray(function (err, OtherPack) {

							if (client.v != undefined && parseInt(client.v) > 36 && !err && OtherPack.length > 0) {

								ofData = ofData.concat(OtherPack)
							}

							cdClass.SendData(client, 'GSEO', { data: ofData }, "success:0000");
						})

					}
					else {

						db.collection('gold_store').find({
							sd: { $lte: new Date() },
							ed: { $gte: new Date() },
							"inapp": "firsttimepurchaseginrummy",
							isother: 1,
							status: 1
						}).toArray(function (err, OtherPack) {

							if (client.v != undefined && parseInt(client.v) > 36 && !err && OtherPack.length > 0) {
								ofData = ofData.concat(OtherPack)
							}
							cdClass.SendData(client, 'GSEO', { data: ofData }, "success:0000");

						})
					}

				})
			} else {
				cdClass.SendData(client, 'GSEO', { data: [] }, "success:0000");
			}
		})
	},
	GoldStoreExitOfferData: (usertrack, callback) => {

		var maxpayment = _.max(usertrack, function (d) { return d });
		var ExtraofferData = []

		db.collection('gold_store').find({
			status: 1,
			"inapp": "ginrummylovelygoldofferpack",
			sd: { $lte: new Date() },
			ed: { $gte: new Date() },
		}).project({ inapp: 1, price: 1, gold: 1, free_gold: 1, free_gems: 1, offerimg: 1 }).toArray(function (err, promooffer) {

			if (!err && promooffer.length > 0) {
				ExtraofferData.push(promooffer[0])
			}

			if (usertrack.length == 0 || maxpayment == 0.99 || maxpayment == 1.98 || maxpayment < 7.98) { //non pyaee user  //Last Condition bcz 5.98 hoi 
				maxpayment = 7.98
			}

			db.collection('gold_store').find({
				status: 1,
				exfrom: { $lte: maxpayment },
				exto: { $gt: maxpayment },
				sd: { $lte: new Date() },
				ed: { $gte: new Date() }
			}).project({ inapp: 1, price: 1, gold: 1, free_gold: 1, free_gems: 1, offerimg: 1 }).toArray(function (err, promooffer) {

				if (!err && promooffer.length > 0) {
					ExtraofferData.push(promooffer[0])
					return callback(ExtraofferData);
				} else {
					return callback(ExtraofferData);
				}
			});

		})
	},
	OfferDataForGems: (usertrack, callback) => {


		var maxpayment = _.max(usertrack, function (d) { return d });


		db.collection('gold_store').find({
			status: 1,
			isoffer: 1,
			isdayoffer: 1,
			bundle: 1,
			sd: { $lte: new Date() },
			ed: { $gte: new Date() },
			//offercode:config.OFFERCODE
		}).toArray(function (err, promooffer) {

			if (!err && promooffer.length > 0) {
				return callback(promooffer[0]);
			} else {
				if (usertrack.length == 0) { //non pyaee user 

					db.collection('gold_store').find({
						status: 1,
						isoffer: 1,
						bundle: 1,
						from: { $lte: 0 },
						to: { $gt: 0 },
						sd: { $lte: new Date() },
						ed: { $gte: new Date() },
						//offercode:config.OFFERCODE
					}).toArray(function (err, promooffer) {

						if (!err && promooffer.length > 0) {
							return callback(promooffer[0]);
						} else {
							return callback({});
						}
					});
				} else {
					db.collection('gold_store').find({
						status: 1,
						isoffer: 1,
						bundle: 1,
						from: { $lte: maxpayment },
						to: { $gt: maxpayment },
						sd: { $lte: new Date() },
						ed: { $gte: new Date() },
						//offercode:config.OFFERCODE
					}).toArray(function (err, promooffer) {

						if (!err && promooffer.length > 0) {
							return callback(promooffer[0]);
						} else {
							return callback({});
						}
					});
				}
			}
		})
	},
	/*
		HPG 
		packid:'_id',
		inapp:"",
		receiptData:"",
		receiptSignature:"",
			
		notiid:""
	
	*/
	HPG: (data, client) => {
		//requre receiptdata || receiptSignature || inapp || packid
		if (typeof data.packid != 'undefined' && data.packid.toString().length == 24 && typeof data.inapp != 'undefined' && data.inapp != null && typeof data.receiptData != 'undefined' && data.receiptData != null && data.receiptData != "" && typeof data.receiptSignature != 'undefined' && data.receiptSignature != null && data.receiptSignature != "") {
			db.collection('game_users').find({
				_id: MongoId(client.uid.toString())
			}).project({ pn: 1, cd: 1, gold: 1, gems: 1, macid: 1, vip_level: 1, unlock: 1 }).toArray(function (err, uData) {
				if (!err && uData.length > 0) {

					db.collection('gold_store').find({
						_id: MongoId(data.packid.toString()),
						inapp: data.inapp,
					}).project({ _id: 0 }).toArray(function (err, pData) {
						if (!err && pData.length > 0) {

							var orderData = com.isJSON(data.receiptData);

							if (orderData) {

								GoldStroeClass.OnOrderVerifier(data, function (isValid) {
									if (isValid && typeof data.orderId != 'undefined' && data.orderId != null) {

										pData[0].orderData = orderData;
										pData[0].userData = uData[0];
										pData[0].ispromo = (data.ispromo == undefined || data.ispromo == 0) ? 0 : data.ispromo;
										pData[0].isextra = (data.isextra == undefined || data.isextra == 0) ? 0 : data.isextra;


										if (data.notiid != undefined && data.notiid != "" && data.notiid != null) {

											db.collection("special_offer").findAndModify(
												{ _id: MongoId(data.notiid.toString()), offer: "Stock" },
												{},
												{ $inc: { usestock: 1 } }, { new: true }, (err, up) => {
													if (!err && up.value != null) {
														db.collection('game_users').update({
															_id: MongoId(client.uid.toString())
														}, { $set: { "flags._stockpurchase": 1 } }, function () {

														})

														//cdClass.SendData(client,'US',{},"error:1010");
														playExchange.publish('other', { "en": "US", data: up.value });
													} else {
														db.collection('game_users').update({
															_id: MongoId(client.uid.toString())
														}, { $set: { "flags._Timerpurchase": 1 } }, function () {

														})
													}
												})
											db.collection("special_offer").find(
												{ _id: MongoId(data.notiid.toString()) }
											).project({ isextra: 1 }).toArray((err, update) => {


												if (!err && update.length > 0 && update[0].isextra != undefined) {
													pData[0].isextra = update[0].isextra
												}

												GoldStroeClass.PreperDataForPayment(pData[0], client)
											})
										} else {
											console.log("data.notiid null che else ma avyu :::::::::::::::::::::::::::::::::", data.notiid)
											GoldStroeClass.PreperDataForPayment(pData[0], client)
										}


									} else {
										console.log("not valid data send ")
										cdClass.SendData(client, 'HPG', {}, "error:1010");

									}
								});

							} else {
								console.log("orderData", orderData);
								cdClass.SendData(client, 'HPG', {}, "error:1010");

							}
						} else {
							console.log("pack id not data found")
							cdClass.SendData(client, 'HPG', {}, "error:1010");

						}
					});
				} else {
					console.log('user not found')
					cdClass.SendData(client, 'HPG', {}, "error:1010");

				}
			});
		} else {
			//not proper data send
			cdClass.SendData(client, 'HPG', {}, "error:1010");
		}
	},
	HPGEMS: (data, client) => {
		//requre receiptdata || receiptSignature || inapp || packid
		if (typeof data.packid != 'undefined' && data.packid.length == 24 && typeof data.inapp != 'undefined' && data.inapp != null && typeof data.receiptData != 'undefined' && data.receiptData != null && data.receiptData != "" && typeof data.receiptSignature != 'undefined' && data.receiptSignature != null && data.receiptSignature != "") {
			db.collection('game_users').find({
				_id: MongoId(client.uid.toString())
			}).project({ pn: 1, cd: 1, gold: 1, gems: 1, macid: 1, vip_level: 1, unlock: 1 }).toArray(function (err, uData) {
				if (!err && uData.length > 0) {

					db.collection('gems_store').find({
						_id: MongoId(data.packid.toString()),
						inapp: data.inapp,
					}).project({ _id: 0 }).toArray(function (err, pData) {
						if (!err && pData.length > 0) {

							var orderData = com.isJSON(data.receiptData);
							if (orderData) {

								GoldStroeClass.OnOrderVerifier(data, function (isValid) {
									if (isValid && typeof data.orderId != 'undefined' && data.orderId != null) {

										pData[0].orderData = orderData;
										pData[0].userData = uData[0];
										GoldStroeClass.PreperDataForPayment(pData[0], client)
									} else {
										console.log("not valid data send ")
										cdClass.SendData(client, 'HPG', {}, "error:1010");

									}
								});

							} else {
								console.log("orderData", orderData);
								cdClass.SendData(client, 'HPG', {}, "error:1010");

							}
						} else {
							console.log("pack id not data found")
							cdClass.SendData(client, 'HPG', {}, "error:1010");

						}
					});
				} else {
					console.log('user not found')
					cdClass.SendData(client, 'HPG', {}, "error:1010");

				}
			});
		} else {
			//not proper data send
			cdClass.SendData(client, 'HPG', {}, "error:1010");
		}

	},
	OnOrderVerifier: function (data, callback) {



		//var googleplay_public_key = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA7zEwcSvw+srooA9I6Slu8wa6nhFKWN8M0iVC0J/26vIBx3d0Im1SyncH+EVIJhM64YRDjumtGfQOjZaVXzLhAKtViP5gwUrxuUugiVk+cMJ/NruLgi2rbyZPpktANd7dYutOlglPKbtUIGjFysePZ+825XT+4pLp66DYDQ3p5w9tGvjZfSiWZ8JM8Ydo1S1ZhtShrcvy4oHHtRem8oBSrj85gg9MS6sgzLS4VgH1d15ZwOsNkA0QwxQS01Lmo+STb1vVZxe1kknYSq7vxzG9X4mfdPWBmP2+o/97OGn6hkTQueoVWTQ2iBJfCXzK1wrOrUvOzNm4JcgPNEbBZnph6wIDAQAB"

		var receiptData = JSON.parse(data.receiptData);

		let receipt = {
			packageName: receiptData.packageName,
			productId: data.inapp,
			purchaseToken: receiptData.purchaseToken
		};



		let promiseData = verifier.verifyINAPP(receipt)

		promiseData.then(function (response) {

			
			if (response != undefined && response.isSuccessful && response.payload != undefined && response.payload.purchaseState != undefined && response.payload.purchaseState == 0) {
				return callback(true);
			} else {
				return callback(false);
			}
			// Yay! Purchase is valid
			// See response structure below
		})
			.then(function (response) {



				// Here for example you can chain your work if purchase is valid
				// eg. add coins to the user profile, etc
				// If you are new to promises API
				// Awesome docs: https://developers.google.com/web/fundamentals/primers/promises
			})
			.catch(function (error) {

				if (error != undefined && !error.isSuccessful) {
					return callback(false);
				}
				// Purchase is not valid or API error
				// See possible error messages below
			})



		return false
		//tonk live
		var googleplay_public_key = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAkB0Q1HkraCV01FECrjqIO931yBdbo3DVb9d3BVuXyoMhsIHTma3F4oxy5ejyHDWjXLF0FMKO1ycF86qf2tiOvgBmOtn02bvSTOOQryqicz1ja+Aup5vgdnTNjuik7P4SJrHG0D98mAHMALUHubT/hpMq3RboiFmjS0eYvwkv21ayrWEOAFZzrtHZmf7hZmma6q9mBhI5Kb/9EVNKACP30uyt6z0AXsxj9LXV7Y4LwgW2RdB2IKNDiDfHn/buiXQVQXmt5mUvqIdhajjz5OPwL4NQ+Ao9ccebhL4cF9WiEA+3FW9Uh0Q0A9cvUm/XdF2dtjQL2Q2sLrNoCW8NCpTUeQIDAQAB"
		//tonk offline 
		//var googleplay_public_key = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAk0dakFe5tVmYAL0IDO3n6nRpnWBoXbTijQRX73B/9tYiSY3RccJJyNL66OAo0BfZQCwWm6a74Dd3yPgqqMaRZ8o5aIibC3mmqyudLJX1CiuG3g6yfmribZkXIktidDhx884MdCHtRInHtthZEFDjb3/YvMu1LJu8mTLpTJMeLHmeU3hKSJmgzOeCUvQGyO2p8WiDz7CcRheNDXrcj8Pks9VC+TU29/tDkJYY6DV63Y3bkyd6p5mtb3WuYdyMOgBHlfDwzpAEYvEmMwZXNqAeHbbF1Ld84fCRHF6TpmyCH/uL3daMalnvhn54VL+cSz0Y+fFhklbVs6e3J2TpbCkaswIDAQAB";        

		var googleplayVerifier = new IABVerifier(googleplay_public_key);

		var receiptData = data.receiptData; //{"packageName": "com.whyphy.spades","productId": "spadeoffline1",    "purchaseTime": 1534781566664,"purchaseState": 0,"purchaseToken":"eoaebenfpjngakmhieclnfbf.AO-J1OyzYHXyuil1iZtfwzTmTAqNcBDX1DzBaWsxU4VNwtySPxhVJ0qWvFJH8X0uvwqzPQemYmN-kJvDJgMtr5B0CRY_EM72lwUIP-RU0dOUxV6GilbY6z7OGrldsc09k0TipDHTlv9A"}; //req.query.receiptDataFromClient;

		var receiptSignature = data.receiptSignature;


		var isValid = googleplayVerifier.verifyReceipt(receiptData, receiptSignature);


		if (isValid) {
			callback(true);
			// Receipt is valid. Grab a beer celebrate!
		} else {
			callback(false);

			// Receipt is NOT valid... 
		}
	},
	/* unlock private table*/
	UPT: function (data, client, callback) {
		//requre receiptdata || receiptSignature || inapp || packid
		if (typeof data.packid != 'undefined' && data.packid.toString().length == 24 && typeof data.inapp != 'undefined' && data.inapp != null && typeof data.receiptData != 'undefined' && data.receiptData != null && data.receiptData != "" && typeof data.receiptSignature != 'undefined' && data.receiptSignature != null && data.receiptSignature != "") {
			db.collection('game_users').find({
				_id: MongoId(client.uid.toString())
			}).project({ pn: 1, cd: 1, gold: 1, gems: 1, macid: 1 }).toArray(function (err, uData) {

				if (!err && uData.length > 0) {

					db.collection('extra_store').find({
						_id: MongoId(data.packid.toString()),
						inapp: data.inapp,
					}).project({ _id: 0 }).toArray(function (err, pData) {
						if (!err && pData.length > 0) {

							var orderData = com.isJSON(data.receiptData);

							if (orderData) {

								GoldStroeClass.OnOrderVerifier(data, function (isValid) {
									if (isValid && typeof data.orderId != 'undefined' && data.orderId != null) {

										pData[0].orderData = orderData;
										pData[0].userData = uData[0];
										pData[0].cd = new Date();

										db.collection('game_users').update({
											_id: MongoId(client.uid.toString())
										}, { $set: { "flags._ispayee": 1, "flags._vip": 1, "flags._isads": 1 } }, function () {

											db.collection('payment_data').insertOne(pData[0], function () { })
											//GoldStroeClass.PreperDataForPayment(pData[0],client)

											if (pData[0].vpoint != 'undefined' && pData[0].vpoint > 0) {
												userClass.UpdateVipLevel(pData[0].vpoint, client.uid);
											}

											if (typeof callback == "function") {
												return callback({
													"flag": ErrorMsg.SUCCESS,
													"msg": ErrorMsg[client.lc + "_0000"],
													"data": pData[0],
													"en": "UPT",
													"errcode": "0000"
												})
											}

										})
									} else {
										console.log("not valid data send ")
										if (typeof callback == "function") {
											return callback({
												"flag": ErrorMsg.FAIL,
												"msg": ErrorMsg[client.lc + "_1010"],
												"data": {},
												"en": "UPT",
												"errcode": "1010"
											})
										}

									}
								});

							} else {
								console.log("orderData", orderData);
								if (typeof callback == "function") {
									return callback({
										"flag": ErrorMsg.FAIL,
										"msg": ErrorMsg[client.lc + "_1010"],
										"data": {},
										"en": "UPT",
										"errcode": "1010"
									})
								}
							}
						} else {
							console.log("pack id not data found")
							if (typeof callback == "function") {
								return callback({
									"flag": ErrorMsg.FAIL,
									"msg": ErrorMsg[client.lc + "_1010"],
									"data": {},
									"en": "UPT",
									"errcode": "1010"
								})
							}

						}
					});
				} else {
					console.log('user not found')
					if (typeof callback == "function") {
						return callback({
							"flag": ErrorMsg.FAIL,
							"msg": ErrorMsg[client.lc + "_1010"],
							"data": {},
							"en": "UPT",
							"errcode": "1010"
						})
					}

				}
			});
		} else {
			//not proper data send
			if (typeof callback == "function") {
				return callback({
					"flag": ErrorMsg.FAIL,
					"msg": ErrorMsg[client.lc + "_1010"],
					"data": {},
					"en": "UPT",
					"errcode": "1010"
				})
			}
		}
	},
	/* unlock Hollywood table*/
	UHT: function (data, client, callback) {
		//requre receiptdata || receiptSignature || inapp || packid
		if (typeof data.packid != 'undefined' && data.packid.toString().length == 24 && typeof data.inapp != 'undefined' && data.inapp != null && typeof data.receiptData != 'undefined' && data.receiptData != null && data.receiptData != "" && typeof data.receiptSignature != 'undefined' && data.receiptSignature != null && data.receiptSignature != "") {
			db.collection('game_users').find({
				_id: MongoId(client.uid.toString())
			}).project({ pn: 1, cd: 1, gold: 1, gems: 1, macid: 1 }).toArray(function (err, uData) {

				if (!err && uData.length > 0) {

					db.collection('extra_store').find({
						_id: MongoId(data.packid.toString()),
						inapp: data.inapp,
					}).project({ _id: 0 }).toArray(function (err, pData) {
						if (!err && pData.length > 0) {

							var orderData = com.isJSON(data.receiptData);

							if (orderData) {

								GoldStroeClass.OnOrderVerifier(data, function (isValid) {
									if (isValid && typeof data.orderId != 'undefined' && data.orderId != null) {

										pData[0].orderData = orderData;
										pData[0].userData = uData[0];
										pData[0].cd = new Date();

										db.collection('game_users').update({
											_id: MongoId(client.uid.toString())
										}, { $set: { "flags._ispayee": 1, "unlock.hollywood": 1 } }, function () {

											db.collection('payment_data').insertOne(pData[0], function () { })
											GoldStroeClass.PreperDataForPayment(pData[0], client)

											/*if(pData[0].vpoint != 'undefined' &&  pData[0].vpoint > 0){
												userClass.UpdateVipLevel(pData[0].vpoint,client.uid);
											}*/

											if (typeof callback == "function") {
												GoldStroeClass.UnuseDataRemovePayment(pData[0]);



												return callback({
													"flag": ErrorMsg.SUCCESS,
													"msg": ErrorMsg[client.lc + "_0000"],
													"data": pData[0],
													"en": "UHT",
													"errcode": "0000"
												})
											}

										})
									} else {
										console.log("not valid data send ")
										if (typeof callback == "function") {
											return callback({
												"flag": ErrorMsg.FAIL,
												"msg": ErrorMsg[client.lc + "_1010"],
												"data": {},
												"en": "UHT",
												"errcode": "1010"
											})
										}

									}
								});

							} else {
								console.log("orderData", orderData);
								if (typeof callback == "function") {
									return callback({
										"flag": ErrorMsg.FAIL,
										"msg": ErrorMsg[client.lc + "_1010"],
										"data": {},
										"en": "UHT",
										"errcode": "1010"
									})
								}
							}
						} else {
							console.log("pack id not data found")
							if (typeof callback == "function") {
								return callback({
									"flag": ErrorMsg.FAIL,
									"msg": ErrorMsg[client.lc + "_1010"],
									"data": {},
									"en": "UHT",
									"errcode": "1010"
								})
							}

						}
					});
				} else {
					console.log('user not found')
					if (typeof callback == "function") {
						return callback({
							"flag": ErrorMsg.FAIL,
							"msg": ErrorMsg[client.lc + "_1010"],
							"data": {},
							"en": "UHT",
							"errcode": "1010"
						})
					}

				}
			});
		} else {
			//not proper data send
			if (typeof callback == "function") {
				return callback({
					"flag": ErrorMsg.FAIL,
					"msg": ErrorMsg[client.lc + "_1010"],
					"data": {},
					"en": "UHT",
					"errcode": "1010"
				})
			}
		}
	},
	PreperDataForPayment: function (packdata, client) {

		var totoalgold = 0;
		var totolgems = 0;
		var isremove = 0;
		var totalnotes = 0;
		var totalleaf = 0;

		if (typeof packdata.issurprice != 'undefined' && packdata.issurprice == 1) {

			totoalgold = 5000;
		}

		//caclulet for free gems and free  gold=====================================
		if (typeof packdata.gold != 'undefined' && packdata.gold != 0) {
			totoalgold = totoalgold + packdata.gold;
		}

		if (typeof packdata.free_gold != 'undefined' && packdata.free_gold != 0) {
			totoalgold = totoalgold + packdata.free_gold;
		}

		if (typeof packdata.gems != 'undefined' && packdata.gems != 0) {
			totolgems = totolgems + packdata.gems;
		}

		if (typeof packdata.free_gems != 'undefined' && packdata.free_gems != 0) {
			totolgems = totolgems + packdata.free_gems;
		}

		if (typeof packdata.notes != 'undefined' && packdata.notes != 0) {
			totalnotes = totalnotes + packdata.notes;
		}

		if (typeof packdata.free_notes != 'undefined' && packdata.free_notes != 0) {
			totalnotes = totalnotes + packdata.free_notes;
		}
		if (typeof packdata.leaf != 'undefined' && packdata.leaf != 0) {
			totalleaf = totalleaf + packdata.leaf;
		}

		//===========================================================================
		//=====================remove flags check if or not ==========================
		if (typeof packdata.isadsremove != 'undefined' && packdata.isadsremove != 0) {
			isremove = packdata.isadsremove;
		}
		//============================================================================

		packdata.initgold = totoalgold; //Net get gold
		packdata.initgems = totolgems; //Net get gold
		packdata.initnotes = totalnotes; //Net get gold
		var promogold = 0;


		if (typeof packdata.ispromo != "undefined" && packdata.ispromo == 100 && totoalgold > 0 && typeof packdata.gold != 'undefined' && packdata.gold != 0) {

			promogold = packdata.gold//totoalgold/100; 

		}

		if (typeof packdata.ispromo != "undefined" && packdata.ispromo == 200 && totoalgold > 0 && typeof packdata.gold != 'undefined' && packdata.gold != 0) {

			promogold = packdata.gold * 2//totoalgold/100; 

		}

		if (packdata.isextra != undefined && packdata.isextra > 0) {
			promogold = Math.round(totoalgold * packdata.isextra / 100);

		}


		//===================================vip level benifit =====================
		//console.log("packdata.userData.vip_level",packdata)
		//console.log("packdata.userData.vip_level",packdata.userData)
		//console.log("packdata.userData.vip_level",packdata.userData.vip_level)


		var VIPGold = 0;
		var VIPGems = 0;
		var VIPNotes = 0;

		if (typeof packdata.userData.vip_level != 'undefined' && typeof packdata.userData.vip_level.vip_lvl != 'undefined' && packdata.userData.vip_level.vip_lvl > 1) {

			if (totoalgold > 0) {

				VIPGold = Math.round(totoalgold * parseInt(packdata.userData.vip_level.benefits.gold) / 100);

			}

			if (totolgems > 0) {
				VIPGems = Math.round(totolgems * parseInt(packdata.userData.vip_level.benefits.gems) / 100);

			}

		}

		if (packdata.inapp != "hollywoodtable" && packdata.userData.unlock != undefined && packdata.userData.unlock.converter != undefined && packdata.userData.unlock.converter == 0) {
			db.collection('game_users').update({
				_id: MongoId(client.uid.toString())
			}, { $set: { "unlock.converter": 1 } }, function () {

			})
			//Unlock Converter
			cdClass.SendData(client, 'ULC', packdata, "success:0000");

		}

		packdata.VIPGold = Math.round(VIPGold);
		packdata.VIPGems = Math.round(VIPGems);
		packdata.VIPNotes = Math.round(VIPNotes);
		packdata.nGold = Math.round(totoalgold);
		packdata.nGems = Math.round(totolgems);

		totolgems = Math.round(totolgems + VIPGems);
		totoalgold = Math.round(totoalgold + VIPGold);

		packdata.promogold = promogold;

		totoalgold = Math.round(totoalgold + promogold);

		packdata.totoalgold = Math.round(totoalgold);
		packdata.totolgems = Math.round(totolgems);
		packdata.totalnotes = totalnotes;
		packdata.isremove = isremove;



		//Tracking for how many user pack buy and wise pack buy
		if (packdata.inapp != "boosterofferpack" && totoalgold > 0 && packdata.iscombo == 0) {
			db.collection('game_users').findAndModify({
				_id: MongoId(client.uid.toString())
			}, {}, { $push: { "track.buy_gold": packdata.price }, $inc: { "track.tp_gold": packdata.price } }, { new: true }, function (err, udata) {

				if (!err && udata.value != null) {

					GoldStroeClass.OfferData(udata.value.track.buy_gold, function (ofData) {

						cdClass.SendData(client, 'GSOC', ofData, "success:0000");
						//Gold Store Offer Change
					})
				}
			})
		} else if (packdata.inapp != "boosterofferpack" && packdata.totolgems > 0 /*&& packdata.iscombo == 0*/) {
			db.collection('game_users').update({
				_id: MongoId(client.uid.toString())
			}, { $push: { "track.buy_gems": packdata.price }, $inc: { "track.tp_gems": packdata.price } }, function () {

			})
		} else if (packdata.iscombo == 1) {
			db.collection('game_users').update({
				_id: MongoId(client.uid.toString())
			}, { $push: { "track.buy_booster_eo": packdata.price } }, function () {

			})

		}

		//udpdate vip level up
		if (packdata.vpoint != 'undefined' && packdata.vpoint > 0) {
			userClass.UpdateVipLevel(packdata.vpoint, client.uid);
		}

		db.collection('game_users').update({
			_id: MongoId(client.uid.toString())
		}, { $set: { "flags._ispayee": 1 } }, function () { })

		//=============================================================

		//=======remove Ads============================================
		if (isremove) {
			db.collection('game_users').update({
				_id: MongoId(client.uid.toString())
			}, { $set: { "flags._isads": 1 } }, function () {

			})
		}
		//==============================================================


		//id golds add golds ============================================
		if (totoalgold > 0) {
			cdClass.updateUserGold(client.uid.toString(), totoalgold, "Purchase Gold", 8);
		}
		//=================================================================

		//Gems Add ==========================================================
		if (totolgems > 0) {
			cdClass.updateUserGems(client.uid.toString(), totolgems, "Purchase Gems", 9);
		}
		//======================================================================

		if (totalnotes > 0) {
			cdClass.updateUsernotes(client.uid.toString(), totalnotes, "Purchased Notes", 54);
			db.collection('game_users').update({
				_id: MongoId(client.uid.toString())
			}, { $inc: { "track.tp_note": packdata.price } }, function () {

			})
		}
		if (totalleaf > 0) {
			cdClass.updateUserLeaf(client.uid.toString(), totalleaf, "Purchased Leaf");
			db.collection('game_users').update({
				_id: MongoId(client.uid.toString())
			}, { $inc: { "track.tp_leaf": packdata.price } }, function () {

			})
		}

		if (packdata.totoalgold > 0) {
			db.collection('game_users').update({
				_id: MongoId(client.uid.toString())
			}, { $set: { "flags._Firstimepurchase": 1 } }, function () {

			})
		}

		if (packdata.card != undefined && packdata.card.length > 0) {


			db.collection('game_users').update({
				_id: MongoId(client.uid.toString())
			}, { $inc: { "track.tp_booster": packdata.price } }, function () {

			})

			if (packdata.inapp == "boosterofferpack") {
				db.collection('game_users').update({
					_id: MongoId(client.uid.toString())
				}, { $set: { "flags._Boosterpurchase": 1 }, $push: { "track.buy_booster": packdata.price } }, function () {

				})
			}

			var isfrom = (packdata.inapp == "boosterofferpack") ? "Booster Purchase" : "Purchase"

			//For Animation


			if (parseInt(client.v) < 40) {
				CardClass.multiple_card_add(packdata.card.slice(0, packdata.card.length), client, "Purchase")
				cdClass.SendDataToUser(client.uid.toString(), { en: "AC", data: { isfrom: isfrom, coupon: packdata.card } }, true)
			} else if (packdata.card1 != undefined && packdata.card1.length > 0) {
				CardClass.multiple_card_add(packdata.card1.slice(0, packdata.card1.length), client, "Purchase")
				cdClass.SendDataToUser(client.uid.toString(), { en: "AC", data: { isfrom: isfrom, coupon: packdata.card1 } }, true)
			}


		} else {
			packdata.card = [],
				packdata.card1 = [];

		}

		if (packdata.inapp == "combopack") {
			db.collection('game_users').update({
				_id: MongoId(client.uid.toString())
			}, { $set: { "flags._combopack": 1 } }, function () {

			})
		}


		packdata.cd = new Date();

		trackClass.buygoldtrtacking(packdata)
		//payemts table data add=================================================
		db.collection('payment_data').insertOne(packdata, function () {

			if (totalnotes > 0 && packdata.inapp != "combopack") {

				GoldStroeClass.UnuseDataRemoveGoldPayment(packdata)

				cdClass.SendData(client, 'HPNOTES', packdata, "success:0000");
			} else if (totalleaf > 0) {

				cdClass.SendData(client, 'HPLEAF', packdata, "success:0000");
			}
			else {

				GoldStroeClass.UnuseDataRemoveGoldPayment(packdata)

				cdClass.SendData(client, 'HPG', packdata, "success:0000");
			}
		})
		//=======================================================================
	},
	OnOrderVerifier_OfflineTonk: function (data, callback) {

		//tonk offline 
		var googleplay_public_key = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAk0dakFe5tVmYAL0IDO3n6nRpnWBoXbTijQRX73B/9tYiSY3RccJJyNL66OAo0BfZQCwWm6a74Dd3yPgqqMaRZ8o5aIibC3mmqyudLJX1CiuG3g6yfmribZkXIktidDhx884MdCHtRInHtthZEFDjb3/YvMu1LJu8mTLpTJMeLHmeU3hKSJmgzOeCUvQGyO2p8WiDz7CcRheNDXrcj8Pks9VC+TU29/tDkJYY6DV63Y3bkyd6p5mtb3WuYdyMOgBHlfDwzpAEYvEmMwZXNqAeHbbF1Ld84fCRHF6TpmyCH/uL3daMalnvhn54VL+cSz0Y+fFhklbVs6e3J2TpbCkaswIDAQAB";

		var googleplayVerifier = new IABVerifier(googleplay_public_key);

		var receiptData = data.receiptData; //{"packageName": "com.whyphy.spades","productId": "spadeoffline1",    "purchaseTime": 1534781566664,"purchaseState": 0,"purchaseToken":"eoaebenfpjngakmhieclnfbf.AO-J1OyzYHXyuil1iZtfwzTmTAqNcBDX1DzBaWsxU4VNwtySPxhVJ0qWvFJH8X0uvwqzPQemYmN-kJvDJgMtr5B0CRY_EM72lwUIP-RU0dOUxV6GilbY6z7OGrldsc09k0TipDHTlv9A"}; //req.query.receiptDataFromClient;

		var receiptSignature = data.receiptSignature;



		var isValid = googleplayVerifier.verifyReceipt(receiptData, receiptSignature);


		if (isValid) {
			callback(true);
			// Receipt is valid. Grab a beer celebrate!
		} else {
			callback(false);

			// Receipt is NOT valid... 
		}
	},
	OnOrderVerifier_OfflineSpades: function (data, callback) {

		//spades offline 
		var googleplay_public_key = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAlD73xNko5n9+ywHxLPWH+uYTxc2VW6U21wmQ7AQmvAY3JTFAoR/CiP8evLo+7hy+bQvQmYH1fmr3oW2XTeSSxPAR8FQdBs2SbyuXnCqVvHu8stBsnlNQTmorr1Nd5rQIF//d6lu2mV/vvVgsqcZUcw9rha4wFXwRLLHjPX1hibHfIlsmBgbKeh+FiKqHCIaemqvm9rLGGdTNEdJTGojwLgW2UJ86qWE+P6kYinl7YExE3TG10pN8637lZbe5uTlvJR6ATAu54JnU2E0GkMgu6JsKC6ZVOE2KXimfzO+Gy6RXDro4kOUXfYzrBADh1Bys2iCPFUYieL5/HyHli6j7MwIDAQAB";

		var googleplayVerifier = new IABVerifier(googleplay_public_key);

		var receiptData = data.receiptData; //{"packageName": "com.whyphy.spades","productId": "spadeoffline1",    "purchaseTime": 1534781566664,"purchaseState": 0,"purchaseToken":"eoaebenfpjngakmhieclnfbf.AO-J1OyzYHXyuil1iZtfwzTmTAqNcBDX1DzBaWsxU4VNwtySPxhVJ0qWvFJH8X0uvwqzPQemYmN-kJvDJgMtr5B0CRY_EM72lwUIP-RU0dOUxV6GilbY6z7OGrldsc09k0TipDHTlv9A"}; //req.query.receiptDataFromClient;

		var receiptSignature = data.receiptSignature;

		var isValid = googleplayVerifier.verifyReceipt(receiptData, receiptSignature);


		if (isValid) {
			callback(true);
			// Receipt is valid. Grab a beer celebrate!
		} else {
			callback(false);

			// Receipt is NOT valid... 
		}
	},
	OnOrderVerifier_OfflineSpades_6ace: function (data, callback) {

		//spades offline 
		var googleplay_public_key = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAjN0M+g0a1c7VFjApi9XPU/ZFUkIPZHaFwcjSl6/A2LTEWVRU0HdOcdzixLsG/rsqQen1q75i2kF8TNZVukzhQsvhgwJoj/cD+H7VVXu5LAwYDw/7ZknWOS5vCquV2t1PgItL34r6F6JD01bCrAYa4xCND1aAl7rMaLVZmBISZo1OH0pPH8WXywxRioCCUVUhzvHOnmqVJl1ucY/2IQrYzOeBUq2a5vegAuYkOyoC+oporm3aeD5N+bOl1aJR1ukV04VnxrEyKJa9Zf6dub0liYH8oMEWX1uVNuy/NV1M5bI4Y3CzLj1C9TZHcExCAi5Zf/S8mDxKiP4LH4/8J9tk8QIDAQAB";

		var googleplayVerifier = new IABVerifier(googleplay_public_key);

		var receiptData = data.receiptData; //{"packageName": "com.whyphy.spades","productId": "spadeoffline1",    "purchaseTime": 1534781566664,"purchaseState": 0,"purchaseToken":"eoaebenfpjngakmhieclnfbf.AO-J1OyzYHXyuil1iZtfwzTmTAqNcBDX1DzBaWsxU4VNwtySPxhVJ0qWvFJH8X0uvwqzPQemYmN-kJvDJgMtr5B0CRY_EM72lwUIP-RU0dOUxV6GilbY6z7OGrldsc09k0TipDHTlv9A"}; //req.query.receiptDataFromClient;

		var receiptSignature = data.receiptSignature;

		var isValid = googleplayVerifier.verifyReceipt(receiptData, receiptSignature);


		if (isValid) {
			callback(true);
			// Receipt is valid. Grab a beer celebrate!
		} else {
			callback(false);

			// Receipt is NOT valid... 
		}
	},
	OnOrderVerifier_Offlineginrummy_6ace: function (data, callback) {

		//spades offline 
		var googleplay_public_key = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAi2aNTH3YKMP/SrUnym8rUh4u56x1Wp8jw291bjcJI2t+uhQqesBy3ib0reTHYOgsqgtHJ80lreQPEcdWaO3cAGRuTuYl8xumKU7VLijBPP9ipCzp9AOOQrjoga+CY1hhpuEMStWOwlIcJGE+VaO5qrxxYiLQ6FRUJi/PAqMg/RugxlIdwouIOfHQHl3jEuFG7Tmn7fKZEDqk8OGv9YETA2e4xxI8QfPG1ShYu8OuNPsNNIELNwz2eAKioZMM5eewkIGUWggLSa09jSRnz4pcOxUJa7NLIiKmoUnLsyelNLgjl3CGNDP3XdzOuNu6ggSB4l/5aL8xnmChRQbyJ68ETwIDAQAB";


		var googleplayVerifier = new IABVerifier(googleplay_public_key);

		var receiptData = data.receiptData; //{"packageName": "com.whyphy.spades","productId": "spadeoffline1",    "purchaseTime": 1534781566664,"purchaseState": 0,"purchaseToken":"eoaebenfpjngakmhieclnfbf.AO-J1OyzYHXyuil1iZtfwzTmTAqNcBDX1DzBaWsxU4VNwtySPxhVJ0qWvFJH8X0uvwqzPQemYmN-kJvDJgMtr5B0CRY_EM72lwUIP-RU0dOUxV6GilbY6z7OGrldsc09k0TipDHTlv9A"}; //req.query.receiptDataFromClient;

		var receiptSignature = data.receiptSignature;

		var isValid = googleplayVerifier.verifyReceipt(receiptData, receiptSignature);


		if (isValid) {
			callback(true);
			// Receipt is valid. Grab a beer celebrate!
		} else {
			callback(false);

			// Receipt is NOT valid... 
		}
	},
	LossGoldOffer: (uid) => {

		cdClass.GetUserInfo(uid.toString(), { version: 1 }, (udata) => {

			if (udata.version != undefined && udata.version.aVersion >= 17) {
				db.collection('gold_store').find({
					status: 1,
					isoffer: 1,
					"inapp": "ginrummybebygoldofferpack",
					//offercode:config.OFFERCODE
					sd: { $lte: new Date() },
					ed: { $gte: new Date() },
				}).project({ inapp: 1, price: 1, gold: 1, free_gold: 1, free_gems: 1, offerimg: 1 }).toArray(function (err, promooffer) {

					if (!err && promooffer.length > 0) {

						var obj1 = {
							s: "5b63400c86c0f01c281e455c",
							r: uid.toString(),
							un: "Admin",
							pp: "upload/appicon/ginrummyonline.png",
							t: "admin",
							html: "<b><font color=#ffda2c>Gin Rummy : Multiplayer Card Game</font></b><br><br><b><p>-🤑 Special Offer Only For You  ➕ " + com.numFormatter((promooffer[0].gold * 2) + promooffer[0].free_gold) + " ➕ $1.49 Only 🤑.<br><br><font color=#00ff07>- Only Pay $1.49.</font><br><br><font color=#ffda2c>- Get More 100% Gold.</font><br><br><font color=#00ff07>- Save More 100%.</font><br><br><font color=#ffda2c>- Get +10 TCP.</font><br><br>- Become Our VIP purchased users.</p></b><br><b>More Gold, More Fun, Get Benefit!",
							isadmin: 1,
							msg: "🤑 Special Offer Only For You ➕ " + com.numFormatter((promooffer[0].gold * 2) + promooffer[0].free_gold) + " ➕ $1.49 Only 🤑",
							hmsg: '<table width="100%" cellspacing="0" cellpadding="0" border="0" align="center"><tr><td width="33%"></td> <td width="34%"><big><font color=#ffda2c>🤑 Special Offer Only For You ➕ ' + com.numFormatter((promooffer[0].gold * 2) + promooffer[0].free_gold) + ' ➕ $1.49 Only 🤑</font></big></td><td width="33%"></td> </tr><tr> <td width="33%">&nbsp;<font color=#00ff07>Only Pay $1.49.</font></td> <td width="34%"></td> <td width="33%">&nbsp;<font color=#00ff07>Save More 100%</font></td> </tr> <tr> <td width="33%"></td><td width="34%">&nbsp;<font color=#FFFF00><b>Remove Add</b></font></td> <td width="33%"></td></tr> <tr> <td width="33%">&nbsp;<font color=#ffda2c>Mode:&nbsp;Hide</font></td> <td width="34%"></td> <td width="33%">&nbsp;<font color=#ffda2c>Get +10 TCP</font></td></tr></table>',
							is: 0,
							ip: 0,
							ispromo: 100,
							cd: new Date(),
							bname: "Buy Now", //Buy Now || Invite || update
							"offerdata": {
								"inapp": "ginrummybebygoldofferpack",
								"_id": promooffer[0]._id.toString()
							}
						};

						db.collection('notification').replaceOne({
							s: "5b63400c86c0f01c281e455c",
							r: uid.toString(),
							t: "admin",
						}, obj1, { upsert: true }, function () {

							notiClass.NC({}, uid.toString());
						})
					}
				})
			}
		})
	},
	GameCountGoldOffer: (uid) => {

		cdClass.GetUserInfo(uid.toString(), { version: 1 }, (udata) => {
			if (udata.version != undefined && udata.version.aVersion >= 17) {
				db.collection('gold_store').find({
					status: 1,
					isoffer: 1,
					"inapp": "ginrummybebygoldofferpack",
					//offercode:config.OFFERCODE,
					sd: { $lte: new Date() },
					ed: { $gte: new Date() },
				}).project({ inapp: 1, price: 1, gold: 1, free_gold: 1, free_gems: 1, offerimg: 1 }).toArray(function (err, promooffer) {

					if (!err && promooffer.length > 0) {

						var obj1 = {
							s: "5b63400c86c0f01c281e455c",
							r: uid.toString(),
							un: "Admin",
							pp: "upload/appicon/ginrummyonline.png",
							t: "admin",
							html: "<b><font color=#ffda2c>Tonk Online : Multiplayer Card Game</font></b><br><br><b><p>-🤑 Special Offer Only For You  ➕ " + com.numFormatter((promooffer[0].gold * 2) + promooffer[0].free_gold) + " ➕ $1.49 Only 🤑.<br><br><font color=#00ff07>- Only Pay $1.49.</font><br><br><font color=#ffda2c>- Get More 100% Gold.</font><br><br><font color=#00ff07>- Get +10 TCP.</font><br><br>- Become Our VIP purchased users.</p></b><br><b>More Gold, More Fun, Get Benefit!",
							isadmin: 1,
							msg: "🤑 Special Offer Only For You ➕ " + com.numFormatter((promooffer[0].gold * 2) + promooffer[0].free_gold) + " ➕ $1.49 Only 🤑",
							hmsg: '<table width="100%" cellspacing="0" cellpadding="0" border="0" align="center"><tr><td width="33%"></td> <td width="34%"><big><font color=#ffda2c>🤑 Special Offer Only For You ➕ ' + com.numFormatter((promooffer[0].gold * 2) + promooffer[0].free_gold) + ' ➕ $1.49 Only 🤑</font></big></td><td width="33%"></td> </tr><tr> <td width="33%">&nbsp;<font color=#00ff07>Only Pay $1.49.</font></td> <td width="34%"></td> <td width="33%">&nbsp;<font color=#00ff07>Save More 100%</font></td> </tr> <tr> <td width="33%"></td><td width="34%">&nbsp;<font color=#FFFF00><b>Remove Add</b></font></td> <td width="33%"></td></tr> <tr> <td width="33%">&nbsp;<font color=#ffda2c>Mode:&nbsp;Hide</font></td> <td width="34%"></td> <td width="33%">&nbsp;<font color=#ffda2c>Get +10 TCP</font></td></tr></table>',
							is: 0,
							ip: 0,
							ispromo: 100,
							cd: new Date(),
							bname: "Buy Now", //Buy Now || Invite || update
							"offerdata": {
								"inapp": "ginrummybebygoldofferpack",
								"_id": promooffer[0]._id.toString()
							}
						};

						db.collection('notification').replaceOne({
							s: "5b63400c86c0f01c281e455c",
							r: uid.toString(),
							t: "admin",
						}, obj1, { upsert: true }, function () {

							notiClass.NC({}, uid.toString());
						})
					}
				})
			}
		})
	},
	HPNOTES: (data, client) => {
		//requre receiptdata || receiptSignature || inapp || packid
		if (typeof data.packid != 'undefined' && data.packid.length == 24 && typeof data.inapp != 'undefined' && data.inapp != null && typeof data.receiptData != 'undefined' && data.receiptData != null && data.receiptData != "" && typeof data.receiptSignature != 'undefined' && data.receiptSignature != null && data.receiptSignature != "") {
			db.collection('game_users').find({
				_id: MongoId(client.uid.toString())
			}).project({ pn: 1, cd: 1, gold: 1, gems: 1, macid: 1, vip_level: 1 }).toArray(function (err, uData) {
				if (!err && uData.length > 0) {

					db.collection('notes_store').find({
						_id: MongoId(data.packid.toString()),
						inapp: data.inapp,
					}).project({ _id: 0 }).toArray(function (err, pData) {
						if (!err && pData.length > 0) {

							var orderData = com.isJSON(data.receiptData);
							if (orderData) {

								GoldStroeClass.OnOrderVerifier(data, function (isValid) {
									if (isValid && typeof data.orderId != 'undefined' && data.orderId != null) {

										pData[0].orderData = orderData;
										pData[0].userData = uData[0];
										GoldStroeClass.PreperDataForPayment(pData[0], client, 1)
									} else {

										cdClass.SendData(client, 'HPNOTES', {}, "error:1010");

									}
								});

							} else {
								cdClass.SendData(client, 'HPNOTES', {}, "error:1010");

							}
						} else {
							cdClass.SendData(client, 'HPNOTES', {}, "error:1010");

						}
					});
				} else {
					cdClass.SendData(client, 'HPNOTES', {}, "error:1010");

				}
			});
		} else {
			//not proper data send
			cdClass.SendData(client, 'HPNOTES', {}, "error:1010");
		}

	},
	HPLEAF: (data, client) => {

		//requre receiptdata || receiptSignature || inapp || packid
		if (typeof data.packid != 'undefined' && data.packid.length == 24 && typeof data.inapp != 'undefined' && data.inapp != null && typeof data.receiptData != 'undefined' && data.receiptData != null && data.receiptData != "" && typeof data.receiptSignature != 'undefined' && data.receiptSignature != null && data.receiptSignature != "") {
			db.collection('game_users').find({
				_id: MongoId(client.uid.toString())
			}).project({ pn: 1, cd: 1, gold: 1, gems: 1, macid: 1, vip_level: 1 }).toArray(function (err, uData) {
				if (!err && uData.length > 0) {

					db.collection('leaf_store').find({
						_id: MongoId(data.packid.toString()),
						inapp: data.inapp,
					}).project({ _id: 0 }).toArray(function (err, pData) {
						if (!err && pData.length > 0) {

							var orderData = com.isJSON(data.receiptData);
							if (orderData) {

								GoldStroeClass.OnOrderVerifier(data, function (isValid) {
									if (isValid && typeof data.orderId != 'undefined' && data.orderId != null) {

										pData[0].orderData = orderData;
										pData[0].userData = uData[0];
										GoldStroeClass.PreperDataForPayment(pData[0], client, 1)
									} else {

										cdClass.SendData(client, 'HPLEAF', {}, "error:1010");

									}
								});

							} else {
								cdClass.SendData(client, 'HPLEAF', {}, "error:1010");

							}
						} else {
							cdClass.SendData(client, 'HPLEAF', {}, "error:1010");

						}
					});
				} else {
					cdClass.SendData(client, 'HPLEAF', {}, "error:1010");

				}
			});
		} else {
			//not proper data send
			cdClass.SendData(client, 'HPNOTES', {}, "error:1010");
		}

	},

	UnuseDataRemoveGoldPayment: function (obj) {

		delete obj.bundle;
		delete obj.isadsremove;
		delete obj.status;
		delete obj.offerimg;
		delete obj.dashoffer;
		delete obj.vpoint;
		delete obj.isdayoffer;
		delete obj.from;
		delete obj.to;
		delete obj.tag;
		delete obj.orderData;
		delete obj.userData;
		delete obj.ispromo;

	}
}