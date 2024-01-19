/*
	card name
	time : ""
	[
	{name:"quest_coupon",title:"Quest Coupon",detail:"Get double reward of quest as much you claim.",cardno:0,count:0,cd:-1,timelimit:172800,per:2},
	{name:"playing_coupon",title:"Playing Coupon",detail:"Get Double of Potvalue as much you win.",cardno:1,count:0,cd:-1,timelimit:129600,per:2},
	{name:"convetor_coupon",title:"convetor Coupon",detail:"Get double coin while convert as much you can.",cardno:2,count:0,cd:-1,timelimit:259200,per:2},
	{name:"minigame_coupon",title:"Minigame Coupon",detail:"Get double coin of win as much you can.",cardno:3,count:0,cd:-1,timelimit:172800,per:2},
	{name:"hollywood_coupon",title:"Hollywood Coupon",detail:"Get double coin of win as much you can.",cardno:4,count:0,cd:-1,timelimit:172800,per:2},
	{name:"bumper_coupon",title:"Bumper Coupon",detail:"Get all five tickets free for you.",cardno:6,count:0,cd:-1,timelimit:-1,per:5},
	{name:"mega_coupon",title:"Mega Coupon",detail:"Get all five tickets free for you.",cardno:7,count:0,cd:-1,timelimit:-1,per:5},
	{name:"lottotexas_coupon",title:"Lottotexas Coupon",detail:"Get all five tickets free for you.",cardno:8,count:0,cd:-1,timelimit:-1,per:5},
	{name:"dailygrand_coupon",title:"Dailygrand Coupon",detail:"Get all five tickets free for you.",cardno:9,count:0,cd:-1,timelimit:-1,per:5},
	{name:"jackpot_coupon",title:"Jackpot Coupon",detail:"Get all five tickets free for you.",cardno:10,count:0,cd:-1,timelimit:-1,per:5}
	]
*/
const _ = require("underscore");

