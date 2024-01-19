
const util = require('util')
const _ = require("underscore");
const Combinatorics = require('js-combinatorics');

com = require('./comm_function_class.js');
cdClass = require('./common.class.js');
gamelogicClass = require('./gamelogic.class.js');
jokerCalss = require('./jokermode.class.js');
compClass = require("./comp.class.js");

module.exports = {
    CardLogic: (table, callback) => {

        var pack = [
            "k-9", "k-10", "k-11", "k-12", "k-13", "k-1", "f-8", "f-9", "f-10", "f-11", "f-12", "f-13",
            "f-1", "k-2", "k-3", "k-4", "k-5", "k-6", "k-7", "k-8", "f-2", "f-3", "f-4", "f-5", "f-6",
            "f-7", "c-9", "c-10", "c-11", "c-12", "c-13", "c-1", "l-8", "l-9", "l-10", "l-11", "l-12", "l-13",
            "l-1", "c-2", "c-3", "c-4", "c-5", "c-6", "c-7", "c-8", "l-2", "l-3", "l-4", "l-5", "l-6", "l-7"]

        var cardList = com.Shuffle_Array(com.Shuffle_Array(pack));
        var odc = cardList.slice(0, 1);
        pack.splice(0, 1);
        if (table.mode == 4 || table.mode == 5 || table.mode == 6) {
            cardList.push('j-0');
            cardList.push('j-1');
            var gamecard = {
                close_deck: com.Shuffle_Array(com.Shuffle_Array(cardList)),
                open_deck: odc,
                cards: {
                    0: [],
                    1: [],
                    2: []
                }
            };


        } else {
            var gamecard = {
                close_deck: cardList,
                open_deck: odc,
                cards: {
                    0: [],
                    1: [],
                    2: []
                }
            };
        }

        cardlength = 10//(totaluser == 2)?10:7

        if (table.tou) {

            async.forEachOf(table.pi, (item, key, call) => {

                if (typeof item != 'undefined' && typeof item.ui != 'undefined' && typeof item.ui.si != 'undefined' && typeof item.ui.uid != 'undefined') {

                    gamelogicClass.DrawCard(gamecard.close_deck, cardlength, (card) => {

                        gamecard.cards[key] = card;
                        call()
                    })
                    
                } else {
                    call()
                }
            }, function (err) {
                return callback(gamecard);
            });
        } else {
            async.forEachOf(table.pi, (item, key, call) => {

                if (typeof item != 'undefined' && typeof item.ui != 'undefined' && typeof item.ui.si != 'undefined' && typeof item.ui.uid != 'undefined') {

                    gamelogicClass.DrawCard(gamecard.close_deck, cardlength, (card) => {
                        gamecard.cards[key] = card;
                        call()
                    })

                } else {
                    call()
                }
            }, function (err) {


                return callback(gamecard);

            });

        }
    },
    CardLogicnewround: (table, callback) => {

        var pack = [
            "k-9", "k-10", "k-11", "k-12", "k-13", "k-1", "f-8", "f-9", "f-10", "f-11", "f-12", "f-13",
            "f-1", "k-2", "k-3", "k-4", "k-5", "k-6", "k-7", "k-8", "f-2", "f-3", "f-4", "f-5", "f-6",
            "f-7", "c-9", "c-10", "c-11", "c-12", "c-13", "c-1", "l-8", "l-9", "l-10", "l-11", "l-12", "l-13",
            "l-1", "c-2", "c-3", "c-4", "c-5", "c-6", "c-7", "c-8", "l-2", "l-3", "l-4", "l-5", "l-6", "l-7"]

        var cardList = com.Shuffle_Array(com.Shuffle_Array(pack));
        var odc = cardList.slice(0, 1);
        pack.splice(0, 1);
        if (table.mode == 4 || table.mode == 5 || table.mode == 6) {
            cardList.push('j-0');
            cardList.push('j-1');
            var gamecard = {
                close_deck: com.Shuffle_Array(com.Shuffle_Array(cardList)),
                open_deck: odc,
                cards: {
                    0: [],
                    1: [],
                    2: []
                }
            };


        } else {
            var gamecard = {
                close_deck: cardList,
                open_deck: odc,
                cards: {
                    0: [],
                    1: [],
                    2: []
                }
            };

            
        }
        cardlength = 10 //(totaluser == 2)?10:7

        if (table.tou) {
            async.forEachOf(table.pi, (item, key, call) => {

                if (typeof item != 'undefined' && typeof item.ui != 'undefined' && typeof item.ui.si != 'undefined' && typeof item.ui.uid != 'undefined' && item.isplay == 1) {

                    gamelogicClass.DrawCard(gamecard.close_deck, 5, (card) => {


                        gamecard.cards[key] = card;
                        call()
                    })
                } else {

                    call()
                }
            }, (err) => {

                return callback(gamecard);
            });

        } else {
            async.forEachOf(table.pi, (item, key, call) => {

                gamelogicClass.DrawCard(gamecard.close_deck, cardlength, (card) => {

                    gamecard.cards[key] = card;
                    call()
                })

            }, function (err) {
                return callback(gamecard);
            });
        } 
    },
    DrawCard: (pack, am, callback) => {

        var c = pack.slice(0, am);

        pack.splice(0, am);

        return callback(c);
    },
    HardCard: (dack, cardlength, callback) => {
        var card = dack.slice(0, dack.length).sort()

        var results = card.reduce((b, c) => ((b[b.findIndex(d => d.el.split('-')[0] === c.split('-')[0])] ||
            b[b.push({ el: c.split('-')[0], card: [], count: 0 }) - 1]).count++,
            b[b.length - 1].card.push(parseInt(c.split('-')[1]))
            , b
        ), []).filter((e) => e.count >= 4);
        var c = {}
        var ind = []
        var fc = []
        _.each(results, e => {
            e.card = _.sortBy(e.card, function (num) { return num; });
            if (e.count >= 8) {
                c[e.el + 'l'] = e.card.slice(0, 4);
                c[e.el + 'h'] = e.card.slice(e.count - 4, e.count);
            } else if (e.count >= 4) {
                c[e.el + 'l'] = e.card.slice(0, 2);
                c[e.el + 'h'] = e.card.slice(e.count - 2, e.count);
            }
        })
        _.each(['k', 'f', 'c', 'l'], e => {
            if (typeof c[e + 'h'] != 'undefined') {
                var darr = _.difference(c[e + 'h'], ind)
                if (darr.length > 1) {
                    var hd = _.sample(darr, 2)
                    fc.push(e + '-' + hd[0], e + '-' + hd[1])
                    ind.push(hd[0], hd[1])
                } else if (darr.length > 0) {
                    var hdno = _.sample(darr)
                    fc.push(e + '-' + hdno)
                    ind.push(hdno)
                }
            }
            if (typeof c[e + 'l'] != 'undefined') {
                var larr = _.difference(c[e + 'l'], ind)
                if (larr.length > 1) {
                    var ld = _.sample(larr, 2)
                    fc.push(e + '-' + ld[0], e + '-' + ld[1])
                    ind.push(ld[0], ld[1])
                } else if (larr.length > 0) {
                    var ldno = _.sample(larr)
                    fc.push(e + '-' + ldno)
                    ind.push(ldno)
                }
            }
        })
        if (fc.length >= 10) {
            var finlcard = _.sample(fc, 10)
        } else {
            var diffc = _.difference(card, fc)
            var mn = 10 - fc.length;
            var finlcard = [...fc, ..._.sample(diffc, mn)]
        }

        for (var i = 0; i < finlcard.length; i++) {
            if (dack.indexOf(finlcard[i]) != -1) {
                dack.splice(dack.indexOf(finlcard[i]), 1);
            }
        }

        return callback(finlcard)
    },
    EasyCardseco: (pack, length, losscount, callback) => {

        var poss = [];
        var finalcard = [];

        //==================================== teen ============================================      
        gpack = _.groupBy(pack, function (num) { return num.split('-')[1] });

        losscount = com.GetRandomInt(1, 2)


        var tkey = _.keys(gpack);

        var final = [];

        for (var i = 0; i < tkey.length; i++) {
            if (gpack[tkey[i]].length > 2) {
                final.push(gpack[tkey[i]])
            }
        }


        var teenposs = final[com.GetRandomInt(0, final.length - 1)];

        for (var i = 0; i < teenposs.length; i++) {
            if (pack.indexOf(teenposs[i]) != -1) {
                finalcard.push(teenposs[i]);
                pack.splice(pack.indexOf(teenposs[i]), 1);
            }

            if (i == 2 && losscount == 1) {
                break;
            }
        }


        //====================================== ron  gin Rummy ===================================





        //if(losscount == -1  || losscount >= 4 || (losscount > 1 && losscount < 4 && com.GetRandomInt(0,1))){

        gpack = _.groupBy(pack, function (num) { return num.split('-')[0] });

        var tkey = _.keys(gpack);

        var final = [];

        for (var i = 0; i < tkey.length; i++) {
            if (gpack[tkey[i]].length > 5) {
                final.push(gpack[tkey[i]])
            }
        }

        var totalspades = gamelogicClass.CheckCardsForSpread(final[com.GetRandomInt(0, final.length - 1)])
        var ronposs = [];

        if (totalspades.length > 0) {
            ronposs = totalspades[com.GetRandomInt(0, totalspades.length - 1)];

            ronposs.sort(function (e, f) {
                return parseInt(e.split('-')[1]) - parseInt(f.split('-')[1])
                //return e.split('-')[1] - f.split('-')[1];
            })
        }


        var breakposition = (losscount == 1) ? 3 : 2;

        for (var i = 0; i < ronposs.length; i++) {
            if (pack.indexOf(ronposs[i]) != -1) {
                finalcard.push(ronposs[i]);
                pack.splice(pack.indexOf(ronposs[i]), 1);
            }

            if (i == breakposition) {
                break;
            }
        }

        //}

        gamelogicClass.DrawCard(pack, length - finalcard.length, (card) => {
            finalcard.push(card)
            return callback(_.flatten(finalcard))
        })
    },
    CheckCardsForSpread: (card) => {

        var spadescard = [];
        if (typeof card == 'undefined' || card.length <= 0) {
            return spadescard;
            return false;
        }

        card = card.filter((elem) => {
            return elem !== null //&& elem !== 'j-0' && elem !== 'j-1';
        });


        card.sort((e, f) => {
            return parseInt(e.split('-')[1]) - parseInt(f.split('-')[1])
        });

        var final = Combinatorics.power(card).filter((a) => {
            //if(a.length > 2 && gamelogicClass.CheckCardCases(a)){
            if (a.length > 2 && (gamelogicClass.CheckCardCases(a) || ((a.indexOf('j-0') != -1 || a.indexOf('j-1') != -1) && jokerCalss.RonForCheckJokerCard(a)))) {

                return a;
            }
        });


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

        if (spadescard.length > 0) {


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



            unusecardList[0].unusecard.sort(function (e, f) {
                return e.split('-')[0] - f.split('-')[0]
            });

            unusecardList[0].unusecard.sort(function (e, f) {
                return parseInt(e.split('-')[1]) - parseInt(f.split('-')[1])
            });

            return unusecardList[0].a;
        }
        else {
            if (spadescard.length == 0) {
                return [];
            } else {
                return spadescard[0];
            }
        }
    },
    CheckCardsForSpreadOnlyRobot: (card) => { //Change only to last unusecard card same length vali poss ni card value 

        var spadescard = [];
        if (typeof card == 'undefined' || card.length <= 0) {
            return spadescard;
            return false;
        }

        card = card.filter((elem) => {
            return elem !== null //&& elem !== 'j-0' && elem !== 'j-1';
        });


        card.sort((e, f) => {
            return parseInt(e.split('-')[1]) - parseInt(f.split('-')[1])
        });

        var final = Combinatorics.power(card).filter((a) => {
            //if(a.length > 2 && gamelogicClass.CheckCardCases(a)){
            if (a.length > 2 && (gamelogicClass.CheckCardCases(a) || ((a.indexOf('j-0') != -1 || a.indexOf('j-1') != -1) && jokerCalss.RonForCheckJokerCard(a)))) {

                return a;
            }
        });

        /*cmb = Combinatorics.power(card);
        cmb.forEach(function(a){ 
    
          if(a.length > 2 && gamelogicClass.CheckCardCases(a)){
           
            final.push(a)
          }
        
        });*/


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

        /*spadescard.sort((e, f)=>{
            return parseInt(f.length) - parseInt(e.length)
        }); //sorting the element in sequence*/
        if (spadescard.length > 0) {


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

            var setunusecard = _.filter(unusecardList, (f) => {
                return f.unusecard.length == unusecardList[0].unusecard.length
            })

            return unusecardList[0].a;
        } else {
            if (spadescard.length == 0) {
                return [];
            } else {
                return spadescard[0];
            }
        }
    },
    CardSetProbability: (cards) => {

        var finalArray = new Array();

        if (cards != undefined && cards.length > 1) {

            var t = new Array();

            /*for(var i=0;i<cards.length;i++){
                for(var j=i+1;j<cards.length;j++){
                    t.push([cards[i],cards[j]]);
                }
            }*/

            t = Combinatorics.bigCombination(cards, 2);

            //we have to check each card combination for it.
            /*for (var y in t) {
                if (gamelogicClass.CheckCardCases(t[y]))
                    finalArray.push(t[y]);
            }*/


            t.forEach(function (a) {

                if (gamelogicClass.CheckCardCasespossonly(a))
                    finalArray.push(a);

            })
        }

        return finalArray;

    },
    ThreeCardSetProbability: (cards) => {

        var finalArray = new Array();
      
        if (cards != undefined && cards.length > 2) {

            var t = new Array();

            /*for(var i=0;i<cards.length;i++){
                for(var j=i+1;j<cards.length;j++){
                    t.push([cards[i],cards[j]]);
                }
            }*/

            t = Combinatorics.bigCombination(cards, 5);


            //we have to check each card combination for it.
            /*for (var y in t) {
                if (gamelogicClass.CheckCardCases(t[y]))
                    finalArray.push(t[y]);
            }*/


            t.forEach(function (a) {

                if (gamelogicClass.CheckCardCasespossonly(a))
                    finalArray.push(a);

            })
        }

        return finalArray;

    },
    CardSetProbabilitynew: (cards) => {

        var cardSet = { teen: [], ron: [] };
        if (cards != undefined && cards.length > 1) {

            var t = new Array();

            t = Combinatorics.bigCombination(cards, 2);


            t.forEach(function (a) {
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
        }

        return cardSet;

    },
    CheckCardCases: (hd) => {
        if (typeof hd == 'undefined' || hd.length == 0)
            return false;

        hd = hd.filter((elem) => {
            return elem !== null && elem != undefined
        });



        if (hd.length == 0) {
            return false
        }


        hd = hd.filter((elem) => {
            return elem !== null && elem !== 'j-0' && elem !== 'j-1'
        });


        hd = com.RemoveJokerCard(hd);



        var dt = gamelogicClass.DiffColor(hd);
        var trio = gamelogicClass.TeenForCheck(dt); //first checking for trail
        var stRun = gamelogicClass.RonForCheck(dt);



        //if trio then return true.
        if (trio == true || stRun == true)
            return true;
        else
            return false;
    },
    CheckCardCasespossonly: (hd) => {
        if (typeof hd == 'undefined' || hd.length == 0)
            return false;

        hd = hd.filter((elem) => {
            return elem !== null && elem != undefined
        });

        if (hd.length == 0) {
            return false
        }


        hd = hd.filter((elem) => {
            return elem !== null && elem !== 'j-0' && elem !== 'j-1'
        });


        hd = com.RemoveJokerCard(hd);



        var dt = gamelogicClass.DiffColor(hd);
        var trio = gamelogicClass.TeenForCheck(dt); //first checking for trail
        var stRun = gamelogicClass.RonForCheck(dt);
        var gap = jokerCalss.gaptotwocard(hd);



        //if trio then return true.
        if (trio || stRun || gap)
            return true;
        else
            return false;
    },
    CheckCardRonCases: (hd) => {
        if (typeof hd == 'undefined' || hd.length == 0)
            return false;

        hd = hd.filter((elem) => {
            return elem !== null && elem != undefined
        });


        if (hd.length == 0) {
            return false
        }


        hd = hd.filter((elem) => {
            return elem !== null && elem !== 'j-0' && elem !== 'j-1'
        });


        hd = com.RemoveJokerCard(hd);



        var dt = gamelogicClass.DiffColor(hd);
        // var trio = gamelogicClass.TeenForCheck(dt); //first checking for trail
        var stRun = gamelogicClass.RonForCheck(dt);



        //if trio then return true.
        if (stRun == true)
            return true;
        else
            return false;
    },
    CheckCardteenCases: (hd) => {
        if (typeof hd == 'undefined' || hd.length == 0)
            return false;

        hd = hd.filter((elem) => {
            return elem !== null && elem != undefined
        });

        if (hd.length == 0) {
            return false
        }


        hd = hd.filter((elem) => {
            return elem !== null && elem !== 'j-0' && elem !== 'j-1'
        });


        hd = com.RemoveJokerCard(hd);



        var dt = gamelogicClass.DiffColor(hd);
        var trio = gamelogicClass.TeenForCheck(dt); //first checking for trail
        //var stRun = gamelogicClass.RonForCheck(dt);



        //if trio then return true.
        if (trio == true)
            return true;
        else
            return false;
    },
    SequenceCheckCardCases: (hd) => {
        if (typeof hd == 'undefined' || hd.length == 0)
            return false;


        hd = hd.filter((elem) => {
            return elem !== null && elem != undefined
        });

        if (hd.length < 3) {
            return false
        }

        hd = hd.filter((elem) => {
            return elem !== null && elem !== 'j-0' && elem !== 'j-1'
        });


        hd = com.RemoveJokerCard(hd);



        var dt = gamelogicClass.DiffColor(hd);
        var trio = gamelogicClass.TeenForCheck(dt); //first checking for trail
        var stRun = gamelogicClass.SequenceRonForCheck(dt);



        //if trio then return true.
        if (trio == true || stRun == true)
            return true;
        else
            return false;
    },
    MakeSpadesForCards: (cards) => {

        var traverseNode = [];
        var AllSpread = []
        for (var i = 0; i < cards.length - 1; i++) {

            var ActualIncr = i;

            if (traverseNode.indexOf(cards[i]) == -1) {
                var checkRon = true;
                var checkTin = true;

                if (cdClass.GetcardColor(cards[i]) == "j" || cdClass.GetcardColor(cards[i + 1]) == "j") {

                    if (jokerCalss.checkForRon(i, cards)) {
                        checkTin = false;

                    } else if (jokerCalss.checkForTin(i, cards) || cdClass.GetcardColor(cards[i + 1]) == "j") {
                        checkRon = false;
                    }
                }
                /*checkRon = true;
                checkTin = false;*/

                if (checkTin && (cdClass.GetcardValue(cards[i]) == cdClass.GetcardValue(cards[i + 1]) ||
                    (cdClass.GetcardColor(cards[i]) == 'j' || cdClass.GetcardColor(cards[i + 1]) == 'j'))
                ) { //teen mate 

                    //var value = (cdClass.GetcardColor(cards[i]) == "j")?  (cdClass.GetcardColor(cards[i+1]) == "j")? 0: cdClass.GetcardValue(cards[i+1]) : cdClass.GetcardValue(cards[i]);

                    var SingleSpread = [];
                    SingleSpread.push(cards[i]);
                    SingleSpread.push(cards[i + 1]);

                    var value = -1;
                    var counter = 2; //two card already save

                    if (cdClass.GetcardColor(SingleSpread[0]) == "j" && cdClass.GetcardColor(SingleSpread[1]) == "j") {


                        if ((i + 2) >= cards.length) {
                            break;
                        }
                        counter++;
                        SingleSpread.push(cards[i + 2]);
                        value = cdClass.GetcardValue(cards[i + 2]);

                    } else {
                        value = (cdClass.GetcardColor(SingleSpread[0]) == "j") ? cdClass.GetcardValue(SingleSpread[1]) : cdClass.GetcardValue(SingleSpread[0]);
                    }

                    for (var j = i + counter; j < cards.length; j++) {

                        if ((value == cdClass.GetcardValue(cards[j]))
                            || (cdClass.GetcardColor(cards[j]) == 'j')) {

                            if (SingleSpread.length >= 3) { //
                                if (cdClass.GetcardColor(cards[j]) == "j" && jokerCalss.checkForTin(j, cards)) {
                                    break;
                                }

                                if (jokerCalss.checkForRon(j, cards)) {
                                    break;
                                }

                            }
                            if (cdClass.GetcardColor(cards[j]) == 'j') {
                                SingleSpread.push(cards[j]);
                            } else if (cdClass.GetcardValue(cards[j]) == value) {
                                SingleSpread.push(cards[j]);

                            } else {
                                break;
                            }
                        } else {
                            break;
                        }
                    }

                    if (SingleSpread.length >= 3) {

                        traverseNode = traverseNode.concat(SingleSpread);

                        if (SingleSpread.indexOf('j-0') != -1 || SingleSpread.indexOf('j-1') != -1) {

                            SingleSpread = jokerCalss.jokercardmakeinspread(SingleSpread)

                            SingleSpread = SingleSpread.filter((elem) => {
                                if (elem == 'j-0' || elem == 'j-1') {
                                    //traverseNode.slice(traverseNode.indexOf(elem),1);
                                    traverseNode.splice(traverseNode.indexOf(elem), 1);
                                }
                                return elem !== null && elem != 'j-0' && elem != 'j-1';
                            })
                        }
                        //[k-12,k-13,j-0,j-1] // singalspread ma thi joker card remove thai atle two card re to ae spread no kevai 
                        if (SingleSpread.length >= 3) {
                            AllSpread.push(SingleSpread);
                        } else {
                            SingleSpread.filter((elem) => {
                                traverseNode.splice(traverseNode.indexOf(elem), 1);
                            })
                        }
                    }

                } else if (checkRon
                    && ((cdClass.GetcardColor(cards[i]) == cdClass.GetcardColor(cards[i + 1])
                        && Math.abs(cdClass.GetcardValue(cards[i]) - cdClass.GetcardValue(cards[i + 1])) == 1)
                        || (cdClass.GetcardColor(cards[i]) == 'j' || cdClass.GetcardColor(cards[i + 1]) == 'j'))) {


                    var SingleSpread = [];
                    SingleSpread.push(cards[i]);
                    SingleSpread.push(cards[i + 1]);

                    //Ron mate
                    var color = (cdClass.GetcardColor(cards[i]) == "j") ? (cdClass.GetcardColor(cards[i + 1]) == "j") ? "" : cdClass.GetcardColor(cards[i + 1]) : cdClass.GetcardColor(cards[i]);

                    var jokerCount = (color == "") ? 2 : ((cdClass.GetcardColor(SingleSpread[0]) == "j") ? 1 : ((cdClass.GetcardColor(SingleSpread[1]) == "j") ? 1 : 0));
                    var JokerUsed = (cdClass.GetcardColor(SingleSpread[0]) == "j") ? 1 : 0
                    var ActualIncr = 2;
                    var isJokerCenter = false;
                    if (color != "") {
                        isJokerCenter = (cdClass.GetcardColor(SingleSpread[0]) != "j") ? true : false;

                    } else {//starting ma 2 joker mala


                        SingleSpread.push(cards[i + 2]);
                        color = cdClass.GetcardColor(SingleSpread[2]); //SingleSpread[2].split("-")[0];
                        JokerUsed = jokerCount;
                        ActualIncr++;
                    }

                    for (var j = i + ActualIncr; j < cards.length; j++) {

                        if (color == cdClass.GetcardColor(cards[j]) || cdClass.GetcardColor(cards[j]) == "j") {



                            if (SingleSpread.length >= 2 && (cdClass.GetcardValue(SingleSpread[SingleSpread.length - 1]) == 1 || cdClass.GetcardValue(SingleSpread[SingleSpread.length - 1]) == 13)) {
                                break;
                            }

                            //if 3 up card in spread 

                            if (SingleSpread.length >= 3) { //spades length  3 > last card check after 2 make spades or not 


                                if (jokerCalss.checkForRon(j, cards)) {
                                    break;
                                } else if (jokerCalss.checkForTin(j, cards)) {
                                    break;
                                }

                            }
                            //middle ma scan larta joker male ne to aya handle thase
                            if (cdClass.GetcardColor(cards[j]) == "j") {//CASE: c-6 c-5 c-4 j-0 c-3
                                jokerCount++;
                                isJokerCenter = true;
                                SingleSpread.push(cards[j]);

                                continue;

                            }

                            //SingleSpread.push(cards[j])
                            var copyspread = _.difference(SingleSpread, ["j-0", "j-1"])
                            copyspread.push(cards[j])

                            var isPlus = (cdClass.GetcardValue(copyspread[1]) - cdClass.GetcardValue(copyspread[0]) > 0) ? true : false;

                            var comparevalue = (isPlus) ? 1 : -1;
                            var compareseconds = (isPlus) ? 2 : -2;
                            var comparethird = (isPlus) ? 3 : -3;


                            if ((JokerUsed == jokerCount || !isJokerCenter) &&
                                ((cdClass.GetcardValue(cards[j]) - cdClass.GetcardValue(SingleSpread[SingleSpread.length - 1])) == comparevalue)) {
                                SingleSpread.push(cards[j]);


                            } else if (isJokerCenter && JokerUsed != jokerCount
                                && (
                                    (
                                        (cdClass.GetcardColor(SingleSpread[SingleSpread.length - 2]) != 'j' &&
                                            (cdClass.GetcardValue(cards[j]) -
                                                cdClass.GetcardValue(SingleSpread[SingleSpread.length - 2])) == compareseconds)
                                    ) ||//ek muki ne ek joker che
                                    (JokerUsed == 0
                                        && jokerCount == 2
                                        && ((cdClass.GetcardValue(cards[j]) -
                                            cdClass.GetcardValue(SingleSpread[SingleSpread.length - 3])) == comparethird))
                                )
                            ) {//upra upri center ma joker che  
                                SingleSpread.push(cards[j]);
                                /* JokerUsed++;*/
                                JokerUsed = (jokerCount == 2) ? 2 : JokerUsed + 1;

                            } else {
                                break;
                            }

                            /*if((SingleSpread[SingleSpread.length-1].split('-')[0] == cards[j].split("-")[0] 
                              && Math.abs(parseInt(SingleSpread[SingleSpread.length-1].split('-')[1]) - parseInt(cards[j].split("-")[1])) == 1) 
                              || ((SingleSpread[SingleSpread.length-1].split('-')[0] == 'j' 
                                && SingleSpread[SingleSpread.length-2].split('-')[0] == 'j') || cards[j].split("-")[0] == 'j')){
              
                              SingleSpread.push(cards[j]);
                            }else{
                              break;
                            }*/
                        } else {
                            break;
                        }
                    }


                    if (SingleSpread.length >= 3) {

                        traverseNode = traverseNode.concat(SingleSpread);

                        if (SingleSpread.indexOf('j-0') != -1 || SingleSpread.indexOf('j-1') != -1) {

                            SingleSpread = jokerCalss.jokercardmakeinspread(SingleSpread)

                            SingleSpread = SingleSpread.filter((elem) => {
                                if (elem == 'j-0' || elem == 'j-1') {

                                    traverseNode.splice(traverseNode.indexOf(elem), 1);
                                }
                                return elem !== null && elem != 'j-0' && elem != 'j-1';
                            })
                        }
                        if (SingleSpread.length >= 3) {
                            AllSpread.push(SingleSpread);
                        } else {
                            SingleSpread.filter((elem) => {
                                traverseNode.splice(traverseNode.indexOf(elem), 1);
                            })
                        }

                    }

                }

            }
        }

        if (typeof AllSpread[0] != "undefined" && typeof AllSpread[0] == "string") {
            console.log("AllSpread data.spc[0] ::::--->>>", AllSpread[0])
            console.log("AllSpread data.spc ::::--->>>", AllSpread)
        }
        return AllSpread;
    },
    MakeSpadesForCardsBck: (cards) => {

        var traverseNode = [];
        var AllSpread = []
        for (var i = 0; i < cards.length - 1; i++) {

            //Ron 
            if (traverseNode.indexOf(cards[i]) == -1
                && ((cards[i].split("-")[0] == cards[i + 1].split("-")[0]
                    && Math.abs(parseInt(cards[i].split("-")[1]) - parseInt(cards[i + 1].split("-")[1])) == 1) || (cards[i].split("-")[0] == 'j' || cards[i + 1].split("-")[0] == 'j'))) {

                var SingleSpread = [];
                SingleSpread.push(cards[i]);
                SingleSpread.push(cards[i + 1]);

                for (var j = i + 2; j < cards.length; j++) {
                    if ((SingleSpread[SingleSpread.length - 1].split('-')[0] == cards[j].split("-")[0]
                        && Math.abs(parseInt(SingleSpread[SingleSpread.length - 1].split('-')[1]) - parseInt(cards[j].split("-")[1])) == 1)
                        || ((SingleSpread[SingleSpread.length - 1].split('-')[0] == 'j' && SingleSpread[SingleSpread.length - 2].split('-')[0] == "j") || cards[j].split("-")[0] == 'j')) {

                        SingleSpread.push(cards[j]);
                    } else {
                        break;
                    }
                }

                if (SingleSpread.length == 3) {
                    AllSpread.push(SingleSpread);
                    traverseNode = traverseNode.concat(SingleSpread);

                } else if (SingleSpread.length > 3) { //spades length  3 > last card check after 2 make spades or not 

                    if (gamelogicClass.SequenceCheckCardCases([SingleSpread[SingleSpread.length - 1], cards[j], cards[j + 1]])) {
                        SingleSpread.pop()

                        AllSpread.push(SingleSpread);
                        traverseNode = traverseNode.concat(SingleSpread);

                    } else {
                        AllSpread.push(SingleSpread);
                        traverseNode = traverseNode.concat(SingleSpread);
                    }
                }

            } else if (traverseNode.indexOf(cards[i]) == -1
                && (parseInt(cards[i].split("-")[1]) == parseInt(cards[i + 1].split("-")[1]) || (cards[i].split("-")[0] == 'j' || cards[i + 1].split("-")[0] == 'j'))
            ) { //teen mate 

                var SingleSpread = [];
                SingleSpread.push(cards[i]);
                SingleSpread.push(cards[i + 1]);

                for (var j = i + 2; j < cards.length; j++) {
                    if ((parseInt(SingleSpread[SingleSpread.length - 1].split('-')[1]) == parseInt(cards[j].split("-")[1]))
                        || (SingleSpread[SingleSpread.length - 1].split('-')[0] == 'j' || cards[j].split("-")[0] == 'j')) {

                        SingleSpread.push(cards[j]);
                    } else {
                        break;
                    }
                }

                if (SingleSpread.length == 3) {
                    AllSpread.push(SingleSpread);
                    traverseNode = traverseNode.concat(SingleSpread);
                } else if (SingleSpread.length > 3) {

                    if (gamelogicClass.SequenceCheckCardCases([SingleSpread[SingleSpread.length - 1], cards[j], cards[j + 1]])) {
                        SingleSpread.pop()
                        AllSpread.push(SingleSpread);
                        traverseNode = traverseNode.concat(SingleSpread);
                    } else {
                        AllSpread.push(SingleSpread);
                        traverseNode = traverseNode.concat(SingleSpread);
                    }
                }
            }
        }
        return AllSpread;
    },
    CountDeadWood: (spc, cards, odc) => {

        //spc card remove in cards and after unuse cards array mathi high card remove 
        var spc = _.flatten(spc);

        var unusecrd = _.difference(cards, spc)

        var isuse = false;

        if (odc != undefined && odc != null && spc.indexOf(odc) == -1 && unusecrd.indexOf(odc) != -1) {
            isuse = true;
            unusecrd = _.difference(unusecrd, [odc])
        }

        if (unusecrd.length > 0) {
            unusecrd.sort(function (e, f) {
                return parseInt(e.split('-')[1]) - parseInt(f.split('-')[1])
            });//sorting the element in sequence 

            unusecrd.pop();

            if (isuse) {
                unusecrd.push(odc)
            }

            var rcard = gamelogicClass.pointDiffColor(unusecrd);
            var rpoint = com.CardPointSum(rcard.cards);

            return rpoint
        } else {

            if (isuse) {
                unusecrd.push(odc)
            }

            var rcard = gamelogicClass.pointDiffColor(unusecrd);
            var rpoint = com.CardPointSum(rcard.cards);

            return rpoint
        }
    },
    PointCountDeadWood: (spc, cards) => {

        //spc card remove in cards and after unuse cards array mathi high card remove 
        var spc = _.flatten(spc);


        var unusecrd = _.difference(cards, spc)

        if (unusecrd.length > 0) {
            unusecrd.sort((e, f) => {
                return parseInt(e.split('-')[1]) - parseInt(f.split('-')[1])
            });//sorting the element in sequence 

            //unusecrd.pop();

            var rcard = gamelogicClass.pointDiffColor(unusecrd);
            var rpoint = com.CardPointSum(rcard.cards);

            return rpoint
        } else {
            return 0
        }
    },
    DiffColor: (card) => {
        var obj = {
            cards: [],
            color: []
        };
        for (var i in card) {
            if (card[i] != null) {
                var d = card[i].split('-');
                obj.cards.push(parseInt(d[1]));
                obj.color.push(d[0]);
            }
        }
        return obj;
    },
    pointDiffColor: (card) => {
        var obj = {
            cards: [],
            color: []
        };
        for (var i in card) {
            if (card[i] != null && card[i].split('-')[0] != 'j') {
                var d = card[i].split('-');
                obj.cards.push(parseInt(d[1]));

                obj.color.push(d[0]);
            }
        }
        return obj;
    },
    TeenForCheck: (a) => {
        var flag = true;

        var point = _.filter(a.cards, (num) => { return num != 0; });
        if (point.length == 1) {
            return flag;
        }

        for (var x in point) {
            if (point[x] != point[0]) {
                flag = false;
                break;
            }
        }

        return flag;
    },
    RonForCheck: (a) => {

        var flag = true;

        a.cards.sort((e, f) => {
            return e - f
        });




        //if all are in sequence then we have to check for same color.
        if (flag == true) {
            for (var x in a.color) {
                if (a.color[x] != a.color[0]) {
                    flag = false;
                    break;
                }
            }
        }

        //special condition for Q,K,A       
        if (flag == true) {
            for (var i = 1; i < a.cards.length; i++) {
                if (a.cards[i] - a.cards[i - 1] == 1 /*|| a.cards[i] - a.cards[i - 1] == -12*/) {
                    flag = true;
                } else {
                    flag = false;
                    break;
                }
            }
        }

        return flag;

    },
    SequenceRonForCheck: (a) => {

        var flag = true;

        if (flag == true) {
            for (var x in a.color) {
                if (a.color[x] != a.color[0]) {
                    flag = false;
                    break;
                }
            }
        }

        if (flag == true) {
            for (var i = 1; i < a.cards.length; i++) {
                if (Math.abs(a.cards[i] - a.cards[i - 1]) == 1) {
                    flag = true;
                } else {
                    flag = false;
                    break;
                }
            }
        }

        return flag;

    },
    CheckForSingleSpread: (spades, hcard) => {

        if (typeof spades == 'undefined' || spades.length == 0 || typeof hcard == 'undefined' || hcard == null)
            return false;


        spades = spades.filter((elem) => {
            return elem !== null && elem !== 'j-0' && elem !== 'j-1'
        });


        spades = com.RemoveJokerCard(spades);

        if (hcard.split("-")[0] == 'j')
            hcard = hcard.split('-')[2] + '-' + hcard.split('-')[3];



        if (typeof hcard == 'undefined' || hcard == null)
            return false;



        var dt = gamelogicClass.DiffColor(spades);
        var trio = gamelogicClass.TeenForCheck(dt); //first checking for trio case
        var scArr = hcard.split('-');

        //scArr[0] == 'a' all ready joker nu card spades ma 6e so a color code aave 
        if (trio && dt.cards[0] == scArr[1] && (!com.InArray(scArr[0], dt.color) || scArr[0] == 'a'))
            return true;
        else {
            dt.cards.push(parseInt(scArr[1]));
            dt.color.push(scArr[0]);
            return gamelogicClass.RonForCheck(dt);
        }
        return false;
    },
    CheckForWinner: function (table, knocker, callback) {

        //Layoff card side and deadwod point updated 
        if (typeof table.type != 'undefined' && table.type == 'knock') {
            var winnerSpc = []
            if (typeof table.pi[knocker] != 'undefined' && typeof table.pi[knocker].si != 'undefined' && table.pi[knocker].status != '' && typeof table.pi[knocker].cards != 'undefined') {
                winnerSpc = table.pi[knocker].spc;
            }


            var totalunusecard = []
            var layoff = [];

            for (var x in table.pi) {
                if (table.pi[x] == null || table.pi[x].cards == null && typeof table.pi[x].si != 'undefined')
                    table.pi[x] = [];

                if (typeof table.pi[x] != 'undefined' && typeof table.pi[x].si != 'undefined' && table.pi[x].status != '' && typeof table.pi[x].cards != 'undefined') {
                    if (table.pi[x].si != knocker) {

                        table.pi[x].unusecard = _.difference(table.pi[x].cards, _.flatten(table.pi[x].spc))
                        totalunusecard.push(table.pi[x].unusecard.slice(0, table.pi[x].unusecard.length));
                        table.pi[x].layoff = [];
                    } else {

                        table.pi[x].unusecard = _.difference(table.pi[x].cards, _.flatten(table.pi[x].spc))

                        table.pi[x].layoff = [];
                    }
                }
            }

            totalunusecard = _.flatten(totalunusecard)
            totalunusecard = totalunusecard.filter((elem) => {
                return elem !== null && elem !== 'j-0' && elem !== 'j-1'
            });


            if (totalunusecard.length > 0) {

                for (var i = 0; i < winnerSpc.length; i++) {
                    if (gamelogicClass.CheckCardRonCases(winnerSpc[i])) {
                        totalunusecard.sort(function (e, f) {
                            return parseInt(e.split("-")[1]) - parseInt(f.split("-")[1])
                        });
                        for (var j = 0; j < totalunusecard.length; j++) {
                            //-----Aa winnerSpc ma add karva thi send winnerArray na SPC ma Layoff nu card add thai jase  ------------->
                            winnerSpc[i].push(totalunusecard[j] + "-o");
                            var spCards = gamelogicClass.CheckCardRonCases(_.flatten(winnerSpc[i]));

                            if (spCards) {
                                layoff.push(totalunusecard[j]);
                            } else {
                                //if not use in spades pop this card 
                                winnerSpc[i].pop();
                            }
                        }

                        totalunusecard = _.difference(totalunusecard, layoff)

                        totalunusecard.sort(function (e, f) {
                            return parseInt(f.split("-")[1]) - parseInt(e.split("-")[1])
                        });

                        for (var k = 0; k < totalunusecard.length; k++) {
                            //-----Aa winnerSpc ma add karva thi send winnerArray na SPC ma Layoff nu card add thai jase  ------------->
                            winnerSpc[i].push(totalunusecard[k] + "-o");
                            var spCards = gamelogicClass.CheckCardRonCases(_.flatten(winnerSpc[i]));

                            if (spCards) {
                                layoff.push(totalunusecard[k]);
                            } else {
                                //if not use in spades pop this card 
                                winnerSpc[i].pop();
                            }
                        }

                        totalunusecard = _.difference(totalunusecard, layoff)

                        winnerSpc[i].sort(function (e, f) {
                            return parseInt(e.split("-")[1]) - parseInt(f.split("-")[1])
                        });
                    }
                }

                for (var i = 0; i < winnerSpc.length; i++) {
                    if (gamelogicClass.CheckCardteenCases(winnerSpc[i])) {

                        totalunusecard.sort(function (e, f) {
                            return parseInt(e.split("-")[1]) - parseInt(f.split("-")[1])
                        });

                        for (var j = 0; j < totalunusecard.length; j++) {
                            //-----Aa winnerSpc ma add karva thi send winnerArray na SPC ma Layoff nu card add thai jase  ------------->
                            winnerSpc[i].push(totalunusecard[j] + "-o");
                            var spCards = gamelogicClass.CheckCardteenCases(_.flatten(winnerSpc[i]));

                            if (spCards) {
                                layoff.push(totalunusecard[j]);
                            } else {
                                //if not use in spades pop this card 
                                winnerSpc[i].pop();
                            }
                        }

                        winnerSpc[i].sort(function (e, f) {
                            return parseInt(e.split("-")[1]) - parseInt(f.split("-")[1])
                        });
                    }
                }

                if (layoff.length > 0) {
                    layoff = _.uniq(_.flatten(layoff));
                    for (var x in table.pi) {
                        if (typeof table.pi[x] != 'undefined' && typeof table.pi[x].si != 'undefined' && table.pi[x].status != '' && typeof table.pi[x].cards != 'undefined') {
                            if (table.pi[x].si != knocker) {
                                table.pi[x].layoff = _.intersection(table.pi[x].unusecard, layoff)

                                var rcard = gamelogicClass.DiffColor(table.pi[x].layoff);
                                var rpoint = com.CardPointSum(rcard.cards);

                                table.pi[x].deadwood = table.pi[x].deadwood - rpoint;
                            }
                        }
                    }
                }
            }

            var ListPlayer = gamelogicClass.CalculateOfPointForKnock(table, knocker);

            if (!ListPlayer) {
                callback(false)
                return false;
            }

        } else {

            var ListPlayer = gamelogicClass.CalculateOfPoint(table, knocker);

            if (!ListPlayer) {
                callback(false)
                return false;
            }
        }

        return callback(ListPlayer);
    },
    CheckForWinnerFinal: function (table, callback) {
        var ListPlayer = gamelogicClass.CalculateOfPointFinal(table);

        if (!ListPlayer) {
            callback(false)
            return false;
        }



        return callback(ListPlayer);
    },
    CalculateOfPoint: (table, knocker) => {
        var winnerArray = []

        var deadwoodlist = [];
        var winnercount = 0;

        for (var x in table.pi) {
            if (table.pi[x] == null || table.pi[x].cards == null && typeof table.pi[x].si != 'undefined')
                table.pi[x] = [];

            if (typeof table.pi[x] != 'undefined' && typeof table.pi[x].si != 'undefined' && (table.tou == true || table.pi[x].status != '') && typeof table.pi[x].cards != 'undefined') {

                table.pi[x].cards = table.pi[x].cards.filter((elem) => {
                    return elem !== null //&& elem != 'j-0' &&  elem != 'j-1'
                });


                unusecard = _.difference(table.pi[x].cards, _.flatten(table.pi[x].spc))


                deadwoodlist.push(table.pi[x].deadwood);
                winnerArray.push({
                    si: parseInt(x),
                    point: table.pi[x].point,
                    deadwood: table.pi[x].deadwood,
                    unusecard: unusecard,
                    layoff: [],
                    gin: 0,
                    biggin: 0,
                    undercut: 0,
                    cards: table.pi[x].cards,
                    spc: table.pi[x].spc,
                    pn: table.pi[x].ui.pn,
                    pp: table.pi[x].ui.pp,
                    uid: table.pi[x].ui.uid.toString(),
                    oldxp: table.pi[x].oldxp,
                    star_candy: (table.pi[x].star_candy != undefined) ? table.pi[x].star_candy : {
                        old_candy: 0,
                        add_candy: 0,
                        total_candy: 0,
                    },
                    isleaveStargame: (table.isleave != undefined && table.isleave.indexOf(table.pi[x].ui.uid.toString()) != -1) ? true : false,
                    oldsxp: table.pi[x].sxp,
                    extraadd: (table.pi[x].extraadd != undefined) ? parseFloat(table.pi[x].extraadd) : 0,
                    iscentralmuseumlock: table.pi[x].iscentralmuseumlock,
                    leftgame: table.pi[x].leftgame,
                    doublexp: table.pi[x].doublexp
                });
            }
        }
        if (deadwoodlist.length == 0) {
            return false;
        }
        var minp = Math.min.apply(null, deadwoodlist);
        var totaladdedpoint = 0;
        var totalminuspoint = 0;

        if (typeof table.type != 'undefined' && (table.type == 'GIN' || table.type == 'BIGGIN')) { //one user spades all card so  point  is 0 and other use have joker card only that point also 0 that case draw 

            totaladdedpoint = totaladdedpoint + (table.type == 'GIN') ? 25 : 31;

            for (var y in winnerArray) {

                if (winnerArray[y].deadwood == 0 && knocker == winnerArray[y].si) {
                    winnercount++;
                    winnerArray[y].w = 1;
                    winnerArray[y].gin = (table.type == 'GIN') ? 1 : 0;
                    winnerArray[y].biggin = (table.type == 'BIGGIN') ? 1 : 0;

                    totalminuspoint = totalminuspoint + winnerArray[y].deadwood;
                } else {
                    winnerArray[y].w = 0;
                    totaladdedpoint = totaladdedpoint + winnerArray[y].deadwood;
                }
            }



        } else {

            if (typeof table.type != 'undefined' && table.type == 'knock') {

                var winnerSpc = []
                for (var y in winnerArray) {
                    if (winnerArray[y].deadwood <= minp) {
                        winnercount++;
                        winnerArray[y].w = 1;
                        totalminuspoint = totalminuspoint + winnerArray[y].deadwood;

                        winnerSpc = winnerArray[y].spc;
                    } else {
                        winnerArray[y].w = 0;
                        totaladdedpoint = totaladdedpoint + winnerArray[y].deadwood;
                    }
                }

                winnerArray.knockerwinner = false

                if (winnercount == 1) {

                    for (var x in winnerArray) {
                        if (knocker == winnerArray[x].si && winnerArray[x].w != 1) {
                            winnerArray.knockerwinner = true;
                            break;
                        }
                    }
                }

                //if there are 2 Or more players as winner then we have to check knocker exist in it or not?
                if (winnercount > 1 && typeof knocker != 'undefined') {
                    for (var x in winnerArray) {
                        if (knocker == winnerArray[x].si) {
                            winnerArray.knockerwinner = true;
                            if (winnerArray[x].w == 1) {
                                winnerArray[x].w = 0;

                                totalminuspoint = totalminuspoint - winnerArray[y].deadwood;
                                totaladdedpoint = totaladdedpoint + winnerArray[y].deadwood;
                                winnercount--;
                                //break;
                            }
                        } else if (winnerArray[x].w == 1) {
                            winnerSpc = winnerArray[y].spc
                        }

                    }
                }

                //Knock Hoi and 
                //WinnerCount == 1 hoi 
                var islayoff = false
                for (var y in winnerArray) {


                    if (winnerArray[y].w == 0) {

                        var layoff = [];
                        winnerArray[y].unusecrd.sort(function (e, f) {
                            return parseInt(e.split("-")[1]) - parseInt(f.split("-")[1])
                        });
                        //sort bcz card low to high user unuse ard [f-12,f-13] hoi to squ ma check thai jai 


                        for (var i = 0; i < winnerSpc.length; i++) {
                            //var totalcard = winnerSpc[i].slice(0,winnerSpc[i].length);
                            for (var j = 0; j < winnerArray[y].unusecrd.length; j++) {

                                //-----Aa winerSpc ma add karva thi send winnerArray na SPC ma Layoff nu card add thai jase  ------------->
                                winnerSpc[i].push(winnerArray[y].unusecrd[j] + "-o");

                                var spCards = gamelogicClass.CheckCardsForSpread(_.flatten(winnerSpc[i]));

                                if (typeof spCards != 'undefined' && spCards.length > 0 && _.flatten(spCards).indexOf(winnerArray[y].unusecrd[j] + "-o") != -1) {
                                    layoff.push(winnerArray[y].unusecrd[j]);
                                } else {
                                    //if not use in spades pop this card 
                                    winnerSpc[i].pop();
                                }
                            }
                            winnerSpc[i].sort(function (e, f) {
                                return parseInt(e.split("-")[1]) - parseInt(f.split("-")[1])
                            });
                        }

                        if (layoff.length > 0) {
                            islayoff = true
                            winnerArray[y].layoff = _.uniq(_.flatten(layoff));

                            var rcard = gamelogicClass.DiffColor(winnerArray[y].layoff);
                            var rpoint = com.CardPointSum(rcard.cards);

                            winnerArray[y].deadwood = winnerArray[y].deadwood - rpoint;
                            totaladdedpoint = totaladdedpoint - rpoint


                        }
                    }
                }

            } else {
                for (var y in winnerArray) {

                    if (winnerArray[y].deadwood <= minp) {
                        winnercount++;
                        winnerArray[y].w = 1;
                        totalminuspoint = totalminuspoint + winnerArray[y].deadwood;
                    } else {
                        winnerArray[y].w = 0;
                        totaladdedpoint = totaladdedpoint + winnerArray[y].deadwood;
                    }
                }
            }
        }
        /*if(layoff.length > 0){
          winnerArray.layoff = 1;
        }else{
          winnerArray.layoff = 0;
        }*/

        winnerArray.totaladdedpoint = totaladdedpoint;
        winnerArray.totalminuspoint = totalminuspoint;
        winnerArray.winnercount = winnercount;

        minp = null;
        points = null;
        return winnerArray;
    },
    CalculateOfPointForKnock: (table, knocker) => {
        var winnerArray = []

        var deadwoodlist = [];
        var winnercount = 0;

        for (var x in table.pi) {
            if (table.pi[x] == null || table.pi[x].cards == null && typeof table.pi[x].si != 'undefined')
                table.pi[x] = [];

            if (typeof table.pi[x] != 'undefined' && typeof table.pi[x].si != 'undefined' && table.pi[x].status != '' && typeof table.pi[x].cards != 'undefined') {

                table.pi[x].cards = table.pi[x].cards.filter((elem) => {
                    return elem !== null //&& elem != 'j-0' &&  elem != 'j-1'
                });

                if (typeof table.pi[x].spc[0] != "undefined" && typeof table.pi[x].spc[0] == "string") {
                    console.log("CalculateOfPointForKnock data.spc[0] ::::--->>>", table.pi[x].spc[0])
                    console.log("CalculateOfPointForKnock data.spc ::::--->>>", table.pi[x].spc)
                }

                deadwoodlist.push(table.pi[x].deadwood);
                winnerArray.push({
                    si: parseInt(x),
                    point: table.pi[x].point,
                    deadwood: table.pi[x].deadwood,
                    unusecard: table.pi[x].unusecard,
                    layoff: table.pi[x].layoff,
                    gin: 0,
                    biggin: 0,
                    undercut: 0,
                    cards: table.pi[x].cards,
                    spc: table.pi[x].spc,
                    pn: table.pi[x].ui.pn,
                    pp: table.pi[x].ui.pp,
                    uid: table.pi[x].ui.uid.toString(),
                    oldxp: table.pi[x].oldxp,
                    star_candy: (table.pi[x].star_candy != undefined) ? table.pi[x].star_candy : {
                        old_candy: 0,
                        add_candy: 0,
                        total_candy: 0,
                    },
                    extraadd: (table.pi[x].extraadd != undefined) ? parseFloat(table.pi[x].extraadd) : 0,
                    isleaveStargame: (table.isleave != undefined && table.isleave.indexOf(table.pi[x].ui.uid.toString()) != -1) ? true : false,
                    oldsxp: table.pi[x].sxp,
                    leftgame: table.pi[x].leftgame,
                    doublexp: table.pi[x].doublexp,
                    iscentralmuseumlock: table.pi[x].iscentralmuseumlock,
                });
            }
        }
        if (deadwoodlist.length == 0) {
            return false;
        }
        var minp = Math.min.apply(null, deadwoodlist);
        var totaladdedpoint = 0;
        var totalminuspoint = 0;

        for (var y in winnerArray) {

            if (winnerArray[y].deadwood <= minp) {
                winnercount++;
                winnerArray[y].w = 1;
                totalminuspoint = totalminuspoint + winnerArray[y].deadwood;

                winnerSpc = winnerArray[y].spc;
            } else {
                winnerArray[y].w = 0;
                totaladdedpoint = totaladdedpoint + winnerArray[y].deadwood;
            }
        }

        winnerArray.knockerwinner = false

        if (winnercount == 1) {
            for (var x in winnerArray) {
                if (knocker == winnerArray[x].si && winnerArray[x].w != 1) {
                    winnerArray.knockerwinner = true;
                    break;
                }
            }
        }

        //if there are 2 Or more players as winner then we have to check knocker exist in it or not?
        if (winnercount > 1 && typeof knocker != 'undefined') {
            for (var x in winnerArray) {
                if (knocker == winnerArray[x].si) {
                    winnerArray.knockerwinner = true;
                    if (winnerArray[x].w == 1) {
                        winnerArray[x].w = 0;

                        totalminuspoint = totalminuspoint - winnerArray[y].deadwood;
                        totaladdedpoint = totaladdedpoint + winnerArray[y].deadwood;
                        winnercount--;
                        break;
                    }
                }
            }
        }

        winnerArray.totaladdedpoint = totaladdedpoint;
        winnerArray.totalminuspoint = totalminuspoint;
        winnerArray.winnercount = winnercount;

        minp = null;
        points = null;
        return winnerArray;
    },
    CalculateOfPointFinal: (table) => {
        var winnerArray = []

        var points = [];
        var winnercount = 0;

        for (var x in table.pi) {
            if (table.pi[x] == null || table.pi[x].cards == null && typeof table.pi[x].si != 'undefined')
                table.pi[x] = [];

            if (typeof table.pi[x] != 'undefined' && typeof table.pi[x].si != 'undefined' && (table.tou == true || table.pi[x].status != '') && table.pi[x].cards) {

                table.pi[x].cards = table.pi[x].cards.filter((elem) => {
                    return elem !== null //&& elem != 'j-0' &&  elem != 'j-1'
                });

                //var p = gamelogicClass.PointCountDeadWood(table.pi[x].spc,table.pi[x].cards);

                /*var dt = gamelogicClass.pointDiffColor(table.pi[x].cards);
                var p = com.CardSum(dt.cards);*/
                points.push(table.pi[x].point);
                winnerArray.push({
                    si: parseInt(x),
                    point: table.pi[x].point,
                    _iscom: table.pi[x].ui._iscom,
                    //deadwood:table.pi[x].deadwood,
                    //gin:0,
                    //biggin:0,
                    //undercut:0,
                    //cards: table.pi[x].cards,
                    //spc:table.pi[x].spc,
                    rw: 0,
                    pn: table.pi[x].ui.pn,
                    pp: table.pi[x].ui.pp,
                    uid: table.pi[x].ui.uid.toString(),
                    isknock: table.pi[x].isknock,
                    oldxp: table.pi[x].oldxp,
                    extraadd: (table.pi[x].extraadd != undefined) ? parseFloat(table.pi[x].extraadd) : 0,
                    oldsxp: table.pi[x].sxp,
                    isleaveStargame: (table.isleave != undefined && table.isleave.indexOf(table.pi[x].ui.uid.toString()) != -1) ? true : false,
                    leftgame: table.pi[x].leftgame,
                    doublexp: table.pi[x].doublexp,
                    iscentralmuseumlock: table.pi[x].iscentralmuseumlock,
                    star_candy: (table.pi[x].star_candy != undefined) ? table.pi[x].star_candy : {
                        old_candy: 0,
                        add_candy: 0,
                        total_candy: 0,
                    }
                });
            }
        }
        if (points.length == 0)
            return false;

        var maxp = Math.max.apply(null, points);
        var totaladdedpoint = 0;
        var totalminuspoint = 0;

        for (var y in winnerArray) {

            if (winnerArray[y].point >= maxp) {
                winnercount++;
                winnerArray[y].w = 1;
            } else {
                winnerArray[y].w = 0;
            }
        }

        winnerArray.winnercount = winnercount;

        maxp = null;
        points = null;
        return winnerArray;
    },
    DeletSameset: (cardset) => {
        var cl = cardset.length;
        for (var i = 0; i < cl; i++) {
            for (var j = i; j < cl; j++) {
                var ccard = cardset[i];
                var nCard = cardset[j + 1];

                if (typeof nCard != "undefined" && nCard != null) {
                    if ((ccard[0] == nCard[0] || ccard[0] == nCard[1]) && (ccard[1] == nCard[0] || ccard[1] == nCard[1])) {
                        cardset.splice(cardset.indexOf(nCard), 1);
                        cl--;
                    }
                }
            }
        }
        return cardset;
    },
    NameOfSet: (set) => {

        cardSet = { teen: [], ron: [] };
        for (var i = 0; i < set.length; i++) {
            if (gamelogicClass.TeenForCheck(gamelogicClass.DiffColor(set[i]))) {
                cardSet.teen.push(set[i]);
            } else if (gamelogicClass.RonForCheck(gamelogicClass.DiffColor(set[i]))) {
                cardSet.ron.push(set[i]);
            } else if (jokerCalss.gaptotwocard(set[i])) {
                cardSet.ron.push(set[i]);
            }
        }
        return cardSet;
    },
    FutureCardSet: (set) => {
        var color1 = ["l", "k", "c", "f"];

        needcard = { teen: [], ron: [] };
        for (var i = 0; i < set.length; i++) {

            set[i].sort((e, f) => {
                return parseInt(e.split('-')[1]) - parseInt(f.split('-')[1])
                //return e.split('-')[1] - f.split('-')[1]
            })


            if (gamelogicClass.TeenForCheck(gamelogicClass.DiffColor(set[i]))) {
                var col = gamelogicClass.DiffColor(set[i]);

                var needcol = _.difference(color1, col.color);
                for (var k = 0; k < needcol.length; k++) {
                    needcard.teen.push(needcol[k] + "-" + col.cards[0])
                }

            } else if (gamelogicClass.RonForCheck(gamelogicClass.DiffColor(set[i]))) {
                var diffcol = gamelogicClass.DiffColor(set[i])


                if (eval(diffcol.cards[diffcol.cards.length - 1] + 1) < 13) {

                    needcard.ron.push(diffcol.color[0] + "-" + eval(diffcol.cards[diffcol.cards.length - 1] + 1))
                }

                if (eval(diffcol.cards[0] - 1) > 0) {

                    needcard.ron.push(diffcol.color[0] + "-" + eval(diffcol.cards[0] - 1));
                }
            }
        }
        return needcard;

    },
    cardInArr: (cardsArr, card) => {
        for (var i = 0; i < cardsArr.length; i++) {
            if (cardsArr[i][0] == card || cardsArr[i][1] == card) {
                return true;
            }
        }
        return false;
    },
    createPack: () => {
        var suits = new Array("k", "f", "c", "l");
        var pack = new Array();
        var n = 52;
        var index = n / suits.length;

        var count = 0;
        for (var i = 0; i <= 3; i++) {
            for (var j = 1; j <= index; j++) {
                pack[count++] = suits[i] + "-" + j;
            }
        }
        return pack;
    }
};