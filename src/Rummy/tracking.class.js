const _ = require("underscore");

module.exports = {
    //rfc //je user ni link par thi aaviyo hoi te  
    ReffrelTrack: function (data, client, callback) {
        trackClass.dailyNewUsertracking(client.uid.toString())

        if (data.rfc) {
            data.lc = (data.lc == undefined || data.lc == null || data.lc == "") ? "en" : data.lc
            db.collection("game_users").find({
                rflcode: data.rfc.toString()
            }, { pp: 1, pn: 1, vip_level: 1, lc: 1 }).toArray(function (err, udata) {
                if (!err && udata.length > 0) {

                    udata[0].lc = (udata[0].lc == undefined || udata[0].lc == null || udata[0].lc == "") ? "en" : udata[0].lc;

                    db.collection("game_users").findAndModify({
                        _id: MongoId(udata[0]._id.toString())
                    }, {}, {
                        $inc: {
                            "counters.ifc": 1
                        },
                        $addToSet: { friend: MongoId(client.uid.toString()) },
                    }, { new: true }, function (err, newData) {

                        db.collection("game_users").update({
                            _id: MongoId(client.uid.toString())
                        }, {
                            $addToSet: { friend: MongoId(udata[0]._id.toString()) },
                        }, function () {
                        })


                        if (!err && newData.value != 'null' && newData.value.counters.ifc <= config.LTIF) {

                            db.collection('notification').replaceOne({
                                s: client.uid.toString(),
                                r: udata[0]._id.toString(),
                                t: "Invite to Friend Bonus",
                            }, {
                                s: client.uid.toString(),
                                r: udata[0]._id.toString(),
                                cd: new Date(),
                                un: client.pn,
                                pp: client.pp,
                                msg: cdClass.CreateMessage(udata[0].lc + "_GAMEIVT", [client.pn]),//"You have got Invite Friend bonus through referral of "+client.pn+".",
                                hmsg: '<big><font color=#ffda2c> Invite To Reffed Bonus </font></big><br><font color=#ffffff>You have got Invite Friend bonus through referral of ' + client.pn + '.</font>',
                                t: "Invite to Friend Bonus",
                                is: 0,
                                ip: 0,
                                cd: new Date()
                            }, {
                                upsert: true,
                                new: true
                            }, function () {

                                var inviteBonus = config.IB; //5000

                                if (typeof udata[0].vip_level != 'undefined' && typeof udata[0].vip_level.vip_lvl != 'undefined' && udata[0].vip_level.vip_lvl > 1) {
                                    inviteBonus += (inviteBonus * udata[0].vip_level.benefits.rfl) / 100;
                                }

                                cdClass.updateUserGold(udata[0]._id.toString(), inviteBonus, "Invite Friend Bonus", 20)


                                notiClass.NC({}, udata[0]._id.toString());
                            });

                        }

                        db.collection('notification').replaceOne({
                            r: client.uid.toString(),
                            s: udata[0]._id.toString(),
                            t: "Invite to Friend Bonus",
                        }, {
                            r: client.uid.toString(),
                            s: udata[0]._id.toString(),
                            cd: new Date(),
                            un: udata[0].pn,
                            pp: udata[0].pp,
                            msg: cdClass.CreateMessage(data.lc + "_REFERRAL", [client.pn]),
                            hmsg: '<big><font color=#ffda2c> Referral Bonus </font></big><br><font color=#ffffff>You have Got Signup Referral Bonus 2500.</font>',
                            t: "Invite to Friend Bonus",
                            is: 0,
                            ip: 0,
                            cd: new Date()
                        }, {
                            upsert: true,
                            new: true
                        }, function () {

                            cdClass.updateUserGold(client.uid.toString(), config.RB, "Singup Referral Bonus", 21, function () {

                                notiClass.NC({}, client.uid.toString());
                                return callback(true)

                            })
                        })

                    });
                } else {

                    return callback(true)
                }

            });
        } else {
            return callback(true)
        }
    },

    // 04/01/2022 comment by ~ nirali
    /*RedisBindings: function () { //expire key binding with redis
    	
        //subscribing for heabeats expiration
        rclient1.psubscribe('__keyspace@' + "0" + '__:*:*');
        rclient1.on("pmessage", function (channel, message, type) {

            //we only need expired event here to handle
            if (type != 'expired')
                return false;


            // 1: key space event, 2: event name 3:if of session or timer what ever	
            var enArr = message.split(':');

            //if any other expire event then we have to ingore it.
            if (enArr.length != 3)
                return false;
            switch (enArr[1]) {
                case 'ping':
                    rclient.hgetall("session:" + enArr[2], function (err, client) {
                        if (client == null)
                            return false;

                        client.si = parseInt(client.si);
                        client._iscom = parseInt(client._iscom);
                        //now we have to refine expire time for that key
                        //dashboardClass.LOGOUT({}, client);
                    });
                    break;
            }

            if(enArr.length > 0 && enArr[0] == "Usercard"){
                
                //User card time is over start new card
                CardClass.TimeOverCardService(enArr[2],enArr[1])      
            }else if(enArr.length > 0 && (enArr[0] == "Usercardexpire" || enArr[0] == "UsercardHalfexpire")){
                CardClass.UserCardnoti(enArr[2],enArr[1],enArr[0])
            }  

        });
    },*/
    RedisBindings: function () { //expire key binding with redis

        //subscribing for heabeats expiration
        rclient.send_command('config', ['set', 'notify-keyspace-events', 'Ex'])

        rclient1.subscribe('__keyevent@0__:expired');


        rclient1.on('message', function (channel, msg, type) {


            var enArr = msg.split(':');

            if (enArr.length > 0 && enArr[0] == "Usercard") {

                //User card time is over start new card
                CardClass.TimeOverCardService(enArr[2], enArr[1])
            }else if(enArr.length > 0 && enArr[0] == "PurchasePlayingTheme"){
                themedataclass.EXTHEME(enArr)
                
            } else if (enArr.length > 0 && (enArr[0] == "Usercardexpire" || enArr[0] == "UsercardHalfexpire")) {

                CardClass.UserCardnoti(enArr[2], enArr[1], enArr[0])
            } else if (enArr.length > 0 && enArr[0] == "UserChest") {

                treasurechestClass.TimeOverChestService(enArr)
            }

        });
    },
    UserGoldHistory: (hdata) => {

        if (typeof hdata.pid == 'undefined')
            return false;

        //sample hdata : { c: Chips, tp : t, pc: uChips, cd : new Date(), uid : }
        /* trackClass.TrackDailyChips({
             t: hdata.tp,
             c: hdata.c
         });*/

        hdata.cd = new Date();
        hdata.pid = MongoId(hdata.pid.toString());
        hdata.total_gold = hdata.previous_gold + hdata.chips;

        db.collection('gold_history').insertOne(hdata, function () { });

    },
}