


cdClass = require('./common.class.js');
userClass = require('./mecanismofuser.class.js');
dashClass = require("./mecanismofdash.class.js");
trackClass = require('./tracking.class.js');
com = require('./comm_function_class.js');
const commonHelper = require('../helper/commonHelper');

const _ = require("underscore");
module.exports = {
    AS: (data, client, callback) => {
        data.lc = (typeof data.lc == "undefined" || data.lc == null || data.lc == "") ? 'en' : data.lc

        rclient.hmset('session:' + client.socketid, 'uid', data._id.toString());
        rclient.hmset('session:' + client.socketid, '_iscom', data.flags._iscom);
        rclient.hmset('session:' + client.socketid, 'pn', data.pn);
        rclient.hmset('session:' + client.socketid, 'fid', data.fid);
        rclient.hmset('session:' + client.socketid, 'ult', data.ult);
        rclient.hmset('session:' + client.socketid, 'pp', data.pp);
        rclient.hmset('session:' + client.socketid, 'v', parseInt(data.version.aVersion));
        rclient.hmset('session:' + client.socketid, 'viplvl', parseInt(data.vip_level.vip_lvl));
        rclient.hmset('session:' + client.socketid, 'level', JSON.stringify(data.level));
        rclient.hmset('session:' + client.socketid, 'lc', data.lc);

        var ispayee = (data.track != undefined && data.track.buy_gold != undefined && data.track.buy_gold.length > 0) ? 1 : 0;


        trackClass.dailyUsertracking(data._id.toString(), ispayee)

        rclient.hgetall("session:" + client.socketid, function (err, client) {
            if (client == null) {

                callback(true)
                return false;
            }

            //if socket id new or old save of user data this time throw ODL

            if (typeof data.socketid != 'undefined' && data.socketid != '' && typeof data.sid != 'undefined' && data.sid != '' && data.socketid != client.socketid) {
                cdClass.SendDataToUser(data._id.toString(),
                    {
                        en: "ODL",//old data lost
                        data: {}
                    });
            }


            cdClass.IsMaintenanceToSendUser(client)



            if ((typeof data.reConnID == 'undefined' || data.reConnID == null || data.reConnID == "") && typeof data.tbid != 'undefined' && data.tbid.toString().length == 24 && typeof data.si != 'undefined') {

                db.collection("playing_table").find({
                    _id: MongoId(data.tbid),
                    "pi.ui.si": parseInt(data.si)
                }).toArray(function (err, pdata) {

                    if (!err && pdata.length > 0) {

                        cdClass.SendData(client, 'SR', //Server Restart 
                            {
                                tbid: data.tbid,
                                si: parseInt(data.si)
                            }, "success:0000");
                    }

                })
            }

            return callback(true)
        });
    },
    SendData: (socket, en, dt, message,flags) => {

        try {
            // eslint-disable-next-line no-param-reassign
            flag = typeof flag === 'undefined' ? true : false;
            // eslint-disable-next-line no-param-reassign
            msg = msg || '';

            var response = {
                flag:flags == undefined ? false : true ,
                msg: message,
                eventName: en,
                data: dt
            };
    
            const encryptedData = commonHelper.encrypt(response);

            socket.emit('req', { payload: encryptedData });
          } catch (error) {
            logger.error('socketFunction.js sendEvent error :--> ' + error);
          }


    },
    SendDataToTable: (client, dataToSend, msgNoti) => {
        
        if (typeof client == 'undefined') {
            return false;
        }

        //includeme Stand for that if we have to include current socket id or not.
        var tb = (typeof client == 'string') ? client : client.tbid;


        if (typeof tb == 'string' && tb.length > 23) {
            if (typeof msgNoti != 'undefined') {
                dataToSend.data.msg = "";
                dataToSend.data.key = msgNoti;
            }

           
            var eData = commonHelper.encrypt(dataToSend);


            io.to(tb).emit('req', { payload: eData });
        } else {
            conoasle.log("SendDataToTable::::::::::::::::::::::::::;else");
        }
    },
    SendDataToUser: (qid, data) => {


        if (typeof qid == 'undefined' || qid == null || qid == '')
            return false;


        cdClass.GetUserInfo(qid.toString(), {
            socketid: 1
        }, (rcu) => {

            if (typeof io != "undefined") {
                var eData = com.Encrypt(data);
                io.to(rcu.socketid).emit('res', eData);
            }
            if (data.en == "LINFO") {

                rclient.hmset('session:' + rcu.socketid, 'level', JSON.stringify(data.data.level_info));

            }

            if (data.en == 'EG' && typeof data.data != 'undefined') {
                cdClass.GetUserInfo(qid.toString(), {
                    socketid: 1
                }, (uInfo) => {
                    if (typeof uInfo.socketid != 'undefined') {

                        io.of('/').adapter.remoteLeave(uInfo.socketid, data.data.tbid.toString(), (err) => {


                        });

                    }
                });
            }
        })
    },
    SendDataToUserSingle: (qid, data, flag) => {


        if (typeof qid == 'undefined' || qid == null || qid == '')
            return false;

        cdClass.GetUserInfo(qid.toString(), {
            socketid: 1,
            sid: 1,
            "flags._io": 1,
            "flags._iscom": 1,
            pn: 1
        }, function (rcu) {

            var single = rcu.socketid;

            if (typeof rcu.flags != 'undefined' && rcu.flags._iscom == 0) {
                playExchange.publish("single." + rcu.sid + "." + rcu.socketid, data);
            }
        })
    },
    GetTableData: (id, fields, callback) => {

        if (typeof fields == 'function') {
            callback = fields;
            fields = {};
        }


        if (typeof id != 'string' || id.length < 24)
            return callback(false);

        db.collection('playing_table').find({
            _id: MongoId(id.toString())
        }).project(fields).toArray((err, res) => {

            if (err || res.length == 0)
                return callback(false);
            else if (res.length > 0)
                return callback(res[0]);

            res = null;
        });
    },
    UpdateTableData: (where, uData, callback) => {
        if (typeof where == 'string')
            where = {
                _id: MongoId(where)
            };

        //adding default time
        if (typeof uData.$set == 'undefined')
            uData.$set = {
                la: new Date()
            };
        else
            uData.$set.la = new Date();


        db.collection('playing_table').update(where, uData, (err, up) => {

            if (typeof callback == 'function') {

                return callback(up);
            }

        });
    },
    updateUserGold: (id, chips, t, code, callback, iscall) => {

        if (isNaN(chips) || parseInt(chips) == 0) {
            if (typeof callback == 'function') {
                return callback(0);
            } else {
                return false;
            }
        }

        var wh = (typeof id == 'string') ? {
            _id: MongoId(id)
        } : {
            _id: id
        };

        chips = Math.floor(Number(chips));
        cdClass.GetUserInfo(wh._id.toString(), {
            "chips": 1,
            "counters.hcl": 1,
            "pn": 1,
            "socketid": 1,
            "flags._iscom": 1,
            "tbid": 1,
            "last": 1,
            "version": 1
        }, (u) => {
            if (typeof u._id != 'undefined') {

                var fgold = ((chips + u.chips) < 0) ? 0 : chips + u.chips;

                var setInfo = {
                    $set: {
                        chips: fgold
                    },
                    $inc: {}
                };
                //All Player set System noti
                /*if(fgold < 2000 && (u.last.sysnoti == "" || 
                    (u.last.sysnoti != undefined && com._getdatedifference(u.last.sysnoti,new Date(),'day') >= 1))){
                    //Send Noti for buy chips
                    GoldStroeClass.LossGoldOffer(wh._id.toString())
                    setInfo["$set"]["last.sysnoti"]= new Date();
                }*/

                if (config.GOLDADDED && fgold < 5000 && parseInt(u.version.aVersion) < parseInt(config.VIDEONOTIVERSION)) {
                    cdClass.updateUserGold(wh._id.toString(), 5000, "Admin Added Gold", 27)
                }

                if (t != "Singup Bonus") {
                    setInfo["$inc"] = {};
                    setInfo["$inc"]["wg"] = chips;
                }

                if (t.match(/Collect Gold For Game/g) || t.match(/Collect Gold For Star Game/g) || t.match(/Winners For Game/g) || t.match(/Winners For Star Game/g) || t.match(/2x Gold from Game Winner/g)/*|| t.match(/Collect For Tournament/g) || t.match(/WinFromTournament/g)*/) {
                    setInfo["$inc"]["wlg"] = chips;
                    setInfo["$inc"]["lastdaylossgold"] = chips;
                }

                setInfo["$inc"]["dg"] = chips;

                if (t.match(/Collect Gold For Game/g) || t.match(/Collect Gold For Star Game/g) || t.match(/Collect For Tournament/g)) {
                    setInfo["$inc"]["cLossG"] = chips;
                }

                if (t.match(/Winners For Game/g) || t.match(/Winners For Star Game/g) || t.match(/2x Gold from Game Winner/g) || t.match(/Win From Tournament/g)) {
                    setInfo["$set"]["cLossG"] = 0;
                }

                if (typeof u.counters != 'undefined' && u.counters.hcl < fgold)
                    setInfo.$set["counters.hcl"] = fgold;

                wh.chips = u.chips;

                db.collection('game_users').findAndModify(wh, {}, setInfo, {
                    new: true
                }, (err, resp) => {
                    if (!err && resp.value != null) {
                        if (u.flags._iscom == 0) {

                            resp.value.lc = (resp.value.lc == undefined || resp.value.lc == null || resp.value.lc == "") ? "en" : resp.value.lc;
                            trackClass.UserGoldHistory({
                                chips: chips,
                                tp: cdClass.GoldHistoryMsg(resp.value.lc + "_" + code, t),
                                previous_gold: u.chips,
                                pid: u._id,
                                pn: u.pn,
                                isgems: 0
                            });

                            trackClass.ChipsTracking(u._id.toString(), Math.abs(chips), t)

                            if (t.match(/Collect Gold For Game/g) || t.match(/Collect Gold For Star Game/g) || t.match(/Winners For Game/g) || t.match(/Winners For Star Game/g) || t.match(/2x Gold from Game Winner/g)) {
                                trackClass.playingBootTracking(parseInt(chips), t.match(/Collect Gold For Game/g) ? 0 : 1)
                            }

                            if (t.match(/Collect Gold For Game/g) || t.match(/Collect Gold For Star Game/g)) {
                                trackClass.newplayingTracking(-1, 0, 0, Math.abs(chips), Math.abs(chips))
                            }

                            if (code != undefined) {
                                trackClass.TrackSystemGold(code, Math.abs(chips))
                            } else {
                                trackClass.TrackSystemGold(t, Math.abs(chips))
                            }
                        }
                        //trackClass.sysUpdateGold(t,chips) 


                        userClass.FindUserPlayBoot({ chips: resp.value.chips }, (bv) => {

                            if (resp.value.NormalEntryGold != undefined && bv[bv.length - 1] != undefined && bv[bv.length - 1] < resp.value.NormalEntryGold && bv.indexOf(resp.value.NormalEntryGold) == -1) {

                                cdClass.UpdateUserData(u._id.toString(), { $set: { 'bootvalue': bv, NormalEntryGold: bv[bv.length - 1] } })
                                if (config.NSUG.indexOf(t) == -1 && u.flags._iscom == 0) {

                                    cdClass.SendDataToUser(u._id.toString(), {
                                        en: "UNEG",
                                        data: {
                                            NormalEntryGold: bv[bv.length - 1]
                                        }
                                    });
                                }
                            } else {
                                cdClass.UpdateUserData(u._id.toString(), { $set: { 'bootvalue': bv } })
                            }
                        });



                        if (config.NSUG.indexOf(t) == -1 && u.flags._iscom == 0) {


                            cdClass.SendDataToUser(u._id, {
                                en: "UG",
                                data: {
                                    chips: fgold,
                                    goldAdded: chips,
                                    tp: t
                                }
                            }); //publishing to exchange
                        }

                    } else {
                        if (iscall != undefined && iscall) {
                            if (typeof callback == 'function')
                                return callback(0)
                            else
                                return false
                        }
                        else if (typeof callback != 'undefined')
                            cdClass.updateUserGold(id, chips, t, code, callback, true);
                        else
                            cdClass.updateUserGold(id, chips, t, code, '', true);
                    }
                    //is change only for invite user mate refrel 
                    if (typeof callback == 'function')
                        return callback(fgold);
                });

            } else if (typeof callback == 'function')
                return callback(0);
        });
    },
    GetUserInfo: (id, fields, callback) => {
        if (typeof fields == 'function') {
            callback = fields;
            fields = {};
        }
        if (typeof id != 'string' || id.length < 24) {
            callback(false);
            return false;
        }

        db.collection("game_users").find({ _id: MongoId(id) }).project(fields).limit(1).toArray((err, res) => {
            if (!err && res.length > 0)
                callback(res[0]);
            else
                callback(false);

            res = null;
        });
    },
    UpdateUserData: (where, uData, callback) => {
        if (typeof where == 'string')
            where = {
                _id: MongoId(where)
            };

        //adding default time
        if (typeof uData == 'undefined')
            return false;

        db.collection('game_users').update(where, uData, (err) => {
            if (typeof callback == 'function')
                return callback();

        });
    },
    LastWinnerList: (callback) => {
        db.collection('weekly_result').find({}).project({
            "users._id": 1
        }).sort({
            $natural: -1
        }).limit(4).toArray((err, pw) => {
            var obj = {
                flu: [],
            };
            for (var a in pw) {
                for (var b in pw[a].users) {
                    obj.flu.push(pw[a].users[b]._id);
                }
            }
            return callback(obj);
        });
    },
    LastDailyWinnerList: (callback) => {
        db.collection('daily_result').find({}).project({
            "users._id": 1
        }).sort({
            $natural: -1
        }).limit(7).toArray((err, pw) => {
            var obj = {
                flu: [],
            };
            for (var a in pw) {
                for (var b in pw[a].users) {
                    obj.flu.push(pw[a].users[b]._id);
                }
            }
            return callback(obj);
        });
    },
    CheckForWineer: (data, callback) => {

        var color = data.card.split('-')[0];

        if (color == 'k' && data.type == 'spades') {
            callback(true);
        } else if (color == 'l' && data.type == 'heart') {
            callback(true);
        } else {
            callback(false);
        }
    },
    //Only 
    GetcardValue: (card) => {
        if (card.split("-")[0] != "j") {
            return parseInt(card.split("-")[1])
        } else {
            return parseInt(0)
        }
    },
    GetcardColor: (card) => {
        return card.split("-")[0]

    },
};
