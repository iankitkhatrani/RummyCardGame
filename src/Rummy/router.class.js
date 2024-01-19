
singupClass = require('./singup_class.js');
amqpClass = require('./rabbitMQ.js');
compClass = require("./comp.class.js");
mechanismClass = require('./mechanismofPlaying.class.js');
userClass = require('./mecanismofuser.class.js');
dashClass = require("./mecanismofdash.class.js");
TournamnetClass = require('./tournament.class.js');
trackClass = require('./tracking.class.js');
CardClass = require('./card_module.class.js');


module.exports = {
	initialStart: () => {
		rclient.zscore("server", SERVERID, function (err, onlineplayer) {
			rclient.hmset(SERVERID, "port", port, "host", HOST, "proto", PROTO);
			rclient.zadd("server", 0, SERVERID);
		});

		io.on('connection', function (socket) {
			c('a user connected', socket.id);

			rclient.zincrby('server', 1, SERVERID);
			rclient.incr("onlineplayer");

			amqpClass.BindSocket(socket);

			socket.on('error', function (data) {
				console.log("eroor :--", data);
			})

			socket.on('disconnect', function () {
				c("socketid DisConnect", socket.id)




				rclient.decr('onlineplayer');
				rclient.zincrby('server', -1, SERVERID);

				rclient.hgetall("session:" + socket.id, function (err, client) {
					if (client == null) {
						c("user no session not found")
						return false;
					}

					if (typeof client.uid != 'undefined') {
						io.of('/').adapter.remoteLeave(socket.id, client.uid, (err) => {
							if (err) {/* console.log("err remoteLeave",err)*/ }

						});
						db.collection('game_users').update({
							_id: MongoId(client.uid),
							/*$or:[
								{socketid:""},
								{socketid: socket.id} 
							]*/ //starting ma sp return karu ae pela kill kari de game to db ma socket id old no store hoi and e match no thai atle 
						}, {
							$set: {
								"flags._io": 0,
							}
						}, function () {

							

							dashClass.DisConnect({}, client);

						});

						var time = com.AddTime(-86400);


						/*db.collection("tracking_setp").update(
							  {
								  uid:MongoId(client.uid),
								  cd:{$gte:new Date(time)}
							  },{
								  $push:{
									  tracking:{sn:"Disconnect",date:new Date()}
								  }
							  },()=>{
										

						});*/
					} else {
						dashClass.DisConnect({}, client);
					}
				});
			});
		});
		
		if (SERVERID.split('_')[1] == "1") {


			setInterval(function () {
				compClass.PraperComp();

			}, 1800000);

			setInterval(function () {
				mechanismClass.RemoveTable();
				mechanismClass.AutoStartTable();
			}, 1800000);
			mechanismClass.AutoStartTable();

			setInterval(function () {
				mechanismClass.repairUser();
			}, 4000000);

			setInterval(() => {
				StarPlayerClass.AutoDeleteTable()
			}, 10800000)

			compClass.PraperComp();
		}
	},
	socketevent: (request) => {

		c('Receiving ::: ' + request.en + '\t:\t' + JSON.stringify(request.data));
		
		switch (request.en) {
			case "HDD"://handel defulat dashboard
			case "UPI":
			case "UPF":
				singupClass[request.en](request.data, request.client);
				break;

			case "PLAYGAME":
			case "EG": //exit game
			case "PFCD"://pick from closed deck
			case 'TC': //throw card
			case "PFOD"://pick from open deck
			case 'JTOF'://join table of friends
			case 'CPT'://Create private table  
			case 'ST'://switch table
			case "JTOGR"://JTOF join table of globle  room
			case "PASS":
			case "KNOCK":
			case "GIN":
			case "PFODPU":
			case "BIGGIN":
			case "ULGSN":
			case "EGS": //Exit Game Star Player
			case "SNR": //Start Next Round
				mechanismClass[request.en](request.data, request.client);

				break;
			case 'RFR'://Response Friends 
				friendClass[request.en](request.data, request.client);
				break;

			case 'ITP'://Invite To playing
			case 'ND'://Notification Data,
			case 'RND'://remove Notification
			case 'HN'://notification handle
			case 'RNID'://RNID remove notification data in dashborad
				notiClass[request.en](request.data, request.client);
				break;

			case 'RGTI'://Rejoin Get Table Info
			case 'TRGTI'://tournamnet rejoin id
			case "DLT"://DLT Delete Live Table
			case "LOTS":
			case "NCTS":
			case "NCTH":
			case "NWWL":
			case "DWL":
				dashClass[request.en](request.data, request.client);
				break;

			case "COT"://Chat On Table
			case "PC"://Persnol chat
			case "URMC"://unread message count
			case "OCH"://Old chat history
				msgClass[request.en](request.data, request.client);
				break;


			case "SGTU"://Send Gift To User
			case "VR"://video reward
			case "SPINWIN": //Spiner 
			case "QSPIN": //quest spin
			case "QB": //quest bonus
			case "QVIP": //quest vip 
			case "SGTUNEW":
			case "GHB":
			case "VBN":
			case "CVB":
				bonusClass[request.en](request.data, request.client);
				break;


			case 'HPG'://Gold buy
			case 'HPGEMS'://GEMS Buy
			case "EO":
			case "GSEO":
			case 'UHT'://Unlock Hollywood table
			case "NOTESS":
			case "HPNOTES":
			case "NBS": //New Booster Store
			case "FGS":
			case "HPLEAF":

				GoldStroeClass[request.en](request.data, request.client);
				break;

			case 'PT':
			case 'EGT':
			case 'ULGS':
				TournamnetClass[request.en](request.data, request.client);
				break;

			case "QUD":
			case "QBC":
			//case "TS":
			case "IPG":
			//case "CGB":
			case "FLC":
			case "GQD":
			case "GQBC":
				trackClass[request.en](request.data, request.client);
				break;

			case "SMI":
			case "HEART":
			case "SSD":
				// case "SLOTESPIN":
				SloteMashine[request.en](request.data, request.client);
				break;

			case "MGE":
			case "MGSPIN":
			case "CSPIN":
				MinigameEventClass[request.en](request.data, request.client);
				break;

			case "FGE":
			case "FGSPIN":
			case "CFSPIN":
				freegameEventClass[request.en](request.data, request.client);
				break;

			case "MI":
			case "CRC":
			case "MIA":
			case "CMR":
				MuseumClass[request.en](request.data, request.client);
				break;


			case "CSNHG":
			case "CHLG":
			case "RJMINI":
				MiniGameClass[request.en](request.data, request.client)
				break;

			case "GLL":
			case "LTD":
			case "OTN":
			case "LLTI":
				lottoClass[request.en](request.data, request.client);
				break;

			case "CR":
				LeagueClass[request.en](request.data, request.client);
				break;

			case "SHG": //Start Hollywood Game
			case "TA":  //Tack Action
				HollywoodClass[request.en](request.data, request.client);
				break;

			case "ED":
			case "JE":
			case "RJOIN":
			case "ECR":
			case "ECSR":
				EventClass[request.en](request.data, request.client);
				break;

			case "LS":
			case "GLS": //Get Luckey Spin
			case "CLSB":
			case "PlaySPIN":
				LuckySpinClass[request.en](request.data, request.client);
				break;

			case "GHL":
			case "CRH":
			case "ULSF":
				HouseOfLuckClass[request.en](request.data, request.client);
				break;

			case "LD":
			case "CSTC":
			case "SC":
				laboratroyClass[request.en](request.data, request.client);
				break;

			case "SCT": //Start Card Time 
			case "STOPC":
				CardClass[request.en](request.data, request.client);
				break;

			case "SPG": //start player game
			case "SPL":
			case "JSP":
				StarPlayerClass[request.en](request.data, request.client);
				break;

			case "TMD":
			case "TMCR":
				TonkMasterClass[request.en](request.data, request.client);
				break;

			case "UNTC":
			case "OTC":
			case "TCCR":
			case "TCST":
			case "RTC":
			case "SCR":
				treasurechestClass[request.en](request.data, request.client);
				break

			case "GTD":
			case "PTHEME":
			case "STHEME":
			case "EXTHEME":
			case "PAYTHEME":
			case "GGF":
			case "SGF":	
			case "ILS":
			case "ICS":
				themedataclass[request.en](request.data, request.client);
				break

			// case "AI": //Achievements Info
			// case "ARC": //Achievements Reward Claim
			// 	Achievementsclass[request.en](request.data, request.client);
			// 	break


		}

	},
	socketeventACK: (request, callback) => {

		c('socketeventACK Receiving ::: ' + request.en + '\t:\t' + JSON.stringify(request.data));
		

		switch (request.en) {
			case "SP"://signup
			case "GL"://guest Login
				singupClass[request.en](request.data, request.client, callback)
				break;


			case 'CVIP'://Check Vip Private table 
			case "UENG"://
			case "SORT": //SORTING CARD
			case "SB": //score data,
			case "SNR": //Start Next Round
				mechanismClass[request.en](request.data, request.client, callback)
				break;

			case "SFR"://Send freinds request 
			case 'ITPL'://Invite Table Playing List  
			case 'BH'://buddies Hub
			case 'BU'://Block User
			case 'UBU'://UnBlock User
			case 'RF'://Remove Freind
			case 'FFBU'://Find Friends By Unique id 
			case 'OFC'://Online freinds list
				friendClass[request.en](request.data, request.client, callback)
				break;


			case 'MP'://My profile
			case "MBV":
			case 'OUP'://Opp User Profile
			case 'UUP'://Update User Profile
			case 'MUP'://Manage User Profile
			case 'AL'://Avatar List
			case 'PA'://Purchase Avatar List
			case 'VLD'://Vip Level Data
				userClass[request.en](request.data, request.client, callback)
				break;

			case 'UGH'://User Golds History
			case 'LB'://Leader Borad
			case 'FB'://Feedback
			case 'WWL'://Weekly Winner List
			case 'VCD'://Vip Club data
			case "LOPT": // List Of Playing Table 
			case "RGR"://Remove globle Room
			case "GCTGEMS": // Gold Convert to Gems 
				dashClass[request.en](request.data, request.client, callback)
				break;

			case "IS":
			case "GMAM"://Get My All Message
			case "DCM"://Delete Chat message
				msgClass[request.en](request.data, request.client, callback)
				break;

			case "MDB"://make Daily bonus
			case "CDB"://collect Daily bonus 	
			case "CMB"://Collect Magic bonus 
			case "GGD"://Get Gift Data
			case "SPIN": //SPIN
				bonusClass[request.en](request.data, request.client, callback)
				break;

			case 'SSAH'://start spades and heart game
			case 'UserTurn'://user Turn to card is heart or spades
			case 'CWA'://Collect win Amount
			case 'SHLG': //Start Game Hi LO 
			case 'UserTurnHILO': //User Turn HI LO
			case 'CWAHILO': //hi lo 
				MiniGameClass[request.en](request.data, request.client, callback)
				break;

			case 'GS'://Gold Store
			case 'GEMSS'://Gems Stroe
			case 'UPT'://unlock vip
			case "NOTESS":
			case "NBS":

				GoldStroeClass[request.en](request.data, request.client, callback)
				break;

			case 'LT'://List
				TournamnetClass[request.en](request.data, request.client, callback)
				break;



			case "SU":
				trackClass[request.en](request.data, request.client, callback);
				break;

			case "LI":
			case "LLA":
				LeagueClass[request.en](request.data, request.client, callback);
				break;

			case "CSNHG":
			case "CHLG":
			case "RJMINI":
				MiniGameClass[request.en](request.data, request.client)
				break;



		}
	}
};