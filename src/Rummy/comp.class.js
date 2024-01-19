

const schedule = require('node-schedule');
const _ = require("underscore");
const Combinatorics = require('js-combinatorics');

com = require('./comm_function_class.js');
cdClass = require('./common.class.js');
compClass = require("./comp.class.js");
schedulerClass = require('./scheduler.class.js');
mechanismClass = require('./mechanismofPlaying.class.js');
gamelogicClass = require('./gamelogic.class.js');
jokerCalss = require('./jokermode.class.js');

var stArr = ['RoundStarted', "NewRoundStarted", "RoundStartedPass"]

module.exports = {
    PraperComp: () => {
        rclient.del("robots_busy", "Robot_free_1", "Robot_free_2", "Robot_free_3", "Robot_free_4", "Robot_free_5", "Robot_free_6", "Robots_busy", function () {

            var rid = [];

            db.collection('playing_table').find({ 'pi.ui._iscom': 1, tou: false }).toArray(function (err, robotb) {
                if (!err && robotb.length > 0) {
                    //var rid = [];
                    for (var x = 0; x < robotb.length; x++) {
                        for (var y = 0; y < robotb[x].pi.length; y++) {
                            if (typeof robotb[x].pi[y].ui != 'undefined' && robotb[x].pi[y].ui._iscom == 1) {
                                rid.push(MongoId(robotb[x].pi[y].ui.uid.toString()));
                            }
                        }
                    }
                }

                db.collection('tournament').find({}).toArray(function (err, trobotb) {
                    if (!err && trobotb.length > 0) {
                        async.forEach(trobotb, function (playingdata, callback) {

                            async.forEach(playingdata.round1, function (round1, callback1) {

                                async.forEach(round1.player, function (playerData, callback2) {

                                    if (typeof playerData._iscom != 'undefined' && playerData._iscom == 1) {
                                        rid.push(MongoId(playerData.uid.toString()));

                                    }
                                    callback2();
                                }, function () {
                                    callback1();
                                });
                            }, function (err) {
                                callback();
                            });
                        }, function (err) {



                            db.collection('game_users').update({ "flags._iscom": 1, _id: { $nin: rid } }, { $set: { "flags._io": 0, s: "free", tbid: '', si: '' } }, { multi: true }, function (err, rids) {

                                db.collection("game_users").find({ "flags._iscom": 1, s: "free" }).project({ _id: 1, timetype: 1 }).toArray(function (err, robot) {
                                    if (err)
                                        return false;

                                    if (robot.length > 0) {
                                        for (var i = 0; i < robot.length; i++) {
                                            if (typeof robot[i].timetype != 'undefined') {
                                                rclient.sadd('Robot_free_' + robot[i].timetype + "", robot[i]._id.toString(), function () { });
                                            } else {
                                                rclient.sadd('Robot_free_1', robot[i]._id.toString(), function () { });
                                            }
                                        }
                                    }
                                });

                                db.collection("game_users").findAndModify({
                                    $and: [{ "flags._iscom": 1 }, { s: "busy" }, { tuid: "" }, {
                                        $or: [{ si: "" }, { tbid: "" }]
                                    }]
                                }, {}, { $set: { s: "free" } }, { new: true }, function (err, robot) {


                                    if (robot.value == null) {

                                        return false;

                                    }


                                    for (var i = 0; i < robot.value.length; i++) {

                                        if (typeof robot.value[i].timetype != 'undefined') {
                                            rclient.srem("robots_busy", id.toString());
                                            rclient.sadd('Robot_free_' + robot.value[i].timetype + "", robot.value[i]._id.toString(), function () { });
                                        } else {
                                            rclient.srem("robots_busy", id.toString());
                                            rclient.sadd('Robot_free_1', robot.value[i]._id.toString(), function () { });
                                        }
                                    }
                                });
                            });


                        });
                    } else {
                        db.collection('game_users').update({ "flags._iscom": 1, _id: { $nin: rid } }, { $set: { "flags._io": 0, s: "free", tbid: '', si: '' } }, { multi: true }, function (err, rids) {
                            db.collection("game_users").find({ "flags._iscom": 1, s: "free" }).project({ _id: 1, timetype: 1 }).toArray(function (err, robot) {
                                if (err)
                                    return false;

                                if (robot.length > 0) {
                                    for (var i = 0; i < robot.length; i++) {
                                        if (typeof robot[i].timetype != 'undefined') {
                                            rclient.sadd('Robot_free_' + robot[i].timetype + "", robot[i]._id.toString(), function () { });
                                        } else {
                                            rclient.sadd('Robot_free_1', robot[i]._id.toString(), function () { });
                                        }
                                    }
                                }
                            });

                            db.collection("game_users").findAndModify({
                                $and: [{ "flags._iscom": 1 }, { s: "busy" }, { tuid: "" }, {
                                    $or: [{ si: "" }, { tbid: "" }]
                                }]
                            }, {}, { $set: { s: "free" } }, { new: true }, function (err, robot) {

                                if (robot.value == null) {
                                    return false;
                                }


                                for (var i = 0; i < robot.value.length; i++) {

                                    if (typeof robot.value[i].timetype != 'undefined') {
                                        rclient.srem("robots_busy", id.toString());
                                        rclient.sadd('Robot_free_' + robot.value[i].timetype + "", robot.value[i]._id.toString(), function () { });
                                    } else {
                                        rclient.srem("robots_busy", id.toString());
                                        rclient.sadd('Robot_free_1', robot.value[i]._id.toString(), function () { });
                                    }
                                }
                            });
                        });
                    }
                });
            });
        });
    },
    EmptySeatFind: (table, fs, callback) => {

        if (typeof table == 'undefined' || table == false)
            return false;

        var Seat = [];

        if (typeof fs != 'undefined' && table.pi[fs] != undefined && typeof table.pi[fs].ui == 'undefined' && typeof table.pi[fs] == 'object') {
            Seat.push(parseInt(parseInt(fs)));
            callback(Seat[0]);
            return false;
        }

        for (x in table.pi) {
            if (table.pi[x] != undefined && typeof table.pi[x].ui == 'undefined' && typeof table.pi[x] == 'object')
                Seat.push(parseInt(x));
        }

        callback(Seat[0]);
    },
    PutCompToPlay: (tbid) => {
        var time = com.AddTime(5);
        var j = schedule.scheduleJob(new Date(time), function () {
            j.cancel();
            schedulerClass.RobotSection(tbid);
        });
    },
    PutCompToTournament: (tbid) => {
        var time = com.AddTime(5);
        var j = schedule.scheduleJob(new Date(time), function () {
            j.cancel();
            schedulerClass.RobotSectionForTournament(tbid);
        });
    },
    TakeCompFristTurn: (tb, tObj) => {

        var pi = tb.pi[tb.ti];

        //Choose random time for action by robot, and it will be vary from 2 to 8 seconds.
        if (typeof pi == 'undefined' || pi == null || typeof pi.cards == 'undefined' || pi.cards == null)
            return false;

        var t = com.GetRandomInt(2, 4);
        tObj.cards = tb.pi[tb.ti].cards;

        tObj.open_deck_card = (typeof tb.open_deck != 'undefined') ? tb.open_deck : [];
        tObj.close_deck = (typeof tb.open_deck != 'undefined') ? tb.close_deck : [];
        cdClass.SendDataToTable(tb._id.toString(), {
            en: 'UPTS',
            data: tObj

        });

        setTimeout(function () {
            schedulerClass.ChooseRobotToPassTurn({ tbId: tb._id.toString(), ti: tb.ti });
        }, (1000 * t));


    },
    TakeCompTurn: (tb, tObj) => {

        var pi = tb.pi[tb.ti]; //getting current playrs' info

        //Choose random time for action by robot, and it will be vary from 2 to 8 seconds.
        if (typeof pi == 'undefined' || pi == null || typeof pi.cards == 'undefined' || pi.cards == null) {
            console.log("robot turn not morw ")
            return false;
        }

        var t = com.GetRandomInt(1, 2);
        tObj.cards = pi.cards;
        tObj.kd = pi.kd;
        //pc
        tObj.open_deck_card = (typeof tb.open_deck != 'undefined') ? tb.open_deck : [];
        tObj.close_deck = (typeof tb.close_deck != 'undefined') ? tb.close_deck : [];

        cdClass.SendDataToTable(tb._id.toString(), {
            en: 'UTS',
            data: tObj
        });


        if (tObj.opendecklock == 1) { //open deck lock then not card get in open deck so get in close deck 
            rclient.hgetall('session:' + pi.ui.uid.toString(), function (err, ct) {


                if (ct == null)
                    return false;

                ct.si = parseInt(ct.si);
                ct._iscom = parseInt(ct._iscom);

                setTimeout(function () {
                    mechanismClass.PFCD({}, ct);
                }, (1000 * t));
            })
        } else {

            setTimeout(function () {
                //RobotsTurnStarted
                schedulerClass.ChooseRobotToTurn({ tbId: tb._id.toString(), ti: tb.ti });
            }, (1000 * t));

        }
    },
    //knock mode  Gin Rummy 
    HighLevalComp_Knock: (table, rct) => {

        
        var rinfo = JSON.parse(JSON.stringify(table.pi[table.ti]));

       
        if (typeof rinfo.cards != 'undefined' && rinfo.cards.length == 0) {
            return false;
        }


        var spctotalcard = _.flatten(rinfo.spc);
        var opendeckcard = (table.open_deck.length > 0) ? table.open_deck[table.open_deck.length - 1] : "";

        var unusecard = []
        var finlspc = []
        if (table.mode == 4 || table.mode == 5 || table.mode == 6) {
            var copyspc = spctotalcard;
            for (var i = 0; i < copyspc.length; i++) {
                if (copyspc[i].split("-")[2] == 'j') {
                    copyspc[i] = copyspc[i].split("-")[2] + "-" + copyspc[i].split("-")[3]
                }
            }

            var copyusercard = rinfo.cards.slice(0, rinfo.cards.length);
            for (var i = 0; i < copyusercard.length; i++) {
                if (copyusercard[i].split("-")[2] == 'j') {
                    copyusercard[i] = copyusercard[i].split("-")[2] + "-" + copyusercard[i].split("-")[3]
                }
            }

            unusecard = _.difference(copyusercard, copyspc)

        } else {
            unusecard = _.difference(rinfo.cards, spctotalcard)
        }
        //================================= open deck =============================================================


        //first check if any groupof make spades so use it 
        //open deck spades then collect open deck 

        var setothercard = []; //this also use in close deck time so 
        var jokercardfirspc = []
        var jokercardadd = [];
        if (table.open_deck.length > 0 && rinfo.cards != null) {

            if (table.open_deck[table.open_deck.length - 1] == 'j-0' || opendeckcard == 'j-1') {
               
                mechanismClass.PFOD({}, rct);

                return false;
            }

            //Joker mode ma je spc ma joker hoi and teni length 3 up hoi 
            //tema open deck nu card add kari ne jovai middle joker card 
            // [ 'f-3', 'k-3', 'l-3', 'f-6', 'f-7-j-1', 'f-7', 'f-8' ] this card  open deck mathi f-7 aave to f-7-j-0 remove kari 
            if (table.mode == 4 || table.mode == 5 || table.mode == 6) { // JE SPC MA JOKER HOI AND SPC NI LENGTH > 3 HOI AEVA SPC MA 
                for (var i = 0; i < rinfo.spc.length; i++) {
                    rinfo.spc[i].push(opendeckcard)

                    //Joker card remove after check spades or not  [ 'f-3', 'k-3', 'l-3', 'f-6', 'f-7-j-1', 'f-7', 'f-8' ] this card 
                    if (jokerCalss.CheckCardCasesmiddelofjoker(rinfo.spc[i])) {
                        
                        mechanismClass.PFOD({}, rct);
                        return false;
                    }
                    rinfo.spc[i].pop()
                }
            }

            
            //Total Spc ma open deck nu card add kari ne check karo if useful
            if (spctotalcard.length > 0) {
                spctotalcard.push(opendeckcard);

                if (table.mode == 4 || table.mode == 5 || table.mode == 6) { //remove made joker card and set orignal joker card  'a-10-j-0' hoi to j-0 add karo 
                    for (var i = 0; i < spctotalcard.length; i++) {
                        if (spctotalcard[i].split("-")[2] == 'j') {
                            spctotalcard[i] = spctotalcard[i].split("-")[2] + "-" + spctotalcard[i].split("-")[3]
                        }
                    }
                }

                var spCardsspc = gamelogicClass.CheckCardsForSpread(spctotalcard.slice(0, spctotalcard.length));
                
                var checkunusecard = _.difference(rinfo.cards, _.flatten(spCardsspc))
                var isdone = true;
                spctotalcard.pop();


                if (table.mode == 4 || table.mode == 5 || table.mode == 6) {
                    //total card in spc but one card is get and is joker mode only if use two spc other unusecard there so get in open deck and throw same card 
                    

                    isdone = (_.flatten(unusecard).length > checkunusecard.length || _.flatten(spCardsspc).length > _.flatten(spctotalcard).length) ? true : false
                    //Second Condition is total spc ma j card use tha to unuse card  to same j rese ne   
                }

                if (isdone && typeof spCardsspc != 'undefined' && spCardsspc.length > 0 && _.flatten(spCardsspc).indexOf(table.open_deck[table.open_deck.length - 1]) != -1) {//&& _.intersection(_.flatten(spCards),[opendeckcard]).length > 0){

                    
                    rinfo.cards.push(table.open_deck[table.open_deck.length - 1])

                    var spCards = gamelogicClass.CheckCardsForSpread(rinfo.cards)

                    var unusedlength = _.difference(rinfo.cards, _.flatten(spCards)).length

                    rinfo.cards.splice(_.indexOf(rinfo.cards, table.open_deck[table.open_deck.length - 1]), 1)

                    rinfo.cards.push(table.close_deck[0])

                    var spCards = gamelogicClass.CheckCardsForSpread(rinfo.cards)

                    rinfo.cards.splice(_.indexOf(rinfo.cards, table.close_deck[0]), 1)
                    if (unusedlength > _.difference(rinfo.cards, _.flatten(spCards)).length) {

                        mechanismClass.PFCD({}, rct);
                        return false;
                    }
                    else {
                        
                        mechanismClass.PFOD({}, rct);
                        return false;

                    }

                }
            }



            //spades na 3> card length vali spades hoi tenu last and first card lai only ron hoi tevi spadesna card nuse card ma use kari ne check 
            for (var i = 0; i < rinfo.spc.length; i++) {

                //jene first ma joker card hoi ae add karavna  

                if (rinfo.spc[i][0].split("-")[2] == "j" && gamelogicClass.CheckCardRonCases(rinfo.spc[i])) {
                    jokercardfirspc.push(rinfo.spc[i])
                }


                //je spc ni length 3 > hoi and last ma ke first ma joker hoi tyare ne unuse card ma joker add kari ne lai levai 
                if (rinfo.spc[i].length > 3 && (rinfo.spc[i][0].split("-")[2] == "j" || rinfo.spc[i][rinfo.spc[i].length - 1].split("-")[2] == 'j')) {
                    if (rinfo.spc[i][0].split("-")[2] == "j") {
                        jokercardadd.push(rinfo.spc[i][0].split("-")[2] + "-" + rinfo.spc[i][0].split("-")[3])
                    } else if (rinfo.spc[i][rinfo.spc[i].length - 1].split("-")[2] == 'j') {
                        jokercardadd.push(rinfo.spc[i][rinfo.spc[i].length - 1].split("-")[2] + "-" + rinfo.spc[i][rinfo.spc[i].length - 1].split("-")[3])
                    }
                }

                if (rinfo.spc[i].length > 3 && gamelogicClass.CheckCardRonCases(rinfo.spc[i])) {
                    setothercard.push(rinfo.spc[i][0]);
                    setothercard.push(rinfo.spc[i][rinfo.spc[i].length - 1]);
                }

                if (rinfo.spc[i].length > 3 && gamelogicClass.CheckCardteenCases(rinfo.spc[i])) {
                    setothercard.push(rinfo.spc[i]);
                }
            }

            //unusecard ma open deck card added 

            
            if (jokercardadd.length > 0) {
                unusecard = unusecard.concat(jokercardadd)
            }
            unusecard.push(opendeckcard);

            var spCards = gamelogicClass.CheckCardsForSpread(unusecard.slice(0, unusecard.length));


            unusecard.pop();
            
            if (typeof spCards != 'undefined' && spCards.length > 0 && _.flatten(spCards).indexOf(table.open_deck[table.open_deck.length - 1]) != -1) {//&& _.intersection(_.flatten(spCards),[opendeckcard]).length > 0){
                
                mechanismClass.PFOD({}, rct);
                return false;
            }

            //normal 4 spc length vali spc ma last first card add kari ne spc check kariyu 
            if (setothercard.length > 0) {

                setothercard = _.flatten(setothercard);

                finlspc = setothercard.filter((elem) => {
                    return elem !== null && elem.split("-")[2] != 'j'
                });

                finlspc = unusecard.concat(finlspc);

                finlspc.push(opendeckcard);
                var spCards = gamelogicClass.CheckCardsForSpread(finlspc);

                if (typeof spCards != 'undefined' && spCards.length > 0 && _.flatten(spCards).indexOf(table.open_deck[table.open_deck.length - 1]) != -1) {//&& _.intersection(_.flatten(spCards),[opendeckcard]).length > 0){
                   
                    mechanismClass.PFOD({}, rct);
                    return false;
                }

            }

            //gap spc set 
            for (var i = 0; i < jokercardfirspc.length; i++) {
                jokercardfirspc[i].push(opendeckcard)

                if (jokerCalss.RonForCheckJokerCard(jokercardfirspc[i])) {
                   

                    mechanismClass.PFOD({}, rct);
                    return false;
                }
                jokercardfirspc[i].pop()

            }

        }

        //========Open Deck to pick card and throw same card or not check
        var odcnp = 0;
        var thcard;
        var client = {
            si: table.ti
        }
        
        if (table.open_deck.length > 0)
            table.pi[table.ti].cards.push(table.open_deck[table.open_deck.length - 1]);

        compClass.pickAfterCardThrow(table, client, true, (thcard) => {

            if (_.indexOf(table.open_deck, table.open_deck[table.open_deck.length - 1]) != -1) {

                table.pi[table.ti].cards.splice(_.indexOf(table.open_deck, table.open_deck[table.open_deck.length - 1]), 1)
            }
            if (_.indexOf(rinfo.cards, table.open_deck[table.open_deck.length - 1]) != -1) {

                rinfo.cards.splice(_.indexOf(rinfo.cards, table.open_deck[table.open_deck.length - 1]), 1)

            }

            
            if (table.open_deck.length > 0) {

                // rinfo.cards.push(table.open_deck[table.open_deck.length - 1]);
                // unusecard.push(table.open_deck[table.open_deck.length - 1]);

                // thcard = compClass.KnockTimeCardThrow(unusecard.slice(0, unusecard.length), table.close_deck);
                thcard = thcard


                odcnp = (typeof thcard != 'undefined' && thcard == table.open_deck[table.open_deck.length - 1]) ? 1 : 0;
                odcnp = (typeof table.pi[table.ti].lpc != 'undefined' && thcard == table.pi[table.ti].lpc) ? 1 : odcnp;

                // unusecard.pop();      date - 21-07-2022 other card remove thy jatu tu s comment kri by harshad

            }


            //======================================all card ============check 
            rinfo.cards.push(opendeckcard);

            var spCards = gamelogicClass.CheckCardsForSpread(rinfo.cards);


            rinfo.cards.pop();
            if (odcnp != 1 && typeof spCards != 'undefined' && spCards.length > 0 && _.flatten(spCards).indexOf(table.open_deck[table.open_deck.length - 1]) != -1) {//&& _.intersection(_.flatten(spCards),[opendeckcard]).length > 0){
              

                mechanismClass.PFOD({}, rct);
                return false;
            }


            //===================================================================================================================


            //=======================================Open Deck End ========================================================
            //===================================Close Deck Logic =========================================================
            //close deck spades 
            if (table.close_deck.length > 0 && rinfo.cards != null) {

                if (table.close_deck[0] == 'j-0' || table.close_deck[0] == 'j-1') {
                    mechanismClass.PFCD({}, rct);
                    return false;
                }
                
                //Total spc ma add card close deck and check 
                if (spctotalcard.length > 0) {
                    spctotalcard.push(table.close_deck[0]);
                    var spCardsspc = gamelogicClass.CheckCardsForSpread(spctotalcard);
                    
                    spctotalcard.pop();
                    if (typeof spCardsspc != 'undefined' && spCardsspc.length > 0 && _.flatten(spCardsspc).indexOf(table.close_deck[0]) != -1) {//&& _.intersection(_.flatten(spCards),[opendeckcard]).length > 0){
                       
                        mechanismClass.PFCD({}, rct);
                        return false;
                    }
                }
                
                unusecard.push(table.close_deck[0]);
                var spCards = gamelogicClass.CheckCardsForSpread(unusecard.slice(0, unusecard.length));
                
                unusecard.pop();

                if (typeof spCards != 'undefined' && spCards.length > 0 && _.flatten(spCards).indexOf(table.close_deck[0]) != -1) {//&& _.intersection(_.flatten(spCards),[opendeckcard]).length > 0){
                    

                    mechanismClass.PFCD({}, rct);
                    return false;
                }

                if (finlspc.length > 0) {

                    finlspc.push(table.close_deck[0]);
                    var spCards = gamelogicClass.CheckCardsForSpread(finlspc);
                    if (typeof spCards != 'undefined' && spCards.length > 0 && _.flatten(spCards).indexOf(table.close_deck[0]) != -1) {//&& _.intersection(_.flatten(spCards),[opendeckcard]).length > 0){
                      

                        mechanismClass.PFCD({}, rct);
                        return false;
                    }

                }

                //Same As close deck to 
                if (table.mode == 4 || table.mode == 5 || table.mode == 6) {
                    for (var i = 0; i < rinfo.spc.length; i++) {
                        rinfo.spc[i].push(table.close_deck[0])
                        //Joker card remove after check spades or not  [ 'f-3', 'k-3', 'l-3', 'f-6', 'f-7-j-1', 'f-7', 'f-8' ] this card 
                        if (jokerCalss.CheckCardCasesmiddelofjoker(rinfo.spc[i])) {
                            

                            mechanismClass.PFCD({}, rct);

                            return false;
                        }
                        rinfo.spc[i].pop()
                    }
                }

                for (var i = 0; i < jokercardfirspc.length; i++) {

                    jokercardfirspc[i].push(table.close_deck[0])

                    if (jokerCalss.RonForCheckJokerCard(jokercardfirspc[i])) {
                       
                        mechanismClass.PFCD({}, rct);
                        return false;
                    }
                    jokercardfirspc[i].pop()

                }
            }

            var rcard = gamelogicClass.DiffColor(unusecard);
            var rpoint = com.CardPointSum(rcard.cards);

            //===============================================close Deck End ===============================================
           
            if (rpoint <= table.deadwood) {

                //Konck Karvo ke nai ae 
                //low card get karvu
                var odcp = (table.open_deck.length > 0) ? opendeckcard.split('-')[1] : -1;
                var cdcp = (table.close_deck.length > 0) ? table.close_deck[0].split('-')[1] : -1;


                if (odcp != -1 && parseInt(odcp) < parseInt(cdcp)) {
                    //jo point 
                    if (unusecard.length <= 3 || rinfo.ltc == opendeckcard) {
                        mechanismClass.PFCD({}, rct);
                        

                        return false
                    }


                    mechanismClass.PFOD({}, rct);
                    return false
                } else if (cdcp != -1 && parseInt(cdcp) < parseInt(odcp) && rinfo.ltc != opendeckcard) {
                    mechanismClass.PFCD({}, rct);
                   
                    return false
                }

            }



            if (thcard != undefined && thcard != null && thcard != "") {
                unusecard = _.difference(unusecard, [thcard])
            }

            //New Logic 

            var opencardposs = []
            var throwcard = []

            if (opendeckcard != "" && unusecard.length > 0) {
                unusecard.push(opendeckcard);
                var cardtypeset = gamelogicClass.CardSetProbabilitynew(unusecard.slice(0, unusecard.length))
                throwcard = compClass.ThrowCardUnUseCard(cardtypeset, table.close_deck);


                for (var i = 0; i < throwcard.length; i++) {
                    if (throwcard[i].card.indexOf(opendeckcard) != -1) {
                        opencardposs.push(throwcard[i])
                    }
                }
                unusecard.pop()
            }


            var closecardposs = []

            if (table.close_deck.length > 0 && unusecard.length > 0) {
                unusecard.push(table.close_deck[0]);
                var cardtypeset = gamelogicClass.CardSetProbabilitynew(unusecard.slice(0, unusecard.length))
                var throwcard = compClass.ThrowCardUnUseCard(cardtypeset, table.close_deck);


                for (var i = 0; i < throwcard.length; i++) {
                    if (throwcard[i].card.indexOf(table.close_deck[0]) != -1) {
                        closecardposs.push(throwcard[i])
                    }
                }
                unusecard.pop()
            }



            closecardposs.sort((e, f) => {
                return e.index[0] - f.index[0]
            })
            opencardposs.sort((e, f) => {
                return e.index[0] - f.index[0]
            })


            if (opencardposs.length > 0 && closecardposs.length > 0 && opencardposs[0].index.length > 0 && closecardposs[0].index.length > 0) {

                if (closecardposs[0].index[0] > opencardposs[0].index[0] && odcnp != 1) {

                    mechanismClass.PFOD({}, rct);
                    return false;
                } else {

                  
                    //Get Card On Close Deck
                    mechanismClass.PFCD({}, rct, false);
                   
                    return false;
                }
            }


            //Check Index 
            if (opencardposs.length > 0 && opencardposs[0].index.length > 0 && opencardposs[0].index[0] <= 10 && odcnp != 1) {

                mechanismClass.PFOD({}, rct);
                return false;

            } else if (closecardposs.length > 0 && closecardposs[0].index.length > 0 && closecardposs[0].index[0] <= 10) { //Check Index 
               
                //Get Card On Close Deck
                mechanismClass.PFCD({}, rct, false);
               

                return false;
            }

            //===================================================================================
            //check user to open card possible unusecard sathe 
            if (table.open_deck.length > 0) {
                //thcard


                unusecard.push(opendeckcard);



                var cardSet = gamelogicClass.CardSetProbabilitynew(unusecard.slice(0, unusecard.length));

                //Aamathi je card Set MA Open Deck Nu Card Hoi te Combination na future card ni length jovai to samrt bane 

                unusecard.pop();


                var totalcard = []

                totalcard = totalcard.concat(cardSet.teen);
                totalcard = totalcard.concat(cardSet.ron);


                if (_.flatten(totalcard).indexOf(opendeckcard) != -1 && odcnp != 1) {

                    //Je Card Set MA open deck nu card use thayu 6e te te card set nu future card jovi 
                    var spadeslist = [];
                    totalcard.forEach(function (a) {

                        if (_.intersection(a, [opendeckcard]).length > 0) {
                            spadeslist.push(a)
                        }
                    })

                    var index = [];
                    spadeslist.forEach(function (a) {

                        var needcard = compClass.FutureCardSetFind(a);


                        for (var j = 0; j < needcard.length; j++) {
                            if (table.close_deck.indexOf(needcard[j]) != -1) {
                                index.push(table.close_deck.indexOf(needcard[j]))
                            }
                        }

                    })


                    if (index.length > 0 && rinfo.ltc != opendeckcard) {

                        mechanismClass.PFOD({}, rct);
                        return false;
                    } else {
                        mechanismClass.PFCD({}, rct, false);

                        return false;
                    }
                } else {
                    mechanismClass.PFCD({}, rct, false);

                    return false;
                }
            }
        })
    },
    //isnotallplay this Function To not All spades change old Spades unuse card To Change only
    pickAfterCardThrow: (table, client, isnotallplay, callback) => {

        cp = table.pi[client.si];
        var final = [];
        var card = cp.cards;//['l-4-4','l-5-5','l-6-6','l-7-7','k-14-10','l-8-8','c-13-10']
        var spc = cp.spc;
        var lpc = cp.lpc;


        var spadescard = [];

        var isusetwojokercardinonespc = false;
        if (table.mode == 4 || table.mode == 5 || table.mode == 6) {
            spc.filter((elem) => {
                var jokercardcount = 0;
                if (elem.length > 3 && gamelogicClass.CheckCardteenCases(elem)) {
                    jokercardcount++;
                }
                elem.filter((childelem) => {
                    if (childelem.split("-")[2] == 'j') {
                        jokercardcount++;
                        return childelem !== null
                    }
                    return childelem !== null
                })
                if (jokercardcount == 2) {

                    isusetwojokercardinonespc = true
                }
            });
        }


        if (typeof isnotallplay == "undefined" || isnotallplay == true || isusetwojokercardinonespc) {


            if (table.mode == 4 || table.mode == 5 || table.mode == 6) {
                jokercard = []
                card = card.filter((elem) => {
                    if (elem.split("-")[2] == 'j') {
                        jokercard.push(elem.split("-")[2] + "-" + elem.split("-")[3])
                        return elem !== null && elem.split("-")[2] !== 'j'
                    }
                    return elem !== null && elem.split("-")[2] !== 'j'
                });
                card = card.concat(jokercard)
            }


            cmb = Combinatorics.power(card);
            cmb.forEach(function (a) {

                if (a.length > 2 && (gamelogicClass.CheckCardCases(a) || ((a.indexOf('j-0') != -1 || a.indexOf('j-1') != -1) && jokerCalss.RonForCheckJokerCard(a)))) {

                    final.push(a)
                }

            });
            cmb = null

            final.sort((e, f) => {
                return parseInt(f.length) - parseInt(e.length)
            }); //sorting the element in sequence 

            
            if (final.length > 2) {
                cmb3 = Combinatorics.bigCombination(final, 3);
                cmb2 = Combinatorics.bigCombination(final, 2);
                cmb1 = Combinatorics.bigCombination(final, 1);

                cmb2.forEach(function (a) {

                    if (a.length == 2 && _.intersection(a[0], a[1]).length == 0) {

                        spadescard.push(a)
                    }

                })

                cmb3.forEach(function (a) {

                    if (a.length == 3 && _.intersection(a[0], a[1]).length == 0 && _.intersection(a[0], a[2]).length == 0 && _.intersection(a[1], a[2]).length == 0) {
                        spadescard.push(a)
                    }

                })

                cmb1.forEach(function (a) {

                    if (a.length == 1) {

                        spadescard.push(a)
                    }

                })

                cmb3 = null
                cmb2 = null
                cmb1 = null

            } else if (final.length > 1) {
                cmb2 = Combinatorics.combination(final, 2);
                cmb1 = Combinatorics.combination(final, 1);


                cmb2.forEach(function (a) {
                    if (a.length == 2 && _.intersection(a[0], a[1]).length == 0) {
                        spadescard.push(a)
                    }
                })

                cmb1.forEach(function (a) {

                    if (a.length == 1) {
                        spadescard.push(a)
                    }
                })

                cmb2 = null
                cmb1 = null

            } else if (final.length == 1) {
                cmb1 = Combinatorics.combination(final, 1);

                cmb1.forEach(function (a) {

                    if (a.length == 1) {

                        spadescard.push(a)
                    }

                })

                cmb1 = null
            }

        }
        //Only This playing To  pick Card Is use only spades 
        if (spadescard.length == 0 && spc.length > 0) {
            spadescard.push(cp.spc)
        }

        var unusecardList = [];

        spadescard.forEach((a) => {
            unusecardList.push({
                a: a,
                unusecard: _.difference(card, _.flatten(a))
            })
        });
        

        unusecardList.sort((e, f) => {
            return parseInt(e.unusecard.length) - parseInt(f.unusecard.length)
        }); //sorting the element in sequence 

        unusecardList.sort(function (e, f) {
            var a = gamelogicClass.DiffColor(e.unusecard);
            var apoint = com.CardPointSumnew(a.cards);

            var b = gamelogicClass.DiffColor(f.unusecard);
            var bpoint = com.CardPointSumnew(b.cards);
            return parseInt(apoint) - parseInt(bpoint)
        });
        if (unusecardList.length > 0) {

            unusecardList[0].unusecard.sort(function (e, f) {
                return e.split('-')[0] - f.split('-')[0]
            });

            unusecardList[0].unusecard.sort(function (e, f) {
                return parseInt(e.split('-')[1]) - parseInt(f.split('-')[1])
            });
        }



        if (unusecardList.length > 0 && unusecardList[0].unusecard.length == 0) {
            //Gin Maro
            if (table.mode == 4 || table.mode == 5 || table.mode == 6) { //with joker 
                unusecardList[0].a = jokerCalss.jokercardtosetready(unusecardList[0].a)
            }


            var sortingcard = compClass.makespadesWisesavecard(unusecardList[0])



            mechanismClass.SORTCOMP({ spc: unusecardList[0].a, cards: sortingcard }, client, (f) => {

                if (typeof callback == "function") {

                    return callback()
                }
                if (table.isnotiid != undefined && table.isnotiid != "" && table.isbiggin != undefined && table.isbiggin == true) {
                    setTimeout(function () {
                        mechanismClass.GIN({}, client)
                    }, (2 * 1000));
                } else {
                    setTimeout(function () {
                        mechanismClass.BIGGIN({}, client)
                    }, (2 * 1000));
                }
            })

        } else if (unusecardList.length > 0 && unusecardList[0].unusecard.length == 1) {
            //knock atlest one card throw card 
           
            var oneunusecard = _.filter(unusecardList, (f) => {

                return f.unusecard.length == 1
            })

            oneunusecard.sort(function (e, f) {
                return parseInt(e.unusecard[0].split("-")[1]) - parseInt(f.unusecard[0].split("-")[1])
            });

            if (table.mode == 4 || table.mode == 5 || table.mode == 6) { //with joker 
                oneunusecard[0].a = jokerCalss.jokercardtosetready(oneunusecard[0].a)
            }


            var sortingcard = compClass.makespadesWisesavecard(oneunusecard[0])

            mechanismClass.SORTCOMP({ spc: oneunusecard[0].a, cards: sortingcard }, client, (f) => {

                //var otherplayerdeadwood  =  compClass.otherplayerisknock(table.pi,cp.si,table.maindeadwood)
                //otherplayerdeadwood is true  let's gin and false not gin wait for bigwin

                var isBIGPlay = false; //isbiggin j false jase atle gin mari dese robot 
                var maxp = 0;

                if ((table.mode == 2 || table.mode == 5) && table.close_deck.length >= 15) {
                    var points = [];

                    for (var x in table.pi) {
                        if (typeof table.pi[x] != 'undefined' && typeof table.pi[x].point != 'undefined') {
                            points.push(table.pi[x].point);
                        }
                    }

                    maxp = Math.max.apply(null, points);

                }
                //straight mode 
                if (table.round == 1 && (table.mode == 2 || table.mode == 5) && table.close_deck.length >= 15 && ((table.point == 100 && maxp <= 75) || (table.point == 50 && maxp <= 25)) /*(table.mode == 2 || !otherplayerdeadwood)*/ && oneunusecard.length > 0 && oneunusecard[0].unusecard.length == 1) {

                    if ((table.close_deck.indexOf("j-0") != -1 && parseInt(table.close_deck.length - table.close_deck.indexOf("j-0")) >= 15 && table.close_deck.indexOf("j-0") <= 4)
                        || (table.close_deck.indexOf("j-1") != -1 && parseInt(table.close_deck.length - table.close_deck.indexOf("j-1")) >= 15 && table.close_deck.indexOf("j-1") <= 4)) {


                        isBIGPlay = true;
                    } else {
                        var throwcard = compClass.myspadesfuturecardisthere(oneunusecard[0].a, table.close_deck);


                        if (throwcard.length > 0) {
                            throwcard.sort((e, f) => {
                                return parseInt(f.index.length) - parseInt(e.index.length)
                            }); //sorting the element in sequence 

                            for (var i = 0; i < throwcard.length; i++) {

                                if (parseInt(table.close_deck.length - throwcard[i].index[0]) >= 15 && throwcard[i].index[0] <= 4) {
                                    isBIGPlay = true;
                                    break;
                                }
                            }
                        }
                    }
                }

                var tc = oneunusecard[0].unusecard[0];


                if (tc == cp.lodpc) {
                    isBIGPlay = true;
                }


                if (!isBIGPlay && /*table.isnotiid != undefined && table.isnotiid != "" &&*/ table.notigameplay == 4) {
                    var opsi = (client.si == 0) ? 1 : 0

                    OppUser = table.pi[opsi];
                    //fourth Noti game opp deadwood 20 karta vadhare hoi tyare 
                    //round 1 deadwood 20 karta o6a and close deck 20 karta o6o 
                    //round 2 deadwood 10 karta o6a and close deck 22 karta o6o



                    if (((OppUser.deadwood < 20 || table.close_deck.length <= 20) && table.round == 1) ||
                        ((OppUser.deadwood < 10 || table.close_deck.length <= 22) && table.round == 2)) {

                        isBIGPlay = false
                    } else {


                        isBIGPlay = true
                    }

                }
               
                if (typeof callback == "function") {

                    return callback(tc)
                }


                if (!isBIGPlay /*|| otherplayerdeadwoodiszero*/) {

                    setTimeout(function () {
                        mechanismClass.GIN({}, client)
                    }, (2 * 1000));

                } else {
                    //throw card
                    setTimeout(function () {
                        schedulerClass.RobotThrowCard({ client: JSON.stringify(client), tc: tc });
                    }, (2 * 1000));
                }
            })

        } else if (unusecardList.length > 0 && unusecardList[0].unusecard.length > 1) {

            //First unusecard length same other case is there all other case is get and count your point and 
            //all same unuse card length set get and sorting to point all card and low point to set use 
            //Same Length unusecard set make 

           
            var setunusecard = _.filter(unusecardList, (f) => {
                return f.unusecard.length == unusecardList[0].unusecard.length
            })

            
            //sorting to unuse card pointwise 
            setunusecard.sort(function (e, f) {
                var a = gamelogicClass.DiffColor(e.unusecard);
                var apoint = com.CardPointSum(a.cards);

                var b = gamelogicClass.DiffColor(f.unusecard);
                var bpoint = com.CardPointSum(b.cards);
                return parseInt(apoint) - parseInt(bpoint)
            });

            setunusecard[0].unusecard.sort(function (e, f) {
                return e.split('-')[0] - f.split('-')[0]
            });

            //setunusecard card to zero low unuse card 
            //Spc ma joker nu card use thayu 6e ke nai te jovanu 
            //high card to low card point sorting     
            setunusecard[0].unusecard.sort(function (e, f) {
                return parseInt(e.split('-')[1]) - parseInt(f.split('-')[1])
            });//sorting the element in sequence 




            if (table.mode == 4 || table.mode == 5 || table.mode == 6) { //with joker 
                setunusecard[0].a = jokerCalss.jokercardtosetready(setunusecard[0].a)
            }

            //point Check
            //if point less deadwood
            //lodpc == last high card so not throw this card  second high card throw 

            if (table.close_deck.length > 20) {

                setunusecard[0] = compClass.makeotherunusedcard(unusecardList[0], table.close_deck, setunusecard[0])

            }
            
            var highcard;
            if (cp.lodpc != undefined && cp.lodpc != "" && cp.lodpc == setunusecard[0].unusecard[setunusecard[0].unusecard.length - 1]) {

                highcard = setunusecard[0].unusecard.splice(setunusecard[0].unusecard.length - 2, 1)[0];
                setunusecard[0].unusecard.slice(setunusecard[0].unusecard.length - 2, 1);

            } else {

                highcard = setunusecard[0].unusecard[setunusecard[0].unusecard.length - 1];

                setunusecard[0].unusecard.pop();
            }

            var rcard = gamelogicClass.DiffColor(setunusecard[0].unusecard);
            var rpoint = com.CardPointSum(rcard.cards);

            if (rpoint <= table.maindeadwood && table.mode != 2 && table.mode != 5) {


                //high card throw and knock    
                setunusecard[0].unusecard.push(highcard)
                var sortingcard = compClass.makespadesWisesavecard(setunusecard[0])
              

                mechanismClass.SORTCOMP({ spc: setunusecard[0].a, cards: sortingcard }, client, (f) => {

                    //mycard legth 7 atle 3 user in  playing 
                    //Close Deck length 20 > hoi to any point par knock karai 
                    //and point 5 < hoi to  konck karai 
                
                    var otherplayerdeadwood = compClass.otherplayerdeadwoodcount(table.pi, cp.si, rpoint)
                    
                    var makeginplaying = false;

                    if (table.round == 1 && setunusecard[0].unusecard.length <= 5) { //2
                        var nexthowmanycardcheck = (table.close_deck.length >= 20) ? 10 : 6;

                        //unuse if card 2 >
                        if (setunusecard[0].unusecard.length > 2) {

                            var cardSet = gamelogicClass.CardSetProbability(setunusecard[0].unusecard);

                            var throwcard = compClass.myspadesfuturecardisthere(cardSet, table.close_deck);

                            /*throwcard [ { card: [ 'c-5', 'f-5', 'l-5' ], index: [], needcard: [ 'k-5' ] },
                              { card: [ 'f-2', 'k-2', 'l-2' ], index: [], needcard: [ 'c-2' ] },
                              { card: [ 'k-1', 'f-1', 'c-1' ],
                                index: [ 5 ],
                                needcard: [ 'l-1' ] } ]*/
                            if (throwcard.length > 0) {
                                throwcard.sort((e, f) => {
                                    return parseInt(f.index.length) - parseInt(e.index.length)
                                }); //sorting the element in sequence 


                                for (var i = 0; i < throwcard.length; i++) {

                                    if (throwcard[i].index[0] <= nexthowmanycardcheck) {
                                        makeginplaying = true;
                                        break;
                                    }
                                }
                            }
                        }

                        //table.close_deck.length 25 karta vadhare and makeginplaying true aave tyare 
                        if ((!makeginplaying && table.close_deck.length >= 25) || setunusecard[0].unusecard.length <= 2) { //only two card threre and one card knock time throw so check if any useful card 
                            var throwcard = compClass.myspadesfuturecardisthere(setunusecard[0].a, table.close_deck);

                            /*throwcard [ { card: [ 'c-5', 'f-5', 'l-5' ], index: [], needcard: [ 'k-5' ] },
                              { card: [ 'f-2', 'k-2', 'l-2' ], index: [], needcard: [ 'c-2' ] },
                              { card: [ 'k-1', 'f-1', 'c-1' ],
                                index: [ 5 ],
                                needcard: [ 'l-1' ] } ]*/
                            if (throwcard.length > 0) {
                                throwcard.sort((e, f) => {
                                    return parseInt(f.index.length) - parseInt(e.index.length)
                                }); //sorting the element in sequence 


                                for (var i = 0; i < throwcard.length; i++) {
                                    if (throwcard[i].index[0] <= nexthowmanycardcheck) {
                                        makeginplaying = true;
                                        break;
                                    }
                                }
                            }
                        }
                    }

                    if (otherplayerdeadwood && !makeginplaying && card.length == 8 && ((table.close_deck.length >= 20 && rpoint >= 5) || (rpoint <= 5))) {
                        
                        if (typeof callback == "function") {

                            return callback()
                        }

                        setTimeout(function () {
                            mechanismClass.KNOCK({}, client)
                        }, (2 * 1000));
                    } else if (otherplayerdeadwood && !makeginplaying && card.length == 11 && ((table.close_deck.length >= 15 && rpoint >= 5) || (rpoint <= 5))) {
                        
                        if (typeof callback == "function") {

                            return callback()
                        }

                        setTimeout(function () {
                            mechanismClass.KNOCK({}, client)
                        }, (2 * 1000));

                    } else {



                        //Point Less

                      
                        var unused = (setunusecard[0].otherunusedcard != undefined && setunusecard[0].otherunusedcard.length > 0) ? setunusecard[0].otherunusedcard : setunusecard[0].unusecard
                        var tc = compClass.KnockTimeCardThrow(unused, table.close_deck, cp.lodpc);

                        if (typeof callback == "function") {

                            return callback(tc)
                        }

                        if (tc == cp.lodpc) {

                            console.log("tc Same As lodpc", tc);
                            console.log("tc Same As setunusecard[0].unusecard", setunusecard[0].unusecard);

                        }


                        //throw card 
                        setTimeout(function () {
                            schedulerClass.RobotThrowCard({ client: JSON.stringify(client), tc: tc });
                        }, (2 * 1000));
                    }

                })

            } else {

                if (table.mode == 2) {
                    //unuse card combination vagar na final unuse card throw
                    setunusecard[0].unusecard.push(highcard)

                    if (setunusecard.length > 1) {
                        setunusecard.forEach((a) => {

                            var cardset = gamelogicClass.CardSetProbability(a.unusecard)

                            var index = [];
                            if (cardset.length > 0) {
                                cardset.forEach((b) => {
                                    var needcard = compClass.FutureCardSetFind(b);

                                    for (var j = 0; j < needcard.length; j++) {
                                        if (table.close_deck.indexOf(needcard[j]) != -1) {
                                            index.push(table.close_deck.indexOf(needcard[j]))
                                        }
                                    }
                                    a.indexofcard = index;

                                })
                            } else {
                                a.indexofcard = index;
                            }
                        })

                        setunusecard.sort((e, f) => {

                            return parseInt(f.indexofcard.length) - parseInt(e.indexofcard.length)
                        });
                    }

                    var sortingcard = compClass.makespadesWisesavecard(setunusecard[0])
                    mechanismClass.SORTCOMP({ spc: setunusecard[0].a, cards: sortingcard }, client, (f) => {

                        var unused = (setunusecard[0].otherunusedcard != undefined && setunusecard[0].otherunusedcard.length > 0) ? setunusecard[0].otherunusedcard : setunusecard[0].unusecard
                        var tc = compClass.KnockTimeCardThrow(unused, table.close_deck, cp.lodpc);


                        if (tc == cp.lodpc) {
                            console.log("tc Same As lodpc", tc);
                            console.log("tc Same As setunusecard[0].unusecard", setunusecard[0].unusecard);
                        }

                        if (typeof callback == 'function') {

                            return callback(tc)
                        }


                        //throw card 
                        setTimeout(function () {
                            schedulerClass.RobotThrowCard({ cards: JSON.stringify(cp.cards), client: JSON.stringify(client), tc: tc });
                        }, (2 * 1000));


                    })
                } else {
                    //unuse card combination vagar na final unuse card throw
                    setunusecard[0].unusecard.push(highcard)

                    var sortingcard = compClass.makespadesWisesavecard(setunusecard[0])


                    mechanismClass.SORTCOMP({ spc: setunusecard[0].a, cards: sortingcard }, client, (f) => {
                        
                        var unused = (setunusecard[0].otherunusedcard != undefined && setunusecard[0].otherunusedcard.length > 0) ? setunusecard[0].otherunusedcard : setunusecard[0].unusecard
                        var tc = compClass.KnockTimeCardThrow(unused, table.close_deck, cp.lodpc);
                        if (typeof callback == 'function') {
                            return callback(tc)
                        }

                        if (tc == cp.lodpc) {
                            console.log("tc Same As lodpc", tc);
                            console.log("tc Same As setunusecard[0].unusecard", setunusecard[0].unusecard);
                        }
                        //throw card 
                        setTimeout(function () {
                            schedulerClass.RobotThrowCard({ client: JSON.stringify(client), tc: tc });
                        }, (2 * 1000));


                    })
                }
            }
        } else {
            var sortingcard = compClass.makespadesWisesavecard(card)

            if (sortingcard != undefined && sortingcard.length > 0 && sortingcard[0] != undefined && sortingcard[0] != null && sortingcard != null) {

                mechanismClass.SORTCOMP({ cards: sortingcard }, client, (f) => {

                    var tc = compClass.KnockTimeCardThrow(card, table.close_deck, cp.lodpc);
                    
                    if (typeof callback == "function") {

                        return callback(tc)
                    }

                    //throw card 
                    setTimeout(function () {
                        schedulerClass.RobotThrowCard({ client: JSON.stringify(client), tc: tc });
                    }, (2 * 1000));

                })
            } else {

                var tc = compClass.KnockTimeCardThrow(card, table.close_deck, cp.lodpc);

                if (typeof callback == "function") {

                    return callback(tc)
                }

                //throw card 
                setTimeout(function () {
                    schedulerClass.RobotThrowCard({ client: JSON.stringify(client), tc: tc });
                }, (2 * 1000));
            }
        }
    },
    SmartLevalComp_Knock: (table, rct) => {

        var rinfo = table.pi[table.ti];

        if (typeof rinfo.cards != 'undefined' && rinfo.cards.length == 0) {
            return false;
        }


        var spctotalcard = _.flatten(rinfo.spc);
        var opendeckcard = (table.open_deck.length > 0) ? table.open_deck[table.open_deck.length - 1] : "";


        var unusecard = []
        var finlspc = []
        if (table.mode == 4 || table.mode == 5 || table.mode == 6) {
            var copyspc = spctotalcard;
            for (var i = 0; i < copyspc.length; i++) {
                if (copyspc[i].split("-")[2] == 'j') {
                    copyspc[i] = copyspc[i].split("-")[2] + "-" + copyspc[i].split("-")[3]
                }
            }

            var copyusercard = rinfo.cards;
            for (var i = 0; i < copyusercard.length; i++) {
                if (copyusercard[i].split("-")[2] == 'j') {
                    copyusercard[i] = copyusercard[i].split("-")[2] + "-" + copyusercard[i].split("-")[3]
                }
            }

            unusecard = _.difference(copyusercard, copyspc)

        } else {
            unusecard = _.difference(rinfo.cards, spctotalcard)
        }
        //================================= open deck =============================================================


        //first check if any groupof make spades so use it 
        //open deck spades then collect open deck 

        var setothercard = []; //this also use in close deck time so 
        var jokercardfirspc = []
        var jokercardadd = [];
        if (table.open_deck.length > 0 && rinfo.cards != null) {

            if (table.open_deck[table.open_deck.length - 1] == 'j-0' || opendeckcard == 'j-1') {
                mechanismClass.PFOD({}, rct);

                return false;
            }

            //Joker mode ma je spc ma joker hoi and teni length 3 up hoi 
            //tema open deck nu card add kari ne jovai middle joker card 
            // [ 'f-3', 'k-3', 'l-3', 'f-6', 'f-7-j-1', 'f-7', 'f-8' ] this card  open deck mathi f-7 aave to f-7-j-0 remove kari 
            if (table.mode == 4 || table.mode == 5 || table.mode == 6) { // JE SPC MA JOKER HOI AND SPC NI LENGTH > 3 HOI AEVA SPC MA 
                for (var i = 0; i < rinfo.spc.length; i++) {
                    rinfo.spc[i].push(opendeckcard)

                    //Joker card remove after check spades or not  [ 'f-3', 'k-3', 'l-3', 'f-6', 'f-7-j-1', 'f-7', 'f-8' ] this card 
                    if (jokerCalss.CheckCardCasesmiddelofjoker(rinfo.spc[i])) {
                        mechanismClass.PFOD({}, rct);
                        return false;
                    }
                    rinfo.spc[i].pop()
                }
            }


            //Total Spc ma open deck nu card add kari ne check karo if useful
            if (spctotalcard.length > 0) {
                spctotalcard.push(opendeckcard);

                if (table.mode == 4 || table.mode == 5 || table.mode == 6) { //remove made joker card and set orignal joker card  'a-10-j-0' hoi to j-0 add karo 
                    for (var i = 0; i < spctotalcard.length; i++) {
                        if (spctotalcard[i].split("-")[2] == 'j') {
                            spctotalcard[i] = spctotalcard[i].split("-")[2] + "-" + spctotalcard[i].split("-")[3]
                        }
                    }
                }

                var spCardsspc = gamelogicClass.CheckCardsForSpread(spctotalcard);
                var checkunusecard = _.difference(rinfo.cards, _.flatten(spCardsspc))
                var isdone = true;
                spctotalcard.pop();


                if (table.mode == 4 || table.mode == 5 || table.mode == 6) {
                    //total card in spc but one card is get and is joker mode only if use two spc other unusecard there so get in open deck and throw same card 
                    isdone = (_.flatten(unusecard).length > checkunusecard.length || _.flatten(spCardsspc).length > _.flatten(spctotalcard).length) ? true : false
                    //Second Condition is total spc ma j card use tha to unuse card  to same j rese ne   
                }

                if (isdone && typeof spCardsspc != 'undefined' && spCardsspc.length > 0 && _.flatten(spCardsspc).indexOf(table.open_deck[table.open_deck.length - 1]) != -1) {//&& _.intersection(_.flatten(spCards),[opendeckcard]).length > 0){
                    mechanismClass.PFOD({}, rct);
                    return false;
                }
            }

            //======================================all card ============check 
            rinfo.cards.push(opendeckcard);

            var spCards = gamelogicClass.CheckCardsForSpread(rinfo.cards);

            rinfo.cards.pop();

            if (typeof spCards != 'undefined' && spCards.length > 0 && _.flatten(spCards).indexOf(table.open_deck[table.open_deck.length - 1]) != -1) {//&& _.intersection(_.flatten(spCards),[opendeckcard]).length > 0){
                mechanismClass.PFOD({}, rct);
                return false;
            }


            //===================================================================================================================


            //spades na 3> card length vali spades hoi tenu last and first card lai only ron hoi tevi spadesna card nuse card ma use kari ne check 
            for (var i = 0; i < rinfo.spc.length; i++) {

                //jene first ma joker card hoi ae add karavna  
                if (rinfo.spc[i][0].split("-")[2] == "j" && gamelogicClass.CheckCardRonCases(rinfo.spc[i])) {
                    jokercardfirspc.push(rinfo.spc[i])
                }


                //je spc ni length 3 > hoi and last ma ke first ma joker hoi tyare ne unuse card ma joker add kari ne lai levai 
                if (rinfo.spc[i].length > 3 && (rinfo.spc[i][0].split("-")[2] == "j" || rinfo.spc[i][rinfo.spc[i].length - 1].split("-")[2] == 'j')) {
                    if (rinfo.spc[i][0].split("-")[2] == "j") {
                        jokercardadd.push(rinfo.spc[i][0].split("-")[2] + "-" + rinfo.spc[i][0].split("-")[3])
                    } else if (rinfo.spc[i][rinfo.spc[i].length - 1].split("-")[2] == 'j') {
                        jokercardadd.push(rinfo.spc[i][rinfo.spc[i].length - 1].split("-")[2] + "-" + rinfo.spc[i][rinfo.spc[i].length - 1].split("-")[3])
                    }
                }

                if (rinfo.spc[i].length > 3 && gamelogicClass.CheckCardRonCases(rinfo.spc[i])) {
                    setothercard.push(rinfo.spc[i][0]);
                    setothercard.push(rinfo.spc[i][rinfo.spc[i].length - 1]);
                }

                if (rinfo.spc[i].length > 3 && gamelogicClass.CheckCardteenCases(rinfo.spc[i])) {
                    setothercard.push(rinfo.spc[i]);
                }
            }

            //unusecard ma open deck card added 


            if (jokercardadd.length > 0) {
                unusecard = unusecard.concat(jokercardadd)
            }
            unusecard.push(opendeckcard);

            var spCards = gamelogicClass.CheckCardsForSpread(unusecard);


            unusecard.pop();

            if (typeof spCards != 'undefined' && spCards.length > 0 && _.flatten(spCards).indexOf(table.open_deck[table.open_deck.length - 1]) != -1) {//&& _.intersection(_.flatten(spCards),[opendeckcard]).length > 0){
                mechanismClass.PFOD({}, rct);
                return false;
            }

            //normal 4 spc length vali spc ma last first card add kari ne spc check kariyu 
            if (setothercard.length > 0) {

                setothercard = _.flatten(setothercard);

                finlspc = setothercard.filter((elem) => {
                    return elem !== null && elem.split("-")[2] != 'j'
                });

                finlspc = unusecard.concat(finlspc);

                finlspc.push(opendeckcard);
                var spCards = gamelogicClass.CheckCardsForSpread(finlspc);

                if (typeof spCards != 'undefined' && spCards.length > 0 && _.flatten(spCards).indexOf(table.open_deck[table.open_deck.length - 1]) != -1) {//&& _.intersection(_.flatten(spCards),[opendeckcard]).length > 0){
                    mechanismClass.PFOD({}, rct);
                    return false;
                }

            }

            //gap spc set 
            for (var i = 0; i < jokercardfirspc.length; i++) {
                jokercardfirspc[i].push(opendeckcard)

                if (jokerCalss.RonForCheckJokerCard(jokercardfirspc[i])) {
                    mechanismClass.PFOD({}, rct);
                    return false;
                }
                jokercardfirspc[i].pop()

            }

        }

        //=======================================Open Deck End ========================================================
        //===================================Close Deck Logic =========================================================
        //close deck spades 
        if (table.close_deck.length > 0 && rinfo.cards != null) {

            if (table.close_deck[0] == 'j-0' || table.close_deck[0] == 'j-1') {
                mechanismClass.PFCD({}, rct);
                return false;
            }

            //Total spc ma add card close deck and check 
            if (spctotalcard.length > 0) {
                spctotalcard.push(table.close_deck[0]);
                var spCardsspc = gamelogicClass.CheckCardsForSpread(spctotalcard);

                spctotalcard.pop();
                if (typeof spCardsspc != 'undefined' && spCardsspc.length > 0 && _.flatten(spCardsspc).indexOf(table.close_deck[0]) != -1) {//&& _.intersection(_.flatten(spCards),[opendeckcard]).length > 0){
                    mechanismClass.PFCD({}, rct);
                    return false;
                }
            }

            unusecard.push(table.close_deck[0]);
            var spCards = gamelogicClass.CheckCardsForSpread(unusecard);

            unusecard.pop();

            if (typeof spCards != 'undefined' && spCards.length > 0 && _.flatten(spCards).indexOf(table.close_deck[0]) != -1) {//&& _.intersection(_.flatten(spCards),[opendeckcard]).length > 0){
                mechanismClass.PFCD({}, rct);
                return false;
            }



            if (finlspc.length > 0) {

                finlspc.push(table.close_deck[0]);
                var spCards = gamelogicClass.CheckCardsForSpread(finlspc);
                if (typeof spCards != 'undefined' && spCards.length > 0 && _.flatten(spCards).indexOf(table.close_deck[0]) != -1) {//&& _.intersection(_.flatten(spCards),[opendeckcard]).length > 0){
                    mechanismClass.PFCD({}, rct);
                    return false;
                }

            }

            //Same As close deck to 
            if (table.mode == 4 || table.mode == 5 || table.mode == 6) {
                for (var i = 0; i < rinfo.spc.length; i++) {
                    rinfo.spc[i].push(table.close_deck[0])
                    //Joker card remove after check spades or not  [ 'f-3', 'k-3', 'l-3', 'f-6', 'f-7-j-1', 'f-7', 'f-8' ] this card 
                    if (jokerCalss.CheckCardCasesmiddelofjoker(rinfo.spc[i])) {
                        mechanismClass.PFCD({}, rct);

                        return false;
                    }
                    rinfo.spc[i].pop()
                }
            }


            for (var i = 0; i < jokercardfirspc.length; i++) {

                jokercardfirspc[i].push(table.close_deck[0])

                if (jokerCalss.RonForCheckJokerCard(jokercardfirspc[i])) {
                    mechanismClass.PFCD({}, rct);
                    return false;
                }
                jokercardfirspc[i].pop()

            }
        }


        var throwcard = []

        //unusecard.push(table.close_deck[0]);
        var cardtypeset = gamelogicClass.CardSetProbabilitynew(unusecard)

        if ((cardtypeset.ron != undefined && cardtypeset.ron.length > 0) || (cardtypeset.teen != undefined && cardtypeset.teen.length > 0)) {
            throwcard = compClass.ThrowCardUnUseCard(cardtypeset, table.close_deck);
        } else {
            var cardSet = { teen: [], ron: [] }
            rinfo.spc.forEach(function (a) {
                if (gamelogicClass.TeenForCheck(gamelogicClass.DiffColor(a))) {
                    cardSet.teen.push(a);
                } else if (gamelogicClass.RonForCheck(gamelogicClass.DiffColor(a))) {
                    cardSet.ron.push(a);
                } else if (jokerCalss.gaptotwocard(a)) {
                    cardSet.ron.push(a);
                }
                /*if (gamelogicClass.CheckCardCases(a))
                    finalArray.push(a);*/
            })
            throwcard = compClass.ThrowCardUnUseCard(cardSet, table.close_deck);
        }



        compClass.Exchangecard(table, throwcard, () => {

            mechanismClass.PFCD({}, rct);
            return false;


            /*for(var i=0;i<throwcard.length;i++){
                if(throwcard[i].card.indexOf(table.close_deck[0]) != -1){
                    closecardposs.push(throwcard[i])
                }
            }*/
            unusecard.pop()



            var rcard = gamelogicClass.DiffColor(unusecard);
            var rpoint = com.CardPointSum(rcard.cards);

            //========Open Deck to pick card and throw same card or not check
            var odcnp = 0;
            var thcard;

            if (table.open_deck.length > 0) {

                //rinfo.cards.push(table.open_deck[table.open_deck.length -1]);        
                unusecard.push(table.open_deck[table.open_deck.length - 1]);
                thcard = compClass.KnockTimeCardThrow(unusecard, table.close_deck);

                odcnp = (typeof thcard != 'undefined' && thcard == table.open_deck[table.open_deck.length - 1]) ? 1 : 0;

                unusecard.pop();
            }

            //===============================================close Deck End ===============================================

            if (rpoint <= table.deadwood) {

                //Konck Karvo ke nai ae 
                //low card get karvu
                var odcp = (table.open_deck.length > 0) ? opendeckcard.split('-')[1] : -1;
                var cdcp = (table.close_deck.length > 0) ? table.close_deck[0].split('-')[1] : -1;


                if (odcp != -1 && parseInt(odcp) < parseInt(cdcp)) {
                    //jo point 
                    if (unusecard.length <= 3 || rinfo.ltc == opendeckcard) {
                        mechanismClass.PFCD({}, rct);
                        return false
                    }


                    mechanismClass.PFOD({}, rct);
                    return false
                } else if (cdcp != -1 && parseInt(cdcp) < parseInt(odcp) && rinfo.ltc != opendeckcard) {
                    mechanismClass.PFCD({}, rct);
                    return false
                }

            }



            if (thcard != undefined && thcard != null && thcard != "") {
                unusecard = _.difference(unusecard, [thcard])
            }

            //New Logic 

            var opencardposs = []
            var throwcard = []

            if (opendeckcard != "" && unusecard.length > 0) {
                unusecard.push(opendeckcard);
                var cardtypeset = gamelogicClass.CardSetProbabilitynew(unusecard)
                throwcard = compClass.ThrowCardUnUseCard(cardtypeset, table.close_deck);


                for (var i = 0; i < throwcard.length; i++) {
                    if (throwcard[i].card.indexOf(opendeckcard) != -1) {
                        opencardposs.push(throwcard[i])
                    }
                }
                unusecard.pop()
            }


            var closecardposs = []

            if (table.close_deck.length > 0 && unusecard.length > 0) {
                unusecard.push(table.close_deck[0]);
                var cardtypeset = gamelogicClass.CardSetProbabilitynew(unusecard)
                var throwcard = compClass.ThrowCardUnUseCard(cardtypeset, table.close_deck);


                for (var i = 0; i < throwcard.length; i++) {
                    if (throwcard[i].card.indexOf(table.close_deck[0]) != -1) {
                        closecardposs.push(throwcard[i])
                    }
                }
                unusecard.pop()
            }



            closecardposs.sort((e, f) => {
                return e.index[0] - f.index[0]
            })
            opencardposs.sort((e, f) => {
                return e.index[0] - f.index[0]
            })


            if (opencardposs.length > 0 && closecardposs.length > 0 && opencardposs[0].index.length > 0 && closecardposs[0].index.length > 0) {

                if (closecardposs[0].index[0] > opencardposs[0].index[0] && odcnp != 1) {

                    mechanismClass.PFOD({}, rct);
                    return false;
                } else {


                    //Get Card On Close Deck
                    mechanismClass.PFCD({}, rct, false);
                    return false;
                }
            }


            //Check Index 
            if (opencardposs.length > 0 && opencardposs[0].index.length > 0 && opencardposs[0].index[0] <= 10 && odcnp != 1) {

                mechanismClass.PFOD({}, rct);
                return false;

            } else if (closecardposs.length > 0 && closecardposs[0].index.length > 0 && closecardposs[0].index[0] <= 10) { //Check Index 
                //Get Card On Close Deck
                mechanismClass.PFCD({}, rct, false);
                return false;
            }

            //===================================================================================
            //check user to open card possible unusecard sathe 
            if (table.open_deck.length > 0) {
                //thcard


                unusecard.push(opendeckcard);



                var cardSet = gamelogicClass.CardSetProbabilitynew(unusecard);

                //Aamathi je card Set MA Open Deck Nu Card Hoi te Combination na future card ni length jovai to samrt bane 

                unusecard.pop();


                var totalcard = []

                totalcard = totalcard.concat(cardSet.teen);
                totalcard = totalcard.concat(cardSet.ron);


                if (_.flatten(totalcard).indexOf(opendeckcard) != -1 && odcnp != 1) {

                    //Je Card Set MA open deck nu card use thayu 6e te te card set nu future card jovi 
                    var spadeslist = [];
                    totalcard.forEach(function (a) {

                        if (_.intersection(a, [opendeckcard]).length > 0) {
                            spadeslist.push(a)
                        }
                    })

                    var index = [];
                    spadeslist.forEach(function (a) {

                        var needcard = compClass.FutureCardSetFind(a);


                        for (var j = 0; j < needcard.length; j++) {
                            if (table.close_deck.indexOf(needcard[j]) != -1) {
                                index.push(table.close_deck.indexOf(needcard[j]))
                            }
                        }

                    })


                    if (index.length > 0 && rinfo.ltc != opendeckcard) {

                        mechanismClass.PFOD({}, rct);
                        return false;
                    } else {
                        mechanismClass.PFCD({}, rct, false);
                        return false;
                    }
                } else {
                    mechanismClass.PFCD({}, rct, false);
                    return false;
                }
            }
        })
    },

    otherplayerdeadwoodcount: (userData, robotsi, robotdeadwood) => {

        var isknock = true;

        for (var i = 0; i < userData.length; i++) {


            if (userData[i].deadwood != undefined && userData[i].si != robotsi && robotdeadwood >= userData[i].deadwood) {
                isknock = false;
                break;
            }
        }

        return isknock;

    },
    otherplayerreadytogin: (userData, robotsi, robotdeadwood) => {

        var isgin = false;

        for (var i = 0; i < userData.length; i++) {

            if (userData[i].deadwood != undefined &&
                userData[i].si != robotsi &&
                userData[i].deadwood == 0) {

                isgin = true;
                break;
            }
        }

        return isgin;

    },
    otherplayerisknock: (userData, robotsi, maindeadwood) => {


        var isgin = false;

        for (var i = 0; i < userData.length; i++) {


            if (userData[i].deadwood != undefined && userData[i].si != robotsi && userData[i].deadwood <= maindeadwood) {
                isgin = true;
                break;
            }
        }
        return isgin;
    },
    makespadesWisesavecard: (spc) => {


        var sortcard = _.filter(spc.a, function (num) {

            num.sort(function (e, f) {
                return parseInt(e.split('-')[1]) - parseInt(f.split('-')[1])
            });
            return num
        });

        sortcard.push(spc.unusecard)

        return _.flatten(sortcard);
    },
    KnockTimeCardThrow: (cards, close_deck, lodpc) => {

        
        cards.sort(function (e, f) {
            return parseInt(f.split("-")[1]) - parseInt(e.split("-")[1])
        });


        var cardSet = gamelogicClass.CardSetProbability(cards);

        var cardtypeset = gamelogicClass.NameOfSet(cardSet);

        var thCard = "";
        var unusecard = [];
        for (var y in cards) {
            if (_.flatten(cardSet).indexOf(cards[y]) == -1) {
                unusecard.push(cards[y]);
            }
        }

        if (typeof lodpc != undefined && lodpc != "" && unusecard.indexOf(lodpc) != -1) {
            unusecard.splice(unusecard.indexOf(lodpc), 1);
        }

        unusecard.sort(function (e, f) {
            //return parseInt(e.substr(2)) - parseInt(f.substr(2))
            return parseInt(e.split('-')[1]) - parseInt(f.split('-')[1])
        });//sorting the element in sequence

        var throwcard = compClass.ThrowCardUnUseCard(cardtypeset, close_deck);

        if (unusecard.length == 0) {

            //if card length 2 
            if (cards.length <= 2) {

                if (typeof lodpc != undefined && lodpc != "" && cards.indexOf(lodpc) != -1) {
                    cards.splice(cards.indexOf(lodpc), 1);
                }

                cards.sort(function (e, f) {
                    return parseInt(f.split("-")[1]) - parseInt(e.split("-")[1])
                });
                //rendam index 
                thCard = cards[0];

            } else {

                var throwcardtounuse = [];

                for (var i = 0; i < throwcard.length; i++) {
                    if (throwcard[i].index.length == 0) {
                        throwcardtounuse.push(throwcard[i].card);
                    }
                }

                for (var i = 0; i < throwcard.length; i++) {
                    if (throwcard[i].index.length > 0) {

                        throwcardtounuse[0] = _.difference(throwcardtounuse[0], throwcard[i].card)

                    }
                }

                throwcard.sort((e, f) => {
                    return e.index.length - f.index.length
                })

                throwcard.sort((e, f) => {
                    return f.index[0] - e.index[0]
                })

                
                // condition ( _.flatten(throwcardtounuse).length == 0) add by harshad date - 18-07-2022 text file robot logic chack case - 1

                if (throwcard.length > 0 && !_.flatten(throwcardtounuse).length) {

                    throwcardtounuse[0] = throwcard[0].card
                }
                

                for (var i = 1; i < throwcard.length; i++) {
                    if (throwcard[i].index.length >= 0) {

                        throwcardtounuse[0] = _.difference(throwcardtounuse[0], throwcard[i].card)
                    }
                }

                if (throwcard.length > 1 && !_.flatten(throwcardtounuse).length) {

                    throwcardtounuse[0] = throwcard[1].card

                    for (var i = 2; i < throwcard.length; i++) {
                        if (throwcard[i].index.length >= 0) {

                            throwcardtounuse[0] = _.difference(throwcardtounuse[0], throwcard[i].card)

                        }
                    }
                }

                if (throwcard.length > 2 && !_.flatten(throwcardtounuse).length) {

                    throwcardtounuse[0] = throwcard[2].card

                    for (var i = 2; i < throwcard.length; i++) {
                        if (throwcard[i].index.length >= 0) {

                            throwcardtounuse[0] = _.difference(throwcardtounuse[0], throwcard[i].card)

                        }
                    }

                }


                if (throwcard.length > 3 && !_.flatten(throwcardtounuse).length) {

                    throwcardtounuse[0] = throwcard[3].card

                    for (var i = 2; i < throwcard.length; i++) {
                        if (throwcard[i].index.length >= 0) {

                            throwcardtounuse[0] = _.difference(throwcardtounuse[0], throwcard[i].card)

                        }
                    }

                }

                if (throwcard.length > 0 && !_.flatten(throwcardtounuse).length) {

                    throwcardtounuse[0] = throwcard[0].card
                    var temp = 0
                    for (var i = throwcard.length - 1; i >= 0; i--) {

                        temp++
                        if (throwcard[i].index != undefined && throwcard[i].index.length >= 0) {

                            throwcardtounuse[0] = _.difference(throwcardtounuse[0], throwcard[i].card)

                        }
                        if (temp == 3)
                            break;
                    }

                }

                var idx = 0;

                if (throwcardtounuse.length == 0) {

                    for (var i = 0; i < throwcard.length; i++) {

                        if (throwcard[i].index.length > 0 && throwcard[i].index[0] > idx) {
                            idx = throwcard[i].index[0];
                            throwcardtounuse[0] = throwcard[i].card;
                        }
                    }
                }
                cardSet = _.flatten(cardSet);
                throwcardtounuse = _.flatten(throwcardtounuse);

                
                for (var i = 0; i < throwcardtounuse.length; i++) {
                    var k = cardSet.indexOf(throwcardtounuse[i])

                    if (k != -1)
                        cardSet.splice(k, 1);

                }

                
                var remaincard = _.difference(throwcardtounuse, cardSet);

                
                if (remaincard.length == 0) {

                    if (typeof lodpc != undefined && lodpc != "" && throwcardtounuse.indexOf(lodpc) != -1) {
                        throwcardtounuse.splice(throwcardtounuse.indexOf(lodpc), 1);
                    }
                    
                    throwcardtounuse.sort(function (e, f) {
                        return parseInt(f.split("-")[1]) - parseInt(e.split("-")[1])
                    });

                    
                    //var int = com.GetRandomInt(0,throwcardtounuse.length - 1)
                    thCard = throwcardtounuse[0];
                   
                    if (typeof thCard == 'undefined') {

                        if (typeof lodpc != undefined && lodpc != "" && cardSet.indexOf(lodpc) != -1) {
                            cardSet.splice(cardSet.indexOf(lodpc), 1);
                        }

                        //var int = com.GetRandomInt(0,cardSet.length - 1)
                        cardSet.sort(function (e, f) {
                            return parseInt(f.split("-")[1]) - parseInt(e.split("-")[1])
                        });


                        thCard = cardSet[0];
                    }
                } else {

                    if (typeof lodpc != undefined && lodpc != "" && remaincard.indexOf(lodpc) != -1) {
                        remaincard.splice(remaincard.indexOf(lodpc), 1);
                    }
                    remaincard.sort(function (e, f) {
                        return parseInt(f.split("-")[1]) - parseInt(e.split("-")[1])
                    });
                   
                    if (remaincard.length > 0) {
                        //var int = com.GetRandomInt(0,remaincard.length - 1)
                        thCard = remaincard[0];
                    } else {
                       
                        if (typeof lodpc != undefined && lodpc != "" && throwcardtounuse.indexOf(lodpc) != -1) {
                            throwcardtounuse.splice(throwcardtounuse.indexOf(lodpc), 1);
                        }

                        throwcardtounuse.sort(function (e, f) {
                            return parseInt(f.split("-")[1]) - parseInt(e.split("-")[1])
                        });


                        //var int = com.GetRandomInt(0,throwcardtounuse.length - 1)
                        thCard = throwcardtounuse[0];

                        if (typeof thCard == 'undefined') {

                            if (typeof lodpc != undefined && lodpc != "" && cardSet.indexOf(lodpc) != -1) {
                                cardSet.splice(cardSet.indexOf(lodpc), 1);
                            }

                            //var int = com.GetRandomInt(0,cardSet.length - 1)
                            cardSet.sort(function (e, f) {
                                return parseInt(f.split("-")[1]) - parseInt(e.split("-")[1])
                            });

                            thCard = cardSet[0];
                        }
                    }

                }
            }
        } else {
            var throwcardtounuse = [];
            var throwcardtouse = [];

            for (var i = 0; i < throwcard.length; i++) {
                if (throwcard[i].index.length == 0) {
                    throwcardtounuse.push(throwcard[i].card);
                } else {
                    throwcardtouse.push(throwcard[i].card)
                }
            }
            /*
                throwcard [ { card: [ 'f-7', 'k-7' ],
                    type: 'teen',
                    index: [],
                    needcard: [ 'l-7', 'c-7' ] },
                  { card: [ 'f-8', 'c-8' ],
                    type: 'teen',
                    index: [ 6 ],
                    needcard: [ 'l-8', 'k-8' ] },
                  { card: [ 'k-10', 'l-10' ],
                    type: 'teen',
                    index: [ 5, 9 ],
                    needcard: [ 'c-10', 'f-10' ] },
                  { card: [ 'f-7', 'f-8' ],
                    type: 'ron',
                    index: [ 16 ],
                    needcard: [ 'f-9', 'f-6' ] },
                  { card: [ 'k-10', 'k-11' ],
                    type: 'ron',
                    index: [ 13 ],
                    needcard: [ 'k-12', 'k-9' ] } ]
                unusecard [ 'f-2', 'f-7', 'k-7' ]
                after Sorting  [ 'f-7', 'k-7', 'f-2' ]
                tc :::::::::::::::::::::::::::::::::::::: f-7
            */
            if (throwcardtounuse.length > 0) {
                //unusecard.push(_.flatten(throwcardtounuse));

                throwcardtounuse = _.difference(_.flatten(throwcardtounuse), _.flatten(throwcardtouse))

                unusecard = _.flatten(unusecard.concat(_.flatten(throwcardtounuse)))

            }
            if (typeof lodpc != undefined && lodpc != "" && unusecard.indexOf(lodpc) != -1) {

                unusecard.splice(unusecard.indexOf(lodpc), 1);
            }
            
            unusecard.sort(function (e, f) {
                return parseInt(f.split("-")[1]) - parseInt(e.split("-")[1])
            });


            thCard = unusecard[0];
        }

        return thCard;
    },
    KnockTimeCardThrowNew: (cards, close_deck, lodpc) => {

        var cardSet = gamelogicClass.CardSetProbability(cards);

        var cardtypeset = gamelogicClass.NameOfSet(cardSet);

        var thCard = "";
        var unusecard = [];
        for (var y in cards) {
            if (_.flatten(cardSet).indexOf(cards[y]) == -1) {
                unusecard.push(cards[y]);
            }
        }

        if (typeof lodpc != undefined && lodpc != "" && unusecard.indexOf(lodpc) != -1) {
            unusecard.splice(unusecard.indexOf(lodpc), 1);
        }

        unusecard.sort(function (e, f) {
            //return parseInt(e.substr(2)) - parseInt(f.substr(2))
            return parseInt(e.split('-')[1]) - parseInt(f.split('-')[1])
        });//sorting the element in sequence

       
        var throwcard = compClass.ThrowCardUnUseCard(cardtypeset, close_deck);

        if (unusecard.length == 0) {

            //if card length 2 
            if (cards.length <= 2) {

                if (typeof lodpc != undefined && lodpc != "" && cards.indexOf(lodpc) != -1) {
                    cards.splice(cards.indexOf(lodpc), 1);
                }

                cards.sort(function (e, f) {
                    return parseInt(f.split("-")[1]) - parseInt(e.split("-")[1])
                });
                //rendam index 
                thCard = cards[0];

            } else {

                var throwcardtounuse = [];

                for (var i = 0; i < throwcard.length; i++) {
                    if (throwcard[i].index.length == 0) {
                        throwcardtounuse.push(throwcard[i].card);
                    }
                }


                var idx = 0;

                if (throwcardtounuse.length == 0) {

                    for (var i = 0; i < throwcard.length; i++) {

                        if (throwcard[i].index.length > 0 && throwcard[i].index[0] > idx) {
                            idx = throwcard[i].index[0];
                            throwcardtounuse[0] = throwcard[i].card;
                        }
                    }
                }

                cardSet = _.flatten(cardSet);
                throwcardtounuse = _.flatten(throwcardtounuse);


                for (var i = 0; i < throwcardtounuse.length; i++) {
                    var k = cardSet.indexOf(throwcardtounuse[i])

                    if (k != -1)
                        cardSet.splice(k, 1);

                }


                var remaincard = _.difference(throwcardtounuse, cardSet);


                if (remaincard.length == 0) {

                    if (typeof lodpc != undefined && lodpc != "" && throwcardtounuse.indexOf(lodpc) != -1) {
                        throwcardtounuse.splice(throwcardtounuse.indexOf(lodpc), 1);
                    }

                    throwcardtounuse.sort(function (e, f) {
                        return parseInt(f.split("-")[1]) - parseInt(e.split("-")[1])
                    });

                    for (var i = 0; i < throwcard.length; i++) {


                        var useother = _.intersection(throwcardtounuse, throwcard[i].card);

                        var alluse = _.difference(throwcard[i].card, throwcardtounuse);



                        if (useother.length > 0 && alluse.length > 0) {

                            for (var j = 0; j < useother.length; j++) {

                                if (throwcardtounuse.length <= 1) {
                                    break;
                                }

                                var k = throwcardtounuse.indexOf(useother[j])

                                if (k != -1)
                                    throwcardtounuse.splice(k, 1);

                            }
                        }

                        if (throwcardtounuse.length <= 1) {
                            break;
                        }
                    }


                    if (throwcardtounuse.length > 0)
                        thCard = throwcardtounuse[0];

                    if (typeof thCard == 'undefined' || thCard == "") {

                        if (typeof lodpc != "undefined" && lodpc != "" && cardSet.indexOf(lodpc) != -1) {
                            cardSet.splice(cardSet.indexOf(lodpc), 1);
                        }

                        //var int = com.GetRandomInt(0,cardSet.length - 1)
                        cardSet.sort(function (e, f) {
                            return parseInt(f.split("-")[1]) - parseInt(e.split("-")[1])
                        });


                        thCard = cardSet[0];
                    }


                    //var int = com.GetRandomInt(0,throwcardtounuse.length - 1)
                    /*thCard = throwcardtounuse[0];  

                    if(typeof thCard == 'undefined'){
 
                        if(typeof lodpc != undefined && lodpc != "" && cardSet.indexOf(lodpc) != -1){
                            cardSet.splice(cardSet.indexOf(lodpc),1);
                        }
                        
                        //var int = com.GetRandomInt(0,cardSet.length - 1)
                        cardSet.sort(function(e, f) {
                            return parseInt(f.split("-")[1]) - parseInt(e.split("-")[1])
                        });


                        thCard = cardSet[0];  
                    }   */
                } else {

                    if (typeof lodpc != undefined && lodpc != "" && remaincard.indexOf(lodpc) != -1) {
                        remaincard.splice(remaincard.indexOf(lodpc), 1);
                    }
                    remaincard.sort(function (e, f) {
                        return parseInt(f.split("-")[1]) - parseInt(e.split("-")[1])
                    });

                    //var int = com.GetRandomInt(0,remaincard.length - 1)
                    thCard = remaincard[0];

                }
            }
        } else {

            var throwcardtounuse = [];
            var throwcardtouse = [];

            for (var i = 0; i < throwcard.length; i++) {
                if (throwcard[i].index.length == 0) {
                    throwcardtounuse.push(throwcard[i].card);
                } else {
                    throwcardtouse.push(throwcard[i].card)
                }
            }

            /*
                throwcard [ { card: [ 'f-7', 'k-7' ],
                    type: 'teen',
                    index: [],
                    needcard: [ 'l-7', 'c-7' ] },
                  { card: [ 'f-8', 'c-8' ],
                    type: 'teen',
                    index: [ 6 ],
                    needcard: [ 'l-8', 'k-8' ] },
                  { card: [ 'k-10', 'l-10' ],
                    type: 'teen',
                    index: [ 5, 9 ],
                    needcard: [ 'c-10', 'f-10' ] },
                  { card: [ 'f-7', 'f-8' ],
                    type: 'ron',
                    index: [ 16 ],
                    needcard: [ 'f-9', 'f-6' ] },
                  { card: [ 'k-10', 'k-11' ],
                    type: 'ron',
                    index: [ 13 ],
                    needcard: [ 'k-12', 'k-9' ] } ]
                unusecard [ 'f-2', 'f-7', 'k-7' ]
                after Sorting  [ 'f-7', 'k-7', 'f-2' ]
                tc :::::::::::::::::::::::::::::::::::::: f-7
            */
            if (throwcardtounuse.length > 0) {
                //unusecard.push(_.flatten(throwcardtounuse));

                throwcardtounuse = _.difference(_.flatten(throwcardtounuse), _.flatten(throwcardtouse))

                unusecard = _.flatten(unusecard.concat(_.flatten(throwcardtounuse)))

            }

            if (typeof lodpc != undefined && lodpc != "" && unusecard.indexOf(lodpc) != -1) {

                unusecard.splice(unusecard.indexOf(lodpc), 1);
            }

            unusecard.sort(function (e, f) {
                return parseInt(f.split("-")[1]) - parseInt(e.split("-")[1])
            });
            thCard = unusecard[0];
        }

        return thCard;
    },
    ThrowCardUnUseCard: (cardTypeSet, close_deck) => {


        var makethrowcard = [];

        for (var i = 0; i < cardTypeSet.teen.length; i++) {

            var makejson = {
                card: cardTypeSet.teen[i],
                type: "teen",
                index: [],
                needcard: []
            };

            var needcard = compClass.FutureCardSetFind(cardTypeSet.teen[i]);

            var index = [];
            for (var j = 0; j < needcard.length; j++) {
                if (close_deck.indexOf(needcard[j]) != -1) {
                    index.push(close_deck.indexOf(needcard[j]))
                }
            }
            index.sort(function (e, f) {
                return e - f;
            });

            makejson.index = index;
            makejson.needcard = needcard;

            makethrowcard.push(makejson);
        }

        for (var i = 0; i < cardTypeSet.ron.length; i++) {
            var makejson = {
                card: cardTypeSet.ron[i],
                type: "ron",
                index: [],
                needcard: []
            };
            var needcard = compClass.FutureCardSetFind(cardTypeSet.ron[i]);

            var index = [];

            for (var j = 0; j < needcard.length; j++) {
                if (close_deck.indexOf(needcard[j]) != -1) {
                    index.push(close_deck.indexOf(needcard[j]))
                }
            }

            index.sort(function (e, f) {
                return e - f;
            })


            makejson.index = index;
            makejson.needcard = needcard;

            makethrowcard.push(makejson);
        }

        return makethrowcard;
    },
    myspadesfuturecardisthere: (spc, close_deck) => {


        var makethrowcard = [];

        for (var i = 0; i < spc.length; i++) {

            var makejson = {
                card: spc[i],
                index: [],
                needcard: []
            };

            var needcard = compClass.FutureCardSetFind(spc[i]);

            var index = [];
            for (var j = 0; j < needcard.length; j++) {
                if (close_deck.indexOf(needcard[j]) != -1) {
                    index.push(close_deck.indexOf(needcard[j]))
                }
            }
            index.sort(function (e, f) {
                return e - f;
            });

            makejson.index = index;
            makejson.needcard = needcard;

            makethrowcard.push(makejson);
        }

        return makethrowcard;
    },
    FutureCardSetFind: (set) => {
        var color1 = ["l", "k", "c", "f"];

        needcard = []
        
        set.sort(function (e, f) {
            return parseInt(e.split('-')[1]) - parseInt(f.split('-')[1])
            //return e.split('-')[1] - f.split('-')[1]
        })

        var dt = gamelogicClass.DiffColor(set);

        if (gamelogicClass.TeenForCheck(dt)) {

            var needcol = _.difference(color1, dt.color);

            for (var k = 0; k < needcol.length; k++) {
                needcard.push(needcol[k] + "-" + dt.cards[0])
            }

        } else if (gamelogicClass.RonForCheck(dt)) {
            if (eval(dt.cards[dt.cards.length - 1] + 1) < 13) {

                needcard.push(dt.color[0] + "-" + eval(dt.cards[dt.cards.length - 1] + 1))
            }

            if (eval(dt.cards[0] - 1) > 0) {

                needcard.push(dt.color[0] + "-" + eval(dt.cards[0] - 1));
            }
        } else if (jokerCalss.gaptotwocard(set)) {

            needcard = jokerCalss.needtogapcardfind(set)

        }


        return needcard;
    },
    CompForFree: (id) => {

        db.collection("game_users").findAndModify({ _id: MongoId(id.toString()) }, {},
            {
                $set: {
                    'flags._io': 0,
                    's': 'free',
                    'tbid': "",
                    'si': "",
                }
            }, { new: true }, (err, uprobot) => {

                if (!err && uprobot.value != null) {
                    if (uprobot.value.extragold != undefined && uprobot.value.extragold != 0) {
                        db.collection("game_users").updateOne({
                            _id: MongoId(id.toString()),
                            chips: {
                                $gt: uprobot.value.extragold
                            }
                        },
                            { $inc: { "chips": -uprobot.value.extragold }, $set: { extragold: 0 } }, (err, update) => {

                            })
                    }


                    rclient.srem("robots_busy", id.toString());
                    rclient.sadd('Robot_free_' + uprobot.value.timetype + "", uprobot.value._id.toString(), function () { });
                    rclient.hdel('session:' + id.toString(), "tbid", "si", "st", "spcd");
                }
            });
    },
    CompForFreeTur: (id) => {

        db.collection("game_users").findAndModify({ _id: MongoId(id.toString()) }, {},
            {
                $set: {
                    'flags._io': 0,
                    's': 'free',
                    'tbid': "",
                    'si': "",
                    "tuid": "",
                    "tsi": ""
                }
            }, { new: true }, (err, uprobot) => {

                if (!err && uprobot.value != null) {
                    rclient.srem("robots_busy", id.toString());
                    rclient.sadd('Robot_free_' + uprobot.value.timetype + "", uprobot.value._id.toString(), () => { });
                    rclient.hdel('session:' + id.toString(), "tbid", "si", "st", "spcd");
                }
            });
    },
    CountManageComp: (tb) => {

        var pl = 0;
        if (typeof tb == 'undefined' || tb == null)
            return pl;

        for (var x in tb) {
            if (typeof tb[x] == 'object' && tb[x] != null && typeof tb[x].si != 'undefined' && (tb[x].comp == 1 || tb[x].ui._iscom == 1))   // && p[x].s != ''
                pl++
        }

        return pl;

    },
    ExitGameOfComp: (tbid) => {

        cdClass.GetTableData(tbid.toString(), {}, (tb) => {
            if (tb) {

                var pl = 0;
                for (var x in tb.pi) {
                    if (typeof tb.pi[x] == 'object' && tb.pi[x] != null && typeof tb.pi[x].si != 'undefined' && tb.pi[x].comp == 1)   // && p[x].s != ''
                        pl++
                }


                if (pl > 0) {

                    var uId = "";
                    var si = "";


                    for (var x in tb.pi) {
                        if (typeof tb.pi[x] == 'object' && tb.pi[x] != null && typeof tb.pi[x].si != 'undefined' && tb.pi[x].comp == 1)   // && p[x].s != ''
                        {
                            uId = tb.pi[x].ui.uid;
                            si = tb.pi[x].si;
                            break;
                        }
                    }


                    /*var uId = TurnPlayer.ui.uid.toString();*/
                    var up = {
                        $set: {
                            "pi.$": {},
                            la: new Date()
                        },
                        $inc: {
                            ap: -1,
                            comp: -1
                        }
                    };
                    var wh = {
                        _id: MongoId(tbid.toString()),
                        "pi.ui.uid": MongoId(uId.toString())
                    };

                    //removing other keys from redis
                    cdClass.GetUserInfo(uId.toString(), {
                        socketid: 1,
                        "flags": 1
                    }, (uInfo) => {


                        if (typeof uInfo.flags != 'undefined' && uInfo.flags._iscom == 0 /*&& uInfo.flags._io == 1*/) {
                            cdClass.SendDataToUser(uId, {
                                en: 'EG',
                                data: {
                                    si: si,
                                    UID: uId,
                                    auto: 0,
                                    tbid: tbid,
                                    comp: 0,
                                    isfrom: "",
                                    promotag: "",
                                    promoflag: "",
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

                        compClass.CompForFree(uId.toString());


                        cdClass.SendDataToTable(tbid.toString(), {
                            en: 'EG',
                            data: {
                                si: si,
                                UID: uId,
                                auto: 0,
                                tbid: tbid,
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

                        //remove Table from user's index.
                        db.collection("game_users").update({
                            _id: MongoId(uId)
                        }, {
                            $set: {
                                tbid: "",
                                reConnID: "",
                                si: ""
                            }
                        }, function () {

                        });
                    })


                    db.collection("playing_table").findAndModify(wh, {}, up, { new: true }, (err, up) => {

                        if (!err && up.value != null) {

                            dashClass.SendGlobelRoom(up.value);
                        }

                        compClass.ExitGameOfComp(tbid);

                    });

                } else {
                    dashClass.SendGlobelRoom(tb)

                }
            }
        });
    },
    ExitGameOfRobot: (tbid, isstargame) => {

        cdClass.GetTableData(tbid.toString(), {}, (tb) => {
            if (tb) {
                var pl = 0;
                for (var x in tb.pi) {
                    if (typeof tb.pi[x] == 'object' && tb.pi[x] != null && typeof tb.pi[x].si != 'undefined' && tb.pi[x].ui._iscom == 1)   // && p[x].s != ''
                        pl++
                }

                var ruc = 0;

                for (var x in tb.pi) {
                    if (typeof tb.pi[x] == 'object' && tb.pi[x] != null && typeof tb.pi[x].si != 'undefined' && tb.pi[x].ui._iscom == 0)   // && p[x].s != ''
                        ruc++
                }


                if (pl > 0 && ruc == 0) {

                    var uId = "";
                    var si = "";


                    for (var x in tb.pi) {
                        if (typeof tb.pi[x] == 'object' && tb.pi[x] != null && typeof tb.pi[x].si != 'undefined' && tb.pi[x].ui._iscom == 1)   // && p[x].s != ''
                        {
                            uId = tb.pi[x].ui.uid;
                            si = tb.pi[x].si;
                            break;
                        }
                    }


                    /*var uId = TurnPlayer.ui.uid.toString();*/
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
                        _id: MongoId(tbid.toString()),
                        "pi.ui.uid": MongoId(uId.toString())
                    };

                    //removing other keys from redis
                    cdClass.GetUserInfo(uId.toString(), {
                        socketid: 1,
                        "flags": 1
                    }, (uInfo) => {


                        if (typeof uInfo.flags != 'undefined' && uInfo.flags._io == 1) {
                            cdClass.SendDataToUser(uId, {
                                en: 'EG',
                                data: {
                                    si: si,
                                    UID: uId,
                                    auto: 0,
                                    tbid: tbid,
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

                        compClass.CompForFree(uId.toString());


                        cdClass.SendDataToTable(tbid, {
                            en: 'EG',
                            data: {
                                si: si,
                                UID: uId,
                                auto: 0,
                                tbid: tbid,
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

                        //remove Table from user's index.
                        db.collection("game_users").update({
                            _id: MongoId(uId)
                        }, {
                            $set: {
                                tbid: "",
                                reConnID: "",
                                si: ""
                            }
                        }, () => {

                        });
                    })

                    //updating the data of table.
                    /* cdClass.UpdateTableData(wh, up, function () {
                         
                         compClass.ExitGameOfRobot(tbid);
                         
                     });
                     */
                    db.collection("playing_table").findAndModify(wh, {}, up, { new: true }, (err, updatedata) => {


                        if (!err && updatedata.value != null) {

                            dashClass.SendGlobelRoom(updatedata.value)
                        }
                        compClass.ExitGameOfRobot(tbid, isstargame);
                    })

                } else {

                    dashClass.SendGlobelRoom(tb)

                    if (ruc == 0) {

                        if (com.InArray(tb.t_status, stArr) /*tb.t_status == 'RoundStarted' || "NewRoundStarted","RoundStartedPass",*/) {

                            com.CancelScheduleJobOnServer(tb._id.toString(), tb.jid);
                            cdClass.UpdateTableData(tb._id.toString(), {
                                $set: {
                                    t_status: '',
                                    pv: 0,
                                    score: [],
                                    round: 1,
                                    maindeadwood: 0
                                }
                            });
                        }

                        db.collection("playing_table").deleteOne({ _id: MongoId(tb._id.toString()), ap: 0, $or: [{ _ip: 1 }, { isnotiid: { $ne: "" } }] }, () => { })
                    }

                    if (isstargame) {
                        StarPlayerClass.AutoDeleteTable()
                    }

                }
            }
        });
    },
    //status 1 hoi tyare 
    ExitGameOfTable: (tbid) => {

        if (typeof tbid == 'undefined' || tbid == null || tbid == "") {
            return false
        }

        cdClass.GetTableData(tbid.toString(), {}, (tb) => {
            if (tb) {

                var uId = "";

                for (var x in tb.pi) {
                    if (typeof tb.pi[x] == 'object' && tb.pi[x] != null && typeof tb.pi[x].si != 'undefined' && typeof tb.pi[x].ui.uid != 'undefined')   // && p[x].s != ''
                    {
                        uId = tb.pi[x].ui.uid;
                        break;
                    }
                }

                if (uId != "") {
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
                        _id: MongoId(tbid.toString()),
                        "pi.ui.uid": MongoId(uId.toString())
                    };

                    //compClass.CompForFree(uId.toString());
                    //jo first round ma thi free kari devi and robot second round maa hooi tyare problem aave 6e 
                    //free robot second round ma playing kare and bije seat kare to problem aave 



                    //remove Table from user's index.
                    db.collection("game_users").update({
                        _id: MongoId(uId)
                    }, {
                        $set: {
                            tbid: "",
                            si: "",
                        }
                    }, () => {

                        //updating the data of table.
                        cdClass.UpdateTableData(wh, up, () => {

                            compClass.ExitGameOfTable(tbid);
                            //return callback();

                        });
                    });
                    /*})*/
                } else {
                    db.collection('playing_table').deleteOne({ _id: MongoId(tb._id.toString()) }, () => { });
                }
            } else {
                console.log("tbid ", tbid)
            }
        });
    },
    //status 2 hoi tyare 
    ExitGameOfTablestatus: (tbid) => {
        if (typeof tbid == 'undefined' || tbid == null || tbid == "") {
            return false
        }

        cdClass.GetTableData(tbid.toString(), {}, (tb) => {
            if (tb) {

                var uId = "";

                for (var x in tb.pi) {
                    if (typeof tb.pi[x] == 'object' && tb.pi[x] != null && typeof tb.pi[x].si != 'undefined' && typeof tb.pi[x].ui.uid != 'undefined') {
                        uId = tb.pi[x].ui.uid;
                        break;
                    }
                }


                if (uId != "") {

                    /*var uId = TurnPlayer.ui.uid.toString();*/
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
                        _id: MongoId(tbid.toString()),
                        "pi.ui.uid": MongoId(uId.toString())
                    };

                    db.collection("game_users").update({
                        _id: MongoId(uId),
                        "flags._iscom": 0
                    }, {
                        $set: {
                            tbid: "",
                            si: "",
                            tuid: "",
                            tsi: "",
                        }
                    }, () => {

                        //updating the data of table.
                        cdClass.UpdateTableData(wh, up, () => {

                            compClass.ExitGameOfTablestatus(tbid);
                            //return callback();

                        });
                    });
                    //})
                } else {
                    db.collection('playing_table').deleteOne({ _id: MongoId(tb._id.toString()) }, () => { });
                }
            } else {
                console.log("tbid ", tbid)
            }
        });
    },
    /* Singal Round game hoi tyare  */
    leaveAllPlayer: (tbid, isfrom) => {


        if (typeof tbid == 'undefined' || tbid == null || tbid == "") {
            return false
        }

        cdClass.GetTableData(tbid.toString(), {}, (tb) => {
            if (tb) {


                var uId = "";
                var si = -1;

                for (var x in tb.pi) {
                    if (typeof tb.pi[x] == 'object' && tb.pi[x] != null && typeof tb.pi[x].si != 'undefined' && typeof tb.pi[x].ui.uid != 'undefined' && tb.pi[x].isplay == 1) {

                        if (tb.pi[x].ui._iscom == 0 && tb.stargame == 1) {

                            uId = tb.pi[x].ui.uid;
                            si = tb.pi[x].si;
                            break;

                        } else if (tb.stargame == 1 && isfrom != 'undefined' && isfrom == 'EG') {

                            uId = tb.pi[x].ui.uid;
                            si = tb.pi[x].si;
                            break;

                        } else if (tb.stargame == 0) {
                            uId = tb.pi[x].ui.uid;
                            si = tb.pi[x].si;
                            break;
                        }
                    }
                }


                if (uId != "" && si != -1) {

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
                        _id: MongoId(tbid.toString()),
                        "pi.ui.uid": MongoId(uId.toString())
                    };

                    //removing other keys from redis
                    cdClass.GetUserInfo(uId.toString(), {
                        socketid: 1,
                        "flags": 1,
                        "wlg": 1,
                        "version": 1,
                        "counters": 1,
                        "ispromogame": 1
                    }, (uInfo) => {

                        egBanner = cdClass.EGBanner(uInfo)
                        if (typeof uInfo.flags != 'undefined' && uInfo.flags._iscom == 0) {



                            cdClass.SendDataToUser(uId, {
                                en: 'EG',
                                data: {
                                    si: si,
                                    UID: uId,
                                    auto: 0,
                                    tbid: tbid,
                                    comp: 0,
                                    isfrom: "",
                                    promoflag: egBanner.promoflag,
                                    promotag: egBanner.promotag,
                                    promolink: egBanner.promolink,
                                    nogold: 0,
                                    wlg: (typeof uInfo.wlg == 'undefined' || parseInt(uInfo.version.aVersion) < parseInt(config.VIDEONOTIVERSION)) ? 0 : uInfo.wlg,
                                    singalround: 1,
                                    quest: {},
                                    isoffer: -1,
                                    isstargameOver: 0
                                }
                            });

                            io.of('/').adapter.remoteLeave(uInfo.socketid, tbid.toString(), (err) => {
                                if (err) {/* c("Not Connect ",uInfo.socketid)*/ }



                            });

                        }

                        if (uInfo.flags._iscom == 1) {

                            compClass.CompForFree(uId.toString());
                        }

                        cdClass.SendDataToTable(tbid, {
                            en: 'EG',
                            data: {
                                si: si,
                                UID: uId,
                                auto: 0,
                                tbid: tbid,
                                comp: 0,
                                isfrom: "",
                                promoflag: egBanner.promoflag,
                                promotag: egBanner.promotag,
                                promolink: egBanner.promolink,
                                nogold: 0,
                                wlg: (typeof uInfo.wlg == 'undefined' || parseInt(uInfo.version.aVersion) < parseInt(config.VIDEONOTIVERSION)) ? 0 : uInfo.wlg,
                                singalround: 1,
                                quest: {},
                                isoffer: -1,
                                isstargameOver: 0
                            }
                        });

                        //remove Table from user's index.
                        db.collection("game_users").update({
                            _id: MongoId(uId)
                        }, {
                            $set: {
                                tbid: "",
                                reConnID: "",
                                si: ""
                            }
                        }, () => {

                        });
                    })

                    db.collection("playing_table").findAndModify(wh, {}, up, { new: true }, (err, updatedata) => {


                        if (!err && updatedata.value != null) {

                            dashClass.SendGlobelRoom(updatedata.value)
                        }
                        compClass.leaveAllPlayer(tbid);
                    })

                    notiClass.RemovejoinTableNoti(tb, { uid: uId.toString() });

                } else {


                    db.collection("playing_table").remove({ _id: MongoId(tbid), ap: 0, $or: [{ _ip: 1 }, { isnotiid: { $ne: "" } }] }, () => { })


                    dashClass.SendGlobelRoom(tb)

                    setTimeout(function () {
                        schedulerClass.AfterGameFinish({
                            tbId: tbid
                        })
                    }, (2 * 1000));

                    /*if(ruc == 0){

                        if(tb.t_status == "FWinnerDeclared")
                        {
                            
                            com.CancelScheduleJobOnServer(tb._id.toString(), tb.jid);
                            cdClass.UpdateTableData(tb._id.toString(), {
                                $set: {
                                    t_status: '',
                                    PassUser:[],
                                    score:[],
                                    round:1,
                                    maindeadwood:0,
                                    pv:0
                                }
                            });
                        }
                        //db.collection("playing_table").remove({_id:MongoId(tb._id.toString()),ap:0,_ip:1},()=>{})
                    }*/
                }
            }
        });
    },
    FreeRobotForTournamnet: (turData) => {

        async.forEach(turData.round1, (item, callback) => {

            async.forEach(item.player, (playeritem, callback1) => {

                // tell async that that particular element of the iterator is done
                if (typeof playeritem.uid != 'undefined' && typeof playeritem._iscom != 'undefined' && playeritem._iscom == 1) {
                    compClass.CompForFreeTur(playeritem.uid.toString());
                }
                callback1();
            }, function (err) {

                // tell async that that particular element of the iterator is done
                db.collection("tournament").deleteOne({ _id: MongoId(turData._id.toString()) }, () => { })

                callback();
            });

        }, function (err) {

        });
    },
    leaveAndJoinRobot: (tbid) => {
        cdClass.GetTableData(tbid.toString(), {}, (tb) => {
            if (tb) {
                var comp = 0;
                var total = 0;

                for (var x in tb.pi) {
                    if (typeof tb.pi[x] == 'object' && tb.pi[x] != null && typeof tb.pi[x].si != 'undefined' && tb.pi[x].ui._iscom == 1)   // && p[x].s != ''
                    {
                        comp++;
                        total++;
                    }
                }

                var ruc = 0;

                for (var x in tb.pi) {
                    if (typeof tb.pi[x] == 'object' && tb.pi[x] != null && typeof tb.pi[x].si != 'undefined' && tb.pi[x].ui._iscom == 0)   // && p[x].s != ''
                    {
                        total++;
                        ruc++;
                    }
                }

                if ((comp >= 1 && ruc >= 2) || comp == 2) {
                    compClass.leaveComp(tbid)
                }



                if (total == 1 && config.ROBOT == true) {
                    compClass.PutCompToPlay(tbid);
                }

            }
        });
    },
    leaveAndJoinRobotTwoUserTime: (tbid) => {
        cdClass.GetTableData(tbid.toString(), {}, (tb) => {
            if (tb) {
                var comp = 0;
                var total = 0;

                for (var x in tb.pi) {
                    if (typeof tb.pi[x] == 'object' && tb.pi[x] != null && typeof tb.pi[x].si != 'undefined' && tb.pi[x].ui._iscom == 1)   // && p[x].s != ''
                    {
                        comp++;
                        //total++;
                    }
                }

                var ruc = 0;

                for (var x in tb.pi) {
                    if (typeof tb.pi[x] == 'object' && tb.pi[x] != null && typeof tb.pi[x].si != 'undefined' && tb.pi[x].ui._iscom == 0)   // && p[x].s != ''
                    {
                        total++;
                        ruc++;
                    }
                }

                if (comp >= 1) {
                    compClass.leaveComp(tbid)
                }




                if (total == 1 && config.ROBOT == true) {
                    compClass.PutCompToPlay(tbid);
                }

            }
        });
    },
    leaveComp: (tbid) => {
        cdClass.GetTableData(tbid.toString(), {}, (tb) => {
            if (tb) {
                var pl = 0;
                for (var x in tb.pi) {
                    if (typeof tb.pi[x] == 'object' && tb.pi[x] != null && typeof tb.pi[x].si != 'undefined' && tb.pi[x].ui._iscom == 1)   // && p[x].s != ''
                        pl++
                }

                var ruc = 0;

                for (var x in tb.pi) {
                    if (typeof tb.pi[x] == 'object' && tb.pi[x] != null && typeof tb.pi[x].si != 'undefined' && tb.pi[x].ui._iscom == 0)   // && p[x].s != ''
                        ruc++
                }


                if (pl > 0 && ruc >= 1) {

                    var uId = "";
                    var si = "";


                    for (var x in tb.pi) {
                        if (typeof tb.pi[x] == 'object' && tb.pi[x] != null && typeof tb.pi[x].si != 'undefined' && tb.pi[x].ui._iscom == 1)   // && p[x].s != ''
                        {
                            uId = tb.pi[x].ui.uid;
                            si = tb.pi[x].si;
                            break;
                        }
                    }


                    /*var uId = TurnPlayer.ui.uid.toString();*/
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
                        _id: MongoId(tbid.toString()),
                        "pi.ui.uid": MongoId(uId.toString())
                    };

                    //removing other keys from redis
                    cdClass.GetUserInfo(uId.toString(), {
                        socketid: 1,
                        "flags": 1
                    }, (uInfo) => {


                        if (typeof uInfo.flags != 'undefined' && uInfo.flags._io == 1) {
                            cdClass.SendDataToUser(uId, {
                                en: 'EG',
                                data: {
                                    si: si,
                                    UID: uId,
                                    auto: 0,
                                    tbid: tbid,
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

                        compClass.CompForFree(uId.toString());


                        cdClass.SendDataToTable(tbid, {
                            en: 'EG',
                            data: {
                                si: si,
                                UID: uId,
                                auto: 0,
                                tbid: tbid,
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

                        //remove Table from user's index.
                        db.collection("game_users").update({
                            _id: MongoId(uId)
                        }, {
                            $set: {
                                tbid: "",
                                reConnID: "",
                                si: ""
                            }
                        }, () => {

                        });
                    })



                    db.collection("playing_table").findAndModify(wh, {}, up, { new: true }, (err, up) => {

                        if (!err && up.value != null) {

                            dashClass.SendGlobelRoom(up.value);
                        }


                    });


                } else {
                    if (ruc == 0) {
                        dashClass.SendGlobelRoom(tb);

                        if (com.InArray(tb.t_status, stArr)/*tb.t_status == 'RoundStarted'*/) {
                            com.CancelScheduleJobOnServer(tb._id.toString(), tb.jid);
                            cdClass.UpdateTableData(tb._id.toString(), {
                                $set: {
                                    t_status: '',
                                    pv: 0,
                                    socre: [],
                                    round: 1
                                }
                            });
                        }
                    }
                }
            }
        });
    },
    RobotCardSquenceAndSet: (rinfo, mode, callback) => {


        rclient.hgetall('session:' + rinfo.ui.uid.toString(), function (err, ct) {


            if (ct == null) {
                console.log("ct", ct)
                return false;
            }

            var spadescard = [];

            var card = rinfo.cards

            if (mode == 4 || mode == 5 || mode == 6) {
                jokercard = []
                card = card.filter((elem) => {
                    if (elem.split("-")[2] == 'j') {

                        jokercard.push(elem.split("-")[2] + "-" + elem.split("-")[3])
                        return elem !== null && elem.split("-")[2] !== 'j'
                    }
                    return elem !== null && elem.split("-")[2] !== 'j'
                });

                card = card.concat(jokercard)
            }

            var final = [];

            cmb = Combinatorics.power(card);
            cmb.forEach(function (a) {

                if (a.length > 2 && (gamelogicClass.CheckCardCases(a) || ((a.indexOf('j-0') != -1 || a.indexOf('j-1') != -1) && jokerCalss.RonForCheckJokerCard(a)))) {
                    //console.log(a)
                    final.push(a)
                }

            });
            cmb = null


            if (final.length > 2) {
                cmb3 = Combinatorics.bigCombination(final, 3);
                cmb2 = Combinatorics.bigCombination(final, 2);
                cmb1 = Combinatorics.bigCombination(final, 1);


                cmb2.forEach(function (a) {

                    if (a.length == 2 && _.intersection(a[0], a[1]).length == 0) {

                        spadescard.push(a)
                    }

                })

                cmb3.forEach(function (a) {

                    if (a.length == 3 && _.intersection(a[0], a[1]).length == 0 && _.intersection(a[0], a[2]).length == 0 && _.intersection(a[1], a[2]).length == 0) {
                        spadescard.push(a)
                    }

                })

                cmb1.forEach(function (a) {

                    if (a.length == 1) {

                        spadescard.push(a)
                    }

                })


                cmb3 = null
                cmb2 = null
                cmb1 = null

            } else if (final.length > 1) {
                cmb2 = Combinatorics.combination(final, 2);
                cmb1 = Combinatorics.combination(final, 1);


                cmb2.forEach(function (a) {
                    if (a.length == 2 && _.intersection(a[0], a[1]).length == 0) {
                        spadescard.push(a)
                    }
                })

                cmb1.forEach(function (a) {

                    if (a.length == 1) {
                        spadescard.push(a)
                    }
                })

                cmb2 = null
                cmb1 = null

            } else if (final.length == 1) {
                cmb1 = Combinatorics.combination(final, 1);

                cmb1.forEach(function (a) {

                    if (a.length == 1) {

                        spadescard.push(a)
                    }

                })

                cmb1 = null
            }

            //Only This playing To  pick Card Is use only spades 

            var unusecardList = [];

            spadescard.forEach((a) => {
                unusecardList.push({
                    a: a,
                    unusecard: _.difference(card, _.flatten(a))
                })
            });

            unusecardList.sort((e, f) => {
                return parseInt(e.unusecard.length) - parseInt(f.unusecard.length)
            }); //sorting the element in sequence 


            if (unusecardList.length > 0) {
                //Gin Maro

                if (mode == 4 || mode == 5 || mode == 6) { //with joker 
                    unusecardList[0].a = jokerCalss.jokercardtosetready(unusecardList[0].a)
                }


                var sortingcard = compClass.makespadesWisesavecard(unusecardList[0])


                mechanismClass.SORTCOMP({ spc: unusecardList[0].a, cards: sortingcard }, ct, (f) => {

                    return callback(true)

                })
            } else {
                return callback(true)
            }
        })
    },
    CheckposiblityForMTE(pocard, cards, close_deck) {
        var posiblity = pocard.reduce((b, c) =>
        ((b[b.findIndex(d => d.card === c.card)] ||
            b[b.push({ el: c.split('-')[0], card: [], pcard1: [], pcard2: [], ind1: -1, ind2: -1, f_ind: -1/*, i: -1*/ }) - 1]),
            b[b.length - 1].pcard1.push(((parseInt(c.split('-')[1]) - 2) != 0) ? c.charAt(0) + '-' + (parseInt(c.split('-')[1]) - 2) : -1),
            b[b.length - 1].pcard1.push(((parseInt(c.split('-')[1]) - 1) != 0) ? c.charAt(0) + '-' + (parseInt(c.split('-')[1]) - 1) : -1),
            b[b.length - 1].pcard2.push(((parseInt(c.split('-')[1]) + 1) < 14) ? c.charAt(0) + '-' + (parseInt(c.split('-')[1]) + 1) : ((parseInt(c.split('-')[1]) + 1) == 14) ? c.charAt(0) + '-1' : -1),
            b[b.length - 1].pcard2.push(((parseInt(c.split('-')[1]) + 2) < 14) ? c.charAt(0) + '-' + (parseInt(c.split('-')[1]) + 2) : ((parseInt(c.split('-')[1]) + 2) == 14) ? c.charAt(0) + '-1' : -1),
            b[b.length - 1].ind1 = compClass.getIndex(b[b.length - 1].pcard1, cards, close_deck),
            b[b.length - 1].ind2 = compClass.getIndex(b[b.length - 1].pcard2, cards, close_deck),
            //b[b.length - 1].f_ind = (b[b.length - 1].ind1 != -1 || b[b.length - 1].ind2 != -1) ? [b[b.length - 1].ind1,b[b.length - 1].ind2].filter(i => i >= 0).sort()[0] : 1000, // for sorting 
            b[b.length - 1].card.push(c)
            , b
        ), []);
        posiblity = _.sortBy(posiblity, e => e.f_ind);
        return posiblity
    },
    getIndex: (data, cards, closdack) => {
        if (data.length == 2 && _.indexOf(data, -1) == -1) {
            var ind1 = -1
            var ind2 = -1
            var ci1 = _.indexOf(cards, data[0])
            if (ci1 > -1) {
                ind1 = 0
            } else {
                var cli1 = _.indexOf(closdack, data[0])
                if (cli1 > -1) {
                    ind1 = cli1
                }
            }
            var ci2 = _.indexOf(cards, data[1])
            if (ind1 > -1 && ci2 > -1) {
                ind2 = 0
            } else if (ind1 > -1) {
                var cli2 = _.indexOf(closdack, data[1])
                if (cli2 > -1) {
                    ind2 = cli2
                }
            }
            return (ind1 == -1 || ind2 == -1) ? -1 : [ind1, ind2]
        } else {
            return -1
        }
    },
    /*
        Ek Card Unuse hoi to baneli spc na use card exchange karo 
        ususe card mathi koi pair no bane to baneli spc mathi card lai ne exchange karo
        
        
    */
    Exchangecard: (tb, throwcard, callback) => {


        throwcard.sort((e, f) => {
            return parseInt(f.index.length) - parseInt(e.index.length)
        })



        if (throwcard.length > 0 && throwcard[0].needcard.length > 0 && throwcard[0].index.length > 0 /*&& throwcard[0].index.length > 1*/) {

            var card = tb.close_deck.splice(throwcard[0].index[0], 1)


            tb.close_deck.unshift(card[0])


            db.collection("playing_table").findAndModify({ _id: MongoId(tb._id.toString()) }, {}, {
                $set: {
                    close_deck: tb.close_deck,
                    exchange: 0
                }
            }, { new: true }, () => {

                if (typeof callback == "function")
                    return callback();

            })

        } else {
            if (typeof callback == "function")
                return callback();
        }

    },
    leaveuserplayedgame: (tbid, uidlist) => {

        if (uidlist.length == 0) {
            return false
        }
        /*if(uidlist.length == 0){
             db.collection("playing_table").find({_id:MongoId(tbid.toString())}).toArray((err,tbl)=>{
                if(!err && tbl.length > 0){
            
                    var tb = tbl[0]

                    db.collection("playing_table").remove({ _id: MongoId(tbid), ap: 0 }, () => { })
                    dashClass.SendGlobelRoom(tb)
                    setTimeout(function () {
                        schedulerClass.AfterRoundFinish({
                            tbId: tbid
                        })
                    }, (2 * 1000));
                }
            })
             return false
        }*/

        if (typeof tbid == 'undefined' || tbid == null || tbid == "") {
            return false
        }

        var uiddata = uidlist.splice(0, 1)
        cdClass.GetUserInfo(uiddata.toString(), {
            socketid: 1,
            "flags": 1,
            "wlg": 1,
            stargame: 1
        }, (uInfo) => {

            //if(uInfo.stargame != undefined && uInfo.stargame.playedgame != undefined &&  uInfo.stargame.playedgame >= config.totalgame){
            db.collection("game_users").update({ _id: MongoId(uiddata.toString()) }, { $set: { "stargame.playedgame": 0, "stargame.ispay": 0 } }, () => { })

            db.collection("playing_table").find({ _id: MongoId(tbid.toString()) }).toArray((err, tbl) => {
                if (!err && tbl.length > 0) {

                    var tb = tbl[0]
                    var uId = "";
                    var si = -1;

                    for (var x in tb.pi) {
                        if (typeof tb.pi[x] == 'object' && tb.pi[x] != null && typeof tb.pi[x].si != 'undefined' && typeof tb.pi[x].ui.uid != 'undefined' && tb.pi[x].ui.uid.toString() == uiddata.toString()) {
                            uId = tb.pi[x].ui.uid;
                            si = tb.pi[x].si;

                            break;
                        }
                    }


                    if (uId != "" && si != -1) {

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
                            _id: MongoId(tbid.toString()),
                            "pi.ui.uid": MongoId(uId.toString())
                        };

                        //removing other keys from redis
                        /*cdClass.GetUserInfo(uId.toString(), {
                            socketid: 1,
                            "flags": 1,
                            "wlg": 1
                        }, (uInfo) => {*/



                        cdClass.SendDataToUser(uId, {
                            en: 'EG',
                            data: {
                                si: si,
                                stt: 0,
                                UID: uId,
                                auto: 0,
                                tbid: tbid,
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
                                isstargameOver: 1
                            }
                        });

                        // io.of('/').adapter.remoteLeave(uInfo.socketid, tbid.toString(), (err) => {
                        //   if (err) {/* c("Not Connect ",uInfo.socketid)*/ }
                        // });

                        if (io.sockets.connected[uInfo.socketid]) {
                            io.sockets.connected[uInfo.socketid].leave(tbid);
                        }





                        cdClass.SendDataToTable(tbid, {
                            en: 'EG',
                            data: {
                                si: si,
                                stt: 0,
                                UID: uId,
                                auto: 0,
                                tbid: tbid,
                                comp: 0,
                                isfrom: "",
                                promotag: "",
                                promoflag: "",
                                promolink: "",
                                nogold: 0,
                                wlg: 0,
                                quest: {},
                                isoffer: -1,
                                isstargameOver: 1
                            }
                        });

                        //remove Table from user's index.
                        db.collection("game_users").update({
                            _id: MongoId(uId)
                        }, {
                            $set: {
                                tbid: "",
                                reConnID: "",
                                si: ""
                            }
                        }, () => {

                        });
                        //})

                        db.collection("playing_table").findAndModify(wh, {}, up, { new: true }, (err, updatedata) => {


                            if (!err && updatedata.value != null) {

                                dashClass.SendGlobelRoom(updatedata.value)
                            }
                            compClass.leaveuserplayedgame(tbid, uidlist)

                        })

                        notiClass.RemovejoinTableNoti(tb, { uid: uId.toString() });

                    } else {
                        compClass.leaveuserplayedgame(tbid, uidlist)

                    }
                }
            });
            // }else{
            //    compClass.leaveuserplayedgame(tbid,uidlist)
            //}
        })
    },
    makeotherunusedcard: (unusecardList, close_deck, setunusecard) => {

       
        var makethrowcard = [];

        for (var i = 0; i < unusecardList.a.length; i++) {

            var newspc = []

            // unused card and current spc ne merge krine chack and je need card male te close deck ma 6e ke chack 
            newspc.push(unusecardList.a[i])
            newspc.push(unusecardList.unusecard)

            var newsetunusedcard = gamelogicClass.ThreeCardSetProbability(_.flatten(newspc))


            for (var j = 0; j < newsetunusedcard.length; j++) {

                
                // old spc and new possiblity ni leanth high so aa codition cooment kri.. 
                // if (_.isEqual(unusecardList.a[i], newsetunusedcard[j])) {

                var makejson = {
                    card: newsetunusedcard[j],
                    index: [],
                    needcard: []
                };

                var needcard = compClass.FutureCardSetFind(newsetunusedcard[j]);
                
                if (close_deck.indexOf(needcard[0]) <= 5 && close_deck.indexOf(needcard[0]) >= 0) {
                    var index = [];
                    for (var k = 0; k < needcard.length; k++) {
                        if (close_deck.indexOf(needcard[k]) != -1) {
                            index.push(close_deck.indexOf(needcard[k]))
                        }
                    }
                    index.sort(function (e, f) {
                        return e - f;
                    });

                    makejson.index = index;
                    makejson.needcard = needcard;
                    makejson.arrayindex = i;

                    makethrowcard.push(makejson);
                }
                // }

            }

        }

        if (makethrowcard.length > 0) {

            unusecardList.unusecard.push(unusecardList.a[makethrowcard[0].arrayindex])

            unusecardList.a.splice(makethrowcard[0].arrayindex, 1)
            unusecardList.unusecard = _.flatten(unusecardList.unusecard)
            unusecardList.otherunusedcard = _.difference(unusecardList.unusecard, makethrowcard[0].card)

            for (var i = 0; i < unusecardList.a.length; i++) {

                var newspcarray = []

                newspcarray.push(unusecardList.a[i])
                for (var j = 0; j < unusecardList.otherunusedcard.length; j++) {

                    newspcarray.push(unusecardList.otherunusedcard[j])
                    var spCards = gamelogicClass.CheckCardsForSpread(_.flatten(newspcarray));

                    if (typeof spCards != 'undefined' && spCards.length > 0 && _.flatten(spCards).indexOf(unusecardList.otherunusedcard[j]) != -1) {

                        unusecardList.otherunusedcard.splice(_.indexOf(unusecardList.otherunusedcard, unusecardList.otherunusedcard[j]), 1)

                    }
                    newspcarray.splice(_.indexOf(newspcarray, unusecardList.unusecard[j]), 1)

                }
            }

            //logic for if any cases functin will decide throw joker card so remove joker from otherunusedcard
            unusecardList.otherunusedcard = unusecardList.otherunusedcard.filter((elem) => {

                return elem !== null && elem.split("-")[2] != 'j';
            })

            return unusecardList

        } else
            return setunusecard

    }
}