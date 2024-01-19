
const shuffle = require('shuffle-array');
com = require('./comm_function_class.js');

module.exports = {
    chooseserver: function (cb) {
        rclient.keys(config.SERVER, function (err, servers) {

            si = com.GetRandomInt(0, (servers.length - 1));
            rclient.HGETALL(servers[si], function (err, sdetail) {

                cb(sdetail);
            })
        })
    },
    CardSum: function (a) {
        var sum = 0;

        for (var i = 0; i < a.length; i++)
            sum += parseInt(a[i]);

        return sum;
    },
    CardPointSum: function (a) {
        var sum = 0;
        var p = 0;

        for (var i = 0; i < a.length; i++) {
            p = (parseInt(a[i]) > 10) ? 10 : parseInt(a[i]);
            sum += parseInt(p);
        }

        return sum;
    },

    // date
    CardPointSumnew: function (a) {
        var sum = 0;
        var p = 0;

        for (var i = 0; i < a.length; i++) {
            p = parseInt(a[i]);
            sum += parseInt(p);
        }

        return sum;
    },
    CancelJobOnServer: function (jid) {
        //tell all server for cancel the job
        //job id will automatically route to that server.
        rclient.del('timer:' + jid); //deleting timer
        rclient.del('jobs:' + jid);
        //jobExchange.publish(jid, sData);
    },
    CancelScheduleJobOnServer: function (tableId, jid) {
        //tell all server for cancel the job

        schedule.cancelJob(jid);

        var sData = { en: 'CTJ', data: { jid: jid } };
        playExchange.publish('table.' + tableId, sData);
    },
    PrepareId: function (sPrefix, id) {
        return sPrefix + "." + id;
    },
    GetRandomInt: function (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    AddTime: function (sec) {
        var t = new Date();
        return t.setSeconds(t.getSeconds() + sec);
    },
    AddTimeDate: function (date, sec) {
        var t = new Date(date);

        return t.setSeconds(t.getSeconds() + sec);
    },
    GetRandomString: function () {
        return Math.random().toString(36).slice(2);
    },
    shuffle_array: function (arr) {
        return shuffle(arr);
    },
    Shuffle: function (o) {
        for (var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
        return o;
    },
    Shuffle_Array: function (array) {

        if (array.length == 0) {
            return false;
        }


        var currentIndex = array.length, temporaryValue, randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;
    },
    create_uniue_id: function () {

        this.length = 4;
        this.timestamp = +new Date;

        var ts = this.timestamp.toString();
        var parts = ts.split("").reverse();
        var id = "";



        for (var i = 0; i < this.length; ++i) {
            var index = com.GetRandomInt(0, parts.length - 1);
            id += parts[index];
        }

        return id;
    },
    create_uniue_ids: function () { //use for sp

        this.timestamp = +new Date;

        var ts = this.timestamp.toString();

        var id = ts.slice(0, 10)

        return id;
    },
    create_uniue_id_rel: function () { //rflcode

        this.timestamp = +new Date;

        var ts = this.timestamp.toString();


        return ts;
    },
    //remove this function
    GetTimeDifference: function (startDate, endDate, type) {
        var date1 = new Date(startDate);
        var date2 = new Date(endDate);

        var diffMs = (date2 - date1);
        if (type == 'day') {
            var date1 = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0, 0, 0);
            var date2 = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 0, 0, 0);
            var timeDiff = Math.abs(date2.getTime() - date1.getTime());
            var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
            return diffDays;
        } else if (type == 'hour')
            return Math.round((diffMs % 86400000) / 3600000);
        else if (type == 'minute')
            return Math.round(((diffMs % 86400000) % 3600000) / 60000);
        else
            return Math.round((diffMs / 1000));
    },
    _getdatedifference: (date1, date2, type) => {
        var d1 = new Date(date1);
        var d2 = new Date(date2);
        var diff = (d2.getTime() - d1.getTime()) / 1000;
        if (type == 'day') {
            diff /= (60 * 60 * 24);
            return Math.floor(Math.round(diff));
        } else if (type == 'hour') {
            diff /= (60 * 60);
            return Math.floor(Math.round(diff));
        } else if (type == 'minute') {
            diff /= 60;
            return Math.floor(Math.round(diff));
        } else {
            return Math.floor(diff)
        }
    },
    CreateDate: (date) => {
        date = new Date(date);
        year = date.getFullYear();
        month = date.getMonth() + 1;
        dt = date.getDate();

        if (dt < 10) {
            dt = '0' + dt;
        }
        if (month < 10) {
            month = '0' + month;
        }

        return dt + '-' + month + '-' + year;
    },
    InArray: function (needle, haystack) {
        if (typeof haystack == 'undefined' || haystack == null || typeof needle == 'undefined')
            return false;

        var length = haystack.length;
        for (var i = 0; i < length; i++) {
            if (haystack[i] != null && haystack[i].toString() == needle.toString())
                return true;
        }
        return false;
    },
    IntersectArray: function (a, b) {
        if (typeof a == 'undefined' || a == null || typeof b == 'undefined' || b == null)
            return false;

        for (var w in b)
            if (b[w] != null && typeof b[w] != 'undefined')
                b[w] = b[w].toString();

        return a.filter(function (d) {
            if (d == null || typeof d == 'undefined')
                return false;
            else
                return b.indexOf(d.toString()) == -1;
        });
    },
    SortCardArr: function (cards) {
        var arr = [].concat(cards);
        arr.sort(function (a, b) {
            var a_num = parseInt(a.split('-')[1]);
            var b_num = parseInt(b.split('-')[1]);
            return a_num - b_num;
        });
        return arr;
    },
    getCurrentWeekRange: function () {
        var dt = new Object(); //creating new object for return with start date and end date
        var curr = new Date; // get current date

        var WeekStartDay = new Date(curr.setDate(curr.getDate() - curr.getDay()));//.toISOString();
        dt.wsd = new Date(WeekStartDay.getFullYear(), WeekStartDay.getMonth(), WeekStartDay.getDate(), 0, 0, 0);

        dt.wed = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0);
        return dt;
    },
    /*
        joker card j-0-l-1 to only add l-1 not j-0 check spades
    */
    RemoveJokerCard: (card) => {
        var lcard = [];

        if (typeof card != 'undefined' && card.length > 0) {
            for (var i = 0; i < card.length; i++) {
                if (card[i].split('-')[0] == 'j') {
                    lcard.push(card[i].split('-')[2] + '-' + card[i].split('-')[3]);
                } else {
                    lcard.push(card[i])
                }
            }

            return lcard;
        } else {
            return lcard
        }
    },
    isJSON: (data) => {
        try {
            return JSON.parse(data);

        } catch (e) {
            return false;
        }
    },
    numFormatter: (num) => {
        if (num > 999 && num < 1000000) {
            return (num / 1000).toFixed(0) + 'K'; // convert to K for number from > 1000 < 1 million 
        } else if (num > 1000000) {
            return (num / 1000000).toFixed(0) + 'M'; // convert to M for number from > 1 million 
        } else if (num < 900) {
            return num; // if value < 1000, nothing to do
        }
    },
    formatMoney: (amount, decimalCount = 0, decimal = ".", thousands = ",") => {

        decimalCount = Math.abs(decimalCount);
        decimalCount = 0//isNaN(decimalCount) ? 2 : decimalCount;

        const negativeSign = amount < 0 ? "-" : "";

        let i = parseInt(amount = Math.abs(Number(amount) || 0).toFixed(decimalCount)).toString();
        let j = (i.length > 3) ? i.length % 3 : 0;

        return negativeSign + (j ? i.substr(0, j) + thousands : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands) + (decimalCount ? decimal + Math.abs(amount - i).toFixed(decimalCount).slice(2) : "");
      
    },
    requireJsonContent: () => {
        return (req, res, next) => {
            com.adminapi_decrypt(req.body, function (reqj) {
                if (reqj.err == true) {
                    res.send(com.adminapi_encrypt({ success: false, message: 'error in request', code: 400 }))
                } else {
                    jwt.verify(reqj.data.token, 'pnVMPulRVKveJqAiUrTR', function (err, decoded) {
                        if (err) {
                            res.send(com.adminapi_encrypt({ success: false, message: 'Token Expire', code: 440 }))
                        } else {
                            req.body = reqj.data;
                            next()
                        }
                    });
                }
            })
        }
    },
    _setDate: (sec) => {
        var date = new Date(com.AddTime(sec));
        date.setUTCHours(0)
        date.setUTCMinutes(0)
        date.setUTCSeconds(0)
        date.setMilliseconds(0)
        return date;
    },
    nextDay: (x) => {
        var now = new Date();
        now.setDate(now.getDate() + (x + (7 - now.getDay())) % 7);
        return now;
    }
};