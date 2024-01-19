
com = require('./comm_function_class.js');
cdClass = require('./common.class.js');
dashClass = require("./mecanismofdash.class.js");
mechanismClass = require('./mechanismofPlaying.class.js');


const schedule = require('node-schedule');
const _ = require("underscore");

module.exports = {
    DisConnect: (data, client) => {
        if (typeof client.socketid == 'undefined') {
            c("LOGOUT We are here for client undefined");
            return false;
        }

        if (client._iscom == 0) {
            cdClass.GetUserInfo(client.uid, {
                tbid: 1, socketid: 1, reConnID: 1, tuid: 1
            }, (uInfo) => {


                if ((uInfo.tbid != "" || uInfo.tuid != "") && (uInfo.reConnID == '' || typeof uInfo.reConnID == 'undefined') && (uInfo.socketid == client.socketid || typeof uInfo.socketid == 'undefined')) {
                    var rjoinTime = com.AddTime(60);
                    var reConnID = "RCT" + com.GetRandomString(10);


                    //aa atle remove kariyu ke tournamnet ma second round ma i think jo reconnect kare to te  last table vali si seat kare atle                   
                    cdClass.UpdateUserData(client.uid, { $set: { "reConnID": reConnID, "last.reConnectTime": new Date()/*, "si": client.si*/ } }, () => { });

                    schedule.scheduleJob(reConnID, new Date(rjoinTime), () => {
                        schedule.cancelJob(reConnID);

                        dashClass.DCP(data, client);
                        //DCP DissConnectProcess
                    });
                } else {

                    if (typeof uInfo.reConnID == 'undefined' || uInfo.reConnID == '' || (uInfo.tbid == "" && uInfo.tuid == "")) {
                        dashClass.DCP(data, client);
                    }
                }
            });
        }
    },
    DCP: (data, client) => {

        cdClass.GetUserInfo(client.uid.toString(), {
            socketid: 1,
            tbid: 1,
            pn: 1,
            tuid: 1,
            si: 1
        }, (uInfo) => {

            if (typeof client.uid != 'undefined' && uInfo.socketid != "" && (uInfo.socketid == client.socketid || typeof uInfo.socketid == 'undefined')) {

                db.collection('game_users').update({
                    _id: MongoId(client.uid),
                    socketid: client.socketid
                }, {
                    $set: {
                        "flags._io": 0,// pachl nu kariyu hatu pan ahiya pan set 0 kari devano koi case ma rai jai tyare ahiya zero thai atle  //user online rai jai tena mate have direct disconnect par io 0 karvano
                        //socketid: "",
                        tbid: "",
                        reConnID: "",
                        si: '',
                        ExitDate: new Date()
                    }
                }, () => {

                    
                });
            } else {
                if (typeof client.uid != 'undefined') {
                    db.collection('game_users').update({
                        _id: MongoId(client.uid),
                        $or: [
                            { socketid: "" },
                            { socketid: client.socketid }
                        ]
                    }, {
                        $set: {
                            "flags._io": 0,
                            //socketid: "",
                            tbid: "",
                            reConnID: "",
                            si: '',
                            ExitDate: new Date()
                        }
                    }, () => {

                        
                    });
                }
            }
            if (typeof uInfo.tuid != "undefined" && uInfo.tuid != "") {
                db.collection('game_users').update({
                    _id: MongoId(client.uid)
                }, {
                    $set: {
                        lgs: 2,
                    }
                }, function () {
                });
            }

            if (typeof uInfo.tbid != "undefined" && uInfo.tbid != "") {
                db.collection('game_users').update({
                    _id: MongoId(client.uid)
                }, {
                    $set: {
                        lgsn: 2,
                    }
                }, function () {
                });
            }


            if (typeof uInfo.socketid != 'undefined' && uInfo.socketid != "" && (uInfo.socketid == client.socketid || typeof uInfo.socketid == 'undefined')) {

                if (typeof client.tbid != 'undefined' && uInfo.tbid != '') {

                    client.tbid = uInfo.tbid;
                    client.si = parseInt(uInfo.si);


                    mechanismClass.EG({}, client);

                    rclient.del("session:" + client.socketid);
                } else {

                    rclient.hgetall("session:" + uInfo.socketid, function (err, client1) {


                        if (client1 != null && typeof client1.tbid != 'undefined' && typeof uInfo.tbid != 'undefined' && uInfo.tbid != '') {
                            mechanismClass.EG({}, client1);

                            //rclient.del("session:" + client1.socketid);

                            return false;
                        } else {

                            if (typeof client.toid != 'undefined' && typeof uInfo.tuid != 'undefined' && uInfo.tuid != '') {
                                TournamnetClass.EGT({ touId: uInfo.tuid.toString() }, client);
                                rclient.del("session:" + client.socketid);

                            } else {
                                rclient.hgetall("session:" + uInfo.socketid, function (err, client) {


                                    if (client != null && typeof client.toid != 'undefined' && typeof uInfo.tuid != 'undefined' && uInfo.tuid != '') {
                                        TournamnetClass.EGT({}, client);
                                        //rclient.del("session:" + client.socketid);
                                    }

                                });
                            }
                        }

                    });
                }



            }


            /*if (typeof uInfo.socketid != 'undefined' && uInfo.socketid != "" && (uInfo.socketid == client.socketid || typeof uInfo.socketid == 'undefined')) {

               

                    if (typeof client.tbid != 'undefined' && typeof  uInfo.tbid != 'undefined' && uInfo.tbid != '') {
                        mechanismClass.EG({}, client); 
                    }else{
                        rclient.hgetall("session:" + uInfo.socketid,  (err, client)=>{
                    
                         
                            if (client != null && typeof client.tbid != 'undefined' && typeof  uInfo.tbid != 'undefined' && uInfo.tbid != '') {
                                mechanismClass.EG({}, client); 
                            }
                       
                        });

                        
                    }  

                    if (typeof client.toid != 'undefined' && typeof  uInfo.tuid != 'undefined' && uInfo.tuid != '') {
                        TournamnetClass.EGT({touId:uInfo.tuid}, client); 
                    }else
                    {
                        rclient.hgetall("session:" + uInfo.socketid,  (err, client)=>{
                    
                            
                            if (client != null && typeof client.toid != 'undefined' && typeof  uInfo.tuid != 'undefined' && uInfo.tuid != '') {
                                mechanismClass.EG({}, client); 
                            }
                       
                        });
                    }                
                    
                    if(client != null && typeof client.socketid != 'undefined'){
                        rclient.del("session:" + client.socketid);
                    } // this issue solve to disconnect time close any screen to remove disconnect preloder and send events  Session remove karvanu bandh bcz session remove thai jato hase client.uid atle nathi maltu 
            }*/
        });
    },
    RGTI: (data, client) => {
        if (data.tbid) {
            cdClass.GetUserInfo(client.uid.toString(), (udata) => {
                if (udata) {
                    db.collection('playing_table').find({
                        _id: MongoId(data.tbid),
                        'pi.ui.uid': MongoId(client.uid)
                    }).toArray((err, reGti) => {
                        if (!err && reGti.length > 0) {


                            var sData = { en: 'CTJ', data: { jid: udata.reConnID } };
                            playExchange.publish('table.' + data.tbid, sData);

                            /*io.of('/').adapter.remoteLeave(client.socketid, data.tbid, (err) => {
                              if (err) { console.log("Not Connect ",client.socketid) }
                                
                            });*/

                            io.of('/').adapter.remoteJoin(client.socketid, data.tbid, (err) => {
                                

                            });

                            var isknock = 0
                            var userData = reGti[0].pi[data.si];
                            if (data.si == reGti[0].ti && (userData.status == 'PFCD' || userData.status == "PFODPU")) {
                                var unusecrd = _.difference(userData.cards, _.flatten(userData.spc))


                                var deadwood = gamelogicClass.CountDeadWood(userData.spc, userData.cards, userData.lodpc);

                                if (deadwood == 0) {

                                    isknock = (unusecrd.length == 0) ? 1 : (unusecrd.length == 1 && unusecrd[0] != userData.lodpc) ? 2 : 0;
                                } else if (deadwood <= reGti[0].maindeadwood) {
                                    //isknock = 3
                                    if (unusecrd.length == 1) {
                                        isknock = (unusecrd[0] == userData.lodpc) ? 0 : 3;
                                    } else {
                                        isknock = 3;
                                    }
                                }
                            }

                            reGti[0].isknock = isknock;



                            db.collection('game_users').update({ _id: MongoId(client.uid.toString()) },
                                {
                                    $set: {
                                        reConnID: "",
                                    }
                                }, { w: 0 });

                            /*dbClass.updateDataOne("playing_table", {_id:MongoId(data.tbid)}, {
                               
                                $push: {
                                    "lastrjti": {
                                        $each: [{
                                            pn:client.pn,
                                            cards:userData.cards,
                                            spc:userData.spc,
                                            cd:new Date(),
                                            t_status:reGti[0].t_status,
                                            round:reGti[0].round,
                                            ctt:(reGti[0].ctt != undefined)?reGti[0].ctt:""  
                                        }],
                                        $slice: -5
                                    }
                                }
                            },{},()=>{})*/


                            dashClass.TimeCofig(reGti[0], client);

                            rclient.hmset('session:' + client.socketid, "si", data.si);

                            if (reGti[0].isleague == undefined || reGti[0].isleague == "" || reGti[0].isleague == 0) {
                                cdClass.GetUserInfo(client.uid.toString(), { resultQuest: 1, Questdata: 1, last: 1 }, (udata) => {
                                    if (udata.resultQuest != undefined && udata.Questdata != undefined) {
                                        db.collection("quest_data").find({ status: 1 }).sort({ sort: 1 }).toArray((err, questdata) => {

                                            if (!err && questdata.length > 0) {
                                                var senddata = [];
                                                var lefttime = (typeof udata.last != 'undefined' && typeof udata.last.qdct != 'undefined') ? com.GetTimeDifference(new Date(), udata.last.qdct.setSeconds(udata.last.qdct.getSeconds() + 86400)) : 0;

                                                for (var i = 0; i < questdata.length; i++) {
                                                    if (questdata[i].mode == "Any" || questdata[i].mode == "TAny" || questdata[i].mode == "XP" || questdata[i].mode == "Only Game" ||
                                                        (reGti[0].mode == 1 && (questdata[i].mode == "Only Knock Gin" || questdata[i].mode == "Any Knock")) ||
                                                        (reGti[0].mode == 2 && (questdata[i].mode == "Only Straight Gin" || questdata[i].mode == "Any Straight")) ||
                                                        (reGti[0].mode == 3 && (questdata[i].mode == "Okhlama Gin" || questdata[i].mode == "Any Knock")) ||
                                                        (reGti[0].mode == 4 && (questdata[i].mode == "Joker Mode" || questdata[i].mode == "Any Knock")) ||
                                                        (reGti[0].mode == 5 && (questdata[i].mode == "Joker Mode")) ||
                                                        (reGti[0].mode == 6 && (questdata[i].mode == "Joker Mode" || questdata[i].mode == "Any Knock"))
                                                    ) {
                                                        questdata[i].claim = udata.resultQuest[questdata[i].quest]
                                                        questdata[i].complete = udata.Questdata[questdata[i].quest]
                                                        questdata[i].lefttime = lefttime

                                                        senddata.push(questdata[i])
                                                    }
                                                }

                                                setTimeout(() => {
                                                    cdClass.SendData(client, "QD", { Questdata: senddata }, 'succes:0000');
                                                }, 1000)
                                            }
                                        })
                                    }

                                })
                            }

                            cdClass.SendData(client, 'RGTI', reGti[0], "error:0000");

                            if (reGti[0].isleague != undefined && reGti[0].isleague == 1) {
                                LeagueClass.SendLeagueRank(reGti[0], client)
                            }

                            var sData = { en: 'LEAVE', data: { tbid: "GLOBLEROOM", socketid: client.socketid } };
                            playExchange.publish('table.GLOBLEROOM', sData);

                            var sData = { en: 'LEAVE', data: { tbid: "GLOBLEROOMTOUR", socketid: client.socketid } };
                            playExchange.publish('table.GLOBLEROOMTOUR', sData);

                            var sData = { en: 'LEAVE', data: { tbid: "GLOBLEROOMSTAR", socketid: client.socketid } };
                            playExchange.publish('table.GLOBLEROOMSTAR', sData);

                            bonusClass.MB({}, { uid: client.uid.toString() });

                            if (data.isnextround != undefined && data.isnextround == 1) {
                                schedulerClass.AfterRoundFinish({
                                    tbId: data.tbid.toString()
                                })
                            }

                        } else {
                            db.collection('game_users').update({ _id: MongoId(client.uid.toString()) },
                                {
                                    $set: {
                                        reConnID: "",
                                    }
                                }, { w: 0 });

                            //jo table id hoi user na table ma and table no hoi tyare aavu kariye to re
                            var sData = { en: 'CTJ', data: { jid: udata.reConnID } };
                            playExchange.publish('table.' + data.tbid, sData);


                            cdClass.SendData(client, 'RGTI', {}, "error:9000");

                        }
                    })
                }
            })
        } else {
            //Tournamnet id check and send data for tournamnet 
            cdClass.SendData(client, 'RGTI', {}, "error:9000");
        }
    },
    /*
        tbid:"",
        si:"",
        tuid:""
        tsi:""
    */
    TRGTI: (data, client) => {
        if (data.tuid) {
            cdClass.GetUserInfo(client.uid.toString(), (udata) => {
                if (udata) {
                    if (data.tbid) {
                        /*db.collection('playing_table').find({
                            _id:MongoId(data.tbid),
                            'pi.ui.uid':MongoId(client.uid)
                        }).toArray(function(err,reGti){*/

                        db.collection('playing_table').findAndModify({
                            _id: MongoId(data.tbid),
                            'pi.ui.uid': MongoId(client.uid)
                        }, {}, {
                            $set: {
                                'pi.$.ui.socketid': client.socketid
                            }
                        }, { new: true }, (err, reGti) => {

                            if (!err && reGti.value != null) {

                                var sData = { en: 'CTJ', data: { jid: udata.reConnID } };
                                playExchange.publish('table.' + data.tbid, sData);


                                /* if(io.sockets.connected[client.socketid]){
 
         
                                     io.sockets.connected[client.socketid].leave(data.tbid);
                                     io.sockets.connected[client.socketid].join(data.tbid);
 
                                 }*/

                                /*io.of('/').adapter.remoteLeave(client.socketid, data.tbid, (err) => {
                                  if (err) { console.log("Not Connect ",client.socketid) }
                                    
                                   
                                });*/

                                io.of('/').adapter.remoteJoin(client.socketid, data.tbid, (err) => {
                                    

                                });

                                var isknock = 0
                                var userData = reGti.value.pi[udata.si];

                                if (udata.si == reGti.value.ti && userData != undefined && userData.status != undefined && (userData.status == 'PFCD' || userData.status == "PFODPU")) {
                                    var unusecrd = _.difference(userData.cards, _.flatten(userData.spc))


                                    var deadwood = gamelogicClass.CountDeadWood(userData.spc, userData.cards, userData.lodpc);

                                    if (deadwood == 0) {

                                        isknock = (unusecrd.length == 0) ? 1 : (unusecrd.length == 1 && unusecrd[0] != userData.lodpc) ? 2 : 0;
                                    } else if (deadwood <= reGti.value.maindeadwood) {
                                        //isknock = 3
                                        if (unusecrd.length == 1) {
                                            isknock = (unusecrd[0] == userData.lodpc) ? 0 : 3
                                        } else {
                                            isknock = 3;
                                        }
                                    }
                                }

                                reGti.value.isknock = isknock;


                                db.collection('game_users').update({
                                    _id: MongoId(client.uid.toString())
                                },
                                    {
                                        $set: {
                                            reConnID: "",
                                        }
                                    }, { w: 0 });

                                /*var update={$set:{}}

                                update["$set"]["round1."+data.tsi+".player.$.socketid"]=client.socketid;

                                
                                */
                                db.collection("tournament").find({
                                    _id: MongoId(data.tuid.toString()),
                                }).toArray((err, turData) => {

                                    if (!err && turData.length > 0) {

                                        /*db.collection("tournament").update({
                                            _id:MongoId(data.tuid.toString()),
                                            'round2.player.uid':MongoId(client.uid)
                                        },{$set:{"round2.0.player.$.socketid":client.socketid}},function(){

                                        })*/

                                        dashClass.TimeCofig(reGti.value, client);


                                        rclient.hmset('session:' + client.socketid, "si",/*data.si*/udata.si);
                                        rclient.hmset('session:' + client.socketid, 'toid', turData[0]._id.toString());

                                        cdClass.GetUserInfo(client.uid.toString(), { resultQuest: 1, Questdata: 1, last: 1 }, (udata) => {
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
                                                            cdClass.SendData(client, "QD", { Questdata: senddata }, 'succes:0000');
                                                        }, 3000)
                                                    }
                                                })
                                            }

                                        })


                                        cdClass.SendData(client, 'RGTI', reGti.value, "error:0000");
                                    } else {
                                        var sData = { en: 'CTJ', data: { jid: udata.reConnID } };
                                        playExchange.publish('table.' + data.tbid, sData);


                                        cdClass.SendData(client, 'RGTI', {}, "error:9000");
                                    }
                                })
                            } else {

                                db.collection('game_users').update({
                                    _id: MongoId(client.uid.toString())
                                },
                                    {
                                        $set: {
                                            reConnID: "",
                                        }
                                    }, { w: 0 });

                                var sData = { en: 'CTJ', data: { jid: udata.reConnID } };
                                playExchange.publish('table.' + data.tbid, sData);

                                cdClass.SendData(client, 'RGTI', {}, "error:9000");
                            }
                        })
                    } else {

                        if (udata.tbid) {
                            
                            data.tbid = udata.tbid

                            /*db.collection('playing_table').find({
                                _id:MongoId(data.tbid),
                                'pi.ui.uid':MongoId(client.uid)
                            }).toArray(function(err,reGti){*/

                            db.collection('playing_table').findAndModify({
                                _id: MongoId(data.tbid),
                                'pi.ui.uid': MongoId(client.uid)
                            }, {}, {
                                $set: {
                                    'pi.$.ui.socketid': client.socketid
                                }
                            }, { new: true }, (err, reGti) => {

                                if (!err && reGti.value != null) {

                                    var sData = { en: 'CTJ', data: { jid: udata.reConnID } };
                                    playExchange.publish('table.' + data.tbid, sData);


                                    /* if(io.sockets.connected[client.socketid]){
     
             
                                         io.sockets.connected[client.socketid].leave(data.tbid);
                                         io.sockets.connected[client.socketid].join(data.tbid);
     
                                     }*/

                                    /*io.of('/').adapter.remoteLeave(client.socketid, data.tbid, (err) => {
                                      if (err) { console.log("Not Connect ",client.socketid) }
                                        
                                       
                                    });*/

                                    io.of('/').adapter.remoteJoin(client.socketid, data.tbid, (err) => {
                                      

                                    });

                                    var isknock = 0
                                    var userData = reGti.value.pi[udata.si];

                                    if (udata.si == reGti.value.ti && userData != undefined && userData.status != undefined && (userData.status == 'PFCD' || userData.status == "PFODPU")) {
                                        var unusecrd = _.difference(userData.cards, _.flatten(userData.spc))


                                        var deadwood = gamelogicClass.CountDeadWood(userData.spc, userData.cards, userData.lodpc);

                                        if (deadwood == 0) {

                                            isknock = (unusecrd.length == 0) ? 1 : (unusecrd.length == 1 && unusecrd[0] != userData.lodpc) ? 2 : 0;
                                        } else if (deadwood <= reGti.value.maindeadwood) {
                                            //isknock = 3
                                            if (unusecrd.length == 1) {
                                                isknock = (unusecrd[0] == userData.lodpc) ? 0 : 3
                                            } else {
                                                isknock = 3;
                                            }
                                        }
                                    }

                                    reGti.value.isknock = isknock;


                                    db.collection('game_users').update({
                                        _id: MongoId(client.uid.toString())
                                    },
                                        {
                                            $set: {
                                                reConnID: "",
                                            }
                                        }, { w: 0 });

                                    /*var update={$set:{}}
    
                                    update["$set"]["round1."+data.tsi+".player.$.socketid"]=client.socketid;
    
                                    
                                    */
                                    db.collection("tournament").find({
                                        _id: MongoId(data.tuid.toString()),
                                    }).toArray((err, turData) => {

                                        if (!err && turData.length > 0) {

                                            /*db.collection("tournament").update({
                                                _id:MongoId(data.tuid.toString()),
                                                'round2.player.uid':MongoId(client.uid)
                                            },{$set:{"round2.0.player.$.socketid":client.socketid}},function(){
    
                                            })*/

                                            dashClass.TimeCofig(reGti.value, client);


                                            rclient.hmset('session:' + client.socketid, "si",/*data.si*/udata.si);
                                            rclient.hmset('session:' + client.socketid, 'toid', turData[0]._id.toString());

                                            cdClass.GetUserInfo(client.uid.toString(), { resultQuest: 1, Questdata: 1, last: 1 }, (udata) => {
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
                                                                cdClass.SendData(client, "QD", { Questdata: senddata }, 'succes:0000');
                                                            }, 3000)
                                                        }
                                                    })
                                                }

                                            })


                                            cdClass.SendData(client, 'RGTI', reGti.value, "error:0000");
                                        } else {
                                            var sData = { en: 'CTJ', data: { jid: udata.reConnID } };
                                            playExchange.publish('table.' + data.tbid, sData);


                                            cdClass.SendData(client, 'RGTI', {}, "error:9000");
                                        }
                                    })
                                } else {

                                    db.collection('game_users').update({
                                        _id: MongoId(client.uid.toString())
                                    },
                                        {
                                            $set: {
                                                reConnID: "",
                                            }
                                        }, { w: 0 });

                                    var sData = { en: 'CTJ', data: { jid: udata.reConnID } };
                                    playExchange.publish('table.' + data.tbid, sData);

                                    cdClass.SendData(client, 'RGTI', {}, "error:9000");
                                }
                            })
                        } else {
                            //Tournamnet id check and send data for tournamnet 
                            db.collection('tournament').find({
                                _id: MongoId(data.tuid.toString()),
                                "round1.player.uid": MongoId(client.uid)
                            }).toArray((err, turData) => {
                                //"round1.player.uid"

                                /*db.collection('tournament').findAndModify({
                                    _id:MongoId(data.tuid.toString()),
                                    'round1.player.uid':MongoId(client.uid)
                                },{},{
                                    $set:{
                                        'round1.0.player.$.socketid':client.socketid
                                    }
                                },{new:true},function(err,turData){
                                   */

                                if (!err && turData.length > 0) {

                                    var sData = { en: 'CTJ', data: { jid: udata.reConnID } };
                                    playExchange.publish('table.' + data.tuid, sData);


                                    /* if(io.sockets.connected[client.socketid]){
    
            
                                        io.sockets.connected[client.socketid].leave(data.tuid);
                                        io.sockets.connected[client.socketid].join(data.tuid);
    
    
    
                                    }*/

                                    /*io.of('/').adapter.remoteLeave(client.socketid, data.tuid, (err) => {
                                      if (err) { console.log("Not Connect ",client.socketid) }
                                        
                                    });*/

                                    io.of('/').adapter.remoteJoin(client.socketid, data.tuid, (err) => {
                                        /*if (err) { console.log("Not Connect ",client.socketid) }*/

                                    });





                                    /*db.collection("tournament").update({
                                        _id:MongoId(data.tuid.toString()),
                                        'round2.player.uid':MongoId(client.uid)
                                    },{$set:{"round2.0.player.$.socketid":client.socketid}},function(){
    
    
                                        var update={$set:{}}
    
                                        update["$set"]["round1."+data.tsi+".player.$.socketid"]=client.socketid;
                                        
    
                                        db.collection("tournament").update({
                                            _id:MongoId(data.tuid.toString()),
                                            'round1.player.uid':MongoId(client.uid)
                                        },update,function(){
    
                                        })
    
                                    })*/



                                    db.collection('game_users').update({ _id: MongoId(client.uid.toString()) },
                                        {
                                            $set: {
                                                reConnID: "",
                                            }
                                        }, { w: 0 });

                                    rclient.hmset('session:' + client.socketid, 'toid', turData[0]._id.toString());

                                    cdClass.SendData(client, 'TD', turData[0], "error:0000");

                                } else {

                                    db.collection('game_users').update({
                                        _id: MongoId(client.uid.toString())
                                    },
                                        {
                                            $set: {
                                                reConnID: "",
                                            }
                                        }, { w: 0 });

                                    var sData = { en: 'CTJ', data: { jid: udata.reConnID } };
                                    playExchange.publish('table.' + data.tbid, sData);

                                    cdClass.SendData(client, 'RGTI', {}, "error:9000");

                                }
                            });
                        }
                    }
                }
            });

        }
    },
    TimeCofig: (tbData, client) => {
        var tbId = tbData._id.toString();
        var st = new Date();

        client.tbid = tbId;
        rclient.hmset('session:' + client.socketid, "tbid", tbId);

        var t = config.TT;

        if (tbData.t_status === 'GameStartTimer' || tbData.t_status === "NewRoundStarted") {

            tbData.round_timer = com._getdatedifference(tbData.ctt, st, 'second');
            //if round time some time 50 up bcz connect 
            if (tbData.round_timer > 6) {
                tbData.round_timer = 4;
            }
            tbData.left_time = 0
        }
        else if (tbData.t_status === 'RoundStarted' || tbData.t_status === 'RoundStartedPass') {
            tbData.round_timer = 0;

            tbData.left_time = parseInt(t) - com._getdatedifference(tbData.ctt, st, 'second');

        }
        else {
            tbData.round_timer = 0;
            tbData.left_time = 0;
        }

        if (tbData.left_time < 0) {
            tbData.left_time = 0
        }

        tbData.closedec_length = tbData.close_deck.length;

        /*for (var x in tbData.pi) {
            if (typeof tbData.pi[x].si != 'undefined' && tbData.pi[x].cards != null) {
                tbData.pi[x].cl = tbData.pi[x].cards.length;
                delete tbData.pi[x].cards;
            }
        }*/
    }
}