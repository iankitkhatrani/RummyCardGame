autoClass = require("./autogenrate.class.js");

module.exports = {
	makeObject: function (cte) {
		var a = [];
		for (var i = 0; i < cte; i++) {
			a.push({});
		}
		return a;
	},
	/*
		bv
		ms
		_ip
		Mode:{
			1:knock Gin
			2:Straight Gin
			3:okhlama Gin
			4:jokermode gin
		}
	*/
	DefaultFields: (data, callback) => {
		var Json = {};

		if (data.stargame != undefined && data.stargame == 1) {
			data._ip = 1
		}

		Json.ap = 0;
		Json.bv = (typeof data.bv == 'undefined') ? 100 : data.bv;
		Json.pv = 0;
		Json.mode = (typeof data.mode != "undefined") ? parseInt(data.mode) : 1;
		Json.point = (typeof data.point != "undefined") ? parseInt(data.point) : 50;
		Json.round = 1;
		Json.pi = autoClass.makeObject(data.ms);
		Json.open_deck = [];
		Json.t_status = "";
		Json.jid = "";
		Json.close_deck = [];
		Json.maindeadwood = 0;
		Json.score = [];
		Json.PassUser = [];
		Json.ti = -1;
		Json.ms = data.ms;
		Json.la = new Date();
		Json.comp = 0;
		Json.group = "";
		Json.touId = "";
		Json.tou = false;
		Json.closedecklock = 0;
		Json.opendecklock = 0;
		Json.isknock = 0;
		Json.turncount = -1;
		Json.isbiggin = (typeof data.isbiggin != undefined) ? data.isbiggin : false;
		Json.isgamewin = 0
		Json.trackercard = {
			l: [],
			c: [],
			k: [],
			f: [],
			j: []
		}


		callback(Json);
	}
}