const util = require('util')
const schedule = require('node-schedule');
const _ = require("underscore");
com = require('./comm_function_class.js');
cdClass = require('./common.class.js');
compClass = require("./comp.class.js");
schedulerClass = require('./scheduler.class.js');
mechanismClass = require('./mechanismofPlaying.class.js');
TournamnetClass = require('./tournament.class.js');

module.exports = {

    /*
        User Boot value cutting
        get user card and set 
    */
    CollectingBootValue: (tbldata) => {
        cdClass.GetTableData(tbldata.tbId.toString(), {}, function (table) {


            if (!table || table.ap < 2 || table.t_status != 'GameStartTimer') {
                var cpl = []
                if (table && table.pi != undefined)
                    cpl = mechanismClass.GetContinuePlayingUserInRound(table.pi);

                if (cpl.length == 1 && cpl[0].ui.uid != undefined && cpl[0].ui.pp != undefined && cpl[0].ui.pn != undefined && cpl[0].ui.pn != null && table && table.stargame == 1 && table.ap == 1) {

                    StarPlayerClass.SendChallange({
                        uid: cpl[0].ui.uid.toString(),
                        pp: cpl[0].ui.pp,
                        pn: cpl[0].ui.pn,
                    }, tbldata.tbId.toString(), table.bv, table.mode, table.point)
                    setTimeout(() => {
                        schedulerClass.RobotSection(tbldata.tbId.toString(), 1);
                    }, config.WAITTIME * 1000)
                }

                return false;
            }

            mechanismClass.GetCardsForGame(table, function (table, ap, uSeats) {

                if (ap > 1) {

                    var jobId = com.GetRandomString(10);

                    var SetOFuser = [];
                    var uid = [];

                    if (typeof table.touId != 'undefined' && table.touId != "") {

                        for (var y in uSeats) {
                            SetOFuser.push(uSeats[y]);
                            uid.push(MongoId(y.toString()));
                            if (table.status == 1) {
                                trackClass.TrackGemsQuestGame(y.toString(), 3)
                            }
                        }

                        if (table.status == 1) {
                            cdClass.CountGame({ _id: { $in: uid } }, table.mode, 1);

                        }
                    } else {

                        for (var y in uSeats) {

                            if (table.isleague == 1 && table.league_free_game == 0) {

                                db.collection("game_users").update({ _id: MongoId(y) }, { $set: { league_free_game: 1 }, $inc: { 'counters.tlp': 1 } }, () => { })

                                if (table.pi[uSeats[y]].ui._iscom == 0) {
                                    trackClass.EventTracking(y.toString(), 1, "Join Champions League")
                                }

                            } else if (table.stargame != undefined && table.stargame == 1) {
                                cdClass.updateUserGold(y, -table.bv, 'Collect Gold For Star Game - ' + table._id.toString(), 44);

                                trackClass.TrackSpinGame(y, 32, 1)
                                

                                var upset = {
                                    $inc: {
                                        "pi.$.stargame": 1
                                    }
                                }

                                if (table.pi[uSeats[y]].stargame + 1 >= config.totalgame) {

                                    upset["$push"] = {
                                        isleave: y
                                    }

                                    db.collection("game_users").update({ _id: MongoId(y) },
                                        { $inc: { 'stargame.playedgame': 1, sxp: 2 }, $set: { 'stargame.ispay': 0 } }, () => {

                                        })

                                } else {
                                    db.collection("game_users").update({ _id: MongoId(y) },
                                        { $inc: { 'stargame.playedgame': 1, sxp: 2 } }, () => {

                                        })
                                }
                                db.collection("playing_table").update({ _id: MongoId(tbldata.tbId), "pi.si": uSeats[y] }, upset, () => {

                                })
                                /*cdClass.UpdateTableData(tbldata.tbId,upset,
                                    function () {})*/

                                trackClass.TrackGemsQuestGame(y.toString(), 3)

                                /*db.collection("game_users").update({ _id: MongoId(y) },
                                    { $inc: { 'stargame.playedgame': 1,'sxp': 2  } },() => { 
                                    
                                })*/
                            } else {
                                if (table.isleague == 1) {

                                    db.collection("game_users").update({ _id: MongoId(y) }, { $inc: { 'counters.tlp': 1 } }, () => { })

                                    trackClass.EventTracking(y.toString(), 1, "Join Champions League")

                                    if (table.pi[uSeats[y]].ui._iscom == 0) {

                                        trackClass.ChipsTracking(y.toString(), Math.abs(table.bv), "Collect Gold For Champions League")
                                    }
                                }


                                if (table.isleague == undefined || table.isleague == 0 || table.isleague == 1) {

                                    if (table.isleague == undefined || table.isleague == 0) {

                                        trackClass.TrackGemsQuestGame(y.toString(), 3)
                                        
                                    }


                                    trackClass.TrackSpinGame(y, 12, table.bv)


                                    cdClass.updateUserGold(y, -table.bv, 'Collect Gold For Game - ' + table._id.toString(), 17);
                                }
                                trackClass.TrackGemsQuestGame(y.toString(), 3)


                            }

                            SetOFuser.push(uSeats[y]);
                            uid.push(MongoId(y.toString()));
                            trackClass.TrackQuestGame(y.toString())

                        }

                    }



                    if (table.isnotiid != undefined && table.isnotiid != "" && table.isnotiid.length == 24) {
                        db.collection("notification").update({ _id: MongoId(table.isnotiid) }, { $inc: { playgame: 1 } }, (err, tab) => {

                            db.collection("notification").deleteOne({ _id: MongoId(table.isnotiid), playgame: { $gte: 5 } }, (err, rm) => {


                                if (!err && rm.result.n == 1) {

                                    cdClass.UpdateTableData(tbldata.tbId.toString(), {
                                        $set: {
                                            isnotiDelete: true
                                        }
                                    },
                                        function () { })
                                }

                            })
                        })
                    } else if (table.bv == 750000) {
                        var playtype = com.GetRandomInt(1, 5)
                        var isbiggin = (playtype == 1 || playtype == 2) ? true : false

                        cdClass.UpdateTableData(tbldata.tbId.toString(), {
                            $set: {
                                notigameplay: playtype,
                                isbiggin: isbiggin
                            }
                        },
                            function () { })
                    }

                    var pv = 0;

                    if (table.league_free_game == undefined || table.league_free_game == 1)
                        pv = Number(table.bv * ap);

                    if (table.stargame != undefined && table.stargame == 1) {
                        pv = pv - Number((pv * 15) / 100)
                    }

                    if (table.tou == false && table.stargame == 0 && config.extra15per.indexOf(table.bv) != -1) {
                        pv = Number(Number(pv) - ((Number(pv) * 15) / 100))
                    }
                    cdClass.UpdateTableData(tbldata.tbId.toString(), {
                        $set: {
                            t_status: 'CollectingBootValue',
                            isNextround: 'CollectingBootValue',
                            pv: pv,
                            jid: jobId,
                            ctt: new Date(),
                            'pi.$[].pickopendackcard': 0
                        }
                    },
                        function () {

                            if (table._ip && table.stargame == 0) {

                                db.collection("game_users").update({ _id: { $in: uid }, "flags._iscom": 0 }, { $inc: { 'counters.tpp': 1 } }, () => { })
                            }

                            if (typeof table.touId == 'undefined' || table.touId == "") {

                                cdClass.CountGame({ _id: { $in: uid }, "flags._iscom": 0 }, table.mode, 0, table.isleague);
                                if (table.league_free_game == undefined || table.league_free_game == 1) {
                                    cdClass.SendDataToTable(tbldata.tbId, {
                                        en: 'CBV',
                                        data: {
                                            s: SetOFuser,
                                            time: config.CBAT * 1000,//animation to *100
                                            bv: table.bv,
                                            pv: pv
                                        }
                                    });
                                }
                            }

                            var cbvTime = com.AddTime(config.CBAT);

                            schedule.scheduleJob(jobId, new Date(cbvTime), function () {
                                schedule.cancelJob(jobId);
                                schedulerClass.StartDealingCard({ tbId: tbldata.tbId });
                            });
                        });
                }
            });
        });
    },
    CollectingBootValueAfterRound: (tbldata) => {
        cdClass.GetTableData(tbldata.tbId.toString(), {}, function (table) {


            if (!table || table.ap < 2 /*|| table.t_status != 'GameStartTimer'*/) {
                return false;
            }

            mechanismClass.GetCardsForNewRound(table, function (table, ap, uSeats) {

                if (ap > 1) {
                    var jobId = com.GetRandomString(10);
                    cdClass.UpdateTableData(tbldata.tbId.toString(), {
                        $set: {
                            t_status: 'CollectingBootValue',
                            isNextround: 'CollectingBootValue',
                            jid: jobId,
                            ctt: new Date(),
                            'pi.$[].pickopendackcard': 0
                        }
                    }, () => {

                        //schedulerClass.StartDealingCard({tbId: tbldata.tbId});
                        var cbvTime = com.AddTime(config.CBAT);

                        schedule.scheduleJob(jobId, new Date(cbvTime), function () {
                            schedule.cancelJob(jobId);
                            schedulerClass.StartDealingCard({ tbId: tbldata.tbId });
                        });
                    });
                }
            });
        });
    },
    /*
        StartDealingCard 
        count Total play user and starting Deal card 
    */
    StartDealingCard: (data) => {
        cdClass.GetTableData(data.tbId, {
            pi: 1,
            close_deck: 1,
            open_deck: 1,
            touId: 1,
            tou: 1,
            status: 1,
            mode: 1,
            trackercard:1
        }, function (table) {
            if (table) {
                var pu = mechanismClass.TotalPlayedUser(table.pi);

                if (pu.length < 2) {
                    return false;
                }

                var cards = []
                var seats = [];
                for (var f in pu) {
                    if (typeof pu[f] != 'undefined') {
                        if (pu[f] != null && typeof pu[f].si != 'undefined') {
                            seats.push(pu[f].si);
                            cards.push(pu[f].cards);
                        }
                    }
                }

                //console.log("cards:::::::::::::::",cards)
                var jobId = com.GetRandomString(10);

                var maindeadwood = 0;
                switch (table.mode) {

                    case 1:
                    case 4:
                        maindeadwood = 10;
                        break;
                    case 3:
                    case 6:
                        maindeadwood = (parseInt(table.open_deck[0].split('-')[1]) > 10) ? 10 : (table.open_deck[0].split('-')[0] == 'j') ? 0 : parseInt(table.open_deck[0].split('-')[1]);
                        break;

                }
                cdClass.UpdateTableData(data.tbId, {
                    $set: {
                        t_status: 'StartDealingCard',
                        jid: jobId,
                        maindeadwood: maindeadwood
                    }
                }, function () {
                    var catimer = (seats.length == 2) ? 4 : 6;
                    cdClass.SendDataToTable(data.tbId, {
                        en: 'SDC',
                        data: {
                            s: seats,
                            time: catimer,
                            open_deck: table.open_deck,
                            maindeadwood: maindeadwood,
                            cards: cards,
                            trackercard:table.trackercard
                        }
                    });

                    var chooseTurnTime = com.AddTime(catimer);

                    schedule.scheduleJob(jobId, new Date(chooseTurnTime), function () {
                        schedule.cancelJob(jobId);
                        schedulerClass.SelectUserForPassTurn({ tbId: data.tbId });
                    });
                });
            } else {
                console.log("else DealCards ::::::::::::::::--------------------->>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", table);
            }
        });
    },
    /*
        Staring User Turn
        random find user and set turn
    */
    SelectUserForPassTurn: (tbdata) => {
        cdClass.GetTableData(tbdata.tbId, {}, (tb) => {

            var cpl = mechanismClass.TotalPlayedUser(tb.pi);

            if (cpl.length == 1) {
                mechanismClass.DeclareWinnerPlayer(tb)
            }

            var totalAP = mechanismClass.TotalActiveUserSeat(tb.pi);
            if (tb == false || totalAP.length < 2)
                return false;

            var turnSeat = totalAP[com.GetRandomInt(0, totalAP.length - 1)];//mechanismClass.ChooseTurnFromSet(tb,tb.cd, 0);

            cdClass.UpdateTableData(tbdata.tbId, {
                $set: {
                    t_status: "RoundStartedPass",
                    closedecklock: 1,
                    opendecklock: 0
                }
            }, function () {
                if (tb.ap <= 1 || typeof tb.pi[turnSeat] == 'undefined') {
                    return false;
                }


                mechanismClass.StartUserPassedTurn(tb, {
                    nt: turnSeat, closedecklock: 1, opendecklock: 0
                });
            });

        });
    },
    SelectUserForTurn: (tbdata) => {
        cdClass.GetTableData(tbdata.tbId, {}, (tb) => {

            var cpl = mechanismClass.TotalPlayedUser(tb.pi);


            if (cpl.length == 1) {
                mechanismClass.DeclareWinnerPlayer(tb)
            }


            var totalAP = mechanismClass.TotalActiveUserSeat(tb.pi);
            if (tb == false || totalAP.length < 2)
                return false;



            var turnSeat = totalAP[com.GetRandomInt(0, totalAP.length - 1)];//mechanismClass.ChooseTurnFromSet(tb,tb.cd, 0);

            cdClass.UpdateTableData(tbdata.tbId, {
                $set: {
                    t_status: "RoundStarted",
                    isNextround: "RoundStarted"
                }
            }, function () {
                if (tb.ap <= 1 || typeof tb.pi[turnSeat] == 'undefined') {
                    //console.log("return not user find to user turn ");
                    return false;
                }

                mechanismClass.StartUserTurn(tb, {
                    nt: turnSeat,
                    opendecklock: 1,
                    closedecklock: 0
                });
            });
        });
    },
    OnTurnExpire: (obj) => {

        obj.ti = parseInt(obj.ti);
        cdClass.GetTableData(obj.tbId, {}, (tb) => {
            if (tb) {
                if (typeof tb.pi[tb.ti] != 'undefined') {
                    if (tb.t_status == "RoundStarted" && typeof tb.pi[tb.ti].si != 'undefined' && tb.pi[tb.ti].cards != null) {

                        var tc = '';
                        var cl = tb.pi[tb.ti].cards.length;

                        if (tb.pi[tb.ti].status == 'PFCD') {
                            //lpc
                            tc = tb.pi[tb.ti].lpc;

                            if (tc != undefined && tc != null) {

                                if (tc.split("-")[0] == "j" && tb.pi[tb.ti].cards.indexOf(tc) == -1) {
                                    for (var i = 0; i < tb.pi[tb.ti].cards.length; i++) {

                                        if (tb.pi[tb.ti].cards[i].split("-")[3] == tc.split("-")[1]) {
                                            tc = tb.pi[tb.ti].cards[i];
                                            break;
                                        }
                                    }
                                }


                                var index = tb.pi[tb.ti].cards.indexOf(tc)
                                tb.pi[tb.ti].cards.splice(index, 1)

                                if (tb.mode == 4 || tb.mode == 5 || tb.mode == 6) {
                                    for (var i = 0; i < tb.pi[tb.ti].cards.length; i++) {
                                        if (tb.pi[tb.ti].cards[i].split("-")[2] == 'j') {
                                            tb.pi[tb.ti].cards[i] = tb.pi[tb.ti].cards[i].split("-")[2] + "-" + tb.pi[tb.ti].cards[i].split("-")[3]
                                        }
                                    }
                                }

                                if (tb.pi[tb.ti].cards.length > 11) {
                                    console.log("Time Out ma Card Throw card length ", tb.pi[tb.ti].cards)
                                }


                                var fspc = gamelogicClass.MakeSpadesForCards(tb.pi[tb.ti].cards);

                                var throwcard = tc;
                                if (throwcard.split("-")[2] == "j") {
                                    throwcard = throwcard.split("-")[2] + "-" + throwcard.split("-")[3];
                                }

                                if (tb.mode == 4 || tb.mode == 5 || tb.mode == 6) {
                                    var totalspc = _.flatten(fspc)
                                    for (var i = 0; i < totalspc.length; i++) {
                                        if (totalspc[i].split("-")[2] == 'j') {
                                            var checkcard = totalspc[i].split("-")[2] + "-" + totalspc[i].split("-")[3];

                                            if (tb.pi[tb.ti].cards.indexOf(checkcard) != -1) {
                                                tb.pi[tb.ti].cards[tb.pi[tb.ti].cards.indexOf(checkcard)] = totalspc[i]
                                            }
                                        }
                                    }
                                }


                                var DATAUPdate = {
                                    $push: {
                                        "open_deck": throwcard
                                    },
                                    /*$pull: {
                                        "pi.$.cards": tc
                                    },*/
                                    $set: {
                                        "pi.$.cards": tb.pi[tb.ti].cards,
                                        "pi.$.status": "p", //bcz count it time out or not 
                                        "pi.$.ltc": tc,
                                        "pi.$.spc": fspc,
                                        "pi.$.lodpc": ""
                                    }
                                }
                                if(tc.split("-")[2] != undefined &&  tc.split("-")[2] == 'j'){
                                    const data= tc.split("-")
                                    DATAUPdate["$push"]["trackercard." + data[2]] = parseInt(data[3])
                                }else{
                                    const [card, value] = tc.split("-")
                                    DATAUPdate["$push"]["trackercard." + card] = parseInt(value)
                                }

                                db.collection('playing_table').findAndModify({
                                    _id: MongoId(obj.tbId.toString()),
                                    "pi.si": parseInt(tb.ti)
                                }, {},DATAUPdate , { new: true }, function (err, updata) {

                                    if (!err && updata.value != null) {

                                        var userData = updata.value.pi[tb.ti]


                                        var deadwood = gamelogicClass.PointCountDeadWood(userData.spc, userData.cards);
                                        var wh = { _id: MongoId(obj.tbId.toString()) }
                                        wh["pi.si"] = parseInt(tb.ti);

                                        var upData = { $set: {} };

                                        upData["$set"]["pi." + tb.ti + ".deadwood"] = deadwood;


                                        db.collection("playing_table").findAndModify(wh, {}, upData, { new: true }, function (err, updata) {

                                            if (!err && updata.value != null) {

                                                delete wh;
                                                delete upData;
                                                delete userData;
                                                delete deadwood;

                                                cdClass.SendDataToTable(obj.tbId, {
                                                    en: 'TE',
                                                    data: {
                                                        si: obj.ti,
                                                        c: tc,
                                                        cc: ((tc != '') ? (cl - 1) : cl),
                                                        open_deck: updata.value.open_deck,
                                                        cards: updata.value.pi[tb.ti].cards,
                                                        turn_miss_cont: updata.value.pi[tb.ti].turn_miss_cont,
                                                        spc: updata.value.pi[tb.ti].spc,
                                                        deadwood: updata.value.pi[tb.ti].deadwood,
                                                        trackercard: (updata.value.trackercard != undefined) ? updata.value.trackercard : {}
                                                    }
                                                });

                                                if (/*tc != ''*/ /*&& tb.pi[tb.ti].cards.length - 1 <= 0)*/  tb.close_deck.length == 0) {
                                                    //tb.pi[tb.ti].cards = [];

                                                    setTimeout(function () {
                                                        mechanismClass.DeclareWinnerPlayer(tb)
                                                    }, 1000);//1000
                                                } else
                                                    mechanismClass.TimeOut(obj.tbId, obj.ti, tb, updata.value.opendecklock, updata.value.closedecklock);
                                            }
                                        })
                                    }
                                });

                            }

                        } else {

                            if (tb.pi[tb.ti].cards.length > 11) {
                                console.log("else Time Out ma Card Throw card length ", tb.pi[tb.ti].cards)
                            }

                            cdClass.SendDataToTable(obj.tbId, {
                                en: 'TE',
                                data: {
                                    si: obj.ti,
                                    c: tc,
                                    cc: ((tc != '') ? (cl - 1) : cl),
                                    open_deck: tb.open_deck,
                                    cards: tb.pi[tb.ti].cards,
                                    turn_miss_cont: tb.pi[tb.ti].turn_miss_cont + 1,
                                    spc: tb.pi[tb.ti].spc,
                                    deadwood: tb.pi[tb.ti].deadwood,
                                    trackercard: (tb.trackercard != undefined) ? tb.trackercard : {}
                                }
                            });

                            if (/*tc != ''*/ /*&& tb.pi[tb.ti].cards.length - 1 <= 0) */ tb.close_deck.length == 0) {
                                tb.pi[tb.ti].cards = [];

                                cdClass.UpdateUserData(tb.pi[tb.ti].ui.uid.toString(), { $set: { lgsn: 2 } }, function () { });

                                setTimeout(function () {
                                    mechanismClass.DeclareWinnerPlayer(tb)
                                }, 1000);
                            } else
                                mechanismClass.TimeOut(obj.tbId, obj.ti, tb, obj.opendecklock, obj.closedecklock);
                        }
                    } else {
                        console.log("OnTurnExpire else 11");
                    }
                } else {
                    console.log("OnTurnExpire tb.pi else");
                }
            } else {
                console.log("OnTurnExpire tb else");
            }
        });
    },
    OnTurnExpirePass: (obj) => {

        obj.ti = parseInt(obj.ti);
        cdClass.GetTableData(obj.tbId, {}, function (tb) {
            if (tb) {
                if (typeof tb.pi[tb.ti] != 'undefined') {

                    if ((tb.t_status == "RoundStartedPass" || tb.t_status == "RoundStarted") && typeof tb.pi[tb.ti].si != 'undefined' && tb.pi[tb.ti].cards != null) {

                        var tc = '';
                        var cl = tb.pi[tb.ti].cards.length;

                        if (tb.pi[tb.ti].status == 'PFODPU' || tb.pi[tb.ti].status == 'PFCD') {

                            tc = tb.pi[tb.ti].lpc;

                            if (tc != undefined && tc != null) {

                                if (tc.split("-")[0] == "j" && tb.pi[tb.ti].cards.indexOf(tc) == -1) {
                                    for (var i = 0; i < tb.pi[tb.ti].cards.length; i++) {

                                        if (tb.pi[tb.ti].cards[i].split("-")[3] == tc.split("-")[1]) {
                                            tc = tb.pi[tb.ti].cards[i];
                                            break;
                                        }
                                    }
                                }


                                var index = tb.pi[tb.ti].cards.indexOf(tc)
                                tb.pi[tb.ti].cards.splice(index, 1)

                                if (tb.mode == 4 || tb.mode == 5 || tb.mode == 6) {
                                    for (var i = 0; i < tb.pi[tb.ti].cards.length; i++) {
                                        if (tb.pi[tb.ti].cards[i].split("-")[2] == 'j') {
                                            tb.pi[tb.ti].cards[i] = tb.pi[tb.ti].cards[i].split("-")[2] + "-" + tb.pi[tb.ti].cards[i].split("-")[3]
                                        }
                                    }
                                }
                                var fspc = gamelogicClass.MakeSpadesForCards(tb.pi[tb.ti].cards);

                                var throwcard = tc;
                                if (throwcard.split("-")[2] == "j") {
                                    throwcard = throwcard.split("-")[2] + "-" + throwcard.split("-")[3];
                                }

                                if (tb.mode == 4 || tb.mode == 5 || tb.mode == 6) {
                                    var totalspc = _.flatten(fspc)
                                    for (var i = 0; i < totalspc.length; i++) {
                                        if (totalspc[i].split("-")[2] == 'j') {
                                            var checkcard = totalspc[i].split("-")[2] + "-" + totalspc[i].split("-")[3];

                                            if (tb.pi[tb.ti].cards.indexOf(checkcard) != -1) {
                                                tb.pi[tb.ti].cards[tb.pi[tb.ti].cards.indexOf(checkcard)] = totalspc[i]
                                            }
                                        }
                                    }
                                }

                                var DATAUPdate = {
                                    $push: {
                                        open_deck: throwcard
                                    },
                                  
                                    $set: {
                                        "pi.$.cards": tb.pi[tb.ti].cards,
                                        "pi.$.status": "p",
                                        "pi.$.ltc": tc,
                                        "pi.$.spc": fspc,
                                        "pi.$.lodpc": ""
                                    }
                                }

                                if(tc.split("-")[2] != undefined &&  tc.split("-")[2] == 'j'){
                                    const data= tc.split("-")
                                    DATAUPdate["$push"]["trackercard." + data[2]] = parseInt(data[3])
                                }else{
                                    const [card, value] = tc.split("-")
                                    DATAUPdate["$push"]["trackercard." + card] = parseInt(value)
                                }


                                db.collection('playing_table').findAndModify({
                                    _id: MongoId(obj.tbId.toString()),
                                    "pi.si": parseInt(tb.ti)
                                }, {},DATAUPdate,{ new: true }, function (err, ups) {

                                    if (!err && ups.value != null) {

                                        var userData = ups.value.pi[tb.ti]

                                        var deadwood = gamelogicClass.PointCountDeadWood(userData.spc, userData.cards);
                                        var wh = { _id: MongoId(obj.tbId.toString()) }
                                        wh["pi.si"] = parseInt(tb.ti);

                                        var upData = { $set: {} };

                                        upData["$set"]["pi." + tb.ti + ".deadwood"] = deadwood;


                                        db.collection("playing_table").findAndModify(wh, {}, upData, { new: true }, function (err, ups) {

                                            if (!err && ups.value != null) {

                                                delete wh;
                                                delete upData;
                                                delete userData;
                                                delete deadwood;

                                                if (ups.value.pi[tb.ti].cards.length > 11) {
                                                    console.log("PASS Time Out ma Card Throw card length ", ups.value.pi[tb.ti].cards)
                                                }

                                                cdClass.SendDataToTable(obj.tbId, {
                                                    en: 'TE',
                                                    data: {
                                                        si: obj.ti,
                                                        c: tc,
                                                        cc: ((tc != '') ? (cl - 1) : cl),
                                                        open_deck: ups.value.open_deck,
                                                        cards: ups.value.pi[tb.ti].cards,
                                                        turn_miss_cont: ups.value.pi[tb.ti].turn_miss_cont,
                                                        spc: ups.value.pi[tb.ti].spc,
                                                        deadwood: ups.value.pi[tb.ti].deadwood,
                                                        trackercard: (ups.value.trackercard != undefined) ? ups.value.trackercard : {}
                                                    }
                                                });

                                                mechanismClass.ChangeTableTurn(obj.tbId, {
                                                    pt: tb.ti,
                                                    opendecklock: 0,
                                                    closedecklock: 0
                                                });

                                                /*var iData = {
                                                    $inc: {
                                                        "pi.$.turn_miss_cont": 1
                                                    }
                                                };
                                                tb.pi[obj.ti].turn_miss_cont = tb.pi[obj.ti].turn_miss_cont + 1;
                                                cdClass.UpdateTableData({
                                                    _id: MongoId(obj.tbId),
                                                    "pi.si": Number(obj.ti)
                                                }, iData, function () {

                                                });*/
                                            } else {
                                                console.log("update Not in pass tuen expire")
                                            }
                                        })
                                    }
                                });
                            }
                            //TE pela uts aavi jati hati atle 
                            /*mechanismClass.ChangeTableTurn(obj.tbId, {
                                pt: tb.ti,
                                opendecklock:0,
                                closedecklock:0
                            });*/

                        } else {

                            var wh = { _id: MongoId(obj.tbId.toString()) }
                            wh["pi.si"] = parseInt(tb.ti)

                            wh["pi." + parseInt(tb.ti) + ".status"] = { $nin: ["PFODPU", "PASS"] };

                            /*{
                                _id: MongoId(obj.tbId.toString()),
                                "pi.si": parseInt(tb.ti)
                            }*/

                            db.collection('playing_table').findAndModify(wh, {}, {
                                $push: {
                                    PassUser: parseInt(tb.ti)
                                },
                                $set: {
                                    "pi.$.status": "PASS",
                                    "pi.$.ispass": 1,
                                },
                                $inc: {
                                    "pi.$.turn_miss_cont": 1
                                }
                            }, { new: true }, function (err, ups) {
                                if (!err && ups.value != null) {

                                    if (tb.pi[tb.ti].cards.length > 10) {
                                        console.log("else PASS else Time Out ma Card Throw card length ", tb.pi[tb.ti].cards)
                                    }

                                    cdClass.SendDataToTable(obj.tbId, {
                                        en: 'TE',
                                        data: {
                                            si: obj.ti,
                                            c: tc,
                                            cc: ((tc != '') ? (cl - 1) : cl),
                                            open_deck: tb.open_deck,
                                            cards: tb.pi[tb.ti].cards,
                                            turn_miss_cont: ups.value.pi[tb.ti].turn_miss_cont,
                                            spc: ups.value.pi[tb.ti].spc,
                                            deadwood: ups.value.pi[tb.ti].deadwood,
                                            trackercard: (ups.value.trackercard != undefined) ? ups.value.trackercard : {}
                                        }
                                    });

                                    var playeduser = mechanismClass.TotalActiveUserSeat(ups.value.pi);

                                    if (ups.value.PassUser.length >= playeduser.length) {
                                        db.collection("playing_table").update({ _id: MongoId(obj.tbId) }, {
                                            $set: {
                                                opendecklock: 1,
                                                closedecklock: 0
                                            }
                                        }, () => {
                                            //schedulerClass.SelectUserForTurn({tbId: obj.tbId})
                                            mechanismClass.ChangeTableTurn(obj.tbId, {
                                                pt: parseInt(tb.ti),
                                                opendecklock: 1,
                                                closedecklock: 0
                                            });
                                        })
                                    } else {
                                        mechanismClass.ChangeTablePassedTurn(obj.tbId, {
                                            pt: parseInt(tb.ti),
                                            opendecklock: 0,
                                            closedecklock: 1
                                        });
                                    }

                                } else {
                                    //console.log("else status :::::::::::::::::::::::: ")
                                    schedulerClass.OnTurnExpirePass(obj);
                                }
                            });
                        }
                    } else {
                        console.log("OnTurnExpirePass else 11");
                    }
                } else {
                    console.log("OnTurnExpirePass tb.pi else");
                }
            } else {
                console.log("OnTurnExpirePass  tb else");
            }
        });
    },
    AfterRoundFinish: (obj) => {

        db.collection('playing_table').findAndModify({
            _id: MongoId(obj.tbId),
            t_status: "WinnerDeclared"
        }, {}, {
            $set: {
                t_status: 'NewRoundStarted',
                PassUser: [],
                "trackercard": {
                    l: [],
                    c: [],
                    k: [],
                    f: [],
                    j: []
                }
            },
            $inc: {
                round: 1
            },
        }, { new: true }, function (err, update) {

            if (!err && update.value != null) {


                var count = 0;
                var TotalActiveUser = 0;
                for (var x in update.value.pi) {

                    if (typeof update.value.pi[x].ui != 'undefined' && update.value.pi[x].ui._iscom == 0) {
                        count++;
                    }

                    if (typeof update.value.pi[x] == 'object' && update.value.pi[x] != null && typeof update.value.pi[x].si != 'undefined' && update.value.pi[x].status != '') {
                        TotalActiveUser++;
                    }
                }


                if (count == 0) {

                    compClass.ExitGameOfRobot(update.value._id);

                } else {

                    if (TotalActiveUser <= 1) { //two user leave thai to atle <= 1 kariyu pela == 1 hatu 
                        cdClass.UpdateTableData(update.value._id.toString(), {
                            $set: {
                                t_status: 'FWinnerDeclaredStart',
                                isgamewin: 1,
                                ctt: new Date()
                            }
                        }, function (up) {

                            setTimeout(function () {
                                mechanismClass.FinalDeclareWinnerPlayer(update.value)
                            }, 10000)

                        })
                    } else {
                        mechanismClass.LestsPlayAfterRound(obj.tbId);
                    }
                }

            }
        });
    },
    AfterGameFinish: (obj) => {

        db.collection('playing_table').findAndModify({
            _id: MongoId(obj.tbId),
            t_status: "FWinnerDeclared"
        }, {}, {
            $set: {
                t_status: '',
                PassUser: [],
                score: [],
                round: 1,
                maindeadwood: 0,
                turncount: -1,
                isgamewin: 0,
                "trackercard": {
                    l: [],
                    c: [],
                    k: [],
                    f: [],
                    j: []
                },
                isleave:[],
            }
        }, { new: true }, function (err, update) {

            if (!err && update.value != null) {

                var cpl = mechanismClass.GetContinuePlayingUserInRound(update.value.pi);
                if (cpl.length <= 1) {
                    var count = 0;
                    for (var x in update.value.pi) {
                        if (typeof update.value.pi[x].ui != 'undefined' && update.value.pi[x].ui._iscom == 0) {
                            count++;
                        }
                    }

                    if (count == 0 && update.value.stargame == 0) {

                        compClass.ExitGameOfRobot(update.value._id);

                    } else {
                        //Final Winner
                        if (update.value._ip == 0) {
                            compClass.PutCompToPlay(obj.tbId);
                        } else {
                            cdClass.SendDataToTable(obj.tbId.toString(), {
                                en: 'GST', //Game  Satrt Timer 
                                data: {
                                    Time: config.RST,
                                    round: update.value.round,
                                    table: (update.value.tou == false) ? {} : { data: update.value }
                                }
                            });
                        }

                        if (cpl[0].ui != undefined && cpl[0].ui.uid != undefined && cpl[0].ui.pp != undefined && cpl[0].ui.pn != undefined && cpl[0].ui.pn != null && update.value.stargame == 1 && count == 1 && update.value.ap == 1) {

                            StarPlayerClass.SendChallange({
                                uid: cpl[0].ui.uid.toString(),
                                pp: cpl[0].ui.pp,
                                pn: cpl[0].ui.pn,

                            }, obj.tbId.toString(), update.value.bv, update.value.mode, update.value.point)


                            setTimeout(() => {
                                schedulerClass.RobotSection(obj.tbId.toString(), 1);
                            }, config.WAITTIME * 1000)
                        }

                    }
                } else {
                    mechanismClass.LestsPlay(obj.tbId);
                }
            }
        });
    },
    AfterExitRoundStart: (obj) => {

        db.collection('playing_table').findAndModify({
            _id: MongoId(obj.tbId),
            $or: [
                { t_status: "GameStartTimer" },
                { t_status: "" }
            ]
        }, {}, {
            $set: {
                t_status: '',
                round: 1,
                turncount: -1,
                "trackercard": {
                    l: [],
                    c: [],
                    k: [],
                    f: [],
                    j: []
                }
            }
        }, { new: true }, function (err, update) {


            if (!err && update.value != null) {

                var cpl = mechanismClass.GetContinuePlayingUserInRound(update.value.pi);
                if (cpl.length <= 1) {

                    var count = 0;
                    for (var x in update.value.pi) {
                        if (typeof update.value.pi[x].ui != 'undefined' && update.value.pi[x].ui._iscom == 0) {
                            count++;
                        }
                    }

                    if (count == 0) {


                        setTimeout(function () {
                            compClass.ExitGameOfRobot(update.value._id);
                        }, 200)
                        /*if(typeof update.value._id != 'undefined' && update.value._id.toString().length > 23)
                        {
                            //console.log("else index index 2");
                            for(var x in update.value.pi)
                            {
                                if(typeof update.value.pi[x].ui != 'undefined' && update.value.pi[x].ui._iscom == 0)
                                {
                                    compClass.CompForFree(update.value.pi[x].ui.uid.toString());

                                }
                            }

                            //db.collection('playing_table').remove({_id:MongoId(update.value._id.toString())},function(){});
                            //console.log("playing_table return")
                            return false;
                        }*/

                    } else {
                        if (update.value._ip == 0) {
                            compClass.PutCompToPlay(obj.tbId);
                        }


                        mechanismClass.LestsPlay(obj.tbId);
                    }
                } else {
                    mechanismClass.LestsPlay(obj.tbId);
                }
            }
        });
    },
    //Playing scation=====================================================
    //============================Robot Section ==========================
    ChooseRobotToPassTurn: (tb) => { //robot pass turn 

        cdClass.GetTableData(tb.tbId, function (table) {
            if (!table) {
                return false;
            }

            //if winner declared or no user exists on the table then we don't need to take any action from robot
            if (table.t_status != 'RoundStartedPass' || typeof table.pi[table.ti] == 'undefined' || table.pi[table.ti] == null || typeof table.pi[table.ti].si == 'undefined') {
                //console.log("table.t_status",table.t_status)
                return false;
            }

            rclient.hgetall('session:' + table.pi[table.ti].ui.uid.toString(), function (err, ct) {


                if (ct == null) {
                    return false;
                }

                ct.si = parseInt(ct.si);
                ct._iscom = parseInt(ct._iscom);

                var rinfo = table.pi[table.ti];


                if (table.open_deck.length > 0 && rinfo.cards != null) {

                    rinfo.cards.push(table.open_deck[table.open_deck.length - 1]);
                    var spCards = gamelogicClass.CheckCardsForSpread(rinfo.cards);


                    if (typeof spCards != 'undefined' && spCards.length > 0 && _.flatten(spCards).indexOf(table.open_deck[table.open_deck.length - 1]) != -1) {
                        rinfo.cards.pop();
                        mechanismClass.PFODPU({}, ct);
                        return false;
                    } else {

                        rinfo.cards.pop();
                        mechanismClass.PASS({}, ct);
                        return false;

                    }
                }
            });
        });
    },
    ChooseRobotToTurn: (tb) => {
        cdClass.GetTableData(tb.tbId, function (table) {
            if (!table) {
                return false;
            }

            //if winner declared or no user exists on the table then we don't need to take any action from robot
            if (table.t_status != 'RoundStarted' || typeof table.pi[table.ti] == 'undefined' || table.pi[table.ti] == null || typeof table.pi[table.ti].si == 'undefined') {

                return false;
            }

            rclient.hgetall('session:' + table.pi[table.ti].ui.uid.toString(), function (err, ct) {

                if (ct == null)
                    return false;

                ct.si = parseInt(ct.si);
                ct._iscom = parseInt(ct._iscom);


                if (table.isnotiid != undefined && table.isnotiid != "" && table.notigameplay != undefined) {
                    var issmart = true;


                    if ((table.notigameplay == 0 && table.exchange < 6) || (table.notigameplay == 1 && table.exchange < 4)) {
                        issmart = false
                    }


                    if (issmart) {
                        compClass.SmartLevalComp_Knock(table, ct);
                    } else {
                        compClass.HighLevalComp_Knock(table, ct);
                    }
                } else {

                    var issmart = false;
                    /*if(table.bv == 750000 &&  table.notigameplay != undefined && table.notigameplay != null){
                        issmart = true;
                        if(((table.notigameplay == 1 || table.notigameplay == 2)  && table.exchange < 6 ) || ((table.notigameplay == 4 || table.notigameplay == 5) && table.exchange < 4)){
                           issmart = false      
                        }
                    }*/ //remove this one 20-04-2021 call by BS 



                    if (issmart) {
                        compClass.SmartLevalComp_Knock(table, ct);
                    } else {
                        compClass.HighLevalComp_Knock(table, ct);
                    }
                }

                return false;

            });
        });
    },
    RobotThrowCard: (obj) => {



        mechanismClass.TC({
            c: obj.tc
        }, JSON.parse(obj.client)); //throwing card which was selected for robot to throw
    },
    RobotSection: (tbid, onlyrobotseat) => {
        dbClass.findDataOne("playing_table", { _id: MongoId(tbid.toString()) }, {}, {}, (table) => {
            if (table) {
                var c = 0;
                var uid = []
                for (var x in table.pi) {

                    if (typeof table.pi[x] != 'undefined' && typeof table.pi[x].ui != 'undefined' && table.pi[x].ui._iscom == 1) {
                        c++;
                    }


                    if (typeof table.pi[x] != 'undefined' && typeof table.pi[x].ui != 'undefined' && table.pi[x].ui._iscom == 0) {
                        uid.push(table.pi[x].ui.uid);
                    }
                }

                   
                    if (c >= 1) {
                        return false;
                    }

                    var wh = {};


                    wh = { "flags._iscom": 1, s: 'free' }
                   
                    dbClass.findDataOne("game_users", wh, {}, {}, (robotData) => {

                        if (robotData) {

                            var upData = { $inc: { chips: 1 }, $set: { status: "busy", tbid: tbid, socketid: robotData._id.toString() } };


                            if (table.bv * 2 > robotData.chips) {
                                //preper robot
                                upData["$inc"]['chips'] = table.bv * 2;
                                upData["$set"]['extragold'] = table.bv * 2;
                            }

                            var wh = {
                                _id: MongoId(tbid.toString()),
                                $and: [
                                    { "pi.ui._iscom": 0 },
                                    { "pi.ui._iscom": { $ne: 1 } }
                                ]
                            }

                            if (onlyrobotseat) {
                                wh = {
                                    _id: MongoId(tbid.toString()),
                                    ap: { $lte: 1 }
                                }
                            }

                            dbClass.findDataOne("playing_table", wh, {}, {}, (ftable) => {



                                if (ftable) {
                                    dbClass.findAndModify("game_users",
                                        { _id: MongoId(robotData._id) },
                                        upData,
                                        { new: true }, (rbdata) => {

                                            if (rbdata) {


                                                mechanismClass.FindSetAndJoin(tbid, ct)


                                            }
                                        });
                                } 

                            });
                        }
                    });
            }else {
                console.log("ROBOT Selection ", tbid.toString())
            }
        });
    },
    RobotCompSection: (tbid, si, callback) => {


        var h = new Date().getHours();

        var timetype = 1;
        if (h >= 0 && h <= 4) {
            timetype = 6;
        } else if (h >= 4 && h <= 8) {
            timetype = 5;
        } else if (h >= 8 && h <= 12) {
            timetype = 4;
        } else if (h >= 12 && h <= 16) {
            timetype = 3;
        } else if (h >= 16 && h <= 20) {
            timetype = 2;
        } else if (h >= 20 && h <= 24) {
            timetype = 1;
        }

        rclient.srandmember("Robot_free_" + timetype + "", 1, function (err, rrobot) {

            var wh = {};

            if (!err && rrobot != null && rrobot != undefined && rrobot.length == 24) {
                wh = { _id: MongoId(rrobot.toString()), s: 'free' }
            } else {
                wh = { "flags._iscom": 1, s: 'free' }
            }

            db.collection("game_users").findAndModify(wh, {},
                {
                    $set: { s: "busy", tbid: tbid, "flags._io": 1, si: si,/*socketid:rrobot.toString()*/ }
                }, { new: true }, function (err, rbdata) {
                    if (!err && rbdata.value != null) {

                        rclient.srem("Robot_free_" + timetype + "", rbdata.value._id.toString());
                        rclient.sadd("robots_busy", rbdata.value._id.toString());

                        rclient.hmset('session:' + rbdata.value._id, 'socketid', rbdata.value._id.toString());
                        rclient.hmset('session:' + rbdata.value._id, 'pn', "Computer");
                        rclient.hmset('session:' + rbdata.value._id, 'pp', "upload/image/comp.png");
                        rclient.hmset('session:' + rbdata.value._id, 'ult', rbdata.value.ult);
                        rclient.hmset('session:' + rbdata.value._id, 'uid', rbdata.value._id.toString());
                        rclient.hmset('session:' + rbdata.value._id, '_iscom', rbdata.value.flags._iscom);
                        rclient.hmset('session:' + rbdata.value._id, 'si', si);
                        rclient.hmset('session:' + rbdata.value._id, 'tbid', tbid.toString());
                        rclient.hmset('session:' + rbdata.value._id, 'v', parseInt(rbdata.value.version.aVersion));
                        rclient.hmset('session:' + rbdata.value._id, 'viplvl', parseInt(rbdata.value.vip_level.vip_lvl));



                        rclient.hmset('session:' + rbdata.value._id, 'comp', 1);

                        rclient.hgetall('session:' + rbdata.value._id, function (err, ct) {

                            callback(ct);
                            //mechanismClass.FindSetAndJoin(tbid,ct)

                        });
                    } else {
                        db.collection('game_users').aggregate([{ $match: { "flags._iscom": 1, s: 'free' } }, { $sample: { size: 1 } }]).toArray((err, robotData) => {
                            if (!err && robotData.length > 0) {
                                db.collection("game_users").findAndModify({ _id: MongoId(robotData[0]._id.toString()), s: 'free' }, {}, { $set: { s: "busy", tbid: tbid, "flags._io": 1, si: si } }, { new: true }, function (err, rbdata) {
                                    if (!err && rbdata.value != null) {

                                        rclient.srem("Robot_free_" + timetype + "", rbdata.value._id.toString());
                                        rclient.sadd("robots_busy", rbdata.value._id.toString());

                                        rclient.hmset('session:' + rbdata.value._id, 'socketid', rbdata.value._id.toString());
                                        rclient.hmset('session:' + rbdata.value._id, 'pn', "Computer");
                                        rclient.hmset('session:' + rbdata.value._id, 'pp', "upload/image/comp.png");
                                        rclient.hmset('session:' + rbdata.value._id, 'ult', rbdata.value.ult);
                                        rclient.hmset('session:' + rbdata.value._id, 'uid', rbdata.value._id.toString());
                                        rclient.hmset('session:' + rbdata.value._id, '_iscom', rbdata.value.flags._iscom);
                                        rclient.hmset('session:' + rbdata.value._id, 'si', si);
                                        rclient.hmset('session:' + rbdata.value._id, 'tbid', tbid.toString());
                                        rclient.hmset('session:' + rbdata.value._id, 'v', parseInt(rbdata.value.version.aVersion));
                                        rclient.hmset('session:' + rbdata.value._id, 'viplvl', parseInt(rbdata.value.vip_level.vip_lvl));



                                        rclient.hmset('session:' + rbdata.value._id, 'comp', 1);

                                        rclient.hgetall('session:' + rbdata.value._id, function (err, ct) {

                                            callback(ct);
                                            //mechanismClass.FindSetAndJoin(tbid,ct)

                                        });
                                    } else {
                                        console.log("COMP DATA not found 1348 bcz s:free vali con")
                                    }
                                });
                            }
                        });
                    }
                });
        });
    },
    RobotSectionForTournament: (tbid) => {

        db.collection("tournament").find({
            _id: MongoId(tbid.toString())
        }, { count: 1, bv: 1 }).toArray(function (err, toudata) {

            if (!err && toudata.length > 0 && toudata[0].count != 9) {

                var h = new Date().getHours();

                var timetype = 1;
                if (h >= 0 && h <= 4) {
                    timetype = 1;
                } else if (h >= 4 && h <= 8) {
                    timetype = 2;
                } else if (h >= 8 && h <= 12) {
                    timetype = 3;
                } else if (h >= 12 && h <= 16) {
                    timetype = 4;
                } else if (h >= 16 && h <= 20) {
                    timetype = 5;
                } else if (h >= 20 && h <= 24) {
                    timetype = 6;
                }

                rclient.srandmember("Robot_free_" + timetype + "", function (err, rrobot) {

                    var wh = {};

                    if (!err && rrobot != undefined && rrobot != null && rrobot != "") {
                        wh = { _id: MongoId(rrobot.toString()) }
                    } else {
                        wh = { "flags._iscom": 1, s: 'free' }
                    }

                    db.collection('game_users').find(wh).toArray((err, robotData) => {

                        if (!err && robotData.length > 0) {

                            var upData = { $inc: { chips: 1 }, $set: { s: "busy", touId: tbid, "flags._io": 1, socketid: robotData[0]._id.toString() } };


                            if (toudata[0].bv * 2 > robotData[0].chips) {
                                //preper robot
                                upData["$inc"]['chips'] = toudata[0].bv * 2;
                            }
                            db.collection("game_users").findAndModify({ _id: MongoId(robotData[0]._id) }, {},/*{$set:{s:"busy",tbid:tbid,"flags._io":1}}*/upData, { new: true }, function (err, rbdata) {

                                if (!err && rbdata.value != null) {

                                    rclient.hmset('session:' + rbdata.value._id, 'socketid', rbdata.value._id.toString());
                                    rclient.hmset('session:' + rbdata.value._id, 'pn', rbdata.value.pn);
                                    rclient.hmset('session:' + rbdata.value._id, 'pp', rbdata.value.pp);
                                    rclient.hmset('session:' + rbdata.value._id, 'ult', rbdata.value.ult);
                                    rclient.hmset('session:' + rbdata.value._id, 'uid', rbdata.value._id.toString());
                                    rclient.hmset('session:' + rbdata.value._id, '_iscom', rbdata.value.flags._iscom);
                                    rclient.hmset('session:' + rbdata.value._id, 'v', parseInt(rbdata.value.version.aVersion));
                                    rclient.hmset('session:' + rbdata.value._id, 'viplvl', parseInt(rbdata.value.vip_level.vip_lvl));


                                    rclient.srem("Robot_free_" + timetype + "", rbdata.value._id.toString());
                                    rclient.sadd("robots_busy", rbdata.value._id.toString());

                                    rclient.hgetall('session:' + rbdata.value._id, function (err, ct) {
                                        //mechanismClass.FindSetAndJoin(tbid,ct)
                                        TournamnetClass.findSeatTournament(tbid, ct);

                                        compClass.PutCompToTournament(tbid);
                                    });
                                } else {
                                    compClass.PutCompToTournament(tbid);
                                }
                            });
                        } else {
                            compClass.PutCompToTournament(tbid);
                        }
                    });
                });
            }
        })
    },
    //Robot section=======================================================
}