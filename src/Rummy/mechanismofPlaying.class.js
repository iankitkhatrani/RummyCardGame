
//NPM define
const schedule = require('node-schedule');
const _ = require("underscore");
const util = require('util');
//==============================================
//class define
autoClass = require("./autogenrate.class.js");
gamelogicClass = require('./gamelogic.class.js');
com = require('./comm_function_class.js');
cdClass = require('./common.class.js');
mechanismClass = require('./mechanismofPlaying.class.js');
userClass = require('./mecanismofuser.class.js');
TournamnetClass = require('./tournament.class.js');

//==============================================
//variable define
var stArr = ["NewRoundStarted", "RoundStartedPass", "RoundStarted", "CollectingBootValue", "StartDealingCard"];
//==============================================
module.exports = {
    //playingTable calss
    /*{
        "point",
        "pool",
        "deals"
        ms:2 || 3
        point:10
        bv:100
    }*/
    PLAYGAME: function (data, socket) {

        rclient.setnx("lock:" + socket.uid, 1, function (err, uresp) {

            rclient.expire("lock:" + socket.uid, 1);  //1

            if (uresp == 0 && typeof flags == 'undefined') {

                cdClass.SendData(socket, "PLAYGAME", {}, 'Wait For Game');
                return false;
            }

            if (typeof socket.uid == 'undefined' || typeof data.mode == "undefined" || typeof data.point == "undefined") {
                cdClass.SendData(socket, "PLAYGAME", {}, 'data not proper send');
                return false
            }

            cdClass.GetUserInfo(socket.uid.toString(), {
                chips: 1,
            }, function (udata) {

                if (!udata) {
                    cdClass.SendData(socket, "PLAYGAME", {}, 'data not proper send');
                    return false;
                }

                data.point = (typeof data.point != "undefined") ? data.point : 10;
                data.mode = (typeof data.mode != "undefined") ? data.mode : "";

                db.collection("playing_table").find({
                    "pi.ui.uid": MongoId(socket.uid.toString())
                }).project({ "pi.$": 1 }).toArray(function (err, ftb) {

                    if (!err && ftb.length > 0) {
                        socket["tbid"] = ftb[0]._id.toString();
                        socket["si"] = ftb[0].pi[0].si;

                        mechanismClass.EG({ stt: 1, isfrom: 'ST' }, socket, () => {
                            if (udata.chips > (data.bv * 2)) {
                                
                                mechanismClass.chooseTableUser(data, udata, socket);
                                
                            } else {
                                cdClass.SendData(socket, "PLAYGAME", {}, 'Not Enough chips');
                            }
                        });
                    } else {
                        if (udata.chips > (data.bv * 2)) {
                            mechanismClass.chooseTableUser(data, udata, socket);
                        } else {
                            cdClass.SendData(socket, "PLAYGAME", {}, 'Not Enough chips');
                        }
                    }
                })
            });
                
        })
    },

    /*
        Pick from open deck pass turn mathi
    */
    PFODPU: (data, client) => {
        cdClass.GetTableData(client.tbid, {
            open_deck: {
                $slice: -1
            }
        }, (tb) => {
            c("tb", tb)
            if (tb) {
                var len = tb.open_deck.length - 1;

                if (tb && len != 0 && tb.open_deck[len] == null)
                    c("PFOD Null detected >> ", tb.open_deck[len] + " pn : " + client.pn + " isRobot : " + client._iscom);


                if (!tb || parseInt(tb.ti) != parseInt(client.si) || typeof tb.pi[tb.ti] == "undefined" || typeof tb.pi[tb.ti].status == "undefined" || tb.pi[tb.ti].status == 'PFCD' || tb.open_deck[len] == null || typeof tb.open_deck[len] == 'undefined') {
                    cdClass.SendData(client, 'PFODPU', {}, 'error:2222');
                  
                    return false;
                } else {
                    //pulling first card from close_deck + set this card in user's card
                    var wh = { _id: MongoId(client.tbid) }
                    wh["pi.si"] = parseInt(client.si);

                    if (tb.open_deck[len].split('-')[0] != 'j') {
                        wh["pi." + client.si + ".cards"] = { $ne: tb.open_deck[len] };
                    }


                    wh["pi." + client.si + ".status"] = { $nin: ["PFODPU", "PASS"] };

                    var upData = { $pop: {},/*$push:{},*/ $set: {}, $inc: {} };
                    tb.pi[tb.ti].cards.push(tb.open_deck[len])


                    if (tb.mode == 4 || tb.mode == 5 || tb.mode == 6) {
                        for (var i = 0; i < tb.pi[tb.ti].cards.length; i++) {
                            if (tb.pi[tb.ti].cards[i].split("-")[2] == 'j') {
                                tb.pi[tb.ti].cards[i] = tb.pi[tb.ti].cards[i].split("-")[2] + "-" + tb.pi[tb.ti].cards[i].split("-")[3]
                            }
                        }
                    }

                    //==========================================================================================
                    var totalAP = mechanismClass.TotalActiveUserSeat(tb.pi);

                    if ((totalAP.length == 3 && tb.pi[tb.ti].cards.length > 8) || (totalAP.length == 2 && tb.pi[tb.ti].cards.length > 11)) {
                        var userData = tb.pi[tb.ti]

                        if (userData.ltc != undefined && userData.ltc.split("-")[2] != undefined && userData.ltc.split("-")[2] == "j") {
                            userData.ltc = userData.ltc.split("-")[2] + "-" + userData.ltc.split("-")[3]
                        } else if (userData.ltc != undefined && userData.ltc.split("-")[2] != undefined && userData.ltc.split("-")[0] == "j") {
                            userData.ltc = userData.ltc.split("-")[0] + "-" + userData.ltc.split("-")[1]
                        }

                        if (userData.ltc != undefined && userData.ltc.split("-")[0] == "j") {

                            for (var i = 0; i < userData.cards.length; i++) {

                                if (userData.cards[i].split("-")[3] == userData.ltc.split("-")[1]) {
                                    userData.ltc = userData.cards[i];
                                    break;
                                }

                                if (userData.cards[i].split("-")[0] == userData.ltc.split("-")[0] && userData.cards[i].split("-")[1] == userData.ltc.split("-")[1]) {
                                    userData.ltc = userData.cards[i];
                                    break;
                                }

                            }
                        }

                        if (tb.pi[tb.ti].cards.indexOf(userData.ltc) != -1) {
                            tb.pi[tb.ti].cards.splice(tb.pi[tb.ti].cards.indexOf(userData.ltc), 1);
                        }


                    }
                    //=====================================================================================================



                    var fspc = gamelogicClass.MakeSpadesForCards(tb.pi[tb.ti].cards);


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


                    //if(fspc.length > 0){
                    upData["$set"]["pi." + client.si + ".spc"] = fspc;
                    //}

                    upData["$pop"]["open_deck"] = 1;
                    upData["$set"]["pi." + client.si + ".cards"] = tb.pi[tb.ti].cards;

                    upData["$set"]["pi." + client.si + ".lpc"] = tb.open_deck[len]; //lpc last pick card
                    upData["$set"]["pi." + client.si + ".lodpc"] = tb.open_deck[len]; //lpc last pick card
                    upData["$set"]["pi." + client.si + ".status"] = "PFODPU";
                    upData["$set"]["pi." + client.si + ".turn_miss_cont"] = 0;
                    upData["$set"]["t_status"] = "RoundStarted";
                    upData["$inc"]["pi." + client.si + ".pickopendackcard"] = 1;
                    upData["$set"]["closedecklock"] = 0;
                    upData["$set"]["opendecklock"] = 0;


                    /*if (tb.trackercard != undefined) {
                        var card = tb.open_deck[len].split('-')
                        upData["$pull"] = {};
                        upData["$pull"]["trackercard." + card[0]] = parseInt(card[1])
                    }*/
                    if (tb.trackercard != undefined) {
                        upData["$pull"] = {};
                        if (tb.open_deck[len].split("-")[2] != undefined && tb.open_deck[len].split("-")[2] == 'j') {
                            const data = tb.open_deck[len].split("-")
                            upData["$pull"]["trackercard." + data[2]] = parseInt(data[3])
                        } else {
                            const [card, value] = tb.open_deck[len].split("-")
                            upData["$pull"]["trackercard." + card] = parseInt(value)
                        }
                    }



                    db.collection('playing_table').findAndModify(wh, {}, upData, { new: true }, (err, resp) => {
                        if (!err && resp.value != null) {

                            var userData = resp.value.pi[client.si]


                            var deadwood = gamelogicClass.PointCountDeadWood(userData.spc, userData.cards);

                            var unusecrd = _.difference(userData.cards, _.flatten(userData.spc))

                            var wh = { _id: MongoId(client.tbid) }
                            wh["pi.si"] = parseInt(client.si);

                            var upData = { $set: {} };

                            upData["$set"]["pi." + client.si + ".deadwood"] = deadwood;


                            db.collection("playing_table").findAndModify(wh, {}, upData, { new: true }, (err, resp) => {

                                if (!err && resp.value != null) {


                                    var isknock = 0;

                                    var deadwood = gamelogicClass.CountDeadWood(userData.spc, userData.cards, tb.open_deck[len]);


                                    if (deadwood == 0) {

                                        isknock = (unusecrd.length == 0) ? 1 : (unusecrd.length == 1 && unusecrd[0] != tb.open_deck[len]) ? 2 : 0;
                                    } else if (deadwood <= resp.value.maindeadwood) {
                                        //isknock = 3
                                        if (unusecrd.length == 1) {
                                            isknock = (unusecrd[0] == tb.open_deck[len]) ? 0 : 3
                                        } else {
                                            isknock = 3;
                                        }
                                    }

                                    cdClass.SendDataToTable(client.tbid, {
                                        en: "PFODPU",
                                        data: {
                                            c: tb.open_deck[len],
                                            si: client.si,
                                            open_deck: resp.value.open_deck,
                                            cards: resp.value.pi[client.si].cards,
                                            spc: resp.value.pi[client.si].spc,
                                            deadwood: resp.value.pi[client.si].deadwood,
                                            isknock: isknock,
                                            trackercard: resp.value.trackercard
                                        }
                                    });


                                    if (client._iscom == 1 && config.ROBOT == true) {

                                        compClass.pickAfterCardThrow(resp.value, client);
                                    }
                                    wh = null;
                                    upData = null;
                                    userData = null;
                                    deadwood = null;

                                } else {
                                    console.log("else if seconds not updated issue ", wh);
                                    console.log("else if seconds not updated issue ", upData);

                                }
                            })
                        } else {
                            cdClass.SendData(client, 'PFODPU', {}, 'error:2222');
                            
                            return false;
                        }
                    });
                }
            }
        });
    },
    /*    
        user get card form close_deck
    */
    PFCD: (data, client, robotplaying) => {

        if (typeof client.tbid == 'undefined')
            return false;


        cdClass.GetTableData(client.tbid.toString(), {
            close_deck: {
                $slice: 1
            }
        }, (tb) => {
            c("tb;;--->>", tb)
            if (tb && tb.close_deck[0] == null)
                console.log("PFCD Null detected >> ", tb.close_deck[0] + " pn : " + client.pn + " isRobot : " + client._iscom);



            if (!tb || tb.ti != client.si || (typeof tb.pi[tb.ti] != 'undefined' && tb.pi[tb.ti].status == 'PFCD') || tb.close_deck[0] == null || typeof tb.close_deck[0] == 'undefined' || (typeof tb.pi[tb.ti] != 'undefined' && typeof tb.pi[tb.ti].cards == "undefined")) {

                cdClass.SendData(client, 'PFCD', {}, 'error:2222');
                
                return false;
            } else {
                //pulling first card from close_deck + set this card in user's card
                var wh = { _id: MongoId(client.tbid) }
                wh["pi.si"] = parseInt(client.si);

                if (tb.close_deck[0].split('-')[0] != 'j') {
                    wh["pi." + client.si + ".cards"] = { $ne: tb.close_deck[0] };
                }

                wh["pi." + client.si + ".status"] = { $ne: "PFCD" };

                var upData = { $pop: {}, $inc: {},/* $push:{},*/ $set: {} };
                tb.pi[tb.ti].cards.push(tb.close_deck[0])

                if (tb.mode == 4 || tb.mode == 5 || tb.mode == 6) {
                    for (var i = 0; i < tb.pi[tb.ti].cards.length; i++) {
                        if (tb.pi[tb.ti].cards[i].split("-")[2] == 'j') {
                            tb.pi[tb.ti].cards[i] = tb.pi[tb.ti].cards[i].split("-")[2] + "-" + tb.pi[tb.ti].cards[i].split("-")[3]
                        }
                    }
                }

                //==========================================================================================
                var totalAP = mechanismClass.TotalActiveUserSeat(tb.pi);

                if ((totalAP.length == 3 && tb.pi[tb.ti].cards.length > 8) || (totalAP.length == 2 && tb.pi[tb.ti].cards.length > 11)) {
                    var userData = tb.pi[tb.ti]


                    if (userData.ltc != undefined && userData.ltc.split("-")[2] != undefined && userData.ltc.split("-")[2] == "j") {
                        userData.ltc = userData.ltc.split("-")[2] + "-" + userData.ltc.split("-")[3]
                    } else if (userData.ltc != undefined && userData.ltc.split("-")[2] != undefined && userData.ltc.split("-")[0] == "j") {
                        userData.ltc = userData.ltc.split("-")[0] + "-" + userData.ltc.split("-")[1]
                    }


                    if (userData.ltc != undefined && userData.ltc.split("-")[0] == "j") {

                        for (var i = 0; i < userData.cards.length; i++) {

                            if (userData.cards[i].split("-")[3] == userData.ltc.split("-")[1]) {
                                userData.ltc = userData.cards[i];
                                break;
                            }

                            if (userData.cards[i].split("-")[0] == userData.ltc.split("-")[0] && userData.cards[i].split("-")[1] == userData.ltc.split("-")[1]) {
                                userData.ltc = userData.cards[i];
                                break;
                            }

                        }
                    }


                    if (tb.pi[tb.ti].cards.indexOf(userData.ltc) != -1) {
                        tb.pi[tb.ti].cards.splice(tb.pi[tb.ti].cards.indexOf(userData.ltc), 1);
                    }

                }
                //=====================================================================================================


                var fspc = gamelogicClass.MakeSpadesForCards(tb.pi[tb.ti].cards);


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


                upData["$set"]["pi." + client.si + ".spc"] = fspc;

                upData["$pop"]["close_deck"] = -1;

                //upData["$push"]["pi."+client.si+".cards"] = tb.close_deck[0];
                upData["$set"]["pi." + client.si + ".cards"] = tb.pi[tb.ti].cards;
                upData["$set"]["pi." + client.si + ".lpc"] = tb.close_deck[0];
                upData["$set"]["pi." + client.si + ".lodpc"] = "";
                upData["$inc"]["pi." + client.si + ".totalTurnCount"] = 1;
                upData["$set"]["pi." + client.si + ".status"] = "PFCD";
                upData["$set"]["pi." + client.si + ".turn_miss_cont"] = 0;

                upData["$set"]["closedecklock"] = 0;
                upData["$set"]["opendecklock"] = 0;

                db.collection('playing_table').findAndModify(wh, {}, upData, { new: true }, (err, resp) => {
                    if (!err && resp.value != null) {

                        var userData = resp.value.pi[client.si]



                        var deadwood = gamelogicClass.PointCountDeadWood(userData.spc, userData.cards);

                        var unusecrd = _.difference(userData.cards, _.flatten(userData.spc))

                        var wh = { _id: MongoId(client.tbid) }
                        wh["pi.si"] = parseInt(client.si);

                        var upData = { $set: {} };

                        upData["$set"]["pi." + client.si + ".deadwood"] = deadwood;


                        db.collection("playing_table").findAndModify(wh, {}, upData, { new: true }, (err, resp) => {

                            if (!err && resp.value != null) {


                                var isknock = 0

                                var deadwood = gamelogicClass.CountDeadWood(userData.spc, userData.cards);


                                if (deadwood == 0) {

                                    isknock = (unusecrd.length == 0) ? 1 : (unusecrd.length == 1) ? 2 : 0;
                                } else if (deadwood <= resp.value.maindeadwood) {
                                    isknock = 3
                                }
                                cdClass.SendDataToTable(client.tbid, {
                                    en: "PFCD",
                                    data: {
                                        c: tb.close_deck[0],
                                        si: client.si,
                                        cards: resp.value.pi[client.si].cards,
                                        close_deck_length: resp.value.close_deck.length,
                                        open_deck: resp.value.open_deck.length,
                                        spc: resp.value.pi[client.si].spc,
                                        deadwood: resp.value.pi[client.si].deadwood,
                                        isknock: isknock,
                                        trackercard: resp.value.trackercard
                                    }
                                });


                                if (client._iscom == 1 && config.ROBOT == true) {

                                    isnotallplay = (typeof robotplaying != "undefined" && robotplaying == false) ? false : true;

                                    isnotallplay = (resp.value.pi[client.si].totalTurnCount != undefined && resp.value.pi[client.si].totalTurnCount == 1) ? true : isnotallplay


                                    compClass.pickAfterCardThrow(resp.value, client, isnotallplay);
                                }
                                wh = null;
                                upData = null;
                                userData = null;
                                deadwood = null;
                            }
                        })
                    }
                });
            }
        });
    },
    /*get card from open_deck*/
    PFOD: (data, client) => { //pick from thrown card

        //first we have to 0 indexed card from trown stack
        cdClass.GetTableData(client.tbid, {
            open_deck: {
                $slice: -1
            }
        }, (tb) => {
            c("tb", tb)

            if (tb) {

                var len = tb.open_deck.length - 1;

                if (tb && len != 0 && tb.open_deck[len] == null)
                    console.log("PFOD Null detected >> ", tb.open_deck[len] + " pn : " + client.pn + " isRobot : " + client._iscom);


                if (!tb || tb.ti != client.si || typeof tb.pi[tb.ti] == "undefined" || typeof tb.pi[tb.ti].status == "undefined" || tb.pi[tb.ti].status == 'PFCD' || tb.open_deck[len] == null || typeof tb.open_deck[len] == 'undefined') {
                    cdClass.SendData(client, 'PFOD', {}, 'error:2222');
                    
                    return false;
                } else {
                    if (tb.t_status != "RoundStarted") {
                        console.log("Round Satrt ")
                    }

                    //pulling first card from close_deck + set this card in user's card
                    var wh = { _id: MongoId(client.tbid) }
                    wh["pi.si"] = parseInt(client.si);

                    if (tb.open_deck[len].split('-')[0] != 'j') {
                        wh["pi." + client.si + ".cards"] = { $ne: tb.open_deck[len] };
                    }

                    wh["pi." + client.si + ".status"] = { $ne: "PFCD" };

                    var upData = { $pop: {},/*$push:{},*/ $set: {}, $inc: {} };
                    tb.pi[tb.ti].cards.push(tb.open_deck[len])

                    if (tb.mode == 4 || tb.mode == 5 || tb.mode == 6) {
                        for (var i = 0; i < tb.pi[tb.ti].cards.length; i++) {
                            if (tb.pi[tb.ti].cards[i].split("-")[2] == 'j') {
                                tb.pi[tb.ti].cards[i] = tb.pi[tb.ti].cards[i].split("-")[2] + "-" + tb.pi[tb.ti].cards[i].split("-")[3]
                            }
                        }
                    }

                    //==========================================================================================
                    var totalAP = mechanismClass.TotalActiveUserSeat(tb.pi);

                    if ((totalAP.length == 3 && tb.pi[tb.ti].cards.length > 8) || (totalAP.length == 2 && tb.pi[tb.ti].cards.length > 11)) {

                        var userData = tb.pi[tb.ti]


                        if (userData.ltc != undefined && userData.ltc.split("-")[2] != undefined && userData.ltc.split("-")[2] == "j") {
                            userData.ltc = userData.ltc.split("-")[2] + "-" + userData.ltc.split("-")[3]
                        } else if (userData.ltc != undefined && userData.ltc.split("-")[2] != undefined && userData.ltc.split("-")[0] == "j") {
                            userData.ltc = userData.ltc.split("-")[0] + "-" + userData.ltc.split("-")[1]
                        }


                        if (userData.ltc != undefined && userData.ltc.split("-")[0] == "j") {

                            for (var i = 0; i < userData.cards.length; i++) {

                                if (userData.cards[i].split("-")[3] == userData.ltc.split("-")[1]) {
                                    userData.ltc = userData.cards[i];
                                    break;
                                }

                                if (userData.cards[i].split("-")[0] == userData.ltc.split("-")[0] && userData.cards[i].split("-")[1] == userData.ltc.split("-")[1]) {
                                    userData.ltc = userData.cards[i];
                                    break;
                                }

                            }
                        }


                        if (tb.pi[tb.ti].cards.indexOf(userData.ltc) != -1) {
                            tb.pi[tb.ti].cards.splice(tb.pi[tb.ti].cards.indexOf(userData.ltc), 1);
                        }
                    }
                    //=====================================================================================================



                    var fspc = gamelogicClass.MakeSpadesForCards(tb.pi[tb.ti].cards);

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


                    upData["$set"]["pi." + client.si + ".spc"] = fspc;
                    upData["$pop"]["open_deck"] = 1;

                    //upData["$push"]["pi."+client.si+".cards"] = tb.open_deck[len];

                    upData["$set"]["pi." + client.si + ".cards"] = tb.pi[tb.ti].cards;

                    upData["$set"]["pi." + client.si + ".lpc"] = tb.open_deck[len]; //lpc last pick card
                    upData["$set"]["pi." + client.si + ".lodpc"] = tb.open_deck[len]; //lpc last pick card
                    upData["$set"]["pi." + client.si + ".status"] = "PFCD";
                    upData["$set"]["pi." + client.si + ".turn_miss_cont"] = 0;
                    upData["$inc"]["pi." + client.si + ".pickopendackcard"] = 1; // 1 pn vaar open deck mathi card lidhu 6 ke nai te jova

                    /*if (tb.trackercard != undefined) {
                        var card = tb.open_deck[len].split('-')
                        upData["$pull"] = {};
                        upData["$pull"]["trackercard." + card[0]] = parseInt(card[1])
                    }*/

                    if (tb.trackercard != undefined) {
                        upData["$pull"] = {};
                        if (tb.open_deck[len].split("-")[2] != undefined && tb.open_deck[len].split("-")[2] == 'j') {
                            const data = tb.open_deck[len].split("-")
                            upData["$pull"]["trackercard." + data[2]] = parseInt(data[3])
                        } else {
                            const [card, value] = tb.open_deck[len].split("-")
                            upData["$pull"]["trackercard." + card] = parseInt(value)
                        }
                    }

                    db.collection('playing_table').findAndModify(wh, {}, upData, { new: true }, (err, resp) => {
                        if (!err && resp.value != null) {

                            var userData = resp.value.pi[client.si]

                            //console.log("userData :",userData);
                            var deadwood = gamelogicClass.PointCountDeadWood(userData.spc, userData.cards);

                            var unusecrd = _.difference(userData.cards, _.flatten(userData.spc))

                            var wh = { _id: MongoId(client.tbid) }
                            wh["pi.si"] = parseInt(client.si);

                            var upData = { $set: {} };

                            upData["$set"]["pi." + client.si + ".deadwood"] = deadwood;


                            db.collection("playing_table").findAndModify(wh, {}, upData, { new: true }, (err, resp) => {

                                if (!err && resp.value != null) {


                                    var isknock = 0

                                    var deadwood = gamelogicClass.CountDeadWood(userData.spc, userData.cards, tb.open_deck[len]);

                                    if (deadwood == 0) {
                                        isknock = (unusecrd.length == 0) ? 1 : (unusecrd.length == 1 && unusecrd[0] != tb.open_deck[len]) ? 2 : 0;
                                    } else if (deadwood <= resp.value.maindeadwood) {
                                        if (unusecrd.length == 1) {
                                            isknock = (unusecrd[0] == tb.open_deck[len]) ? 0 : 3
                                        } else {
                                            isknock = 3
                                        }
                                    }

                                    cdClass.SendDataToTable(client.tbid, {
                                        en: "PFOD",
                                        data: {
                                            c: tb.open_deck[len],
                                            si: client.si,
                                            open_deck: resp.value.open_deck,
                                            cards: resp.value.pi[client.si].cards,
                                            spc: resp.value.pi[client.si].spc,
                                            deadwood: resp.value.pi[client.si].deadwood,
                                            isknock: isknock,
                                            trackercard: resp.value.trackercard
                                        }
                                    });

                                    if (client._iscom == 1 && config.ROBOT == true) {

                                        compClass.pickAfterCardThrow(resp.value, client);
                                    }

                                    wh = null;
                                    upData = null;
                                    userData = null;
                                    deadwood = null;

                                }
                            })
                        }
                    });
                }
            }
        });
    },
    TC: (data, client) => { //throw card on deck

        if (typeof client.tbid != 'undefined' && typeof client.si != 'undefined' && typeof data.c != 'undefined' && data.c != null && data.c != '') {
            var olddate = new Date()

            cdClass.GetTableData(client.tbid.toString(), {}, (tb) => {

                if (!tb || typeof client.si == 'undefined' || parseInt(tb.ti) != parseInt(client.si)) {
                    cdClass.SendData(client, 'TC', {}, 'error:2222');
                    
                    return false;
                }

                if (tb.pi[tb.ti].status != 'PFCD' && tb.pi[tb.ti].status != "PFODPU" && tb.pi[tb.ti].status != "PFOD") {
                    cdClass.SendData(client, 'TC', { data: data, tb: tb }, 'error:8001');
                    
                    return false;
                }

                if (tb.mode == 4 || tb.mode == 5 || tb.mode == 6) {
                    for (var i = 0; i < tb.pi[tb.ti].cards.length; i++) {
                        if (tb.pi[tb.ti].cards[i].split("-")[2] == 'j') {
                            tb.pi[tb.ti].cards[i] = tb.pi[tb.ti].cards[i].split("-")[2] + "-" + tb.pi[tb.ti].cards[i].split("-")[3]
                        }
                    }
                }
                var orcard = data.c;  //c is equal to throw card
                if (data.c.split("-")[2] == "j") {
                    orcard = data.c.split("-")[2] + "-" + data.c.split("-")[3]
                }

                var index = tb.pi[tb.ti].cards.indexOf(orcard)
                tb.pi[tb.ti].cards.splice(index, 1)

                var fspc = gamelogicClass.MakeSpadesForCards(tb.pi[tb.ti].cards);

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

                    $inc: {
                        exchange: 1
                    },
                    $push: {
                        open_deck: orcard
                    },
                    $set: {
                        "pi.$.cards": tb.pi[tb.ti].cards,
                        "pi.$.status": "p",
                        "pi.$.ltc": orcard,
                        "pi.$.spc": fspc,
                        "pi.$.lodpc": ""
                    }
                }

                /*const [card, value] = data.c.split("-")
                DATAUPdate["$push"]["trackercard." + card] = parseInt(value)*/

                if (data.c.split("-")[2] != undefined && data.c.split("-")[2] == 'j') {
                    const data1 = data.c.split("-")
                    DATAUPdate["$push"]["trackercard." + data1[2]] = parseInt(data1[3])
                } else {
                    const [card, value] = data.c.split("-")
                    DATAUPdate["$push"]["trackercard." + card] = parseInt(value)
                }

              

                db.collection('playing_table').findAndModify({
                    _id: MongoId(client.tbid),
                    "pi.si": parseInt(client.si),
                    "pi.cards": data.c
                }, {}, DATAUPdate, {
                    new: true
                }, (err, updated) => {


                    if (err || updated.value == null) {

                        c("Nothing Updated in Table.");
                        return false;
                    }

                    var userData = updated.value.pi[client.si]



                    var deadwood = gamelogicClass.PointCountDeadWood(userData.spc, userData.cards);
                    var wh = { _id: MongoId(client.tbid) }
                    wh["pi.si"] = parseInt(client.si);

                    var upData = { $set: {} };

                    upData["$set"]["pi." + client.si + ".deadwood"] = deadwood;


                    db.collection("playing_table").findAndModify(wh, {}, upData, { new: true }, (err, updated) => {

                        if (!err && updated.value != null) {

                            wh = null;
                            upData = null;
                            userData = null;
                            deadwood = null;

                            //cancel the current users. turn 
                            cdClass.SendDataToTable(client.tbid, {
                                en: "TC",
                                data: {
                                    c: orcard,
                                    si: client.si,
                                    cc: updated.value.pi[client.si].cards.length,
                                    //remove in APP
                                    cards: updated.value.pi[client.si].cards,
                                    open_deck: updated.value.open_deck,
                                    spc: updated.value.pi[client.si].spc,
                                    deadwood: updated.value.pi[client.si].deadwood,
                                    trackercard: updated.value.trackercard
                                }
                            });


                            //========================================after thrwo card to clear Time  
                            com.CancelScheduleJobOnServer(updated.value._id.toString(), updated.value.jid);
                            //======================================================================


                            cdClass.GetTableData(client.tbid.toString(), {}, (tb) => {
                                if (!tb) {
                                    return false;
                                }


                                //if user card [] or close deck time winner declare other wise change turn
                                if (typeof tb.pi[client.si].cards != "undefined" && typeof tb.close_deck != "undefined" && (tb.pi[client.si].cards.length == 0 || tb.close_deck.length == 0)) {



                                    if (tb.pi[client.si].cards.length == 0) {
                                        tb.SPCWIN = 1;
                                    }

                                    setTimeout(function () {
                                        c("winner decalree to throw card after");
                                        mechanismClass.DeclareWinnerPlayer(tb);
                                    }, 2000);
                                } else {

                                    //console.log("TC ::::::ChangeTableTurn ")

                                    //change turn 
                                    mechanismClass.ChangeTableTurn(client.tbid, {
                                        pt: client.si,
                                        opendecklock: 0,
                                        closedecklock: 0
                                    });
                                }
                            });
                        }
                    })
                });
                //}
            });
        } else {
            c("client .tbid not ", client);
        }
    },
    PASS: (data, client) => {

        cdClass.GetTableData(client.tbid, {}, (tb) => {

            if (tb) {

                if (!tb || tb.ti != client.si || typeof tb.pi[tb.ti] == "undefined" || typeof tb.pi[tb.ti].status == "undefined" || tb.pi[tb.ti].status == "" || tb.pi[tb.ti].status == 'PASS' || tb.pi[tb.ti].status == "PFCD" || tb.pi[tb.ti].status == "PFODPU") {
                    cdClass.SendData(client, 'PASS', {}, 'error:2222');
                   
                    return false;
                } else {
                    //pulling first card from close_deck + set this card in user's card
                    var wh = { _id: MongoId(client.tbid) }
                    wh["pi.si"] = parseInt(client.si);

                    wh["pi." + client.si + ".status"] = { $nin: ["PFODPU", "PASS"] };

                    var upData = { $set: {}, $push: { PassUser: parseInt(client.si) } };
                    upData["$set"]["pi." + client.si + ".status"] = "PASS";
                    upData["$set"]["pi." + client.si + ".ispass"] = 1;
                    upData["$set"]["pi." + client.si + ".turn_miss_cont"] = 0;
                    upData["$set"]["pi." + client.si + ".lodpc"] = "";

                    db.collection('playing_table').findAndModify(wh, {}, upData, { new: true }, (err, resp) => {
                        if (!err && resp.value != null) {

                            cdClass.SendDataToTable(client.tbid, {
                                en: "PASS",
                                data: {
                                    si: client.si,
                                    spc: resp.value.pi[client.si].spc,
                                    cards: resp.value.pi[client.si].cards
                                }
                            });

                            //========================================after thrwo card to clear Time  
                            com.CancelScheduleJobOnServer(resp.value._id.toString(), resp.value.jid);
                            //======================================================================


                            var playeduser = mechanismClass.TotalActiveUserSeat(resp.value.pi);

                            if (resp.value.PassUser.length >= playeduser.length) {

                                db.collection("playing_table").update({ _id: MongoId(client.tbid) }, {
                                    $set: {
                                        opendecklock: 1,
                                        closedecklock: 0
                                    }
                                }, () => {
                                    //schedulerClass.SelectUserForTurn({tbId: client.tbid,pt:parseInt(client.si)})
                                    mechanismClass.ChangeTableTurn(client.tbid, {
                                        pt: parseInt(client.si),
                                        opendecklock: 1,
                                        closedecklock: 0
                                    });
                                })
                            } else {
                                mechanismClass.ChangeTablePassedTurn(client.tbid, {
                                    pt: parseInt(client.si),
                                    opendecklock: 0,
                                    closedecklock: 1
                                });
                            }
                        } else {
                            cdClass.SendData(client, 'PASS', {}, 'error:2222');
                            
                            return false;
                            //console.log("resp.value:::::::pass ")
                        }
                    });
                }
            }
        });
    },
    /*
        data:{
            spc:[
                [],
                [],
                []
            ],
            cards:[],
            deadwood:0
        }
    */
    SORT: (data, client, callback) => {
        if (client.tbid != undefined && client.tbid != "" && client.tbid != null) {

            cdClass.GetTableData(client.tbid.toString(), {}, (tb) => {

                if (!tb) {

                    if (typeof callback == "function") {
                        return callback({
                            "flag": ErrorMsg.FAIL,
                            "msg": ErrorMsg[client.lc + "_1113"],
                            "data": data,
                            "en": "SORT",
                            "errcode": "1113"
                        })
                    }

                }

                if (data.turncount != undefined && tb.turncount != undefined && parseInt(data.turncount) != parseInt(tb.turncount)) {

                   
                    if (typeof callback == "function") {
                        return callback({
                            "flag": ErrorMsg.FAIL,
                            "msg": ErrorMsg[client.lc + "_1114"],
                            "data": data,
                            "en": "SORT",
                            "errcode": "1114"
                        })
                    }

                }

                var wh = { _id: MongoId(client.tbid), "pi.si": parseInt(client.si) }

                var upData = {
                    $set: {}
                };

                if (data.cards == undefined || data.cards == null || data.cards.length <= 0 ||
                    data.spc == undefined || data.spc == null
                ) {
                  
                    if (typeof callback == "function") {
                        return callback({
                            "flag": ErrorMsg.FAIL,
                            "msg": ErrorMsg[client.lc + "_1113"],
                            "data": data,
                            "en": "SORT",
                            "errcode": "1113"
                        })
                    }

                }

                if (data.cards.length == 10 || data.cards.length == 7) {
                    //Nommal card save is status 10 or 7 
                    wh["pi." + client.si + ".status"] = { $nin: ["PFODPU", "PFCD", "KNOCK", "GIN", "BIGGIN"] };
                }

                if (data.cards.length == 11 || data.cards.length == 8) {
                    //Nommal card save is status 10 or 7 
                    wh["pi." + client.si + ".status"] = { $in: ["PFODPU", "PFCD"], $nin: ["KNOCK", "GIN", "BIGGIN"] };

                }

                /*if(typeof data.spc[0] != "undefined" && typeof data.spc[0] == "string"){
                    //console.log("SORT data.spc[0] ::::--->>>",data.spc[0])
                    //console.log("SORT data.spc ::::--->>>",data.spc)
                }*/

                var newspc = [];


                //convert spc to string if spc is string
                for (var i = 0; i < data.spc.length; i++) {

                    if (typeof data.spc[i] != "undefined" && typeof data.spc[i] == "string") {

                        data.spc[i] = data.spc[i].replace("[", "");
                        data.spc[i] = data.spc[i].replace("]", "");

                        var make = data.spc[i].split(",")

                        for (var j = 0; j < make.length; j++) {
                            make[j] = make[j].trim()
                        }

                        newspc.push(make)
                    } else if (typeof data.spc[i] != "undefined") {
                        newspc.push(data.spc[i])
                    }
                }


                if (typeof newspc[0] != "undefined" && typeof newspc[0] == "string") {
                    console.log("SORT newspc data.spc[0] ::::--->>>", newspc[0])
                    console.log("SORT newspc data.spc ::::--->>>", newspc)
                }



                if (tb.pi[client.si] != undefined && tb.pi[client.si].cards != undefined && _.difference(tb.pi[client.si].cards, data.cards).length > 2) {
                   
                  
                    if (typeof callback == "function") {
                        return callback({
                            "flag": ErrorMsg.FAIL,
                            "msg": ErrorMsg[client.lc + "_1114"],
                            "data": data,
                            "en": "SORT",
                            "errcode": "1114"
                        })
                    }
                }

                /*if(data.cards.length > 11){
                   
                    console.log("SORT data.cards. cards ::::::::::::::::::::::::::::::::: ",data.cards.length)
                }*/

                if (tb.t_status == "WinnerDeclared"
                    || tb.t_status == "FWinnerDeclaredStart"
                    || tb.t_status == "NewRoundStarted"
                    || tb.t_status == "FWinnerDeclared" || tb.t_status == "" || tb.t_status == "GameStartTimer") {

                    if (typeof callback == "function") {
                        return callback({
                            "flag": ErrorMsg.FAIL,
                            "msg": ErrorMsg[client.lc + "_1114"],
                            "data": data,
                            "en": "SORT",
                            "errcode": "1114"
                        })
                    }
                }



                data.spc = newspc;

                upData["$set"]["pi." + client.si + ".spc"] = newspc;//data.spc;
                upData["$set"]["pi." + client.si + ".cards"] = data.cards;
                upData["$set"]["pi." + client.si + ".deadwood"] = data.deadwood;

                db.collection('playing_table').findAndModify(wh, {}, upData, { new: true }, (err, resp) => {
                    if (!err && resp.value != null) {

                        if (typeof callback == "function") {

                            return callback({
                                "flag": ErrorMsg.SUCCESS,
                                "msg": ErrorMsg[client.lc + "_0000"],
                                "data": data,
                                "en": "SORT",
                                "errcode": "0000"
                            })
                        }

                    } else {

                        if (typeof callback == "function") {
                            return callback({
                                "flag": ErrorMsg.FAIL,
                                "msg": ErrorMsg[client.lc + "_1114"],
                                "data": data,
                                "en": "SORT",
                                "errcode": "1114"
                            })
                        }
                    }
                });
            })

        } else {
            if (typeof callback == "function") {
                return callback({
                    "flag": ErrorMsg.FAIL,
                    "msg": ErrorMsg[client.lc + "_1113"],
                    "data": data,
                    "en": "SORT",
                    "errcode": "1113"
                })
            }
        }
    },
    SORTCOMP: (data, client, callback) => {

        var wh = { _id: MongoId(client.tbid), "pi.si": parseInt(client.si) }

        var upData = {
            $set: {}
        };


        if (data.spc == undefined || data.spc.length == 0) {
            spc = gamelogicClass.MakeSpadesForCards(data.cards);
        } else {
            spc = data.spc;
        }

        if (data.cards.length == 8 || data.cards.length == 11) {
            var deadwood = gamelogicClass.CountDeadWood(spc, data.cards);
        } else {
            var deadwood = gamelogicClass.PointCountDeadWood(spc, data.cards);
        }

        var unusecrd = _.difference(data.cards, _.flatten(spc))

        upData["$set"]["pi." + client.si + ".spc"] = spc;
        upData["$set"]["pi." + client.si + ".cards"] = data.cards;
        upData["$set"]["pi." + client.si + ".deadwood"] = deadwood;


        db.collection('playing_table').findAndModify(wh, {}, upData, { new: true }, (err, resp) => {
            if (!err && resp.value != null) {

                var isknock = 0;
                if (resp.value.pi[client.si].deadwood == 0) {


                    isknock = (unusecrd.length == 0) ? 1 : (unusecrd.length == 1) ? 2 : 3;
                } else if (resp.value.pi[client.si].deadwood <= resp.value.maindeadwood) {
                    isknock = 3
                }


                if (typeof callback == "function") {

                    return callback(false)
                } else {
                    cdClass.SendData(client, 'SORT', {
                        spc: resp.value.pi[client.si].spc,
                        cards: resp.value.pi[client.si].cards,
                        deadwood: resp.value.pi[client.si].deadwood,
                        isknock: isknock
                    }, "error:0000");
                }


            } else {

                if (typeof callback == "function") {
                    return callback(false)
                }
            }
        });
    },
    //KNOCK mens finish to game and winner decalre  With One Card 
    /*
        c :"l-1"
        spc
        card:
    */
    KNOCK: (data, client) => { //knock on game

        if (typeof client.tbid != 'undefined' && typeof client.si != 'undefined') {

            cdClass.GetTableData(client.tbid, {

            }, (tb) => {

                if (!tb || typeof client.si == 'undefined' || parseInt(tb.ti) != parseInt(client.si) || (tb.pi[tb.ti].status != 'PFCD' && tb.pi[tb.ti].status != "PFODPU" && tb.pi[tb.ti].status != "PFOD")) {
                    cdClass.SendData(client, 'KNOCK', {}, 'error:2222');
                   
                    return false;
                }

                //check to knock mode or not 
                if (tb.mode == 2) {
                    cdClass.SendData(client, 'KNOCK', {}, 'error:1030');
                    return false;
                }

                var newspc = [];
                if (data.spc != undefined && data.spc != null && data.spc != "" && data.spc.length > 0) {
                    for (var i = 0; i < data.spc.length; i++) {

                        if (typeof data.spc[i] != "undefined" && typeof data.spc[i] == "string") {

                            data.spc[i] = data.spc[i].replace("[", "");
                            data.spc[i] = data.spc[i].replace("]", "");

                            var make = data.spc[i].split(",")

                            for (var j = 0; j < make.length; j++) {
                                make[j] = make[j].trim()
                            }

                            newspc.push(make)
                        } else if (typeof data.spc[i] != "undefined") {
                            newspc.push(data.spc[i])
                        }
                    }
                }

                var spc = (newspc.length > 0) ? newspc : tb.pi[tb.ti].spc;
                var cards = (data.cards != undefined && data.cards != null && data.cards != "" && data.cards.length > 0) ? data.cards : tb.pi[tb.ti].cards


                for (var i = 0; i < spc.length; i++) {
                    for (var j = 0; j < spc[i].length; j++) {
                        spc[i][j] = spc[i][j].trim()
                    }
                }

                //spc card remove in cards and after unuse cards array mathi high card remove 
                //var spc = _.flatten(spc);
                var unusecrd = _.difference(cards, _.flatten(spc))

                deadwood = 0;
                data.c = "";

                if (unusecrd.length > 0) {

                    var cardthere = unusecrd.indexOf(tb.pi[tb.ti].lodpc);

                    if (cardthere != -1) {

                        unusecrd.slice(unusecrd.indexOf(tb.pi[tb.ti].lodpc), 1);
                        unusecrd.splice(unusecrd.indexOf(tb.pi[tb.ti].lodpc), 1);

                    }

                    unusecrd.sort(function (e, f) {
                        return parseInt(e.split('-')[1]) - parseInt(f.split('-')[1])
                    });//sorting the element in sequence 
                    data.c = unusecrd[unusecrd.length - 1];

                    unusecrd.pop();
                    //jo card unusecard ma thi splice kariyu hoi to 
                    if (cardthere != -1 && tb.pi[tb.ti].lodpc != undefined && tb.pi[tb.ti].lodpc != null && tb.pi[tb.ti].lodpc != "")
                        unusecrd.push(tb.pi[tb.ti].lodpc);



                    var rcard = gamelogicClass.pointDiffColor(unusecrd);
                    deadwood = com.CardPointSum(rcard.cards);

                }

                var index = cards.indexOf(data.c)
                if (index != -1) {
                    cards.splice(index, 1)
                } else {
                    console.log("cards ::-->>", cards)
                    console.log("index ::-->>", index)
                    console.log("data.c ::-->>", data.c)
                }

                //checking for user is eligible to knock on game.
                if (deadwood <= tb.maindeadwood && data.c != "") {

                    db.collection('playing_table').findAndModify({
                        _id: MongoId(client.tbid),
                        "pi.si": parseInt(client.si),
                        "pi.cards": data.c
                    }, {}, {
                        /*$pull: {
                            "pi.$.cards": data.c
                        },*/
                        $push: {
                            open_deck: data.c
                        },
                        $set: {
                            "pi.$.cards": cards,
                            "pi.$.spc": spc, //new change time save in knock
                            "pi.$.status": "KNOCK",
                            "pi.$.ltc": data.c,
                            "pi.$.deadwood": deadwood,
                            "pi.$.lodpc": "",
                            "pi.$.isknock": 1
                        }
                    }, {
                        new: true
                    }, (err, updated) => {
                        c("err", err);
                        c("updated", updated);

                        if (err || updated.value == null) {
                            c("Nothing Updated in Table. knock ");
                            return false;
                        }


                        var jokerwithset = false;
                        if (!updated.value.tou && _.filter(cards, function (num) { return num.split("-")[0] == "j" || num.split("-")[2] == 'j'; }).length >= 1) {

                            for (i in spc) {

                                if (spc[i].length > 2 && (gamelogicClass.CheckCardRonCases(spc[i]) || gamelogicClass.CheckCardteenCases(spc[i])) && _.filter(spc[i], function (num) { return num.split("-")[0] == "j" || num.split("-")[2] == 'j'; }).length >= 1) {
                                    jokerwithset = true
                                }
                            }
                        }

                        if (jokerwithset) {
                            trackClass.TrackSpinGame(client.uid, 11, 1)
                        }

                        if (!updated.value.tou && deadwood < 7)
                            trackClass.TrackSpinGame(client.uid, 1, 1)


                        if (!updated.value.tou && parseInt(client._iscom) == 0 && updated.value.pi[parseInt(client.si)] != undefined &&
                            updated.value.pi[parseInt(client.si)].pickopendackcard != undefined && updated.value.pi[parseInt(client.si)].pickopendackcard == 0) {
                            trackClass.TrackSpinGame(client.uid, 21, 1)
                        }

                        var t = (client._iscom == 1) ? 3000 : 2000;

                        //gin Rummy  to user and winner declare
                        //tb.lowchips  /*hec*/ = (uInfo.chips >= tb.bv) ? 1 : 0;
                        cdClass.SendDataToTable(client.tbid, {
                            en: 'KNOCK',
                            data: {
                                si: client.si,
                                c: data.c,
                                cards: updated.value.pi[client.si].cards,
                                cc: updated.value.pi[client.si].cards.length,
                                open_deck: updated.value.open_deck,
                                spc: updated.value.pi[client.si].spc,
                                deadwood: updated.value.pi[client.si].deadwood,

                            }
                        });
                        //tb.knocker = tb.pi[client.si];
                        tb.type = 'knock';
                        setTimeout(function () {
                            mechanismClass.DeclareWinnerPlayer(tb, parseInt(client.si))
                        }, t);
                    })

                } else {
                    cdClass.SendData(client, 'KNOCK', {}, 'error:1111');
                   
                }
            });
        } else {
            cdClass.SendData(client, 'KNOCK', {}, 'error:1111');
            
        }
    },
    /*
        spc:[],
        cards:[]
        
    */
    GIN: (data, client) => { //GIN on game

        if (typeof client.tbid != 'undefined' && typeof client.si != 'undefined') {

            cdClass.GetTableData(client.tbid, {
                "close_deck": 0,
                open_deck: 0
            }, function (tb) {


                if (!tb || typeof client.si == 'undefined' || parseInt(tb.ti) != parseInt(client.si) || (tb.pi[tb.ti].status != 'PFCD' && tb.pi[tb.ti].status != "PFODPU" && tb.pi[tb.ti].status != "PFOD")) {
                    cdClass.SendData(client, 'GIN', {}, 'error:2222');
                    
                    return false;
                }

                var newspc = [];
                if (data.spc != undefined && data.spc != null && data.spc != "" && data.spc.length > 0) {
                    for (var i = 0; i < data.spc.length; i++) {

                        if (typeof data.spc[i] != "undefined" && typeof data.spc[i] == "string") {

                            data.spc[i] = data.spc[i].replace("[", "");
                            data.spc[i] = data.spc[i].replace("]", "");

                            var make = data.spc[i].split(",")

                            for (var j = 0; j < make.length; j++) {
                                make[j] = make[j].trim()
                            }

                            newspc.push(make)
                        } else if (typeof data.spc[i] != "undefined") {
                            newspc.push(data.spc[i])
                        }
                    }
                }

                var spc = (newspc.length > 0) ? newspc : tb.pi[tb.ti].spc;
                var cards = (data.cards != undefined && data.cards != null && data.cards != "" && data.cards.length > 0) ? data.cards : tb.pi[tb.ti].cards


                /*var  spc = tb.pi[tb.ti].spc;
                var cards = tb.pi[tb.ti].cards*/

                //spc card remove in cards and after unuse cards array mathi high card remove 
                //var spc = _.flatten(spc);
                var unusecrd = _.difference(cards, _.flatten(spc))

                deadwood = 0;
                data.c = "";


                for (var i = 0; i < spc.length; i++) {
                    for (var j = 0; j < spc[i].length; j++) {
                        spc[i][j] = spc[i][j].trim()
                    }
                }


                if (unusecrd.length > 0) {
                    unusecrd.sort(function (e, f) {
                        return parseInt(e.split('-')[1]) - parseInt(f.split('-')[1])
                    });//sorting the element in sequence 
                    data.c = unusecrd[unusecrd.length - 1];

                    unusecrd.pop();

                    var rcard = gamelogicClass.pointDiffColor(unusecrd);
                    deadwood = com.CardPointSum(rcard.cards);

                } else {
                    data.c = "";

                    for (var i = 0; i < spc.length; i++) {

                        if (spc[i].length > 3) {
                            data.c = spc[i].splice(0, 1)[0]
                            break;
                        }
                    }
                }

                var index = cards.indexOf(data.c)
                if (index != -1) {
                    cards.splice(index, 1)
                } else {
                    console.log("cards ::-->>", cards)
                    console.log("index ::-->>", index)
                    console.log("data.c ::-->>", data.c)
                }
                //checking for user is eligible to knock on game.
                //var knocker = tb.pi[client.si];
                if (deadwood == 0 && data.c != "") {
                    db.collection('playing_table').findAndModify({
                        _id: MongoId(client.tbid),
                        "pi.si": parseInt(client.si),
                        "pi.cards": data.c
                    }, {}, {
                        /*$pull: {
                            "pi.$.cards": data.c
                        },*/
                        $push: {
                            open_deck: data.c
                        },
                        $set: {
                            "pi.$.cards": cards,
                            "pi.$.spc": spc, //new change time save in knock
                            "pi.$.status": "GIN",
                            "pi.$.ltc": data.c,
                            "pi.$.lodpc": "",
                            "pi.$.deadwood": 0
                        }
                    }, {
                        new: true
                    }, (err, updated) => {
                        c("err", err);
                        c("updated", updated);

                        if (err || updated.value == null) {
                            c("Nothing Updated in Table. knock ");
                            return false;
                        }

                        var t = (client._iscom == 1) ? 3000 : 2000;


                        var isron = true;
                        for (var i = 0; i < spc.length; i++) {


                            if (!gamelogicClass.CheckCardRonCases(spc[i])) {
                                isron = false;
                                break;
                            }
                        }


                        // Go Gin with at least one 4 cards set
                        var cardset = false, result = false;
                        for (i in spc) {

                            if (spc[i].length > 3) {

                                if (spc[0] != undefined && spc[1] != undefined && spc[0].length == spc[1].length) {
                                    result = JSON.stringify(_.sortBy(gamelogicClass.DiffColor(spc[0]).cards)) == JSON.stringify(_.sortBy(gamelogicClass.DiffColor(spc[1]).cards))

                                }
                                cardset = true;
                            }


                        }
                        if (result) {
                            trackClass.TrackSpinGame(client.uid, 6, 1)
                        }
                        if (cardset) {

                            trackClass.TrackSpinGame(client.uid, 31, 1)
                        }

                        var jokerwithset = false;
                        if (!updated.value.tou && _.filter(cards, function (num) { return num.split("-")[0] == "j" || num.split("-")[2] == 'j'; }).length >= 1) {

                            for (i in spc) {
                                if (spc[i].length > 2 && (gamelogicClass.CheckCardRonCases(spc[i]) || gamelogicClass.CheckCardteenCases(spc[i])) && _.filter(spc[i], function (num) { return num.split("-")[0] == "j" || num.split("-")[2] == 'j'; }).length >= 1) {
                                    jokerwithset = true
                                }
                            }
                        }

                        if (jokerwithset) {
                            trackClass.TrackSpinGame(client.uid, 11, 1)
                        }
                        if (!updated.value.tou) {
                            trackClass.TrackSpinGame(client.uid, 34, 1)
                        }
                        if (!updated.value.tou && isron) {
                            trackClass.TrackSpinGame(client.uid, 22, 1)
                        }

                        if (!updated.value.tou && data.c.split("-")[0] == 'j') {
                            trackClass.TrackSpinGame(client.uid, 4, 1)
                        }

                        if (!updated.value.tou && parseInt(client._iscom) == 0 && updated.value.pi[parseInt(client.si)] != undefined &&
                            updated.value.pi[parseInt(client.si)].pickopendackcard != undefined && updated.value.pi[parseInt(client.si)].pickopendackcard == 0) {
                            trackClass.TrackSpinGame(client.uid, 5, 1)
                        }

                        /*if((updated.value.isleague == undefined || updated.value.isleague == "" || updated.value.isleague == 0) && parseInt(data.c.split("-")[1]) == 13){
                            trackClass.TrackGemsQuestGame(client.uid.toString(),3)
                        }*/

                        //gin Rummy  to user and winner declare
                        //tb.lowchips  /*hec*/ = (uInfo.chips >= tb.bv) ? 1 : 0;
                        cdClass.SendDataToTable(client.tbid, {
                            en: 'GIN',
                            data: {
                                si: client.si,
                                c: data.c,
                                cards: updated.value.pi[client.si].cards,
                                cc: updated.value.pi[client.si].cards.length,
                                open_deck: updated.value.open_deck,
                                spc: updated.value.pi[client.si].spc,
                                deadwood: updated.value.pi[client.si].deadwood,
                            }
                        });
                        tb.type = 'GIN';
                        setTimeout(() => {

                            mechanismClass.DeclareWinnerPlayer(tb, parseInt(client.si))

                        }, t);
                    })
                } else {
                    cdClass.SendData(client, 'GIN', {}, 'error:1112');
                    
                }
            });
        } else {
            cdClass.SendData(client, 'GIN', {}, 'error:1112');
           
        }
    },
    /*
        spc:[],
        cards:[]
        
    */
    BIGGIN: (data, client) => { //BIGGIN on game

        if (typeof client.tbid != 'undefined' && typeof client.si != 'undefined') {

            cdClass.GetTableData(client.tbid, {
            }, (tb) => {

                if (!tb || typeof client.si == 'undefined' || parseInt(tb.ti) != parseInt(client.si) || (tb.pi[tb.ti].status != 'PFCD' && tb.pi[tb.ti].status != "PFODPU" && tb.pi[tb.ti].status != "PFOD")) {
                    cdClass.SendData(client, 'BIGGIN', {}, 'error:2222');
                    
                    return false;
                }

                var newspc = [];
                if (data.spc != undefined && data.spc != null && data.spc != "" && data.spc.length > 0) {
                    for (var i = 0; i < data.spc.length; i++) {

                        if (typeof data.spc[i] != "undefined" && typeof data.spc[i] == "string") {

                            data.spc[i] = data.spc[i].replace("[", "");
                            data.spc[i] = data.spc[i].replace("]", "");

                            var make = data.spc[i].split(",")

                            for (var j = 0; j < make.length; j++) {
                                make[j] = make[j].trim()
                            }

                            newspc.push(make)
                        } else if (typeof data.spc[i] != "undefined") {
                            newspc.push(data.spc[i])
                        }
                    }
                }

                var spc = (newspc.length > 0) ? newspc : tb.pi[tb.ti].spc;
                var cards = (data.cards != undefined && data.cards != null && data.cards != "" && data.cards.length > 0) ? data.cards : tb.pi[tb.ti].cards



                /*var  spc = tb.pi[tb.ti].spc;
                var cards = tb.pi[tb.ti].cards*/

                for (var i = 0; i < spc.length; i++) {
                    for (var j = 0; j < spc[i].length; j++) {
                        spc[i][j] = spc[i][j].trim()
                    }
                }

                var deadwood = gamelogicClass.PointCountDeadWood(spc, data.cards);

                //checking for user is eligible to knock on game.
                //var knocker = tb.pi[client.si];
                if (deadwood == 0) {
                    db.collection('playing_table').findAndModify({
                        _id: MongoId(client.tbid),
                        "pi.si": parseInt(client.si)
                    }, {}, {
                        $set: {
                            "pi.$.spc": spc, //new change time save in knock
                            "pi.$.status": "BIGGIN",
                            "pi.$.lodpc": "",
                            "pi.$.deadwood": 0
                        }
                    }, {
                        new: true
                    }, (err, updated) => {
                        c("err", err);
                        c("updated", updated);

                        if (err || updated.value == null) {
                            c("Nothing Updated in Table. knock ");
                            return false;
                        }

                        var t = (client._iscom == 1) ? 3000 : 2000;

                        var jokerwithset = false;
                        if (!updated.value.tou && _.filter(cards, function (num) { return num.split("-")[0] == "j" || num.split("-")[2] == 'j'; }).length >= 1) {

                            for (i in spc) {
                                if (spc[i].length > 2 && (gamelogicClass.CheckCardRonCases(spc[i]) || gamelogicClass.CheckCardteenCases(spc[i])) && _.filter(spc[i], function (num) { return num.split("-")[0] == "j" || num.split("-")[2] == 'j'; }).length >= 1) {
                                    jokerwithset = true
                                }
                            }
                        }

                        if (jokerwithset) {
                            trackClass.TrackSpinGame(client.uid, 11, 1)
                        }

                        //Bid Gin 5 Times 

                        if (!updated.value.tou)
                            trackClass.TrackSpinGame(client.uid, 3, 1)

                        if (updated.value.tou)
                            trackClass.TrackSpinGame(client.uid, 44, 1)


                        if (updated.value.isnotiid != undefined && updated.value.isnotiid != "" && updated.value.isbiggin != undefined && updated.value.isbiggin == false) {
                            db.collection("notification").update({ _id: MongoId(updated.value.isnotiid.toString()) }, { $set: { isbiggin: true } }, () => { })
                            db.collection("playing_table").update({ _id: MongoId(client.tbid.toString()) }, { $set: { isbiggin: true } }, () => { })

                        }
                        //gin Rummy  to user and winner declare
                        //tb.lowchips  /*hec*/ = (uInfo.chips >= tb.bv) ? 1 : 0;
                        cdClass.SendDataToTable(client.tbid, {
                            en: 'BIGGIN',
                            data: {
                                si: client.si,
                                cards: updated.value.pi[client.si].cards,
                                cc: updated.value.pi[client.si].cards.length,
                                open_deck: updated.value.open_deck,
                                spc: updated.value.pi[client.si].spc,
                                deadwood: updated.value.pi[client.si].deadwood,
                            }
                        });
                        tb.type = 'BIGGIN';
                        setTimeout(() => {
                            mechanismClass.DeclareWinnerPlayer(tb, parseInt(client.si))
                        }, t);
                    })
                } else {
                    cdClass.SendData(client, 'BIGGIN', {}, 'error:1112');
                    
                }
            });
        } else {
            cdClass.SendData(client, 'BIGGIN', {}, 'error:1112');
            
        }
    },
    LestsPlay: (tbId) => {

        var st = new Date();

        rclient.setnx("LestsPlay:" + tbId, 3, (err, chkFlag) => {

            if (chkFlag == 0) {
                return false;
            }

            rclient.expire("LestsPlay:" + tbId, 2);
            dbClass.findDataOne("playing_table", { _id: MongoId(tbId.toString()) }, {}, {}, (table) => {
                if (table) {
                    rclient.del("LestsPlay:" + tbId);

                    if (table == false || table.t_status != '' || table.ap <= 1) {

                        return false;
                    }
                    var realuser = 0;
                    var robot = 0;
                    var realuserprofile = {}


                    for (var x in table.pi) {
                        if (table.pi[x] == null) {

                            var set = { $set: {} };
                            set["$set"]["pi." + x + ""] = {};

                            db.collection('playing_table').updateOne({ _id: MongoId(tbId.toString()) }, set, { w: 0 })
                        } else if (typeof table.pi[x] != 'undefined' && typeof table.pi[x].si != 'undefined') {
                            table.pi[x].cards = [];
                            table.pi[x].status = "";
                            table.pi[x].point = 0;
                            table.pi[x].lodpc = "";
                            table.pi[x].lpc = "";
                            table.pi[x].ltc = "";
                            table.pi[x].spc = [];
                            table.pi[x].turn_miss_cont = 0;
                            table.pi[x].isnotallplay = 0;
                            table.pi[x].totalplay = table.pi[x].totalplay + 1;
                            table.pi[x].isknock = 0;


                            db.collection('playing_table').updateOne({ _id: MongoId(tbId.toString()), "pi.si": table.pi[x].si }, { $set: { "pi.$": table.pi[x] } }, { w: 0 })

                            if (table.pi[x].ui._iscom == 0) {
                                realuser++;
                                realuserprofile = table.pi[x].ui
                            }

                            if (table.pi[x].ui._iscom == 1) {
                                robot++;
                            }
                        }
                    }

                    var jobId = com.GetRandomString(10);
                    dbClass.updateDataOne("playing_table", { _id: MongoId(tbId.toString()) }, {
                        $set: {
                            t_status: 'GameStartTimer',
                            isNextround: "",
                            ctt: st,
                            pv: 0,
                            comp: 0,
                            jid: jobId,
                            round: 1,
                            score: [],
                            PassUser: [],
                            maindeadwood: 0,
                            turncount: -1,
                            EasyCARD: false,
                            isleave: [],
                            isgamewin: 0,
                            "trackercard": {
                                l: [],
                                c: [],
                                k: [],
                                f: [],
                                j: []
                            }
                        }
                    }, () => {

                        table.closedec_length = table.close_deck.length; //for tournamnet 

                        cdClass.SendDataToTable(tbId.toString(), {
                            en: 'GST', //Game  Satrt Timer 
                            data: {
                                Time: 5,
                                round: table.round,
                                table: (table.tou == false) ? {} : { data: table } //GTI Tournament mate issue fixed
                            }
                        });

                        var rtsTime = com.AddTime(5);

                        schedule.scheduleJob(jobId, new Date(rtsTime), () => {
                            schedule.cancelJob(jobId);
                            schedulerClass.CollectingBootValue({ tbId: tbId.toString() });
                        });
                    });
                }
            });
        });
    },
    LestsPlayAfterRound: (tbId) => {
        var st = new Date();

        rclient.setnx("LestsPlay:" + tbId, 3, (err, chkFlag) => {

            if (chkFlag == 0) {
                return false;
            }

            rclient.expire("LestsPlay:" + tbId, 2);
            dbClass.findDataOne("playing_table", { _id: MongoId(tbId.toString()) }, {}, {}, (table) => {
                if (table) {
                    rclient.del("LestsPlay:" + tbId);


                    if (table == false || table.t_status != 'NewRoundStarted' || table.ap <= 1) {

                        return false;
                    }

                    for (var x in table.pi) {
                        if (table.pi[x] == null) {

                            var set = { $set: {} };
                            set["$set"]["pi." + x + ""] = {};

                            db.collection('playing_table').updateOne({ _id: MongoId(tbId.toString()) }, set, { w: 0 })
                        } else if (typeof table.pi[x] != 'undefined' && typeof table.pi[x].si != 'undefined') {
                            table.pi[x].cards = [];
                            table.pi[x].lpc = "";
                            table.pi[x].ltc = "";
                            table.pi[x].spc = [];
                            table.pi[x].lodpc = "";
                            table.pi[x].isnotallplay = 0;
                            table.pi[x].turn_miss_cont = 0;//Time Out count  

                            db.collection('playing_table').updateOne({ _id: MongoId(tbId.toString()), "pi.si": table.pi[x].si }, { $set: { "pi.$": table.pi[x] } }, { w: 0 })
                        }
                    }


                    var jobId = com.GetRandomString(10);

                    dbClass.updateDataOne("playing_table", { _id: MongoId(tbId.toString()) }, {
                        $set: {
                            ctt: st,
                            comp: 0,
                            jid: jobId,
                            PassUser: [],
                            turncount: -1,
                            "trackercard": {
                                l: [],
                                c: [],
                                k: [],
                                f: [],
                                j: []
                            }
                        }
                    }, () => {

                        table.closedec_length = table.close_deck.length; //for tournamnet 

                        cdClass.SendDataToTable(tbId.toString(), {
                            en: 'GST', //Game  Satrt Timer 
                            data: {
                                Time: config.RST,
                                round: table.round,
                                table: (table.tou == false) ? {} : { data: table }, //GTI Tournament mate issue fixed
                                EasyCARD: false
                            }
                        });

                        var rtsTime = com.AddTime(config.RST);

                        schedule.scheduleJob(jobId, new Date(rtsTime), () => {
                            schedule.cancelJob(jobId);
                            schedulerClass.CollectingBootValueAfterRound({ tbId: tbId.toString() });
                        });

                    });
                }
            });
        });
    },
    GetCardsForGame: (table, callback) => {
        gamelogicClass.CardLogic(table, (gi) => {

            var i = 0;
            var usr = [];
            var uSeats = {};
            //db.collection("dublicate_card").find({code:1}).toArray((err,finduser)=>{


            for (var z = 0; z < table.ms; z++) {

                if (table.pi[z] == null || typeof table.pi[z] == 'undefined')
                    table.pi[z] = {};


                if (typeof table.pi[z].si != 'undefined') {

                    if (table.pi[z].ui._iscom == 0 && (table.isleague == undefined || table.isleague == 0)) {
                        trackClass.TrackSpinGame(table.pi[z].ui.uid, 8, 1)
                    }

                    var spc = gamelogicClass.MakeSpadesForCards(gi.cards[table.pi[z].si]);

                    var deadwood = gamelogicClass.PointCountDeadWood(spc, gi.cards[table.pi[z].si]);
                    //Joker mode and ek pan joker nu card hoi to j 
                    if ((table.mode == 4 || table.mode == 5 || table.mode == 6) && (gi.cards[table.pi[z].si].indexOf("j-0") != -1 || gi.cards[table.pi[z].si].indexOf("j-1") != -1)) {
                        var totalspc = _.flatten(spc)
                        for (var j = 0; j < totalspc.length; j++) {
                            if (totalspc[j].split("-")[2] == 'j') {
                                var checkcard = totalspc[j].split("-")[2] + "-" + totalspc[j].split("-")[3];

                                if (gi.cards[table.pi[z].si].indexOf(checkcard) != -1) {
                                    gi.cards[table.pi[z].si][gi.cards[table.pi[z].si].indexOf(checkcard)] = totalspc[j]
                                }
                            }
                        }
                    }

                    if (gi.cards[table.pi[z].si] != undefined && gi.cards[table.pi[z].si] != undefined && _.intersection(gi.cards[table.pi[z].si], gi.close_deck).length > 0) {
                        
                        console.log("GetCardsForGame ",gi)
                    }

                    table.pi[z].cards = gi.cards[table.pi[z].si];
                    table.pi[z].status = 'p';
                    table.pi[z].isplay = 1;
                    table.pi[z].spc = spc;
                    table.pi[z].deadwood = deadwood;
                    cdClass.UpdateTableData({
                        _id: table._id,
                        "pi.si": z
                    }, {
                        $set: {
                            "pi.$": table.pi[z]
                        }
                    });


                    /*if(!err && finduser[0].user.indexOf(table.pi[z].ui.pn) != -1)
                        cdClass.UpdateTableData({
                            _id: table._id,
                            "pi.si": z
                        },{
                            
                            $push: {
                                "pi.$.lastroundcard": {
                                    $each: [gi.cards[table.pi[z].si]],
                                    $slice: -3
                                }
                            }
                        });*/

                    usr.push(table.pi[z].ui.uid);
                    uSeats[usr[i]] = z;
                    i++;
                }
            }

            var updatedata = {
                $set: {
                    close_deck: gi.close_deck,
                    open_deck: gi.open_deck
                },

            }

            if (gi.open_deck.length > 0) {
                updatedata["$push"] = {}

                if (gi.open_deck[0].split("-")[2] != undefined && gi.open_deck[0].split("-")[2] == 'j') {
                    const data = gi.open_deck[0].split("-")
                    updatedata["$push"]["trackercard." + data[2]] = parseInt(data[3])
                } else {
                    const [card, value] = gi.open_deck[0].split("-")
                    updatedata["$push"]["trackercard." + card] = parseInt(value)
                }

            }


            //updating close_deck with database.
            cdClass.UpdateTableData(table._id.toString(), updatedata);

            //console.log(util.inspect(table, false, null, true /* enable colors */))

            //deduct boot amount from all users' account. first we have to get all user's chip
            db.collection('game_users').find({
                _id: {
                    $in: usr
                }
            }).project({
                chips: 1,
                pn: 1,
                flags: 1,
                socketid: 1,
                tou: 1
            }).limit(3)
                .toArray(function (err, ucheck) {
                    var ap = 0;

                    for (var v in ucheck) {

                        if (ucheck[v].chips < table.bv && table.tou == false && (table.league_free_game != undefined && table.league_free_game == 1)/*|| ucheck[v].flags._io == 0*/) {

                            mechanismClass.EG({
                                nogold: 1
                            }, {
                                frm: "io",
                                socketid: ucheck[v].socketid,
                                uid: ucheck[v]._id.toString(),
                                pn: ucheck[v].pn,
                                tbid: table._id.toString(),
                                si: uSeats[ucheck[v]._id.toString()]
                            });

                            //delete index frm array 
                            delete uSeats[ucheck[v]._id.toString()];
                        } else {
                            ap++;

                            /* if (ucheck[v].flags._iscom == 1)
                                 rclient.hdel("session:" + ucheck[v]._id.toString(), "st");
                             else
                                 rclient.hdel("session:" + ucheck[v].socketid, "st");*/

                            ucheck[v].uid = ucheck[v]._id.toString();

                            if (ucheck[v].flags._iscom == 0) {

                                //var spc =  gamelogicClass.MakeSpadesForCards(table.pi[uSeats[ucheck[v]._id.toString()]].cards);

                                //console.log("SPC",spc)
                                if (table.isnotiid != undefined && table.isnotiid != "") {
                                    trackClass.notibigtabletracking("bet", table.bv)
                                }


                                if (table.isleague == 1) {
                                    trackClass.playingLeagueBootTracking(table.bv, 0)
                                }

                                /*if(table.tou == undefined || table.tou == false)
                                    trackClass.newplayingTracking(-1,0,0,table.bv,table.bv)*/

                                cdClass.SendDataToUser(ucheck[v]._id.toString(), {
                                    en: 'SMC',
                                    data: {
                                        cards: table.pi[uSeats[ucheck[v]._id.toString()]].cards,
                                        deadwood: table.pi[uSeats[ucheck[v]._id.toString()]].deadwood,
                                        spc: table.pi[uSeats[ucheck[v]._id.toString()]].spc
                                    }
                                });
                            } else {

                                compClass.RobotCardSquenceAndSet(table.pi[uSeats[ucheck[v]._id.toString()]], table.mode, () => {

                                })
                            }
                        }
                    }

                    return callback(table, ap, uSeats);
                });
            //})
        });
    },
    GetCardsForNewRound: (table, callback) => {
        gamelogicClass.CardLogicnewround(table, (gi) => {

            var i = 0;
            var usr = [];
            var uSeats = {};
            //db.collection("dublicate_card").find({code:1}).toArray((err,finduser)=>{


            for (var z = 0; z < table.ms; z++) {

                if (table.pi[z] == null || typeof table.pi[z] == 'undefined')
                    table.pi[z] = {};


                if (typeof table.pi[z].si != 'undefined' && typeof table.pi[z].isplay != 'undefined' && table.pi[z].isplay == 1) {



                    var spc = gamelogicClass.MakeSpadesForCards(gi.cards[table.pi[z].si]);

                    var deadwood = gamelogicClass.PointCountDeadWood(spc, gi.cards[table.pi[z].si]);


                    if ((table.mode == 4 || table.mode == 5 || table.mode == 6) && (gi.cards[table.pi[z].si].indexOf("j-0") != -1 || gi.cards[table.pi[z].si].indexOf("j-1") != -1)) {
                        var totalspc = _.flatten(spc)
                        for (var j = 0; j < totalspc.length; j++) {
                            if (totalspc[j].split("-")[2] == 'j') {
                                var checkcard = totalspc[j].split("-")[2] + "-" + totalspc[j].split("-")[3];

                                if (gi.cards[table.pi[z].si].indexOf(checkcard) != -1) {
                                    gi.cards[table.pi[z].si][gi.cards[table.pi[z].si].indexOf(checkcard)] = totalspc[j]
                                }
                            }
                        }
                    }

                    table.pi[z].cards = gi.cards[table.pi[z].si];
                    table.pi[z].status = 'p';
                    table.pi[z].isplay = 1;
                    table.pi[z].spc = spc;
                    table.pi[z].deadwood = deadwood;
                    cdClass.UpdateTableData({
                        _id: table._id,
                        "pi.si": z
                    }, {
                        $set: {
                            "pi.$": table.pi[z]
                        }
                    });

                    /*if(!err && finduser[0].user.indexOf(table.pi[z].ui.pn) != -1)
                        cdClass.UpdateTableData({
                            _id: table._id,
                            "pi.si": z
                        },{
                            
                            $push: {
                                "pi.$.lastroundcard": {
                                    $each: [gi.cards[table.pi[z].si]],
                                    $slice: -3
                                }
                            }
                        });*/

                    usr.push(table.pi[z].ui.uid);
                    uSeats[usr[i]] = z;
                    i++;
                }
            }
            //updating close_deck with database.
            cdClass.UpdateTableData(table._id.toString(), {
                $set: {
                    close_deck: gi.close_deck,
                    open_deck: gi.open_deck
                }
            });

            //deduct boot amount from all users' account. first we have to get all user's chip
            db.collection('game_users').find({
                _id: {
                    $in: usr
                }
            }).project({
                chips: 1,
                pn: 1,
                flags: 1,
                socketid: 1,
                tou: 1
            }).limit(3)
                .toArray((err, ucheck) => {
                    var ap = 0;

                    for (var v in ucheck) {

                        /*if (ucheck[v].chips < (table.bv * 2) && table.tou == false) {
                            
                            mechanismClass.EG({
                                nogold: 1
                            }, {
                                frm: "io",
                                socketid: ucheck[v].socketid,
                                uid: ucheck[v]._id.toString(),
                                pn: ucheck[v].pn,
                                tbid: table._id.toString(),
                                si: uSeats[ucheck[v]._id.toString()]
                            });

                            delete uSeats[ucheck[v]._id.toString()];
                        } else {*/
                        ap++;

                        /* if (ucheck[v].flags._iscom == 1)
                             rclient.hdel("session:" + ucheck[v]._id.toString(), "st");
                         else
                             rclient.hdel("session:" + ucheck[v].socketid, "st");*/

                        ucheck[v].uid = ucheck[v]._id.toString();

                        if (ucheck[v].flags._iscom == 0) {

                            //var spc =  gamelogicClass.MakeSpadesForCards(table.pi[uSeats[ucheck[v]._id.toString()]].cards);

                            //console.log("SPC",spc)

                            cdClass.SendDataToUser(ucheck[v]._id.toString(), {
                                en: 'SMC',
                                data: {
                                    cards: table.pi[uSeats[ucheck[v]._id.toString()]].cards,
                                    deadwood: table.pi[uSeats[ucheck[v]._id.toString()]].deadwood,
                                    spc: table.pi[uSeats[ucheck[v]._id.toString()]].spc
                                }
                            });
                        } else {
                            compClass.RobotCardSquenceAndSet(table.pi[uSeats[ucheck[v]._id.toString()]], table.mode, () => {

                            })
                        }
                        //}
                    }

                    return callback(table, ap, uSeats);
                });
            //})
        });
    },
    StartUserPassedTurn: (tb, TurnData) => {
        var t = config.TT + 3;
        tb._id = tb._id.toString();
        var jobId = com.GetRandomString(10);
        tb.jid = jobId;
        tb.ti = TurnData.nt;
        /*cdClass.UpdateTableData(tb._id, {
            $set: {
                ti: TurnData.nt,
                ctt: new Date(),
                jid: jobId
            }
        },  ()=>{*/
        db.collection("playing_table").findAndModify({ _id: MongoId(tb._id.toString()) }, {},
            {
                $set: {
                    ti: parseInt(TurnData.nt),
                    ctt: new Date(),
                    jid: jobId

                },
                $inc: {
                    turncount: 1
                }
            }, { new: true }, (err, findtbdata) => {
                if (TurnData.nt == null || typeof tb.pi[TurnData.nt] == 'undefined' || tb.pi[TurnData.nt] == null || typeof tb.pi[TurnData.nt].si == 'undefined') {
                    console.log("_StartUserTurn return")
                    return false;
                }

                if (!err && findtbdata.value != null) {
                    TurnData.turncount = findtbdata.value.turncount
                } else {
                    console.log("err ", err)
                    console.log("findtbdata.value ", findtbdata.value)
                }

                TurnData.spc = tb.pi[tb.ti].spc;


                if (tb.pi[tb.ti].ui._iscom == 1 && config.ROBOT == true) {

                    compClass.TakeCompFristTurn(tb, TurnData);
                    var turnExpireTime = com.AddTime(t - 3);
                    //rclient.expire('jobs:' + tb.jid, 60);

                    schedule.scheduleJob(tb.jid, new Date(turnExpireTime), () => {

                        schedule.cancelJob(tb.jid);
                        schedulerClass.OnTurnExpirePass({ tbId: tb._id, ti: tb.ti, jid: tb.jid });
                    });
                    return false;
                } else {

                    TurnData.cards = tb.pi[tb.ti].cards;

                    //tell device that whoms turn for which table
                    TurnData.pc = (typeof tb.close_deck[0] != 'undefined') ? tb.close_deck[0] : '';
                    TurnData.open_deck_card = tb.open_deck
                    TurnData.close_deck = tb.close_deck != undefined ? tb.close_deck : []

                    cdClass.SendDataToTable(tb._id, {
                        en: 'UPTS', //userPassTurnStart
                        data: TurnData

                    });

                    var turnExpireTime = com.AddTime(t);


                    //rclient.expire('jobs:' + tb.jid, 60);
                    schedule.scheduleJob(tb.jid, new Date(turnExpireTime), () => {

                        schedule.cancelJob(tb.jid);
                        schedulerClass.OnTurnExpirePass({ tbId: tb._id, ti: tb.ti, jid: tb.jid });
                    });
                }
            });
    },
    StartUserTurn: (tb, TurnData) => {

        var t = config.TT + 3;
        tb._id = tb._id.toString();
        var jobId = com.GetRandomString(10);
        tb.jid = jobId;
        tb.ti = TurnData.nt;
        /*cdClass.UpdateTableData(tb._id, {
            $set: {
                ti: TurnData.nt,
                ctt: new Date(),
                jid: jobId,
                t_status: "RoundStarted"
            }
        },()=>{*/
        db.collection("playing_table").findAndModify({ _id: MongoId(tb._id.toString()) }, {},
            {
                $set: {
                    ti: parseInt(TurnData.nt),
                    ctt: new Date(),
                    jid: jobId,
                    t_status: "RoundStarted"
                },
                $inc: {
                    turncount: 1
                }
            }, { new: true }, (err, findtbdata) => {
                if (TurnData.nt == null || typeof tb.pi[TurnData.nt] == 'undefined' || tb.pi[TurnData.nt] == null || typeof tb.pi[TurnData.nt].si == 'undefined') {
                    c("_StartUserTurn return")
                    return false;
                }

                if (!err && findtbdata.value != null) {
                    TurnData.turncount = findtbdata.value.turncount
                } else {
                    console.log("err ", err)
                    console.log("findtbdata.value ", findtbdata.value)
                }

                TurnData.spc = tb.pi[tb.ti].spc;

                if (tb.pi[tb.ti].ui._iscom == 1 && config.ROBOT == true) {

                    compClass.TakeCompTurn(tb, TurnData);
                    var turnExpireTime = com.AddTime(t - 3);

                    schedule.scheduleJob(tb.jid, new Date(turnExpireTime), () => {

                        schedule.cancelJob(tb.jid);
                        schedulerClass.OnTurnExpire({ tbId: tb._id, ti: tb.ti, jid: tb.jid, opendecklock: TurnData.opendecklock, closedecklock: TurnData.closedecklock });
                    });
                    return false;
                } else {

                    TurnData.cards = tb.pi[tb.ti].cards;

                    //tell device that whoms turn for which table
                    TurnData.pc = (typeof tb.close_deck[0] != 'undefined') ? tb.close_deck[0] : '';
                    TurnData.open_deck_card = tb.open_deck
                    TurnData.close_deck = tb.close_deck != undefined ? tb.close_deck : []
                    cdClass.SendDataToTable(tb._id, {
                        en: 'UTS',
                        data: TurnData,
                    });

                    var turnExpireTime = com.AddTime(t);

                    schedule.scheduleJob(tb.jid, new Date(turnExpireTime), () => {

                        schedule.cancelJob(tb.jid);
                        schedulerClass.OnTurnExpire({ tbId: tb._id, ti: tb.ti, jid: tb.jid, opendecklock: TurnData.opendecklock, closedecklock: TurnData.closedecklock });
                    });
                }
            });
    },
    ChooseDealerForRound: (table) => {
        //if dealer is not defined previously then we have to select first user as dealer
        if (typeof table.cd == 'undefined') {
            var s = '';
            var k = 0; //key for seatIndex
            for (var x in table.pi) {
                if (table.pi[x] != null && typeof table.pi[x].jt != 'undefined') {
                    if (s == '' || s > table.pi[x].jt) {
                        s = table.pi[x].jt;
                        k = x;
                    }
                }
            }
            return k;
        } else //if playing in second round then we have move clock wise direction.
            return mechanismClass.ChooseTurnFromSet(table, table.cd, 0, 'dealer');
    },
    ChangeTableTurn: (tbId, obj) => {


        cdClass.GetTableData(tbId.toString(), {}, (table) => {
            //console.log("table",table)
            if (table == false) {
                return false;
            }
            var gpu = mechanismClass.TotalPlayedUser(table.pi);
            var customGPU = mechanismClass.GetContinuePlayingUserInRound(table.pi);

            var compcount = compClass.CountManageComp(table.pi);

            if ((gpu.length == 1 || table.close_deck.length == 0 || gpu.length == compcount) && com.InArray(table.t_status, stArr)) {
                setTimeout(() => {
                    mechanismClass.DeclareWinnerPlayer(table);
                }, 2000);
            } else if (customGPU.length > 1 && (table.t_status == 'NewRoundStarted' || table.t_status == 'RoundStarted' || table.t_status == 'RoundStartedPass' || table.t_status == "GameStartTimer")) {

                if (table.t_status == "RoundStartedPass" || table.t_status == 'RoundStarted') {

                    var nt = mechanismClass.ChooseNextTurn(table, table.ti, 0);
                    if (nt != obj.pt || typeof obj.pt == 'undefined') {
                        obj.nt = nt;
                        mechanismClass.StartUserTurn(table, obj);
                    }
                } else {
                    if (table.t_status == 'NewRoundStarted') {
                        schedulerClass.CollectingBootValueAfterRound({
                            tbId: tbId
                        });
                    } else {
                        schedulerClass.CollectingBootValue({
                            tbId: tbId
                        });
                    }
                }
            } else {
                console.log("else::-->>");
            }
        });
    },
    ChangeTablePassedTurn: (tbId, obj) => {

        cdClass.GetTableData(tbId.toString(), {}, (table) => {

            if (table == false) {
                return false;
            }
            var gpu = mechanismClass.TotalPlayedUser(table.pi);
            var customGPU = mechanismClass.GetContinuePlayingUserInRound(table.pi);

            var compcount = compClass.CountManageComp(table.pi);

            if ((gpu.length == 1 || table.close_deck.length == 0 || gpu.length == compcount) && com.InArray(table.t_status, stArr)) {
                setTimeout(() => {
                    mechanismClass.DeclareWinnerPlayer(table);
                }, 2000);
            } else if (customGPU.length > 1 && (table.t_status == 'NewRoundStarted' || table.t_status == 'RoundStarted' || table.t_status == 'RoundStartedPass' || table.t_status == "GameStartTimer")) {


                if (table.t_status == "RoundStartedPass" || table.t_status == 'RoundStarted') {


                    var nt = mechanismClass.ChooseNextTurn(table, table.ti, 0);


                    if (nt != obj.pt || typeof obj.pt == 'undefined') {
                        obj.nt = nt;
                        //mechanismClass.StartUserTurn(table, obj);
                        obj.opendecklock = 0;
                        obj.closedecklock = 1;

                        mechanismClass.StartUserPassedTurn(table, obj);
                    }
                } else {
                    if (table.t_status == 'NewRoundStarted') {
                        schedulerClass.CollectingBootValueAfterRound({
                            tbId: tbId
                        });
                    } else {
                        schedulerClass.CollectingBootValue({
                            tbId: tbId
                        });
                    }
                }
            } else {
                console.log("ChangeTablePassedTurn else::-->>");
            }
        });
    },
    DeclareWinnerPlayer: (tb, knocker, isfrom) => {
        //here we have multiple and single winner.

        rclient.setnx("lockwin:" + tb._id.toString(), 1, (err, uresp) => {

            if (uresp == 0) {
                return false;
            }

            rclient.expire("lockwin:" + tb._id.toString(), 1);  //1

            var tbId = tb._id.toString();
            var j = tb.jid;

            cdClass.GetTableData(tbId, (table) => {
                if (!table)
                    return false;

                table.type = tb.type;
                gamelogicClass.CheckForWinner(table, knocker, (winners) => {


                    var setdata = {
                        $set: {
                            jid: table.jid,
                            close_deck: [],
                            open_deck: [],
                            ctt: new Date(),
                            turncount: -1
                        }
                    }


                    if (table.t_status != "WinnerDeclared") {
                        setdata["$set"]["t_status"] = 'WinnerDeclared';
                        setdata["$set"]["isNextround"] = 'WinnerDeclared';
                    }


                    //updating table statuses for next round
                    cdClass.UpdateTableData(tbId, setdata, (up) => {

                        if (winners == false && table.tou == true && table.t_status != 'WinnerDeclared') {

                            // response tournamnet ma java devano 6e 
                            setTimeout(() => {

                                var sdata = {
                                    winner: [],
                                    group: table.group,
                                    touId: table.touId,
                                    status: table.status,
                                    tbid: tbId
                                }

                                TournamnetClass.WinnerDecalre(sdata)
                            }, 2000)
                            return false
                        }

                        if (((table.isleague == undefined || table.isleague == 0) && (table.tou == false && table.pv == 0)) || table.t_status == 'WinnerDeclared' || winners == false || winners.length == 0) {


                            db.collection("playing_table").update({ _id: MongoId(tb._id.toString()) }, {
                                $set: {
                                    t_status: 'FWinnerDeclared',
                                    isNextround: 'FWinnerDeclared',
                                    pv: 0,
                                    score: [],
                                    round: 1,
                                    maindeadwood: 0,
                                    "trackercard": {
                                        l: [],
                                        c: [],
                                        k: [],
                                        f: [],
                                        j: []
                                    }
                                }
                            }, () => {

                                if (config.SINGALROUND != undefined && config.SINGALROUND) {

                                    compClass.leaveAllPlayer(tbId);
                                } else {

                                    setTimeout(function () {
                                        schedulerClass.AfterGameFinish({
                                            tbId: tbId
                                        })
                                    }, (3 * 1000));
                                }

                            })
                            return false;
                        }

                        //cancel the turn on the server and declare the winner
                        com.CancelJobOnServer(j);
                        com.CancelScheduleJobOnServer(tbId, j);

                        table.jid = com.GetRandomString(10); //job for auto next round start.

                        var undercut = 0;
                        if (typeof winners.knockerwinner != "undefined" && winners.knockerwinner && tb.type == "knock") {

                            undercut = 25;

                        }
                        var totalAddpoint = 0;

                        if (winners.totaladdedpoint != undefined && winners.totalminuspoint != undefined) {
                            totalAddpoint = winners.totaladdedpoint + undercut;
                            totalAddpoint = totalAddpoint - winners.totalminuspoint;

                            totalAddpoint = parseInt(totalAddpoint / winners.winnercount);

                        }

                        if (totalAddpoint <= 0) {
                            totalAddpoint = 0
                        }

                        var totaluser = 0;
                        var score = [];

                        async.forEach(winners, (a, callbackfor) => {

                            if (typeof a.si != 'undefined') {
                                a.uid = table.pi[a.si].ui.uid;
                                /*db.collection("game_users").find({
                                    _id:MongoId(a.uid)
                                }).project({version:1,counters:1,ispromogame:1}).toArray((err,userdata)=>{

                                    console.log("err",err)
                                    console.log("userdata",userdata)
                                    if(!err && userdata.length > 0){
                                        a.egBanner =  cdClass.EGBanner(userdata[0])
                                    }*/

                                if (a.w) {
                                    a.previouspoint = a.point;
                                    a.currentroundpoint = totalAddpoint;
                                    a.point = a.point + totalAddpoint

                                    a.undercut = (undercut > 0) ? 1 : 0;

                                    // if (a.undercut)


                                    score.push({
                                        "si": a.si,
                                        "currentroundpoint": totalAddpoint,
                                        "pn": a.pn,
                                        "pp": a.pp,
                                        "uid": a.uid,
                                        "w": a.w,
                                        "point": a.point,
                                        "isgin": (tb.type == "GIN") ? 1 : 0,
                                        "isknock": (tb.type == "knock") ? 1 : 0

                                    })

                                    cdClass.UpdateTableData({
                                        _id: table._id,
                                        "pi.si": a.si
                                    }, {
                                        $set: {
                                            "pi.$.status": 'p',
                                            "pi.$.spc": [],
                                            "pi.$.cards": []
                                        },
                                        $inc: {
                                            "pi.$.point": totalAddpoint,
                                        },
                                        $unset: {
                                            "ti": "" //Unset for start a new round if other user exists just on collecting boot value.
                                        }
                                    }, () => {
                                        callbackfor()
                                    });
                                } else {
                                    a.previouspoint = a.point;
                                    a.currentroundpoint = 0;

                                    score.push({
                                        "si": a.si,
                                        "currentroundpoint": 0,
                                        "pn": a.pn,
                                        "pp": a.pp,
                                        "uid": a.uid,
                                        "w": a.w,
                                        "point": a.point,
                                        "isgin": 0,
                                        "isknock": 0,

                                    })

                                    cdClass.UpdateTableData({
                                        _id: table._id,
                                        "pi.si": a.si
                                    }, {
                                        $set: {
                                            "pi.$.status": 'p',
                                            "pi.$.spc": [],
                                            "pi.$.cards": []
                                        }
                                    }, () => {
                                        callbackfor()
                                    });
                                }

                                totaluser++;

                                //});
                            }
                        }, () => {

                            score.sort((e, f) => {
                                return parseInt(e.si) - parseInt(f.si)
                            })

                            db.collection("playing_table").findAndModify({
                                _id: MongoId(tb._id.toString())
                            }, {}, {
                                $push: {
                                    score: score
                                }
                            }, { new: true }, (err, update) => {

                                if (!err && update.value != null) {
                                    gamewin = false;
                                    //tie = false;
                                    count = 0;

                                    var points = []
                                    var pointswilder = []
                                    for (var i in update.value.pi) {

                                        if (update.value.pi[i].point >= update.value.point) {

                                            gamewin = true;
                                            points.push(update.value.pi[i].point);
                                            //break; // tie karva mate break hatavine count mukiyu jo count ++ hoi 2 hoi to  
                                        }


                                        var difpoint = update.value.pi[i].point != undefined ? update.value.pi[i].point : 0;

                                        pointswilder.push(difpoint)
                                    }
                                    if (totaluser <= 1) {
                                        gamewin = true
                                    }

                                    var maxp = Math.max.apply(null, points);
                                    winnercount = 0;

                                    for (var y in points) {
                                        if (points[y] == maxp) {
                                            winnercount++;
                                        }
                                    }

                                    if (winnercount >= 2) {
                                        gamewin = false;
                                        //tie = true;
                                    }

                                    for (var y in winners) {

                                        if (winners[y].point >= maxp) {

                                            if (winners[y].extraadd != undefined && parseFloat(winners[y].extraadd) > 1) {

                                                winners[y].rw = parseInt(table.pv /** parseFloat(winners[y].extraadd)*/);
                                            } else {
                                                winners[y].rw = table.pv;
                                            }

                                            winners[y].newsxp = winners[y].oldsxp + 7
                                            if (gamewin && winners[y].oldxp != undefined && winners[y].oldxp != null && winners[y].oldxp != "") {
                                                winners[y].newxp = userClass.ManageUserLevel_update_get(winners[y].oldxp, 7, "WIN", winners[y].doublexp)

                                                if (table.stargame != undefined && table.stargame) {

                                                    if (winners[y].iscentralmuseumlock != undefined && winners[y].iscentralmuseumlock == 1) {
                                                        winners[y].star_candy.add_candy = 1;
                                                        winners[y].star_candy.total_candy = winners[y].star_candy.add_candy + winners[y].star_candy.total_candy;

                                                    }
                                                }
                                            }



                                        } else {


                                            winners[y].rw = -table.bv;
                                            winners[y].newsxp = winners[y].oldsxp + 2
                                            if (gamewin && winners[y].oldxp != undefined && winners[y].oldxp != null && winners[y].oldxp != "") {
                                                winners[y].newxp = userClass.ManageUserLevel_update_get(winners[y].oldxp, 2, "loss", winners[y].doublexp)


                                            }

                                        }
                                    }


                                    pointswilder = pointswilder.sort(function (a, b) { return b - a });
                                    var pointdiff = pointswilder[0] - pointswilder[1];


                                    /*if(pointswilder.length > 0){
                                        var fp = pointswilder[0]

                                        console.log("FP",fp)
                                        _.each(_.without(pointswilder,pointdiff),e => {
                                            console.log("e",e)
                                            pointdiff += fp - e
                                        })
                                    }*/


                                    var ruc = [];


                                    for (var x in update.value.pi) {
                                        if (typeof update.value.pi[x] == 'object' && update.value.pi[x] != null && typeof update.value.pi[x].si != 'undefined' && update.value.pi[x].ui._iscom == 0)
                                            ruc.push(update.value.pi[x])
                                    }
                                    var iswait = false;


                                    if (!tb.tou && ruc.length == 1 && ruc[0].v >= 45 && ruc[0].isads == 0 && config.iswaitflag && !tb.stargame) {
                                        iswait = true
                                    }

                                    var issingal = (config.SINGALROUND != undefined) ? config.SINGALROUND : false

                                    issingal = (issingal == false && update.value.isleague != undefined && update.value.isleague == 1) ? update.value.isleague : issingal

                                    cdClass.SendDataToTable(tb._id.toString(), {
                                        en: 'RWIN',
                                        score: winners,
                                        mode: update.value.mode,
                                        point: update.value.point,
                                        bv: update.value.bv,
                                        _ip: update.value._ip,
                                        gamewin: gamewin,
                                        tie: (winners.winnercount == 1) ? false : true,
                                        //time:10,
                                        time: (gamewin || totaluser) ? 5 : 10,
                                        isTournament: (typeof update.value.tou != "undefined") ? update.value.tou : false,
                                        tbid: tb._id.toString(),
                                        knocker: (tb.type != undefined && tb.type == "knock") ? knocker : -1,
                                        winnercount: winners.winnercount,
                                        SINGALROUND: issingal,//(config.SINGALROUND != undefined)?config.SINGALROUND:false
                                        isleague: (tb.isleague != undefined) ? tb.isleague : 0,
                                        league_free_game: (tb.isleague == undefined || tb.isleague == 0 || tb.league_free_game == undefined) ? 1 : tb.league_free_game,//0 atle free 
                                        isnotiDelete: (tb.isnotiDelete != undefined) ? tb.isnotiDelete : false,
                                        isnotiid: (tb.isnotiid != undefined && tb.isnotiid != "") ? tb.isnotiid : "",
                                        iswildermode: (update.value.wildermode != undefined) ? update.value.wildermode : 0,
                                        wilderwin: (update.value.wildermode != undefined && update.value.wildermode != 0) ? pointdiff * update.value.wildermode : 0,
                                        pointdiff: pointdiff,
                                        stargame: (update.value.stargame != undefined) ? update.value.stargame : 0,
                                        ShowAds: (tb.tou || !config.iswaitflag) ? true : iswait,
                                        iswaitflag: config.iswaitflag,
                                        isgamewin: (update.value.isgamewin != undefined) ? update.value.isgamewin : 0,
                                    });


                                    if (gamewin || totaluser == 1 || update.value.tou) {
                                        //game winner and start new frash round 
                                        cdClass.UpdateTableData(tb._id.toString(), {
                                            $set: {
                                                t_status: 'FWinnerDeclaredStart',
                                                isgamewin: 1,
                                                ctt: new Date()
                                            }
                                        }, function (up) {

                                            var rtime = (typeof update.value.tou != "undefined" && update.value.tou == true) ? 2000 : 4000 //(totaluser <= 1)?3000:5000


                                            setTimeout(function () {
                                                mechanismClass.FinalDeclareWinnerPlayer(update.value, isfrom)
                                            }, rtime)

                                        })
                                    } else {

                                        //trackClass.RoundTracking("round")

                                        //not finish game next round start 

                                        if (!iswait || !config.iswaitflag) {
                                            //not finish game next round start 
                                            setTimeout(function () {
                                                schedulerClass.AfterRoundFinish({
                                                    tbId: tb._id.toString()
                                                })
                                            }, (8 * 1000));
                                        }

                                    }
                                }
                            });
                        })
                    })
                });
            });
        })
    },
    FinalDeclareWinnerPlayer: (tb, isfrom) => {

        rclient.setnx("lockwin:" + tb._id.toString(), 1, (err, uresp) => {

            if (uresp == 0) {
                return false;
            }

            rclient.expire("lockwin:" + tb._id.toString(), 1);  //1

            var tbId = tb._id.toString();
            var j = tb.jid;

            cdClass.GetTableData(tbId, (table) => {
                if (!table)
                    return false;

                gamelogicClass.CheckForWinnerFinal(table, (winners) => {

                    var setdata = {
                        $set: {
                            jid: table.jid,
                            close_deck: [],
                            open_deck: [],
                            ctt: new Date(),
                            turncount: -1,
                            isgamewin: 1
                        }
                    }


                    if (table.t_status != "FWinnerDeclared") {
                        setdata["$set"]["t_status"] = 'FWinnerDeclared';
                        setdata["$set"]["isNextround"] = 'FWinnerDeclared';
                    }


                    //updating table statuses for next round
                    cdClass.UpdateTableData(tbId, setdata, (up) => {
                        //Tournament mate 
                        if (winners == false && table.tou == true && table.t_status != 'FWinnerDeclared') {

                            // response tournamnet ma java devano 6e 
                            setTimeout(() => {

                                var sdata = {
                                    winner: [],
                                    group: table.group,
                                    touId: table.touId,
                                    status: table.status,
                                    tbid: tbId
                                }

                                TournamnetClass.WinnerDecalre(sdata)
                            }, 2000)
                            return false
                        }

                        if (((table.isleague == undefined || table.isleague == 0) && (table.tou == false && table.pv == 0)) || table.t_status == 'FWinnerDeclared' || winners == false || winners.length == 0) {

                            //if(winners == false || winners.length == 0){
                            /*cdClass.UpdateTableData(tbId,{$set:{t_status:""}},(up)=>{
                               compClass.PutCompToPlay(tbId);
                       
                               
                           })*/

                            if ((table.isleague != undefined && table.isleague == 1) || (config.SINGALROUND != undefined && config.SINGALROUND)) {

                                compClass.leaveAllPlayer(tbId);
                            } else {

                                setTimeout(function () {
                                    schedulerClass.AfterGameFinish({
                                        tbId: tbId
                                    })
                                }, (3 * 1000));
                            }
                            //}
                            return false;
                        }

                        //cancel the turn on the server and declare the winner
                        com.CancelJobOnServer(j);
                        com.CancelScheduleJobOnServer(tbId, j);

                        table.jid = com.GetRandomString(10); //job for auto next round start.

                        var winneruser = "";

                        var pointdiff = 0
                        //updating information for each winner.

                        for (var z in winners) {

                            if (typeof winners[z].si != 'undefined') {
                                winners[z].uid = table.pi[winners[z].si].ui.uid;

                                if (winners[z].w) {

                                    winneruser = winners[z].uid;

                                    var Set = {
                                        $set: {
                                            "pi.$.status": 'p',
                                            "pi.$.spc": [],
                                            "pi.$.cards": []
                                        },
                                        $inc: {
                                            "pi.$.chips": table.pv
                                        },
                                        $unset: {
                                            "ti": "" //Unset for start a new round if other user exists just on collecting boot value.
                                        }
                                    }


                                    if (table.stargame != undefined && table.stargame == 1) {

                                        db.collection("game_users").update({ _id: MongoId(table.pi[winners[z].si].ui.uid.toString()) }, { $inc: { sxp: 5 } }, () => { })
                                        Set["$inc"]["pi.$.sxp"] = 7;
                                        winners[z].newsxp = winners[z].oldsxp + 7;


                                        if (winners[z].iscentralmuseumlock != undefined && winners[z].iscentralmuseumlock == 1) {

                                            winners[z].star_candy.add_candy = 1;
                                            winners[z].star_candy.total_candy = winners[z].star_candy.add_candy + winners[z].star_candy.total_candy;

                                            Set["$inc"]["pi.$.star_candy.old_candy"] = 1
                                            Set["$inc"]["pi.$.star_candy.total_candy"] = 1
                                        }

                                        trackClass.TrackSpinGame(winners[z].uid, 25, 1)

                                        trackClass.TrackSpinGame(winners[z].uid, 35, ((table.pv * winners[z].extraadd) - table.bv))

                                        cdClass.updateUsercandy(winners[z].uid.toString(), 1, "Star Game Won")


                                        if (winners[z]._iscom == 0) {

                                            trackClass.TrackSystemGold("Star Player Deduct", Number((table.bv * table.ap * 15) / 100))
                                        }

                                        // Win 12 Games by Gin in Star Player
                                        var gincount = 0;
                                        for (i = 0; i < tb.score.length; i++) {

                                            for (j = 0; j < tb.score[i].length; j++) {

                                                if ((tb.score[i][j].uid.toString == winners[z].uid.toString) && tb.score[i][j].isgin == 1) {
                                                    gincount++;
                                                }
                                            }
                                        }

                                        if (gincount == tb.score.length) {

                                            trackClass.TrackSpinGame(winners[z].uid, 43, 1)
                                        }
                                    }
                                    else if (winners[z]._iscom == 0 && table.deduct == 15) {

                                        trackClass.TrackSystemGold("Normal Playing Deduct", Number((table.bv * table.ap * 15) / 100))
                                    }

                                    //winners[z].points = winners[z].points + totalAddpoint
                                    cdClass.UpdateTableData({
                                        _id: table._id,
                                        "pi.si": winners[z].si
                                    }, Set);

                                    // Win 10 Games by Knock.
                                    if (winners[z].isknock) {

                                        var knockcount = 0;
                                        for (i = 0; i < tb.score.length; i++) {

                                            for (j = 0; j < tb.score[i].length; j++) {

                                                if ((tb.score[i][j].uid.toString == winners[z].uid.toString) && tb.score[i][j].isknock == 1) {
                                                    knockcount++;
                                                }
                                            }
                                        }

                                        if (knockcount == tb.score.length) {
                                            trackClass.TrackSpinGame(winners[z].uid, 45, 1)
                                        }
                                    }

                                    if (winners[z].oldxp != undefined && winners[z].oldxp != null && winners[z].oldxp != "") {
                                        winners[z].newxp = userClass.ManageUserLevel_update_get(winners[z].oldxp, 7, "WIN", winners[z].doublexp)
                                    }
                                    if (!table.tou && (table.mode == 1 || table.mode == 3 || table.mode == 4 || table.mode == 6) && winners[z].isknock != undefined && winners[z].isknock == 0) {
                                        trackClass.TrackSpinGame(winners[z].uid, 10, 1)
                                    }

                                    if (table.isleague == 0 && !table.stargame && (typeof table.tou == 'undefined' || table.tou == false))
                                        winners[z].TMP = TonkMasterClass.track_point(1, table.pi[winners[z].si].ui.uid, "Playing")


                                } else {


                                    var Set = {
                                        $set: {
                                            "pi.$.status": 'p',
                                            "pi.$.spc": [],
                                            "pi.$.cards": []
                                        }
                                    }

                                    if (table.stargame != undefined && table.stargame == 1) {
                                        //db.collection("game_users").update({_id:MongoId(table.pi[winners[z].si].ui.uid.toString())},{$inc:{sxp:5}},()=>{})
                                        Set["$inc"] = {}
                                        Set["$inc"]["pi.$.sxp"] = 2;
                                        winners[z].newsxp = winners[z].oldsxp + 2;
                                    }

                                    //winners[z].points = winners[z].points + totalAddpoint
                                    cdClass.UpdateTableData({
                                        _id: table._id,
                                        "pi.si": winners[z].si
                                    }, Set);


                                    if (winners[z].oldxp != undefined && winners[z].oldxp != null && winners[z].oldxp != "") {
                                        winners[z].newxp = userClass.ManageUserLevel_update_get(winners[z].oldxp, 2, "loss", winners[z].doublexp)
                                    }
                                }

                                if (typeof table.tou == 'undefined' || table.tou == false) {


                                    if (table.isleague != undefined && table.isleague == 1) {
                                        if (winners[z].w && winners[z].point < table.point) {
                                            LeagueClass.pointadd(table.point, table.pi[winners[z].si].ui.uid, winners[z].w)

                                        } else {
                                            LeagueClass.pointadd(winners[z].point, table.pi[winners[z].si].ui.uid, winners[z].w)
                                        }

                                    }

                                    if (table.isleague != undefined && table.isleague == 2 && winners[z]._iscom == 0) {

                                        EventClass.EventResult(table.pi[winners[z].si].ui.uid, winners[z].w)
                                    }

                                    if (winners[z].w) {
                                        //winIDs.push(table.pi[winners.pl[z].si].ui.uid.toString());                           

                                        if (table.stargame != undefined && table.stargame == 0 && table.isleague != undefined && table.isleague == 0) {
                                            treasurechestClass.AddChest({ bv: table.bv, uid: table.pi[winners[z].si].ui.uid.toString() })

                                        }



                                        pointdiff += winners[z].point
                                        cdClass.CountHandsWin(table.pi[winners[z].si].ui.uid, table.mode, table.isleague); //counting Winners hand
                                        if (table.isleague == undefined || table.league_free_game == undefined || table.isleague == 0 || (table.isleague == 1 && table.league_free_game != 0)) {

                                            if (/*(table.stargame == undefined || table.stargame == 0) &&*/ winners[z].extraadd != undefined && winners[z].extraadd > 1) {

                                                var t = (tb.stargame == undefined || tb.stargame == 0) ? "2x Gold from Game Winner" : "1.5x Gold from Star Game Winner"
                                                var code = (tb.stargame == undefined || tb.stargame == 0) ? 60 : 65

                                                winners[z].rw = parseInt(table.pv /** winners[z].extraadd*/);

                                                cdClass.updateUserGold(table.pi[winners[z].si].ui.uid, table.pv * winners[z].extraadd, t + ' - ' + table._id, code);// - '+tbId);

                                            } else {
                                                winners[z].rw = table.pv;

                                                var t = (table.stargame == undefined || table.stargame == 0) ? "Winners For Game" : "Winners For Star Game"
                                                var code = (tb.stargame == undefined || tb.stargame == 0) ? 14 : 66

                                                cdClass.updateUserGold(table.pi[winners[z].si].ui.uid, table.pv, t + ' - ' + table._id, code);// - '+tbId);

                                                if (winners[z]._iscom == 0)
                                                    trackClass.newplayingTracking(-1, 1, 0, table.bv, -table.pv)

                                            }

                                            trackClass.TrackSpinGame(winners[z].uid, 33, 1)

                                            if (typeof winners[z].extraadd != "undefined" && (table.isleague == undefined || table.isleague == 0)) {

                                                trackClass.TrackSpinGame(winners[z].uid, 47, ((table.pv * winners[z].extraadd) - table.bv))
                                                trackClass.TrackSpinGame(winners[z].uid, 13, ((table.pv * winners[z].extraadd) - table.bv))
                                            }
                                        }

                                        cdClass.UpdateUserData(winners[z].uid.toString(), { $set: { "track.Closs": 0, "track.ClossForEg": 0, lgsn: 1 }, $inc: { "track.Cwin": 1 } }, function () { });

                                        trackClass.UserLastGameTrack(winners[z].uid.toString(), 'W');

                                        if (winners[z]._iscom == 0 && table.isnotiid != undefined && table.isnotiid != "") {
                                            trackClass.notibigtabletracking("win", table.pv)
                                        }

                                        /*if(config.LEAGUETYPE == "pointmultiplyer" && table.isleague != undefined && table.isleague == 1){

                                            if(winners[z].w && winners[z].point < table.point){
                                                LeagueClass.pointadd(table.point,table.pi[winners[z].si].ui.uid,winners[z].w)

                                            }else{
                                                LeagueClass.pointadd(winners[z].point,table.pi[winners[z].si].ui.uid,winners[z].w)
                                            }
                                        }*/



                                        if (winners[z]._iscom == 0) {
                                            trackClass.playingTracking(table.ap, table.mode, table.bv, 1)

                                            if (table.isleague != undefined && table.isleague != "" && table.isleague == 1) {
                                                trackClass.playingLeagueBootTracking(table.pv, 1)

                                                trackClass.ChipsTracking(table.pi[winners[z].si].ui.uid.toString(), Math.abs(table.pv), "Winners For Champions League")


                                            } else {

                                                if (table.mode == 4 || table.mode == 5 || table.mode == 6) {
                                                    trackClass.TrackGemsQuestGame(winners[z].uid.toString(), 1)
                                                }

                                                if ((table.mode == 1 || table.mode == 3 || table.mode == 4 || table.mode == 6) && winners[z].isknock == 0) {
                                                    trackClass.TrackGemsQuestGame(winners[z].uid.toString(), 2)
                                                }
                                            }
                                        }
                                    } else {
                                        winners[z].rw = -table.bv;//table.bv;
                                        pointdiff -= winners[z].point
                                        if (table.isnotiid != undefined && table.isnotiid != "" && table.isnotiid.length == 24) {
                                            db.collection("notification").update({ _id: MongoId(table.isnotiid), r: winners[z].uid.toString() }, { $push: { history: "L" } }, () => { })
                                        }

                                        cdClass.UpdateUserData(winners[z].uid.toString(), { $set: { "track.Cwin": 0, lgsn: 2 }, $inc: { "track.Closs": 1, "track.ClossForEg": 1 } }, function () { });

                                        trackClass.UserLastGameTrack(winners[z].uid.toString(), 'L');



                                        if (winners[z]._iscom == 0)
                                            trackClass.playingTracking(table.ap, table.mode, table.bv, 0)

                                    }
                                } else {
                                    if (!winners[z].w) {
                                        cdClass.UpdateUserData(winners[z].uid.toString(), { $set: { "tbid": "", si: "", tuid: "", lgs: 2 } }, function () { });
                                    } else {
                                        cdClass.UpdateUserData(winners[z].uid.toString(), { $set: { "tbid": "", si: "" } }, function () { });
                                    }
                                }
                            }
                        }


                        winners.sort(function (e, f) {
                            return parseInt(f.w) - parseInt(e.w)
                        });


                        if (table.wildermode != undefined && pointdiff * table.wildermode > 0 && winneruser != "") {
                            cdClass.updateUserGold(winneruser, pointdiff * table.wildermode, 'Wilder Reward - ' + table._id, 40);
                        }

                        cdClass.SendDataToTable(tbId, {
                            en: 'WIN',
                            data: winners, // aa key remove after 11 vaerion ma aave pachi 
                            score: winners,
                            winbv: table.winbv,
                            tbid: tbId,
                            isTournament: (typeof table.tou != "undefined") ? table.tou : false,
                            winnercount: winners.winnercount,
                            isleague: (table.isleague != undefined) ? table.isleague : 0,
                            iswildermode: (table.wildermode != undefined) ? table.wildermode : 0,
                            wilderwin: (table.wildermode != undefined && table.wildermode != 0) ? pointdiff * table.wildermode : 0,
                            pointdiff: pointdiff,
                            stargame: (table.stargame != undefined) ? table.stargame : 0,
                            isgamewin: (table.isgamewin != undefined) ? table.isgamewin : 0,
                        });

                        trackClass.RoundTracking("round")

                        if (table.point == 10 || table.point == 20)
                            trackClass.RoundTracking("special_round")


                        compClass.ExitGameOfComp(tbId)

                        var pl = 0;
                        var robotplaying = 0;
                        for (var x in table.pi) {
                            if (typeof table.pi[x] == 'object' && table.pi[x] != null && typeof table.pi[x].si != 'undefined' && table.pi[x].ui._iscom == 1) {
                                robotplaying = table.pi[x].totalplay
                                pl++;
                            }

                        }

                        var ruc = 0;
                        var uids = []

                        for (var x in table.pi) {
                            if (typeof table.pi[x] == 'object' && table.pi[x] != null && typeof table.pi[x].si != 'undefined' && table.pi[x].ui._iscom == 0) {
                                ruc++
                                if (table.isleave != undefined && table.isleave.indexOf(table.pi[x].ui.uid.toString()) != -1) {
                                    uids.push(table.pi[x].ui.uid.toString())
                                }
                            }
                        }



                        if (typeof table.tou != 'undefined' && table.tou == true && typeof table.touId != 'undefined' && table.touId.length == 24) {

                            setTimeout(function () {

                                var sdata = {
                                    winner: winners,
                                    group: table.group,
                                    touId: table.touId,
                                    status: table.status,
                                    tbid: tbId
                                }

                                TournamnetClass.WinnerDecalre(sdata)
                            }, 2000)

                        } else {

                            if (config.SINGALROUND != undefined && config.SINGALROUND) {

                                compClass.leaveAllPlayer(tbId, isfrom);
                            } else {
                                var pro = com.GetRandomInt(1, 10);

                                if (ruc == 0 && pl > 0) {
                                    compClass.ExitGameOfRobot(table._id);
                                }

                                //Ony one robot playing cou.. is stop and leave robot rendomly
                                if (table.stargame == 0 && ruc == 1 && pl == 1 && robotplaying >= 3 && pro > 5) {
                                    compClass.leaveAndJoinRobotTwoUserTime(tbId);
                                }

                                if (table.stargame == 1) {
                                    setTimeout(function () {
                                        compClass.leaveuserplayedgame(tbId, uids);
                                    }, 2000);
                                }

                                setTimeout(function () {
                                    schedulerClass.AfterGameFinish({
                                        tbId: tbId
                                    })
                                }, (10 * 1000));
                            }
                        }
                    })
                });
            });
        })
    },
    //remove not user funcation
    ChooseTurnFromSet: function (table, x, counter, type) {
        var players = table.pi;
        var plen = table.pi.length;
        var ase = table.ms - 1;
        var t = '';

        if (typeof counter == 'undefined')
            var counter = 0;

        if (x == ase)
            x = 0;
        else
            x = x + 1;

        //for stoping recursion
        if (counter == (table.ms + 1)) {
            if (typeof type != 'undefined') //means case for dealer selection.
                return table.cd;
            else
                return (x);
        }

        counter++;

        //if current index user is dealer then assign turn to next user.
        if (typeof type != 'undefined') // when selection dealer that time we do not have to check any condition.
        {
            if (typeof players[x] == 'undefined' || players[x] == null || typeof players[x].si == 'undefined' /*|| players[x].s == '' || players[x].cards == null || typeof players[x].cards == 'undefined' || players[x].cards.length <= 0*/)
                return this.ChooseTurnFromSet(table, x, counter, type);
            else
                return (x);
        } else {
            if (x < plen && (typeof players[x] == 'undefined' || players[x] == null || typeof players[x].si == 'undefined' || players[x].status == '' /*|| players[x].cards == null || typeof players[x].cards == 'undefined' || players[x].cards.length <= 0*/))
                return this.ChooseTurnFromSet(table, x, counter);
            else
                return (x);
        }
    },
    //remove user
    TotalPlayedUser: function (p) {
        var pl = new Array();
        if (typeof p == 'undefined' || p == null)
            return pl;

        for (var x in p) {
            if (typeof p[x] == 'object' && p[x] != null && typeof p[x].si != 'undefined' && p[x].status != '')
                pl.push(p[x]);
        }
        return pl;
    },
    GetContinuePlayingUserInRound: function (p) {
        var pl = new Array();
        if (typeof p == 'undefined' || p == null)
            return pl;

        for (var x in p) {
            if (typeof p[x] == 'object' && p[x] != null && typeof p[x].si != 'undefined' && (p[x].status == '' || p[x].status == 'p' || p[x].status == 'PFCD' || p[x].status == 'TC' || p[x].status == 'PFODPU' || p[x].status == 'PFOD' || p[x].status == 'PASS'))
                pl.push(p[x]);
        }
        return pl;
    },
    TotalActiveUserSeat: (playerdata) => {
        var seat = new Array();
        if (typeof playerdata == 'undefined' || playerdata == null)
            return seat;

        for (var x in playerdata) {
            if (typeof playerdata[x] == 'object' && playerdata[x] != null && typeof playerdata[x].si != 'undefined' && playerdata[x].status != '')
                seat.push(x);
        }
        return seat;
    },
    ChooseNextTurn: function (table, prevTurn, counter) {
        var p = table.pi;
        var plen = p.length;
        var mSeat = Number(table.ms - 1);

        if (prevTurn == mSeat)
            x = 0;
        else
            x = Number(prevTurn) + 1;

        if (counter == (table.ms + 1)) {
            return prevTurn;
        }

        counter++;

        if (x < plen && (p[x] == null || typeof p[x].si == 'undefined' || (p[x].playst == '' && p[x].cards.length <= 0) || p[x].cards == null || typeof p[x].cards == 'undefined' || p[x].cards.length <= 0))
            return this.ChooseNextTurn(table, x, counter);
        else
            return (x);
    },
    TimeOut: function (tbId, SeatIn, tb, opendecklock, closedecklock) {

        if (typeof tb.pi[SeatIn] == 'undefined') {
            return false;
        }

        if (tb.pi[SeatIn].status != 'PFCD') {
            var iData = {
                $inc: {
                    "pi.$.turn_miss_cont": 1
                }
            };
            tb.pi[SeatIn].turn_miss_cont = tb.pi[SeatIn].turn_miss_cont + 1;
            cdClass.UpdateTableData({
                _id: MongoId(tbId),
                "pi.si": Number(SeatIn)
            }, iData, function () {
            });
        }

        if (tb.pi[SeatIn] != null && tb.pi[SeatIn].turn_miss_cont >= config.ALTC) {

            var compcount = compClass.CountManageComp(tb.pi);
            var activeuer = mechanismClass.TotalPlayedUser(tb.pi);


            //priate table no hoi
            //active player 3 hoi tyare 
            //Two robot playing table ime check this also 
            if ((tb.t_status == 'RoundStarted' || tb.t_status == 'CollectingBootValue' || tb.t_status == 'StartDealingCard') &&
                ((activeuer.length == 2 && tb.ap == 2 && tb.wildermode != 0) ||
                    (tb.ap == 2 && tb.isleague != undefined && tb.isleague > 0) ||
                    (activeuer.length == 2 && tb.ap == 2 && tb.wildermode != 0)) &&
                compcount <= 1 /*&&  tb._ip == 0*/  /*&&  tb.pi[SeatIn].isplay == 1*/ &&
                tb.pi[SeatIn].status != '') {

                var uid = tb.pi[SeatIn].ui.uid;
                var socketid = tb.pi[SeatIn].ui.socketid;

                if (((typeof tb.touId == "undefined" || tb.touId == "" || tb.tou == false) && (tb.ms == 3)) ||
                    (activeuer.length == 2 && tb.ap == 2 && tb.wildermode != undefined && tb.wildermode != 0) ||
                    (tb.ap == 2 && tb.isleague != undefined && tb.isleague > 0) ||
                    (tb.tou == true && tb.ms == 3)) //not  tournamnet 
                {
                    var obj = {
                        en: 'EG',
                        data: {
                            si: SeatIn,
                            stt: 0,//switch to Table
                            auto: 1,
                            UID: uid,
                            tbid: tbId.toString(),
                            comp: 1,
                            isfrom: "",
                            promoflag: "",
                            promotag: "",
                            promolink: "",
                            nogold: 0,
                            wlg: 0,
                            singalround: 0,
                            quest: {},
                            isoffer: -1,
                            isstargameOver: 0
                            //uid: client.uid,
                        }
                    };

                    rclient.hdel('session:' + socketid.toString(), "tbid", "si");

                    cdClass.UpdateUserData(uid.toString(), { $set: { "wlg": 0, 'lgsn': 0 } }, function () { });
                    //if (client.frm == 'io') {
                    cdClass.SendDataToTable(tbId, obj);

                    cdClass.SendDataToUser(uid.toString(), {
                        en: 'EG',
                        data: obj.data
                    });


                    /*if (io.sockets.connected[socketid])
                         io.sockets.connected[socketid].leave(tbId);*/

                    io.of('/').adapter.remoteLeave(socketid, tbId, (err) => {
                        /*if (err) { console.log("Not Connect ",client.socketid) }*/

                    });


                    db.collection("game_users").findAndModify({ _id: MongoId(uid.toString()) }, {},
                        {
                            $set: {
                                tbid: "",
                                si: ""
                            }
                        }, { new: true }, (err, udata) => {

                            if (!err && udata.value != null) {

                                var sData = { en: 'CTJ', data: { jid: udata.value.reConnID } };
                                playExchange.publish('table.' + tbId.toString(), sData);
                            }
                        })

                    schedulerClass.RobotCompSection(tbId, SeatIn, (compData) => {

                        var ui = {
                            pn: compData.pn,
                            uid: MongoId(compData.uid),
                            _iscom: parseInt(compData._iscom),
                            si: SeatIn,
                            socketid: compData.socketid,
                            pp: compData.pp,
                            viplvl: parseInt(compData.viplvl)
                        };

                        if (typeof tb.touId != "undefined" && tb.touId != "" && tb.tou == true)
                            TournamnetClass.ExitTimeCompSeat({ touId: tb.touId.toString(), compData: ui }, { uid: uid }, () => { })


                        var upData = { $inc: {}, $set: {} };

                        upData["$set"]["pi." + compData.si + ".comp"] = 1;
                        upData["$set"]["pi." + compData.si + ".giftImg"] = "";
                        upData["$set"]["pi." + compData.si + ".ui"] = ui;
                        upData["$set"]["pi." + compData.si + ".turn_miss_cont"] = 0;
                        upData["$inc"]["comp"] = 1;



                        var wh = {
                            _id: MongoId(tbId),
                            "pi.si": SeatIn,
                            "pi.comp": 0,
                            //comp:{$lt:2}
                        };

                        db.collection('playing_table').findAndModify(wh, {}, upData, {
                            new: true
                        }, (err, tb) => {
                            //"RoundStarted", "GameStartTimer", "CollectingBootValue", "StartDealingCard"
                            //if user is playing in current table then we have to trigger leave method. 
                            if (tb.value != null && typeof tb.value != "undefined") {

                                c("tb.value.pi[si]", tb.value.pi[SeatIn]);

                                if (tb.value.isleague != undefined && tb.value.isleague == 2) {
                                    //cdClass.UpdateUserData(client.uid.toString(), {$set:{"league_muliplier":1}}, function () {});
                                    EventClass.EventResult(uid.toString(), 0)
                                }

                                if (tb.value.isleague != undefined && tb.value.isleague == 1) {
                                    LeagueClass.pointadd(0, uid, 0)
                                }

                                dashClass.TimeCofig(tb.value, compData);



                                //setTimeout(function () {
                                cdClass.SendDataToTable(tbId.toString(), {
                                    en: "JT",
                                    data: {
                                        si: SeatIn,
                                        ui: tb.value.pi[SeatIn]
                                    }
                                })
                                //},500);


                                rclient.hmset('session:' + compData.socketid, 'si', parseInt(SeatIn));
                                rclient.hmset('session:' + compData.socketid, 'tbid', tbId.toString());

                                if (tb.value.t_status == 'NewRoundStarted' || tb.value.t_status == 'RoundStartedPass' || tb.value.t_status == 'RoundStarted' || tb.value.t_status == 'CollectingBootValue' || tb.value.t_status == 'StartDealingCard') {
                                    trackClass.UserLastGameTrack(uid.toString(), 'L');
                                    cdClass.UpdateUserData(uid.toString(), { $set: { "track.Cwin": 0, lgsn: 2 }, $inc: { "track.Closs": 1, "track.ClossForEg": 1 } }, function () { });
                                }

                                mechanismClass.ManagePlayerComp(tb.value, compData, SeatIn, function () { });

                                notiClass.RemovejoinTableNoti(tb.value, { uid: uid.toString() });
                            } else {
                                console.log("time out ma comp seating ma issue ")
                            }
                        });
                    });
                } else { //if tournment do lets start not comp seating 


                    var obj = {
                        en: 'EG',
                        data: {
                            si: SeatIn,
                            stt: 0,//switch to Table
                            auto: 1,
                            UID: uid,
                            tbid: tbId,
                            comp: 0,
                            isfrom: "",
                            promoflag: "",
                            promotag: "",
                            promolink: "",
                            nogold: 0,
                            wlg: 0,
                            singalround: 0,
                            quest: {},
                            isoffer: -1,
                            isstargameOver: 0
                            //uid: client.uid,
                        }
                    };

                    cdClass.UpdateUserData(uid.toString(), { $set: { "wlg": 0, 'lgs': 0 } }, () => { });

                    cdClass.SendDataToTable(tbId, obj);

                    cdClass.SendDataToUser(uid.toString(), {
                        en: 'EG',
                        data: obj.data
                    });

                    /*if (io.sockets.connected[socketid])
                        io.sockets.connected[socketid].leave(tbId);*/

                    io.of('/').adapter.remoteLeave(socketid, tbId, (err) => {
                        /*if (err) { console.log("Not Connect ",client.socketid) }*/

                    });



                    var up = {
                        $set: {
                            "pi.$": {},
                            la: new Date()
                        },
                        $inc: {
                            ap: -1
                        }
                    };
                    var wh = {
                        _id: MongoId(tbId),
                        "pi.si": parseInt(SeatIn)
                    };


                    db.collection('playing_table').findAndModify(wh, {}, up, {
                        new: true
                    }, (err, tbn) => {

                        if (!err && tbn.value != null) {

                            if (typeof tbn.value.touId != "undefined" && tbn.value.touId != "")
                                TournamnetClass.ExitTimeCompSeat({
                                    touId: tbn.value.touId.toString(),
                                    compData: {
                                        pn: "",
                                        uid: "",
                                        _iscom: -1,
                                        si: -1,
                                        socketid: "",
                                        pp: "upload/user_left.png",
                                        viplvl: "",
                                        group: -1,
                                        jt: new Date(),
                                        leave: 1
                                    }
                                }, { uid: uid.toString() }, () => { })

                            rclient.hdel('session:' + socketid.toString(), "tbid", "si");

                            /*if(tbn.value.t_status.t_status == 'RoundStarted' || tbn.value.t_status.t_status == 'CollectingBootValue' || tbn.value.t_status.t_status == 'StartDealingCard'){
                                trackClass.UserLastGameTrack(client.uid.toString(),'L');
                                cdClass.UpdateUserData(client.uid.toString(), {$set:{"track.Cwin":0},$inc:{"track.Closs":1}}, function () {});
                            }*/
                            //TournamnetClass.EGT({touId:tb.touId}, {uid:uid}); 

                            if (tbn.value.isleague != undefined && tbn.value.isleague == 2) {
                                //cdClass.UpdateUserData(client.uid.toString(), {$set:{"league_muliplier":1}}, function () {});
                                EventClass.EventResult(uid.toString(), 0)
                            }

                            db.collection("game_users").findAndModify({
                                _id: MongoId(uid.toString())
                            },
                                {},
                                {
                                    $set: {
                                        tbid: "",
                                        si: "",
                                        tuid: "",
                                        tsi: ""
                                    }
                                }, { new: true }, (err, udata) => {

                                    if (!err && udata.value != null) {

                                        var sData = { en: 'CTJ', data: { jid: udata.value.reConnID } };
                                        playExchange.publish('table.' + tbId.toString(), sData);

                                    }

                                })

                            var count = 0;

                            for (var x in tbn.value.pi) {
                                if (typeof tbn.value.pi[x].ui != 'undefined' && tbn.value.pi[x].ui._iscom == 0 && tbn.value.pi[x].status != '') {
                                    count++;
                                }
                            }


                            trackClass.UserLastGameTrackTur(uid.toString(), 'L');

                            if (count == 0) {


                                compClass.ExitGameOfComp(tbn.value._id)

                                com.CancelScheduleJobOnServer(tbn.value._id.toString(), tbn.value.jid);
                                setTimeout(function () {
                                    mechanismClass.DeclareWinnerPlayer(tbn.value, 'EG');
                                }, 2000);

                            } else {

                                mechanismClass.ManagePlayerOnExitGame(tbn.value, parseInt(SeatIn));


                            }
                        } else {
                            console.log("else :::::::::::::::::::::")
                        }
                    })
                }
            } else {

                mechanismClass.AutoStandupUser(tb, tb.pi[SeatIn], function () {
                    mechanismClass.ChangeTableTurn(tbId, {
                        pt: SeatIn,
                        opendecklock: opendecklock,
                        closedecklock: closedecklock
                    }); //changing table turn
                });

            }
        } else {
            mechanismClass.ChangeTableTurn(tbId, {
                pt: SeatIn,
                opendecklock: opendecklock,
                closedecklock: closedecklock
            });
        }
    },
    AutoStandupUser: function (tb, TurnPlayer, callback) {

        if (typeof tb._id == 'undefined' || tb._id.toString().length < 24 || typeof TurnPlayer.ui.uid == 'undefined' || TurnPlayer.ui.uid.toString().length < 24) {
            return false;

        }
        var tbId = tb._id.toString();

        if (typeof TurnPlayer != 'undefined' && TurnPlayer != null && typeof TurnPlayer.si != 'undefined') {
            var UserId = TurnPlayer.ui.uid.toString();
            var up = {
                $set: {
                    "pi.$": {},
                    la: new Date()
                },
                $inc: {
                    ap: -1
                }
            };
            var wh = {
                _id: MongoId(tbId.toString()),
                "pi.ui.uid": MongoId(UserId.toString())
            };

            cdClass.GetUserInfo(UserId, {
                "flags._io": 1,
                reConnID: 1
            }, (uInfo) => {

                if (typeof uInfo.reConnID != 'undefined' && uInfo.reConnID != "") {

                    var sData = { en: 'CTJ', data: { jid: uInfo.reConnID } };
                    playExchange.publish('table.' + tbId.toString(), sData);

                }


                if (typeof uInfo.flags != 'undefined' /*&& uInfo.flags._io == 1*/) {
                    cdClass.SendDataToUser(UserId, {
                        en: 'EG',
                        data: {
                            si: TurnPlayer.si,
                            UID: UserId,
                            auto: 1,
                            tbid: tbId,
                            comp: 0,
                            isfrom: "",
                            promoflag: "",
                            promotag: "",
                            promolink: "",
                            nogold: 0,
                            wlg: 0,
                            singalround: 0,
                            quest: {},
                            isoffer: -1,
                            isstargameOver: 0
                        }
                    });
                }


                cdClass.SendDataToTable(tbId, {
                    en: 'EG',
                    data: {
                        si: TurnPlayer.si,
                        UID: UserId,
                        tbid: tbId,
                        auto: 1,
                        comp: 0,
                        isfrom: "",
                        promoflag: "",
                        promotag: "",
                        promolink: "",
                        nogold: 0,
                        wlg: 0,
                        singalround: 0,
                        quest: {},
                        isoffer: -1,
                        isstargameOver: 0
                    }
                });

                if ((typeof tb.touId == "undefined" && tb.touId == "" && tb.tou == false) || tb.t_status == 'NewRoundStarted' || tb.t_status == 'RoundStartedPass' || tb.t_status == 'RoundStarted' || tb.t_status == 'CollectingBootValue' || tb.t_status == 'StartDealingCard') {
                    trackClass.UserLastGameTrack(UserId.toString(), 'L');
                    cdClass.UpdateUserData(UserId.toString(), { $set: { "track.Cwin": 0 }, $inc: { "track.Closs": 1, "track.ClossForEg": 1 } }, function () { });

                    if (tb.isleague != undefined && tb.isleague == 1) {
                        LeagueClass.pointadd(0, UserId, 0)
                    }

                    if (tb.isleague != undefined && tb.isleague == 2) {
                        EventClass.EventResult(UserId.toString(), 0)
                    }
                    // if(tb.isleague != undefined && tb.isleague == 1){
                    //     cdClass.UpdateUserData(UserId.toString(), {$set:{"league_muliplier":1}}, function () {});
                    // }
                }

                if (typeof tb.touId != "undefined" && tb.touId != "" && tb.tou == true) {
                    trackClass.UserLastGameTrackTur(UserId.toString(), 'L');
                }

                cdClass.UpdateUserData(UserId.toString(), { $set: { "wlg": 0, 'lgs': 0, 'lgsn': 2 } }, () => { });

                //remove Table from user's index.
                db.collection("game_users").update({
                    _id: MongoId(UserId)
                }, {
                    $set: {
                        tbid: "",
                        si: "",
                        tuid: "",
                        tsi: ""
                    }
                }, () => {

                });
            })



            db.collection("playing_table").findAndModify(wh, {}, up, { new: true }, (err, updatedata) => {

                if (!err && updatedata.value != null) {

                    dashClass.SendGlobelRoom(updatedata.value)
                }
                return callback();
            })
            /*cdClass.UpdateTableData(wh, up, function () {
                return callback();
            });*/
        } else
            return callback();
    },
    
    CheckActiveSeat: (client, cb) => {
        if (client.ischallange) {
            return cb(false);
        }
        db.collection("playing_table").find({ "pi.ui.uid": MongoId(client.uid.toString()) }).toArray((err, counttable) => {
            if (!err && counttable.length > 0) {
               
                if (counttable[0].tou) {
                    var rankdeatils = _.filter(counttable[0].pi, function (num) { return num.ui != undefined && num.ui.uid != undefined && client.uid.toString() == num.ui.uid.toString() });
                    if (rankdeatils != undefined && rankdeatils[0].si != undefined) {
                        dashClass.TRGTI({ tbid: counttable[0]._id.toString(), tuid: counttable[0].touId.toString(), si: parseInt(rankdeatils[0].si) }, client)
                        return cb(true);
                    } else {
                        return cb(false);
                    }
                } else {
                    var rankdeatils = _.filter(counttable[0].pi, function (num) { return num.ui != undefined && num.ui.uid != undefined && client.uid.toString() == num.ui.uid.toString() });
                    if (rankdeatils != undefined && rankdeatils[0].si != undefined) {
                        dashClass.RGTI({ tbid: counttable[0]._id.toString(), si: parseInt(rankdeatils[0].si) }, client)
                        return cb(true);
                    } else {
                        return cb(false);
                    }
                }
            } else {
                db.collection('tournament').find({
                    $or: [
                        {
                            "round1.0.winid": "",
                            "round1.0.player.uid": MongoId(client.uid.toString())
                        },
                        {
                            "round1.1.winid": "",
                            "round1.1.player.uid": MongoId(client.uid.toString())
                        },
                        {
                            "round1.2.winid": "",
                            "round1.2.player.uid": MongoId(client.uid.toString())
                        },
                        {
                            "round2.0.winid": "",
                            "round2.0.player.uid": MongoId(client.uid.toString())
                        }
                    ],
                }).toArray(function (err, turData) {
                    if (!err && turData.length > 0) {
                       
                        dashClass.TRGTI({ tbid: "", tuid: turData[0]._id.toString() }, client)
                        return cb(true);
                    } else {
                        return cb(false);
                    }
                })
            }
        })
    },
    chooseTableUser: (data, udata, socket) => {
        rclient.setnx("lock:" + data.bv, 1, (err, resp) => {

            rclient.expire("lock:" + data.bv, 1);  //1

            var a = (resp > 0) ? {
                $lt: data.ms,
                $gte: 0
            } : 0;


            //Find table to play Friends
            var wh = {
                round: 1,
                ms: data.ms,
                ap: a,
                bv: data.bv,
                t_status: { $in: ["", "GameStartTimer", "FWinnerDeclared"] },
                mode: data.mode,
                "pi.ui.uid": { $nin: udata.block },
                $or: [
                    {
                        "pi.ui._iscom": 0
                    }
                ],
                tou: false,
                point: data.point
                
            };

            db.collection("playing_table").find(wh).toArray(function (err, ftb) {
                if (!err && ftb.length > 0) {
                    delete wh;
                    client.chips = udata.chips
                    mechanismClass.FindSetAndJoin(ftb[0]._id.toString(), client);
                } else {
                    delete wh;
                    mechanismClass.FindNewTable(data, udata, client);
                }
            });
        })
    },
    FindNewTable: function (data, udata, client) {

        var wh = {
            ap: 0,
            ms: data.ms,
            bv: data.bv,
            round: 1,
            point: data.point,
            t_status: "",
            mode: data.mode,
            tou: false
        };



        db.collection("playing_table").find(wh).toArray(function (err, ftb) {
            if (!err && ftb.length > 0) {
                delete wh;
                client.chips = udata.chips
                mechanismClass.FindSetAndJoin(ftb[0]._id.toString(), client);
            } else {
                delete wh;
                autoClass.DefaultFields(data, function (dbfields) {
                    db.collection("playing_table").save(dbfields, function (err, inData) {
                        if (!err && inData.ops.length > 0) {
                            client.chips = udata.chips
                            mechanismClass.FindSetAndJoin(inData.ops[0]._id, client);
                        } else {
                            console.log("err FindNewTable", err);
                        }
                    });
                });
            }
        });
    },
    FindSetAndJoin: function (tbid, socket, fs) {

        dbClass.findDataOne("playing_table", { _id: MongoId(tbid.toString()) }, {}, {}, (table) => {

            if (!table) {
                cdClass.SendData(socket, "PLAYGAME", {}, 'Data Not Proper Set',true);
                return false
            }

            compClass.EmptySeatFind(table, fs, function (Eseat) {

                if (typeof Eseat == 'undefined' || Eseat > table.ms) {
                    cdClass.SendData(socket, "PLAYGAME", {},  'Data Not Proper Set',true);
                    return false;
                }
                
                cdClass.GetUserInfo(socket.uid.toString(), {name:1,chips: 1,Iscom:1,profileUrl:1}, function (udata) {

                   

                        var ui = {
                            pn: udata.name,
                            uid: MongoId(socket.uid),
                            _iscom: udata._iscom,
                            si: Eseat,
                            socketid: socket.id,
                            pp: udata.profileUrl,
                        };

                        var userInfo = {
                            cards: [],
                            si: Eseat,
                            jt: new Date(),
                            ui: ui,
                            status: '',
                            turn_miss_cont: 0,//TOCount Time Out Count
                            isplay: 0,
                            spc: [],
                            lpc: "",
                            lodpc: "",
                            comp: 0,
                            point: 0,
                            ispass: 0,
                            deadwood: 0,
                            totalplay: 0,
                            isknock: 0,
                            chips: (typeof socket.chips != undefined) ? socket.chips : 0,
                        };

                        var set = { $set: { la: new Date() }, $inc: { ap: 1 } };
                        set["$set"]["pi." + Eseat + ""] = userInfo;

                        var wh = { _id: MongoId(tbid), ap: { $lt: table.ms } };

                        wh["pi." + Eseat + ".si"] = { $exists: false };

                        dbClass.findAndModify("playing_table", wh, set, { new: true }, (ujoin) => {

                            if (!ujoin) {
                                if (typeof table == "object") {

                                    autoClass.DefaultFields(table,function (dbfields) {

                                        db.collection("playing_table").save(dbfields, function (err, inData) {

                                            mechanismClass.FindSetAndJoin(inData.ops[0]._id, socket);
                                        });
                                    });
                                }
                                return false;
                            }

                            table = ujoin;

                            if (table.ap < table.ms) {
                                compClass.PutCompToPlay(tbid);
                            }


                            if (table.ap >= 2 && table.round == 1) {

                                setTimeout(function () {
                                    mechanismClass.LestsPlay(tbid);
                                }, 2000)
                            }

                            dashClass.TimeCofig(table, socket);

                            cdClass.SendData(socket, "GTI", table, '',false);

                            cdClass.SendDataToTable(tbid.toString(), {
                                en: "JT",
                                data: {
                                    tbid: tbid,
                                    si: Eseat,
                                    ui: userInfo
                                }
                            })

                          

                            socket.si=  parseInt(Eseat)
                            socket.tbid=  tbid.toString()


                            if (udata.Iscom == undefined || udata.Iscom == 0)
                                socket.join(tableInfo._id.toString());

                        })
                })
            });
        });
    },
    /*
        isEg:1

    */
    EG: function (data, client, cb) {

        if (typeof client == 'undefined' || typeof client.tbid == 'undefined') {

            if (data.isfrom == undefined || (data.isfrom != undefined && data.isfrom != "JTOF" && data.isfrom != "HN"))
                cdClass.SendData(client, "EG", {}, 'error:7012');


            if (typeof cb == 'function') {
                return cb();
            }

            return false;
        }


        var tbId = client.tbid;
        var si = parseInt(client.si);

        var iscom = true;
        //if user have not chips and EG time comp seat this issue solve by set flags 
        if (typeof data.nogold != 'undefined' && data.nogold == 1) {
            iscom = false;
        }

        rclient.hdel('session:' + client.socketid.toString(), "tbid", "si");

        var update = {
            $set: {
                tbid: "",
                si: "",
                tuid: "",
                tsi: "",
            }
        }

        if (data.mbrt != undefined && data.mbrt != "" && data.mbrt > 0) {
            update["$set"]["mbrt"] = data.mbrt;
        }

        db.collection('game_users').findAndModify({
            _id: MongoId(client.uid)
        }, {}, update, { new: true }, function (err, upUserRes) {
            if (!err && upUserRes.value != null) {

                //var isoffer = (upUserRes.value.track.buy_gold.length == 0 && upUserRes.value.chips < 1000000)?1:(upUserRes.value.chips > 1000000)?2:-1
                var isoffer = (upUserRes.value.track.buy_gold.length == 0 && (upUserRes.value.track.buy_booster == undefined || upUserRes.value.track.buy_booster.length == 0) && upUserRes.value.chips < 1000000) ? com.GetRandomInt(0, 1) ? 1 : -1 : (upUserRes.value.track.buy_booster == undefined || upUserRes.value.track.buy_booster.length == 0 /*&& upUserRes.value.chips > 1000000*/) ? com.GetRandomInt(0, 1) ? 2 : -1 : -1

                var promoflag = "";
                var promotag = "";
                var promolink = "";
                var day = new Date().getDay();
                var h = new Date().getUTCHours()

                trackClass.QuestDateForEg(upUserRes.value, (quest) => {

                    if (typeof config.OFFER != 'undefined' && config.OFFER != '' && com.GetRandomInt(0, 1) == 1) {
                        promoflag = config.OFFER;
                        promotag = config.OFFERTAG;

                    } else if (((day == 5 && h < 6) ||
                        (day == 1 && h >= 13) || day == 2 || day == 3 || day == 4)
                        && typeof upUserRes.value.version.aVersion != "undefined" && upUserRes.value.version.aVersion >= 43
                        && config.League != undefined && config.League != "" && upUserRes.value.l_league_muliplier == 1 && com.GetRandomInt(0, 1) == 1) {


                        promoflag = config.League;
                        promotag = "ChampionLeague";
                        promotype = "League";

                    } else if (((day == 1 && h < 6) || (day == 5 && h > 13) || day == 6 || day == 0) && typeof upUserRes.value.version.aVersion != "undefined" && upUserRes.value.version.aVersion >= 43
                        && config.League != undefined && config.League != "" && upUserRes.value.Event_join == false && com.GetRandomInt(0, 1) == 1) {



                        promoflag = config.Event_10_10;
                        promotag = "event10-10";
                        promotype = "Event_10_10";


                    } else {
                        if (typeof upUserRes.value.version.aVersion != "undefined" && upUserRes.value.version.aVersion >= 31 /*&& upUserRes.value.version.aVersion < 41*/ && quest.title != undefined /*&& com.GetRandomInt(0,1) == 1*/) {

                            promoflag = "";
                            promotag = "QUEST";


                        } else if (typeof upUserRes.value.version.aVersion != "undefined" && upUserRes.value.version.aVersion >= 23
                            && config.LOTTO != "" && upUserRes.value.flags._plotto == 0) {
                            promoflag = config.LOTTO;
                            promotag = "lotto";
                        } else if (config.PROMOMINI != "" && upUserRes.value.isfreemini == 0) {
                            promoflag = config.PROMOMINI;
                            promotag = "MiniGame";
                        } else if (typeof upUserRes.value.counters != 'undefined' && typeof upUserRes.value.counters.thkp != 'undefined' && typeof upUserRes.value.counters.thsp != 'undefined' && (upUserRes.value.counters.thkp + upUserRes.value.counters.thsp + upUserRes.value.counters.thop) <= 10 && typeof config.PROMO != 'undefined' && config.PROMO != '') {

                            if (com.GetRandomInt(0, 1) == 1) {
                                promoflag = config.PROMO;
                                promotag = config.PROMOTAG;
                            } else if (config.PROMOLIVE != "" && config.PROMOTAGLIVE != "") {
                                promoflag = config.PROMOLIVE;
                                promotag = config.PROMOTAGLIVE;
                            } else {
                                promoflag = config.PROMO;
                                promotag = config.PROMOTAG;
                            }
                        } else if (upUserRes.value.version.aVersion > 9 && typeof upUserRes.value.counters.thtp != "undefined" && upUserRes.value.counters.thtp == 0 && config.PROMOTOURNAMENT != "") {

                            promoflag = config.PROMOTOURNAMENT;
                            promotag = "Tournament";

                        } else if (upUserRes.value.ispromogame != undefined && upUserRes.value.ispromogame.length > 0) {

                            promoflag = upUserRes.value.ispromogame[0].PROMOGAME;
                            promotag = "PromoGame";
                            promolink = upUserRes.value.ispromogame[0].PROMOGAMELINK;

                        }
                    }

                    db.collection("playing_table").find({
                        _id: MongoId(tbId)
                    }).project({
                        pi: 1,
                        bv: 1,
                        t_status: 1,
                        _ip: 1,
                        ap: 1,
                        comp: 1,
                        touId: 1,
                        tou: 1,
                        ms: 1,
                        isleague: 1,
                        wildermode: 1
                    }).toArray(function (err, tbl) {

                        if (tbl.length > 0 && typeof tbl[0].pi[si] != 'undefined' && typeof tbl[0].pi[si].isplay != 'undefined' && typeof tbl[0].pi[si].ui != "undefined" && typeof tbl[0].pi[si].ui.uid != "undefined" && client.uid.toString() == tbl[0].pi[si].ui.uid.toString()) {

                            c("tbl", tbl[0].pi[si].isplay);

                            //var compcount=compClass.CountManageComp(tbl[0].pi);
                            var activeuer = mechanismClass.TotalPlayedUser(tbl[0].pi);

                            //priate table no hoi
                            //active player 3 hoi tyare 
                            //tournament na hoi

                         

                            if (((typeof tbl[0].touId == "undefined" || tbl[0].touId == "" || tbl[0].tou == false)
                                || (tbl[0].tou == true && tbl[0].ms == 3))
                                && (tbl[0].t_status == "NewRoundStarted" ||
                                    tbl[0].t_status == 'RoundStartedPass' ||
                                    tbl[0].t_status == 'RoundStarted' ||
                                    tbl[0].t_status == 'CollectingBootValue' ||
                                    tbl[0].t_status == 'StartDealingCard' ||
                                    tbl[0].t_status == "WinnerDeclared")
                                && iscom && ((activeuer.length == 3 && tbl[0].ap == 3 && tbl[0].wildermode == 0) || (tbl[0].ap == 2 && tbl[0].isleague != undefined && tbl[0].isleague > 0) || (activeuer.length == 2 && tbl[0].ap == 2 && tbl[0].wildermode != undefined && tbl[0].wildermode != 0)) && tbl[0].pi[si].status != '') {


                               
                                schedulerClass.RobotCompSection(tbId, si, function (compData) {

                                    
                                    var ui = {
                                        pn: compData.pn,
                                        uid: MongoId(compData.uid),
                                        _iscom: parseInt(compData._iscom),
                                        si: si,
                                        socketid: compData.socketid,
                                        pp: compData.pp,
                                        viplvl: parseInt(compData.viplvl)
                                    };

                                    if (tbl[0].tou == true)
                                        TournamnetClass.ExitTimeCompSeat({ touId: tbl[0].touId.toString(), compData: ui }, client, () => { })


                                    var upData = { $inc: {}, $set: {} };

                                    upData["$set"]["pi." + client.si + ".comp"] = 1;
                                    upData["$set"]["pi." + client.si + ".giftImg"] = "";
                                    upData["$set"]["pi." + client.si + ".ui"] = ui;
                                    upData["$set"]["pi." + client.si + ".turn_miss_cont"] = 0;
                                    upData["$inc"]["comp"] = 1;

                                    var wh = {
                                        _id: MongoId(tbId.toString()),
                                        "pi.si": si,
                                        "pi.comp": 0,
                                        comp: { $lt: 2 }
                                    };

                                    db.collection('playing_table').findAndModify(wh, {}, upData, {
                                        new: true
                                    }, function (err, tb) {
                                        //if two user left time second time comp not seat 
                                        if (err || tb.value == null) {


                                           
                                            var egObj = {
                                                si: si,
                                                stt: (typeof data.stt != 'undefined') ? data.stt : 0,//switch to Table
                                                auto: 0,
                                                UID: client.uid,
                                                comp: 0,
                                                isfrom: (typeof data.isfrom != 'undefined') ? data.isfrom : "",
                                                promoflag: promoflag,
                                                promotag: promotag,
                                                promolink: promolink,
                                                nogold: (typeof data.nogold == 'undefined') ? 0 : 1,
                                                wlg: (typeof upUserRes.value.wlg == 'undefined' || parseInt(client.v) < parseInt(config.VIDEONOTIVERSION)) ? 0 : upUserRes.value.wlg,
                                                tbid: tbId,
                                                singalround: 0,
                                                quest: quest,
                                                isoffer: isoffer,
                                                isstargameOver: 0
                                                //uid: client.uid,
                                            };

                                            var obj = {
                                                en: 'EG',
                                                data: egObj
                                            };



                                            if (client.frm == 'io') {
                                                cdClass.SendDataToTable(tbId, obj);

                                                cdClass.SendData(client, "EG", egObj, 'succes:0000');

                                                c("\n\n\nEG :::::::::::::::::::::;--------------------------------->>>>>>>>>>>>>>>>", tbId);
                                                /* if (io.sockets.connected[client.socketid])
                                                     io.sockets.connected[client.socketid].leave(tbId);*/

                                                io.of('/').adapter.remoteLeave(client.socketid, tbId, (err) => {
                                                    /*if (err) { console.log("Not Connect ",client.socketid) }*/


                                                });

                                            }

                                            var up = {
                                                $set: {
                                                    "pi.$": {},
                                                    la: new Date()
                                                },
                                                $inc: {
                                                    ap: -1
                                                }
                                            };
                                            var wh = {
                                                _id: MongoId(tbId),
                                                "pi.si": si
                                            };

                                            db.collection('playing_table').findAndModify(wh, {}, up, {
                                                new: true
                                            }, function (err, tbn) {
                                                if (!err && tbn.value != null) {

                                                    if (tbn.value.t_status == "NewRoundStarted" || tbn.value.t_status == 'RoundStartedPass' || tbn.value.t_status == 'RoundStarted' || tbn.value.t_status == 'CollectingBootValue' || tbn.value.t_status == 'StartDealingCard') {
                                                        trackClass.UserLastGameTrack(client.uid.toString(), 'L');
                                                        cdClass.UpdateUserData(client.uid.toString(), { $set: { "track.Cwin": 0 }, $inc: { "track.Closs": 1, "track.ClossForEg": 1 } }, function () { });
                                                    }

                                                    if (tbn.value.isleague != undefined && tbn.value.isleague == 2) {
                                                        EventClass.EventResult(client.uid, 0)
                                                    }

                                                    if (tb.value.isleague != undefined && tb.value.isleague == 1 && tbl[0].pi[si].ui._iscom == 0) {
                                                        LeagueClass.pointadd(0, client.uid, 0)
                                                    }

                                                    var count = 0;

                                                    for (var x in tbn.value.pi) {
                                                        if (typeof tbn.value.pi[x].ui != 'undefined' && tbn.value.pi[x].ui._iscom == 0 && tbn.value.pi[x].status != '') {
                                                            count++;
                                                        }
                                                    }

                                                    if (count == 0) {


                                                        compClass.ExitGameOfComp(tbn.value._id)

                                                        com.CancelScheduleJobOnServer(tbn.value._id.toString(), tbn.value.jid);
                                                        setTimeout(function () {
                                                            mechanismClass.DeclareWinnerPlayer(tbn.value);
                                                        }, 2000);

                                                    } else {

                                                        mechanismClass.ManagePlayerOnExitGame(tbn.value, si);


                                                    }

                                                    if (typeof data.stt == 'undefined' || typeof data.stt == 0) {

                                                        cdClass.UpdateUserData(client.uid.toString(), { $set: { "wlg": 0 } }, function () { });
                                                    }

                                                    notiClass.RemovejoinTableNoti(tbn.value, client);

                                                    if (typeof cb == 'function') {
                                                        return cb();
                                                    }

                                                } else {
                                                    if (typeof cb == 'function') {
                                                        return cb();
                                                    }
                                                }
                                            })
                                        } else {
                                            //"RoundStarted", "GameStartTimer", "CollectingBootValue", "StartDealingCard"
                                            //if user is playing in current table then we have to trigger leave method. 


                                            /*if (typeof tb.value != "undefined" && tb.value != null ) {  */
                                            
                                            var egObj = {
                                                si: si,
                                                stt: (typeof data.stt != 'undefined') ? data.stt : 0,//switch to Table
                                                auto: 0,
                                                UID: client.uid,
                                                comp: 1,
                                                isfrom: (typeof data.isfrom != 'undefined') ? data.isfrom : "",
                                                promoflag: promoflag,
                                                promotag: promotag,
                                                promolink: promolink,
                                                nogold: (typeof data.nogold == 'undefined') ? 0 : 1,
                                                wlg: (typeof upUserRes.value.wlg == 'undefined' || parseInt(client.v) < parseInt(config.VIDEONOTIVERSION)) ? 0 : upUserRes.value.wlg,
                                                tbid: tbId,
                                                singalround: 0,
                                                quest: quest,
                                                isoffer: isoffer,
                                                isstargameOver: 0
                                                //uid: client.uid,
                                            };


                                            var obj = {
                                                en: 'EG',
                                                data: egObj
                                            };


                                            if (client.frm == 'io') {
                                                cdClass.SendDataToTable(tbId, obj);

                                                cdClass.SendData(client, "EG", egObj, 'succes:0000');

                                                //setTimeout(function () {

                                                c("\n\n\nEG :::::::::::::::::::::;--------------------------------->>>>>>>>>>>>>>>>", tbId);
                                                /*if (io.sockets.connected[client.socketid])
                                                    io.sockets.connected[client.socketid].leave(tbId);*/
                                                io.of('/').adapter.remoteLeave(client.socketid, tbId, (err) => {
                                                    /*if (err) { console.log("Not Connect ",client.socketid) }*/


                                                });
                                                //}, 100);
                                            }


                                            dashClass.TimeCofig(tb.value, compData);

                                            cdClass.SendData(compData, "GTI", tb.value, 'succes:0000');

                                            //setTimeout(function () {
                                            cdClass.SendDataToTable(tbId.toString(), {
                                                en: "JT",
                                                data: {
                                                    si: si,
                                                    ui: tb.value.pi[si]
                                                }
                                            })
                                            //},500);



                                            rclient.hmset('session:' + compData.socketid, 'si', parseInt(si));
                                            rclient.hmset('session:' + compData.socketid, 'tbid', tbId.toString());

                                            if (tb.value.t_status == "RoundStartedPass" || tb.value.t_status == 'RoundStarted' || tb.value.t_status == 'CollectingBootValue' || tb.value.t_status == 'StartDealingCard') {
                                                trackClass.UserLastGameTrack(client.uid.toString(), 'L');
                                                cdClass.UpdateUserData(client.uid.toString(), { $set: { "track.Cwin": 0 }, $inc: { "track.Closs": 1, "track.ClossForEg": 1 } }, function () { });
                                                if (tb.value.isleague != undefined && tb.value.isleague == 1 && tbl[0].pi[si].ui._iscom == 0) {
                                                    LeagueClass.pointadd(0, client.uid, 0)
                                                }

                                                if (tb.value.isleague != undefined && tb.value.isleague == 2 && tbl[0].pi[si].ui._iscom == 0) {
                                                    EventClass.EventResult(client.uid.toString(), 0)
                                                }

                                            }

                                            mechanismClass.ManagePlayerComp(tb.value, compData, si, function () { });

                                            if (typeof data.stt == 'undefined' || typeof data.stt == 0) {
                                                cdClass.UpdateUserData(client.uid.toString(), { $set: { "wlg": 0 } }, function () { });
                                            }


                                            notiClass.RemovejoinTableNoti(tb.value, client);

                                            if (typeof cb == 'function') {
                                                return cb();
                                            }
                                        }
                                    });
                                });
                            } else {


                                var egObj = {
                                    si: si,
                                    stt: (typeof data.stt != 'undefined') ? data.stt : 0,//switch to Table
                                    auto: 0,
                                    UID: client.uid,
                                    comp: 0,
                                    isfrom: (typeof data.isfrom != 'undefined') ? data.isfrom : "",
                                    promoflag: promoflag,
                                    promotag: promotag,
                                    promolink: promolink,
                                    nogold: (typeof data.nogold == 'undefined') ? 0 : 1,
                                    wlg: (typeof upUserRes.value.wlg == 'undefined' || parseInt(client.v) < parseInt(config.VIDEONOTIVERSION)) ? 0 : upUserRes.value.wlg,
                                    tbid: tbId,
                                    singalround: 0,
                                    quest: quest,
                                    isoffer: isoffer,
                                    isstargameOver: 0
                                };

                                var obj = {
                                    en: 'EG',
                                    data: egObj
                                };

                                if (client.frm == 'io') {
                                    cdClass.SendDataToTable(tbId.toString(), obj);

                                    cdClass.SendData(client, "EG", egObj, 'succes:0000');


                                    //setTimeout(function () {
                                    c("\n\n\nEG :::::::::::::::::::::;--------------------------------->>>>>>>>>>>>>>>>", tbId);
                                    /*if (io.sockets.connected[client.socketid])
                                        io.sockets.connected[client.socketid].leave(tbId);*/

                                    io.of('/').adapter.remoteLeave(client.socketid, tbId, (err) => {
                                        /*if (err) { console.log("Not Connect ",client.socketid) }*/

                                    });

                                    //}, 100);
                                }

                                //if user leaving it seat 
                                var up = {
                                    $set: {
                                        "pi.$": {},
                                        la: new Date()
                                    },
                                    $inc: {
                                        ap: -1
                                    }
                                };
                                var wh = {
                                    _id: MongoId(tbId),
                                    "pi.si": si
                                };


                                db.collection('playing_table').findAndModify(wh, {}, up, {
                                    new: true
                                }, function (err, tb) {
                                    if (err || tb.value == null) {
                                        c("Error in updating table for user : " + client.pn + " with uid : " + client.uid);
                                    }

                                    //"RoundStarted", "GameStartTimer", "CollectingBootValue", "StartDealingCard"
                                    //if user is playing in current table then we have to trigger leave method. 

                                    if (tb.value != null && typeof tb.value != "undefined") {

                                        if ((typeof tbl[0].touId == "undefined" || tbl[0].touId == "" || tbl[0].tou == false) && (tb.value.t_status == "NewRoundStarted" || tb.value.t_status == 'RoundStartedPass' || tb.value.t_status == 'RoundStarted' || tb.value.t_status == 'CollectingBootValue' || tb.value.t_status == 'StartDealingCard') && /*tbl[0].pi[si].isplay == 1 &&*/ tbl[0].pi[si].status != '') {
                                            trackClass.UserLastGameTrack(client.uid.toString(), 'L');
                                            cdClass.UpdateUserData(client.uid.toString(), { $set: { "track.Cwin": 0 }, $inc: { "track.Closs": 1, "track.ClossForEg": 1 } }, function () { });

                                            if (tb.value.isleague != undefined && tb.value.isleague == 1 && tbl[0].pi[si].ui._iscom == 0) {
                                                LeagueClass.pointadd(0, client.uid, 0)
                                            }

                                            if (tb.value.isleague != undefined && tb.value.isleague == 2 && tbl[0].pi[si].ui._iscom == 0) {
                                                EventClass.EventResult(client.uid.toString(), 0)
                                            }

                                            // if(tbl[0].isleague != undefined && tbl[0].isleague == 1){
                                            //     cdClass.UpdateUserData(client.uid.toString(), {$set:{"league_muliplier":1}}, function () {});
                                            // } 

                                        }

                                        if (typeof tbl[0].touId != "undefined" && tbl[0].touId != "" && tbl[0].tou == true) {

                                            TournamnetClass.ExitTimeCompSeat({
                                                touId: tbl[0].touId.toString(), compData: {
                                                    pn: "",
                                                    uid: "",
                                                    _iscom: -1,
                                                    si: -1,
                                                    socketid: "",
                                                    pp: "upload/user_left.png",
                                                    viplvl: "",
                                                    group: -1,
                                                    jt: new Date(),
                                                    leave: 1
                                                }
                                            }, client, () => { })

                                            trackClass.UserLastGameTrackTur(client.uid.toString(), 'L');
                                        }

                                        if (tb.value.tou == false && (tb.value._ip == 0 || tb.value.stargame == 1)) {
                                            dashClass.SendGlobelRoom(tb.value);
                                        }

                                        mechanismClass.ManagePlayerOnExitGame(tb.value, si);
                                        //after remove entry from this table we have to emit this information to all table member.
                                        notiClass.RemovejoinTableNoti(tb.value, client);

                                        if (typeof data.stt == 'undefined' || typeof data.stt == 0) {
                                            cdClass.UpdateUserData(client.uid.toString(), { $set: { "wlg": 0 } }, function () { });
                                        }

                                        if (tb.value._ip) {

                                            db.collection("playing_table").deleteOne({ _id: MongoId(tbId), ap: 0, _ip: 1 }, () => { })
                                        }
                                    } else {
                                        console.log("eg ma comp seating na issue ", err);
                                        console.log("eg ma comp seating na issue tb.value ", tb.value);
                                    }
                                    if (typeof cb == 'function')
                                        return cb();
                                });
                            }
                        } else {
                            cdClass.SendData(client, "EG", {}, 'error:7012');
                            if (typeof cb == 'function')
                                return cb();
                        }
                    });
                })
            } else {
                console.log("user info for tbId and si updated for user : " + client.pn);

                if (typeof cb == 'function') {
                    return cb();
                }
            }
        });
    },
    ManagePlayerOnExitGame: function (tb, si) {
        if (typeof tb._id != "undefined") {
            cdClass.GetTableData(tb._id.toString(), {}, function (tb) {
                if (tb) {
                    var pl = mechanismClass.TotalPlayedUser(tb.pi);

                    var cpl = mechanismClass.GetContinuePlayingUserInRound(tb.pi);

                    var tbId = tb._id.toString();



                    if (cpl.length <= 1 && (tb.t_status == 'GameStartTimer' || tb.t_status == "" || tb.t_status == "CollectingBootValue" || tb.t_status == 'RoundStarted' || tb.t_status == "WinnerDeclared" || tb.t_status == "NewRoundStarted" || tb.t_status == "RoundStartedPass")) {

                        if ((tb.t_status == 'GameStartTimer' || tb.t_status == "") && (typeof tb.tou == 'undefined' || tb.tou == false || typeof tb.touId == 'undefined' || typeof tb.touId == "")) {
                            //put robot 
                            schedulerClass.AfterExitRoundStart({
                                tbId: tb._id.toString()
                            })

                        } else if (tb.t_status == "CollectingBootValue" || tb.t_status == "StartDealingCard" || tb.t_status == 'RoundStarted' || tb.t_status == "WinnerDeclared" || tb.t_status == "NewRoundStarted" || tb.t_status == "RoundStartedPass") {
                            //decalre winner 

                            com.CancelScheduleJobOnServer(tb._id.toString(), tb.jid);
                            setTimeout(function () {

                                if (tb.t_status == "WinnerDeclared") {
                                    cdClass.UpdateTableData({ _id: MongoId(tb._id.toString()), t_status: "WinnerDeclared" }, {
                                        $set: {
                                            t_status: 'FWinnerDeclaredStart',
                                            isgamewin: 1,
                                            ctt: new Date()
                                        }
                                    }, () => {

                                        mechanismClass.FinalDeclareWinnerPlayer(tb)

                                    })
                                } else {
                                    mechanismClass.DeclareWinnerPlayer(tb, {}, 'EG');
                                }
                            }, 2000);
                            return false;
                        } else if (typeof tb.tou != 'undefined' && tb.tou == true && typeof tb.touId != 'undefined' && typeof tb.touId != "") {
                            com.CancelScheduleJobOnServer(tb._id.toString(), tb.jid);
                            setTimeout(function () {
                                mechanismClass.DeclareWinnerPlayer(tb);
                            }, 2000);
                            return false;
                        }
                    }

                    //if table have more people than we need to start next turn
                    if (com.InArray(tb.t_status, stArr) && ((tb.t_status == 'RoundStarted' || tb.t_status == "NewRoundStarted" || tb.t_status == "RoundStartedPass" || tb.ti == si) || cpl.length == 2)) {
                        if (com.InArray(tb.t_status, stArr)) {

                            if (tb.t_status == "RoundStarted") {
                                if (tb.ti == si) {
                                    com.CancelScheduleJobOnServer(tbId, tb.jid);
                                    mechanismClass.ChangeTableTurn(tbId, {
                                        pt: tb.ti,
                                        opendecklock: 0,
                                        closedecklock: 0
                                    }); //changing turn to next user.    
                                }



                                if (tb.ti != si && cpl.length == 1) {
                                    mechanismClass.ChangeTableTurn(tbId, {
                                        pt: tb.ti,
                                        opendecklock: 0,
                                        closedecklock: 0
                                    }); //changing turn to next user.           
                                }
                            } else if (tb.t_status == "RoundStartedPass") {
                                if (tb.ti == si) {
                                    com.CancelScheduleJobOnServer(tbId, tb.jid);
                                    mechanismClass.ChangeTablePassedTurn(tbId, {
                                        pt: tb.ti,
                                        opendecklock: 0,
                                        closedecklock: 1
                                    }); //changing turn to next user.    
                                }



                                if (tb.ti != si && cpl.length == 1) {
                                    mechanismClass.ChangeTablePassedTurn(tbId, {
                                        pt: tb.ti,
                                        opendecklock: 0,
                                        closedecklock: 1
                                    }); //changing turn to next user.           
                                }
                            }
                        }
                    }


                    if ((tb.t_status == "RoundStarted" || tb.t_status == "NewRoundStarted" || tb.t_status == "WinnerDeclared" || tb.t_status == "RoundStartedPass") && pl.length == 0) {

                        com.CancelScheduleJobOnServer(tbId, tb.jid);
                        cdClass.UpdateTableData(tbId, {
                            $set: {
                                t_status: '',
                                pv: 0,
                                round: 1,
                                score: [],
                                maindeadwood: 0
                            }
                        });
                    } else if ((tb.t_status == "RoundStarted" || tb.t_status == "NewRoundStarted" || tb.t_status == "WinnerDeclared" || tb.t_status == "RoundStartedPass" || tb.t_status == "CollectingBootValue") && pl.length == 1) {

                        com.CancelScheduleJobOnServer(tb._id.toString(), tb.jid);
                        setTimeout(function () {
                            //AA status atle set kariyu ke winnerdeclared status hoi ne ek user leave mare and ek player watch ma hoi to cpl 2 male and pl 1 
                            //pan ahiya WinnerDeclared status male to winner na funcation aa status same male to aagal no vadhe atle status round started kari ne aagal java devanu 
                            if (tb.t_status == "WinnerDeclared") {
                                cdClass.UpdateTableData({ _id: MongoId(tb._id.toString()), t_status: "WinnerDeclared" }, {
                                    $set: {
                                        t_status: 'FWinnerDeclaredStart',
                                        isgamewin: 1,
                                        ctt: new Date()
                                    }
                                }, () => {

                                    mechanismClass.FinalDeclareWinnerPlayer(tb)

                                })
                            } else {
                                mechanismClass.DeclareWinnerPlayer(tb);
                            }
                        }, 2000);
                    }
                }
            });
        }
    },
    ManagePlayerComp: function (tb, client, si) {

        if (typeof tb._id != "undefined") {
            cdClass.GetTableData(tb._id.toString(), {}, function (tb) {
                if (tb) {

                    var tbId = tb._id.toString();

                    //if table have more people than we need to start next turn
                    if (tb.ti == si) {
                        if (typeof tb.pi[tb.ti] != 'undefined') {
                            if (typeof tb.pi[tb.ti].si != 'undefined' && tb.pi[tb.ti].cards != null) {


                                if (tb.t_status == "RoundStarted") {

                                    var tc = '';//throw card(tc)
                                    var cl = tb.pi[tb.ti].cards.length;//card length(cl)


                                    //user re card lai lidhu 6e pan throw karvanu baki 6e 
                                    if (tb.pi[tb.ti].status == "PFODPU" || tb.pi[tb.ti].status == 'PFCD' || tb.pi[tb.ti].status == 'PFOD' || tb.pi[tb.ti].status == 'SPC') {

                                        com.CancelScheduleJobOnServer(tbId, tb.jid);

                                        //compClass.AfterPickCardAction(tb, client, tb.close_deck[0]);
                                        compClass.pickAfterCardThrow(tb, client/* tb.open_deck[len]*/);


                                    } else {
                                        //user ne card levanu j baki 6e 
                                        com.CancelScheduleJobOnServer(tbId, tb.jid);

                                        if (tb.opendecklock != undefined && tb.opendecklock) {

                                            rclient.hgetall('session:' + tb.pi[tb.ti].ui.uid.toString(), function (err, ct) {

                                                if (ct == null)
                                                    return false;

                                                ct.si = parseInt(ct.si);
                                                ct._iscom = parseInt(ct._iscom);

                                                mechanismClass.PFCD({}, ct);

                                            })
                                        } else {
                                            schedulerClass.ChooseRobotToTurn({ tbId: tb._id.toString(), ti: tb.ti });
                                        }
                                    }
                                }

                                if (tb.t_status == "RoundStartedPass") {

                                    var tc = '';//throw card(tc)
                                    var cl = tb.pi[tb.ti].cards.length;//card length(cl)


                                    //user re card lai lidhu 6e pan throw karvanu baki 6e 
                                    if (tb.pi[tb.ti].status == 'PFODPU') {

                                        com.CancelScheduleJobOnServer(tbId, tb.jid);

                                        //compClass.AfterPickCardAction(tb, client, tb.close_deck[0]);
                                        compClass.pickAfterCardThrow(tb, client/* tb.open_deck[len]*/);

                                    } else {
                                        //user ne card levanu j baki 6e 
                                        com.CancelScheduleJobOnServer(tbId, tb.jid);

                                        //schedulerClass.ChooseRobotToTurn({tbId: tb._id.toString(), ti: tb.ti});
                                        schedulerClass.ChooseRobotToPassTurn({ tbId: tb._id.toString(), ti: tb.ti });

                                    }
                                }


                            } else {
                                c("else 11");
                            }
                        } else {
                            c("tb.pi else");
                        }
                    }
                }
            });
        }
    },
    ManagePlayerCount: function (tb) {
        //Counting active players on the table.
        var tbId = tb._id.toString();
        var ttPl = 0;
        var pls = tb.pi;
        for (var x = 0; x < tb.ms; x++) {
            if (pls[x] == null || typeof pls[x] == 'undefined')
                tb.pi[x] = {};
            if (typeof pls[x] != 'undefined' && typeof pls[x].si != 'undefined' && pls[x].si != null)
                ttPl++;
        }

        //updating players count and flag to database
        cdClass.UpdateTableData(tbId, {
            $set: {
                ap: ttPl
            }
        });
    },
    ST: (data, client) => {

        cdClass.GetUserInfo(client.uid.toString(), { chips: 1, bootvalue: 1, NormalEntryGold: 1 }, (uData) => {
            if (!uData.chips) {
                cdClass.SendData(client, 'HIPN', {}, "error:3005");
                return false;
            }

            if (typeof data.bv == "undefined" || data.bv == 0 || data.bv == "") {
                if (typeof uData.NormalEntryGold != "undefined" && uData.NormalEntryGold != 0) {
                    data.bv = uData.NormalEntryGold;
                } else if (uData.bootvalue[0] != 'undefined') {
                    data.bv = uData.bootvalue[0];
                } else {
                    data.bv = 100;
                }

                if (typeof data.bv == "undefined" || data.bv == 0 || data.bv == "") {
                    data.bv = 100;
                }
            }
            if (uData.chips > (data.bv * 2)) {

                mechanismClass.EG({ stt: 1, isfrom: 'ST' }, client, () => {

                    mechanismClass.PLAYGAME(data, client, true);

                });
            } else {
                cdClass.SendData(client, "PLAYGAME", {}, 'error:3005');
            }
        });

    },
    RemoveTable: () => {
        var time = com.AddTime(-86400);

        db.collection('playing_table').deleteMany({
            ap: { $gte: 0 },
            'pi.ui.iscom': 0,
            t_status: 'RoundStarted',
            "ctt": { $lte: new Date(time) }
        }, function (err, dt) {

        });
    },
    AutoStartTable: () => {
        var time = com.AddTime(-45);

        db.collection('playing_table').find({
            ap: { $gt: 0 },
            'pi.ui._iscom': 0,
            t_status: { $in: ["RoundStarted"] },
            "ctt": { $lte: new Date(time) }
        }).toArray(function (err, dt) {

            if (!err && dt.length > 0) {
                for (var i = 0; i < dt.length; i++) {

                    mechanismClass.ChangeTableTurn(dt[i]._id, {});
                }
                dt = null;
            }
        });

        db.collection('playing_table').find({
            ap: { $gt: 0 },
            'pi.ui._iscom': 0,
            t_status: { $in: ["RoundStartedPass"] },
            "ctt": { $lte: new Date(time) }
        }).toArray(function (err, dt) {

            if (!err && dt.length > 0) {
                for (var i = 0; i < dt.length; i++) {

                    mechanismClass.ChangeTablePassedTurn(dt[i]._id, {});
                }
                dt = null;
            }
        });

        db.collection('playing_table').find({
            ap: { $gt: 0 },
            'pi.ui._iscom': 0,
            t_status: 'GameStartTimer',
            "ctt": { $lte: new Date(time) }
        }).toArray(function (err, dt) {

            if (!err && dt.length > 0) {
                for (var i = 0; i < dt.length; i++) {

                    schedulerClass.CollectingBootValue({ tbId: dt[i]._id.toString() });
                    //mechanismClass.ChangeTableTurn(dt[i]._id, {});
                }
                dt = null;
            }

        });

        db.collection('playing_table').find({
            ap: { $gt: 0 },
            'pi.ui._iscom': 0,
            t_status: 'NewRoundStarted',
            "ctt": { $lte: new Date(time) }
        }).toArray(function (err, dt) {

            if (!err && dt.length > 0) {

                for (var i = 0; i < dt.length; i++) {

                    schedulerClass.CollectingBootValueAfterRound({ tbId: dt[i]._id.toString() });

                }
                dt = null;
            }

        });

        db.collection('playing_table').find({
            ap: { $gt: 1 },
            'pi.ui._iscom': 0,
            t_status: "",
            "la": { $lte: new Date(time) }
        }).toArray(function (err, dt) {

            if (!err && dt.length > 0) {
                for (var i = 0; i < dt.length; i++) {

                    mechanismClass.LestsPlay(dt[i]._id);
                }
                dt = null;
            }
        });


        db.collection('playing_table').find({
            ap: { $gt: 1 },
            'pi.ui._iscom': 0,
            t_status: { $in: ["CollectingBootValue", "StartDealingCard"] },
            "ctt": { $lte: new Date(time) }
        }).toArray(function (err, dt) {
            if (!err && dt.length > 0) {
                for (var i = 0; i < dt.length; i++) {
                    //Not send this bcz open and close deck lock and unlcok logic added
                    schedulerClass.SelectUserForTurn({ tbId: dt[i]._id.toString() });
                }
            }
            dt = null;
        });


    },//auto repair user online in one day to 
    repairUser: () => {
        var time = com.AddTime(-86400);

        db.collection('game_users').findAndModify({
            "flags._iscom": 0,
            "last.la": { $lte: new Date(time) },
            "flags._io": 1,
        }, {}, { $set: { "flags._io": 0, tbid: "", si: "" } }, function () {

        });
    },
    UENG: (data, client, callback) => {

        db.collection("game_users").update({ _id: MongoId(client.uid.toString()) }, {
            $set: {
                NormalEntryGold: data.bv
            }
        }, () => {
            if (typeof callback == "function") {
                return callback({
                    "flag": ErrorMsg.SUCCESS,
                    "msg": ErrorMsg[client.lc + "_0000"],
                    "data": data,
                    "en": "UENG",
                    "errcode": "0000"
                })
            }
        })
    },
    //Score Borad 
    SB: (data, client, callback) => {
        if (data.tbid != undefined && data.tbid != "" && data.tbid != null && data.tbid.length == 24) {

            db.collection('playing_table').find({ _id: MongoId(data.tbid) }).project({ point: 1, mode: 1, score: 1, pi: 1 }).toArray(function (err, tbdata) {

                if (!err && tbdata.length > 0) {

                    var activeuer = mechanismClass.TotalPlayedUser(tbdata[0].pi);

                    if (typeof callback == "function") {
                        return callback({
                            "flag": ErrorMsg.SUCCESS,
                            "msg": ErrorMsg[client.lc + "_0000"],
                            "data": { flag: false, point: tbdata[0].point, activeuer: activeuer.length, score: tbdata[0].score, mode: tbdata[0].mode },
                            "en": "SB",
                            "errcode": "0000"
                        })
                    }

                } else {

                    if (typeof callback == "function") {
                        return callback({
                            "flag": ErrorMsg.SUCCESS,
                            "msg": ErrorMsg[client.lc + "_0000"],
                            "data": { flag: false, score: [], point: 0, activeuer: 0, mode: "" },
                            "en": "SB",
                            "errcode": "0000"
                        })
                    }

                }

            })
        } else {
            if (typeof callback == "function") {
                return callback({
                    "flag": ErrorMsg.SUCCESS,
                    "msg": ErrorMsg[client.lc + "_0000"],
                    "data": { flag: false, score: [], point: 0, activeuer: 0, mode: "" },
                    "en": "SB",
                    "errcode": "0000"
                })
            }
        }
    },

    ULGSN: (data, client) => {
        cdClass.UpdateUserData(client.uid.toString(), { $set: { "lgsn": 0 } }, function () { });
    }
};