module.exports = {
	//
	multiple_card_add: (usercard, client, sources) => {

		if (usercard.length == 0) {

			return false
		}
		var userData = usercard.splice(0, 1)

		CardClass.add_card(userData[0].name, client, userData[0].count, usercard, sources)

	},
	add_card: (cardname, client, cardlength, usercardlist, sources) => {
		var track = {}
		db.collection("user_card").find({ uid: MongoId(client.uid) }).toArray((err, findcard) => {

			if (!err && findcard.length > 0) {

				db.collection("user_card").findAndModify({ uid: MongoId(client.uid), "cardlist.name": cardname }, {}, {
					$set:{
						cd:new Date()
					},
					$inc: {
						"cardlist.$.count": cardlength
					}
				}, { new: true }, (err, upt) => {

					CardClass.Trackcard(cardname, cardlength, 1, sources)

					if (!err && upt.value != null) {


						db.collection("game_users").update({ _id: MongoId(client.uid.toString()) },
							{ $inc: { "ebooster": cardlength } }, () => {
							})

						laboratroyClass.Checkcoupon(client.uid.toString())

						if (sources != "Purchase")
							cdClass.SendDataToUser(client.uid.toString(), { en: "AC", data: { isfrom: sources, coupon: [{ name: cardname, count: cardlength }] } }, true)

						// Active_Booster_Screen --- used for android 	
						if (sources == "laboratory" || sources == "Active_Booster_Screen" || sources == "Chest") {

							var cardarra = ["bumper_coupon", "mega_coupon", "lottotexas_coupon", "dailygrand_coupon", "jackpot_coupon"]
							if (cardarra.indexOf(cardname) != -1) {

								track.Total_Booster_Get = 1
								lottoClass.UserlottoLandTracking(client.uid, track, cardname)
							}
							CardClass.SCT(cardname, upt.value, client, "add_other", usercardlist, sources)

						} else {
							if (usercardlist != undefined && usercardlist.length > 0) {
								CardClass.multiple_card_add(usercardlist, client, sources)
							} else {
								laboratroyClass.LD({ isfrom: sources }, client)
							}
						}

					}
				})

			} else {

				db.collection("user_card").insert({
					uid: MongoId(client.uid), cardlist: [
						{ name: "quest_coupon", title: "Quest Coupon", detail: "Get double reward of quest as much you claim.", cardno: 0, count: 0, cd: -1, timelimit: 172800, per: 2, v: 38 },
						{ name: "playing_coupon", title: "Playing Coupon", detail: "Get Double of Potvalue as much you win.", cardno: 1, count: 0, cd: -1, timelimit: 129600, per: 2, v: 38 },
						{ name: "convetor_coupon", title: "convetor Coupon", detail: "Get double coin while convert as much you can.", cardno: 2, count: 0, cd: -1, timelimit: 259200, per: 2, v: 38 },
						{ name: "minigame_coupon", title: "Minigame Coupon", detail: "Get double coin of win as much you can.", cardno: 3, count: 0, cd: -1, timelimit: 172800, per: 2, v: 38 },
						{ name: "hollywood_coupon", title: "Hollywood Coupon", detail: "Get double coin of win as much you can.", cardno: 4, count: 0, cd: -1, timelimit: 172800, per: 2, v: 38 },
						{ name: "bumper_coupon", title: "Bumper Coupon", detail: "Get all five tickets free for you.", cardno: 6, count: 0, cd: -1, timelimit: -1, per: 5, v: 38 },
						{ name: "mega_coupon", title: "Mega Coupon", detail: "Get all five tickets free for you.", cardno: 7, count: 0, cd: -1, timelimit: -1, per: 5, v: 38 },
						{ name: "lottotexas_coupon", title: "Lottotexas Coupon", detail: "Get all five tickets free for you.", cardno: 8, count: 0, cd: -1, timelimit: -1, per: 5, v: 38 },
						{ name: "dailygrand_coupon", title: "Dailygrand Coupon", detail: "Get all five tickets free for you.", cardno: 9, count: 0, cd: -1, timelimit: -1, per: 5, v: 38 },
						{ name: "jackpot_coupon", title: "Jackpot Coupon", detail: "Get all five tickets free for you.", cardno: 10, count: 0, cd: -1, timelimit: -1, per: 5, v: 38 }
					]
				}, (err, insertdata) => {


					CardClass.add_card(cardname, client, cardlength, usercardlist, sources)

				})

			}
		})
	},
	//StartCardTimer
	SCT: (cardname, usercard, client, isfrom, usercardlist, sources) => {

		var track = {}
		var getcarddetails = _.find(usercard.cardlist, function (num) { return num.name == cardname; });

		rclient.ttl("Usercard:" + client.uid + ":" + cardname, function (err, usecarddetails) {

			if (!err && usecarddetails > 0) {

				/*if(usercardlist.length == 0){
					cdClass.SendDataToUser(client.uid.toString(),
					{	 
						en:"SC", //Start Coupon
						data:{UserCard:CardClass.NowStartCard(usercard.cardlist),isfrom:isfrom}
					},true);

				}else{*/
				/*cdClass.SendDataToUser(client.uid.toString(),
				{	 
					en:"SC", //Start Coupon
					data:{msg:"Only one Coupon is activate at one time. It is already activate.",isfrom:isfrom}
				},true);*/

				//Android side close karavni 
				if (sources != "laboratory")
					cdClass.SendData(client, 'SC', {}, "error:9013");

				//}
				laboratroyClass.Checkcoupon(client.uid.toString())
				laboratroyClass.LD({ isfrom: sources }, client)



			} else {

				rclient.set("Usercard:" + client.uid + ":" + cardname, getcarddetails.per)

				if (getcarddetails.name != 'starplaying_coupon') {
					rclient.expire("Usercard:" + client.uid + ":" + cardname, getcarddetails.timelimit)


					rclient.set("Usercardexpire:" + client.uid + ":" + cardname, getcarddetails.per)
					rclient.expire("Usercardexpire:" + client.uid + ":" + cardname, getcarddetails.timelimit - 10800)

					rclient.set("UsercardHalfexpire:" + client.uid + ":" + cardname, getcarddetails.per)
					rclient.expire("UsercardHalfexpire:" + client.uid + ":" + cardname, getcarddetails.timelimit / 2)
				}

				db.collection("user_card").findAndModify({ uid: MongoId(client.uid), "cardlist.name": cardname }, {}, {
					$inc: {
						"cardlist.$.count": -1,
					},
					$set: {
						cd:new Date(),
						"cardlist.$.cd": new Date()
					}
				}, { new: true }, (err, upt) => {


					if (!err) {
						if (usercardlist.length == 0) {

							var cardarra = ["bumper_coupon", "mega_coupon", "lottotexas_coupon", "dailygrand_coupon", "jackpot_coupon"]
							if (cardarra.indexOf(cardname) != -1) {
								track.Total_Booster_Use = 1
								lottoClass.UserlottoLandTracking(client.uid, track, cardname)
							}
							cdClass.SendDataToUser(client.uid.toString(),
								{
									en: "SC", //Start Coupon
									data: { UserCard: CardClass.NowStartCard(upt.value.cardlist), isfrom: isfrom }
								}, true);
						}
					}

					db.collection("game_users").update({ _id: MongoId(client.uid.toString()) },
						{ $inc: { "ubooster": 1 } }, () => {
						})

					laboratroyClass.Checkcoupon(client.uid.toString())
					laboratroyClass.LD({ isfrom: sources }, client)

					/*if(usercardlist != undefined && usercardlist.length > 0){
						CardClass.multiple_card_add(usercardlist,client,sources)
					}*/
				})

			}
		})
	},

	STOPC: (data, client) => {

		if (data.cardname != undefined && data.cardname != null && data.cardname != "") {
			rclient.del("Usercard:" + client.uid.toString() + ":" + data.cardname, (err) => {
				console.log("err ", err)
			})
			CardClass.TimeOverCardService(data.cardname, client.uid.toString(), "STOP")
		} else {
			cdClass.SendData(client, 'STOPC', {}, "error:1010")
		}

	},

	StartCardTimer: (cardname, usercard, client, isfrom, usercardlist, sources) => {


		var getcarddetails = _.find(usercard.cardlist, function (num) { return num.name == cardname; });

		rclient.ttl("Usercard:" + client.uid + ":" + cardname, function (err, usecarddetails) {

			if ((!err && usecarddetails > 0) || !com.InArray(cardname, ["playing_coupon", "quest_coupon", "convetor_coupon", "minigame_coupon", "hollywood_coupon"])) {

				if (usercardlist.length == 0) {
					cdClass.SendDataToUser(client.uid.toString(),
						{
							en: "SC", //Start Coupon
							data: { UserCard: CardClass.NowStartCard(usercard.cardlist), isfrom: isfrom }
						}, true);
				}

				if (usercardlist != undefined && usercardlist.length > 0) {
					CardClass.multiple_card_add(usercardlist, client, sources)
				}
			} else {

				rclient.set("Usercard:" + client.uid + ":" + cardname, getcarddetails.per)
				rclient.expire("Usercard:" + client.uid + ":" + cardname, getcarddetails.timelimit)

				/*db.collection("usercard").update({uid:MongoId(client.uid),"cardlist.name":cardname},{$set:{
				"cardlist.$.cd":new Date()
			}},(err,settime)=>{*/

				db.collection("user_card").findAndModify({ uid: MongoId(client.uid), "cardlist.name": cardname }, {}, {
					$set: {
						"cardlist.$.cd": new Date()
					}
				}, { new: true }, (err, upt) => {

					if (!err) {
						if (usercardlist.length == 0) {
							cdClass.SendDataToUser(client.uid.toString(),
								{
									en: "SC", //Start Coupon
									data: { UserCard: CardClass.NowStartCard(upt.value.cardlist), isfrom: isfrom }
								}, true);
						}
					}

					if (usercardlist != undefined && usercardlist.length > 0) {
						CardClass.multiple_card_add(usercardlist, client, sources)
					}
				})
			}
		})
	},
	TimeOverCardService_OLD: (cardname, uid) => {

		db.collection("user_card").findAndModify({ uid: MongoId(uid), "cardlist.name": cardname }, {},
			{
				$inc: {
					"cardlist.$.count": -1,
				},
				$set: {
					cd:new Date(),
					"cardlist.$.cd": -1
				}
			}, {
			new: true
		}, (err, findcard) => {

			if (!err && findcard.value != null) {

				CardClass.Trackcard(cardname, 1)

				var getcarddetails = _.find(findcard.value.cardlist, function (num) { return num.name == cardname; });

				cdClass.SendDataToUser(uid.toString(),
					{
						en: "STC", //Stop Coupon
						data: { UserCard: CardClass.NowStartCard(findcard.value.cardlist) }
					}, true);

				//New Card Service Start getcarddetails to check card 6e have ke nai 
				if (getcarddetails.count >= 1 && com.InArray(cardname, ["playing_coupon", "quest_coupon", "convetor_coupon", "minigame_coupon", "hollywood_coupon"])) {
					CardClass.StartCardTimer(cardname, findcard.value, { uid: uid }, "cardover", [])
				} else {
					if (getcarddetails.name == "playing_coupon") {
						db.collection("playing_table").update({ "pi.ui.uid": MongoId(uid) }, { $set: { "pi.$.extraadd": 1 } }, () => { })
					}
				}
			}
		})

	},
	TimeOverCardService: (cardname, uid, type) => {
		db.collection("game_users").find({ _id: MongoId(uid.toString()) }).project({ version: 1 }).toArray((err, userData) => {
			//var uservserion = 56;

			if (!err && userData.length > 0) {
				uservserion = parseInt(userData[0].version.aVersion)
			}
			/*var set ={
				$inc:{
					"cardlist.$.count":-1,
				},
				$set:{
					"cardlist.$.cd":-1
				}
			}*/
			//if(uservserion >= 57){
			set = {
				/*$inc:{
					"cardlist.$.count":-1,
				},*/
				$set: {
					"cardlist.$.cd": -1
				}
			}
			//}

			db.collection("user_card").findAndModify({ uid: MongoId(uid), "cardlist.name": cardname }, {}, set, {
				new: true
			}, (err, findcard) => {

				if (!err && findcard.value != null) {

					CardClass.Trackcard(cardname, 1, type)

					var getcarddetails = _.find(findcard.value.cardlist, function (num) { return num.name == cardname; });

					cdClass.SendDataToUser(uid.toString(),
						{
							en: "STC", //Stop Coupon
							data: { UserCard: CardClass.NowStartCard(findcard.value.cardlist), cardname: cardname }
						}, true);

					laboratroyClass.Checkcoupon(uid.toString())
					laboratroyClass.LD({ isfrom: "OVER" }, { uid: uid.toString() })

					//if(uservserion >= 57){
					if (getcarddetails.name == "playing_coupon" || getcarddetails.name == "starplaying2x_coupon") {
						db.collection("playing_table").update({ "pi.ui.uid": MongoId(uid) }, { $set: { "pi.$.extraadd": 1 } }, () => { })
					}
					if (getcarddetails.name == "double_xp_coupon") {
						db.collection("playing_table").update({ "pi.ui.uid": MongoId(uid) }, { $set: { "pi.$.doublexp": 1 } }, () => { })
					}
					/*}else{
						//New Card Service Start getcarddetails to check card 6e have ke nai 
						if(getcarddetails.count >= 1 && com.InArray(cardname,["playing_coupon","quest_coupon","convetor_coupon","minigame_coupon","hollywood_coupon"])){
							CardClass.StartCardTimer(cardname,findcard.value,{uid:uid},"cardover",[])
						}
					}*/

				}
			})
		})
	},
	NowStartCard: (card) => {
		var usercard = []
		card.forEach(function (a) {

			// if (a.count > 0) {
			endtime = (a.cd != undefined && a.cd != -1) ? new Date(com.AddTimeDate(a.cd, a.timelimit)) : -1;


			a.lefttime = (endtime != -1) ? com._getdatedifference(new Date(), endtime) : 0;

			//if(!com.InArray(a.name,["playing_coupon","quest_coupon","convetor_coupon","minigame_coupon","hollywood_coupon"]) || a.lefttime > 0){
			usercard.push(a)
			//}

			// }
		})

		return usercard
	},
	Trackcard: (cardname, count, type, sources) => {

		var olddate = com.CreateDate(new Date());

		if (type == "STOP") {
			db.collection('coupon_collect_track').update(
				{
					cardname: cardname,
					date: olddate
				}, {
				$inc: { stopcard: count, total_card: -count },
				$set: { cd: new Date() }
			}, { upsert: true }, () => {

			})
		}
		else if (type) {
			db.collection('coupon_collect_track').update(
				{
					sources: sources,
					cardname: cardname,
					date: olddate
				}, {
				$inc: { addcard: count, total_card: count },

				$set: { cd: new Date() }
			}, { upsert: true }, () => {

			})
		} else {
			db.collection('coupon_collect_track').update(
				{
					cardname: cardname,
					date: olddate
				}, {
				$inc: { usecard: count, total_card: -count },
				$set: { cd: new Date() }
			}, { upsert: true }, () => {

			})
		}


	},
	UserCardnoti: (cardname, uid, time) => {
		cdClass.GetUserInfo(uid.toString(), { "flags": 1, player_id: 1, version: 1, track: 1, gems: 1,/*currentmission:1,currenttheme:1,*/fcm_token: 1 }, (udata) => {

			if (udata != undefined && udata.player_id != undefined) {

				var noti = {
					title: "",
					body: ""
				}
				if (time == "UsercardHalfexpire") {
					switch (cardname) {
						case "playing_coupon":
							noti = {
								title: "💮Playing Booster going to expired🛑",
								body: "⏰Last few times to claim 2X coin from Playing."
							}
							break;
						case "convetor_coupon":
							noti = {
								title: "💮Converter Booster going to expired🛑",
								body: "⏰Last few times to claim 2X coin from converter."
							}
							break;
						case "minigame_coupon":
							noti = {
								title: "💮Mini Game Booster going to expired🛑",
								body: "⏰Last few times to won 2X coin from minigame."
							}
							break;
						case "quest_coupon":
							noti = {
								title: "💮Quest Booster going to expired🛑",
								body: "⏰Last few times to won 2X Gems from Quest."
							}
							break;
						case "hollywood_coupon":
							noti = {
								title: "💮Hollywood Table Booster going to expired🛑",
								body: "⏰Last few times to won 2X Coin from Hollywood Table."
							}
							break;
						case "mega_coupon":
						case "lottotexas_coupon":
						case "dailygrand_coupon":
						case "jackpot_coupon":
							noti = {
								title: "💮Use the LottoLand Draw Booster🛑",
								body: "🆓By free tickets by user LottoLand Draw Booster."
							}
							break;
					}
				} else if (time == "Usercardexpire") {
					switch (cardname) {
						case "playing_coupon":
							noti = {
								title: "💮Playing Booster going to expired🛑",
								body: "⏰Last few times to claim 2X coin from Playing."
							}
							break;
						case "convetor_coupon":
							noti = {
								title: "💮Converter Booster going to expired🛑",
								body: "⏰Last few times to claim 2X coin from converter."
							}
							break;
						case "minigame_coupon":
							noti = {
								title: "💮Mini Game Booster going to expired🛑",
								body: "⏰Last few times to won 2X coin from minigame."
							}
							break;
						case "quest_coupon":
							noti = {
								title: "💮Quest Booster going to expired🛑",
								body: "⏰Last few times to won 2X Gems from Quest."
							}
							break;
						case "hollywood_coupon":
							noti = {
								title: "💮Hollywood Table Booster going to expired🛑",
								body: "⏰Last few times to won 2X Coin from Hollywood Table."
							}
							break;
						case "mega_coupon":
						case "lottotexas_coupon":
						case "dailygrand_coupon":
						case "jackpot_coupon":
							noti = {
								title: "💮Use the LottoLand Draw Booster🛑",
								body: "🆓By free tickets by user LottoLand Draw Booster."
							}
							break;
					}
				}
				if (udata.flags._io == 0 && noti.title != "" && noti.body != "") {

					notiClass.fcm_notisend_oneby_one([udata.fcmtoken], noti.title, noti.body)


					notiClass.NewOneSignalNoti({
						token: [udata.player_id],
						title: noti.title,
						body: noti.body,
						si: "https://ginrummy.sixacegames.com:3001/upload/app_icon.png",
					})
				}
			}
		})

	}
}