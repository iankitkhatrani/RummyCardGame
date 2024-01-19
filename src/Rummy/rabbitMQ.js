/*process.on('uncaughtException', (err) => {
    console.log("err::---->>>>",err);
});*/
routerClass = require('./router.class.js');
validatorClass = require("./validator.class.js");
amqpClass = require('./rabbitMQ.js');
com = require('./comm_function_class.js');
cdClass = require('./common.class.js');


schedule = require('node-schedule');

module.exports = {
    RabbitMQevent: function () {
       
        rabbitConn.queue('users_' + SERVERID, {
            exclusive: false,
            arguments: {
                "x-message-ttl": 10000
            }
        }, function (q) {
            q.bind(playExchange, "table.*");
            q.subscribe(function (message, headers, deliveryInfo, messageObject) {
                if (message == null) {
                    return false;
                }

                if (message.en == 'CTJ') {
                    if (message.data.jid != null) {

                        schedule.cancelJob(message.data.jid);
                    }
                    return false;
                }
            });
        });

        rabbitConn.queue('emitter_' + SERVERID, {
            exclusive: false,
            arguments: {
                "x-message-ttl": 10000
            }
        }, function (q) {
            q.bind(playExchange, "single." + SERVERID + ".*");

            q.subscribe(function (message, headers, deliveryInfo, messageObject) {



                if (message == null)
                    return false;

                if (deliveryInfo.routingKey.indexOf("single.") != -1) {


                    var single = deliveryInfo.routingKey.replace('single.', '');

                    single = single.split('.')[1]


                    if (io.sockets.connected[single]) {


                        var eData = com.Encrypt(message);

                        io.sockets.connected[single].emit('res', eData);
                        //send RES FOR 

                        /*if (message.en == 'NCC')
                            setTimeout(function () {
                                if (io.sockets.connected[single])
                                    io.sockets.connected[single].disconnect();
                            }, 500);*/
                    }

                    if (message.en == 'EG' && typeof message.data != 'undefined'/* && (message.data.auto == 1 || message.data.noChips == 1 || message.data.swt == 1)*/) {
                        var dt = message.data;
                        if (io.sockets.connected[single])
                            io.sockets.connected[single].leave(dt.tbid); //leaving the table by socket id instance.
                    }
                }
            });
        });

        rabbitConn.queue(SERVERID, {
            exclusive: false,
            arguments: {
                "x-message-ttl": 10000
            }
        }, function (q) {
            q.bind(playExchange, "other");

            q.subscribe(function (message, headers, deliveryInfo, messageObject) {

                if (message == null)
                    return false;

                //save config
                if (message.en == 'SC') {

                    config = message.config;


                    if (SERVERID.split('_')[1] == "1") {

                        if (HOST == "192.168.0.203") {

                            fs.writeFile("./config.json", JSON.stringify(config), function (err) {
                                if (err) {
                                    console.log(err);
                                }
                            });

                        } else if (HOST == "167.99.239.112") {
                            fs.writeFile("./configdev.json", JSON.stringify(config), function (err) {
                                if (err) {
                                    console.log(err);
                                }

                                
                            });
                        } else if (HOST == "ginrummy.sixacegames.com") {
                            fs.writeFile("./configlive.json", JSON.stringify(config), function (err) {
                                if (err) {
                                    console.log(err);
                                }

                                
                            });
                        }
                    }

                    if (config.MM == true) {

                        cdClass.IsMaintenance();

                    }
                }

                if (message.en == "QD") {
                    if (typeof io != 'undefined') {
                        io.emit('res', com.Encrypt({ "en": "QDU", "data": {} }));
                    }

                }

                if (message.en == "LE") {
                    if (typeof io != 'undefined') {
                        io.emit('res', com.Encrypt({ "en": "LE", "data": message.data }));
                    }

                }

                if (message.en == "LSE") {

                    if (typeof io != 'undefined') {

                        io.emit('res', com.Encrypt({ "en": "LSE", "data": message.data }));
                    }

                }

                if (message.en == "US") {
                    if (typeof io != 'undefined') {
                        io.emit('res', com.Encrypt({ "en": "US", "data": message.data }));
                    }

                }

                if (message.en == "TMS") {

                    if (typeof io != 'undefined') {

                        io.emit('res', com.Encrypt({ "en": "TMS", "data": message.data }));
                    }

                }

                if (message.en == "OTM1") {
                    if (typeof io != 'undefined') {

                        io.emit('res', com.Encrypt({ "en": "OTM1", "data": message.data }));
                    }

                }


                if (message.en == "SPW") { //Star player winner 
                    if (typeof io != 'undefined') {

                        io.emit('res', com.Encrypt({ "en": "SPW", "data": message.data }));
                    }

                }

                if (message.en == "VBN") { //Star player winner 
                    if (typeof io != 'undefined') {

                        io.emit('res', com.Encrypt({ "en": "VBN", "data": message.data }));
                    }

                }
            });
        });
    },
    BindSocket: function (socket) {

        if (typeof socket == 'undefined' || socket == null || typeof socket.id == 'undefined' || socket.id == null || socket.id == '') {
            return false;
        }

        var socketid = socket.id;

        rclient.setex("ping:" + socketid, 120, 1); //setting heartbeat token on redis; 
        rclient.hmset("session:" + socketid, {
            "socketid": socketid,
            "sid": SERVERID,
            frm: "io",
            ip: (socket.handshake != undefined && socket.handshake.address != undefined && socket.handshake.address.split(':')[3] != undefined) ? socket.handshake.address.split(':')[3] : "",
        }, function (err) {
            rclient.expire('session:' + socketid, 125);
        });
        socket.socketid = socketid;


        socket.on('req', function (request) {
            request = com.Decrypt(request);

            socket.removeListener('req', function () { });

            if (request == null)
                return false;

            rclient.hgetall("session:" + socket.socketid, function (err, client) {

                if (client == null) {
                    db.collection('game_users').find({ socketid: socket.socketid }).project({ tbid: 1, socketid: 1 }, function (err, uInfo) {
                        if (err) {
                            console.log("bindsocket", err);
                        }
                        else {
                            if (uInfo.length > 0) {
                                var single = uInfo[0].socketid;
                                if (io.sockets.connected[single]) {
                                    //io.sockets.connected[single].leave(uInfo[0].tbid);
                                    io.of('/').adapter.remoteLeave(single, tbid, (err) => {
                                        /*if (err) { console.log("Not Connect ",single) }*/
                                    });
                                    io.sockets.connected[single].disconnect();
                                }
                            }
                        }
                    });
                    return false;
                }

                //validting all the parameters which are sending from client
                var isValid = validatorClass.ValiDate(request, client);

                if (isValid == false) {
                    cdClass.SendData(client, request.en, request.data, "error:3007");
                    return false;
                }

                //now we have to refine expire time for that key 35 seconds
                rclient.expire("ping:" + socket.socketid, config.REDIS_HB_TO); //35
                rclient.expire("session:" + socket.socketid, config.REDIS_SESSION_TO); //60          

                request.client = client;
                routerClass.socketevent(request);
            });
        });


        socket.on('reqack', function (request, callback) {
            request = com.Decrypt(request);

            socket.removeListener('reqack', function () { });

            if (request == null)
                return false;

            rclient.hgetall("session:" + socket.socketid, function (err, client) {

                if (client == null) {
                    db.collection('game_users').find({ socketid: socket.socketid }).project({ tbid: 1, socketid: 1 }, function (err, uInfo) {
                        if (err) {
                            console.log("bindsocket", err);
                        }
                        else {
                            if (uInfo.length > 0) {
                                var single = uInfo[0].socketid;
                                if (io.sockets.connected[single]) {
                                    //io.sockets.connected[single].leave(uInfo[0].tbid);
                                    io.of('/').adapter.remoteLeave(single, tbid, (err) => {
                                        /*if (err) { console.log("Not Connect ",single) }*/

                                    });
                                    io.sockets.connected[single].disconnect();
                                }
                            }
                        }
                    });
                    return false;
                }

                //validting all the parameters which are sending from client
                var isValid = validatorClass.ValiDate(request, client);

                if (isValid == false) {
                    cdClass.SendData(client, request.en, request.data, "error:3007");
                    var json = {
                        flag: true,
                        msg: "Somthing is Wrong..!!",
                        errcode: "3007",
                        en: request.en,
                        data: {}
                    }
                    return callback(json)
                }

                //now we have to refine expire time for that key 35 seconds
                rclient.expire("ping:" + socket.socketid, config.REDIS_HB_TO); //35
                rclient.expire("session:" + socket.socketid, config.REDIS_SESSION_TO); //60          

                request.client = client;

                routerClass.socketeventACK(request, (res) => {
                    c("Sending callback 00::: " + res.en + "\t:\t" + JSON.stringify(res));
                    var eData = com.Encrypt(res);
                    return callback(eData);
                });
            });
        });


        socket.on('error', (exc) => {
            console.log("ignoring exception: " + exc);
        });

        socket.on('PING', (request) => {
            socket.emit('res',
                com.Encrypt({
                    en: "PONG",
                    data: {}
                })
            );
            rclient.expire("ping:" + socket.socketid, config.REDIS_HB_TO);  //35
            rclient.expire("session:" + socket.socketid, config.REDIS_SESSION_TO);  //60 

            socket.removeListener('pong', () => { });
        });
    }
};