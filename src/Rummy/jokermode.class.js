/*process.on('uncaughtException', (err) => {
    console.log("err::---->>>>",err);
});*/

const _ = require("underscore");

com            = require('./comm_function_class.js');
gamelogicClass = require('./gamelogic.class.js');
jokerCalss     = require('./jokermode.class.js');

module.exports={
	//joker to make card or not 
    /*
        [[ 'l-1', 'l-1', 'j-0' ],[ 'l-12', 'l-13', 'j-0' ],[ 'l-7', 'l-5', 'j-0' ]]
        
        spades ma replse kari ne aap 6e j-0
    */
	jokercardtosetready:(set)=>{
        

        //var finalcrad=[];

        for(var i = 0;i<set.length;i++){

            if(com.InArray('j-0',set[i]) || com.InArray('j-1',set[i])){

                var countforjoker=set[i].filter((elem)=>{
                    return  elem == 'j-0' || elem == 'j-1';
                })

        		set[i]=set[i].filter((elem)=>{
        			return elem !== null && elem != 'j-0' && elem != 'j-1';
        		})

                //all card na card set lidha 
        		//var poss= jokerCalss.cardset(card);
                if(countforjoker.length == 1){

                    var maketojokercard=jokerCalss.JokerFutureCardSet(set[i]);

            	    if(maketojokercard[0]){
 
                        set[i].push(maketojokercard[0]+"-"+countforjoker[0])
                       
            	    }else{
                        console.log("Not Joker Card Make Any ")
                    }
                }else{

                    var maketojokercard=jokerCalss.JokerFutureCardSettwojokermate(set[i]);
                   
                    if(maketojokercard && maketojokercard.length  > 0){
                        
                        set[i].push(maketojokercard[0]+"-"+countforjoker[0])
                        if(maketojokercard[1] != undefined)
                         set[i].push(maketojokercard[1]+"-"+countforjoker[1])

                    }else{
                         console.log("Not Make Joker Card Tow joker card there ")
                        //return false;
                    }
                }
            }
        }
        return set;
	},
    //This only use in one spread 
    //Also sequence to maintain
    jokercardmakeinspread:(set)=>{
    
        if(com.InArray('j-0',set) || com.InArray('j-1',set)){

            var countforjoker = []
            var jokerindex = []
            for(var i = 0;i<set.length;i++){
               if(set[i] == 'j-0' || set[i] == 'j-1'){
                   countforjoker.push(set[i]) 
                   jokerindex.push(i)
               } 
            }


            copyset=set.filter((elem)=>{
                return elem !== null && elem != 'j-0' && elem != 'j-1';
            })
            var sort;
            if(copyset.length > 1){
               
                var order = parseInt(copyset[0].split("-")[1]) - parseInt(copyset[1].split("-")[1])
             
                if(order > 0){ // [k-13,'k-11'] //joker na card me moti value thi nani value sorting karvanu
                    sort = -1;
                }else{
                    sort = 1;
                }
            }

            //all card na card set lidha 
            //var poss= jokerCalss.cardset(card);
            if(countforjoker.length == 1){

                var needcard;
                var a=gamelogicClass.DiffColor(copyset);
                if(gamelogicClass.TeenForCheck(a)){
            
                    var col=gamelogicClass.DiffColor(copyset);
                    needcard = "a-"+col.cards[0];
                    set[jokerindex[0]] = needcard+"-"+countforjoker[0];
                  
                }else if(gamelogicClass.RonForCheck(a)){
                    
                    if(jokerindex[0] == 0){
                        
                        if(sort == -1){
                            if(eval(parseInt(set[jokerindex[0]+1].split("-")[1])+1) < 14){
                                maketojokercard = set[jokerindex[0]+1].split("-")[0]+"-"+eval(parseInt(set[jokerindex[0]+1].split("-")[1])+1)
                                set[jokerindex[0]]= maketojokercard+"-"+countforjoker[0];
                            }
                        }else{
                            if(eval(parseInt(set[jokerindex[0]+1].split("-")[1])-1) > 0){
                                maketojokercard = set[jokerindex[0]+1].split("-")[0]+"-"+eval(parseInt(set[jokerindex[0]+1].split("-")[1])-1)
                                set[jokerindex[0]]= maketojokercard+"-"+countforjoker[0];
                            }
                        }

                    }else if(jokerindex[0] == (set.length -1)){
                       
                        if(sort == 1){
                            if(eval(parseInt(set[jokerindex[0]-1].split("-")[1])+1) < 14){
                                maketojokercard = set[jokerindex[0]-1].split("-")[0]+"-"+eval(parseInt(set[jokerindex[0]-1].split("-")[1])+1)
                                set[jokerindex[0]]= maketojokercard+"-"+countforjoker[0];
                            }
                        }else{
                            if(eval(parseInt(set[jokerindex[0]-1].split("-")[1])-1) > 0){
                                maketojokercard = set[jokerindex[0]-1].split("-")[0]+"-"+eval(parseInt(set[jokerindex[0]-1].split("-")[1])-1)
                                set[jokerindex[0]]= maketojokercard+"-"+countforjoker[0];
                            }
                        }
                    }else{
                        //Middle of joker 
                        if(eval(parseInt(set[jokerindex[0]+1].split("-")[1])-1) > 0){
                            maketojokercard = set[jokerindex[0]+1].split("-")[0]+"-"+eval(parseInt(set[jokerindex[0]+1].split("-")[1])-1)
                            set[jokerindex[0]]= maketojokercard+"-"+countforjoker[0];
                        }
                    }

                }else if(jokerCalss.gaptotwocard(copyset)){
                    needcard=jokerCalss.needtogapcardfind(copyset)
                    set[jokerindex[0]] = needcard+"-"+countforjoker[0];
                }
            }else{

                var a=gamelogicClass.DiffColor(copyset);
                var needcard;

                if(gamelogicClass.TeenForCheck(a))
                {
                
                    var col=gamelogicClass.DiffColor(copyset);
                    needcard = "a-"+col.cards[0];
                    set[jokerindex[0]] = needcard+"-"+countforjoker[0];
                    set[jokerindex[1]] = needcard+"-"+countforjoker[1];
                     
                   
                      
                }else{
                    
                    if(jokerindex[0] == 0){
                        if(set[jokerindex[0]+1].split("-")[0] == 'j'){

                            if(sort == -1){
                                if(eval(parseInt(set[jokerindex[1]+1].split("-")[1])+2) < 14){
                                    maketojokercard = set[jokerindex[1]+1].split("-")[0]+"-"+eval(parseInt(set[jokerindex[1]+1].split("-")[1])+2)
                                    set[jokerindex[0]]= maketojokercard+"-"+countforjoker[0];
                                }
                            }else{
                               
                                if(eval(parseInt(set[jokerindex[1]+1].split("-")[1])-2) > 0){
                                    maketojokercard = set[jokerindex[1]+1].split("-")[0]+"-"+eval(parseInt(set[jokerindex[1]+1].split("-")[1])-2)
                                    set[jokerindex[0]]= maketojokercard+"-"+countforjoker[0];
                                }
                            }

                        }else{

                            if(sort == -1){
                                if(eval(parseInt(set[jokerindex[0]+1].split("-")[1])+1) < 14){
                                    maketojokercard = set[jokerindex[0]+1].split("-")[0]+"-"+eval(parseInt(set[jokerindex[0]+1].split("-")[1])+1)
                                    
                                    set[jokerindex[0]]= maketojokercard+"-"+countforjoker[0];
                                }
                            }else{
                                if(eval(parseInt(set[jokerindex[0]+1].split("-")[1])-1) > 0){
                                    maketojokercard = set[jokerindex[0]+1].split("-")[0]+"-"+eval(parseInt(set[jokerindex[0]+1].split("-")[1])-1)
                                    
                                    set[jokerindex[0]]= maketojokercard+"-"+countforjoker[0];
                                }
                            }
                        }
                    }else if(jokerindex[0] == (set.length -1)){
                        
                        if(sort == 1){
                            if(eval(parseInt(set[jokerindex[0]-1].split("-")[1])+1) < 14){
                                maketojokercard = set[jokerindex[0]-1].split("-")[0]+"-"+eval(parseInt(set[jokerindex[0]-1].split("-")[1])+1)
                                 
                                set[jokerindex[0]]= maketojokercard+"-"+countforjoker[0];
                            }
                        }else{
                            if(eval(parseInt(set[jokerindex[0]-1].split("-")[1])-1) > 0){
                                maketojokercard = set[jokerindex[0]-1].split("-")[0]+"-"+eval(parseInt(set[jokerindex[0]-1].split("-")[1])-1)
                                
                                set[jokerindex[0]]= maketojokercard+"-"+countforjoker[0];
                            }
                        }

                    }else{
                        //Middle of joker 
                        if(sort == 1){
                            if(eval(parseInt(set[jokerindex[0]-1].split("-")[1])+1) < 14){
                                maketojokercard = set[jokerindex[0]-1].split("-")[0]+"-"+eval(parseInt(set[jokerindex[0]-1].split("-")[1])+1)
                                
                                set[jokerindex[0]]= maketojokercard+"-"+countforjoker[0];
                            }
                        }else{
                            if(eval(parseInt(set[jokerindex[0]-1].split("-")[1])-1) > 0){
                                maketojokercard = set[jokerindex[0]-1].split("-")[0]+"-"+eval(parseInt(set[jokerindex[0]-1].split("-")[1])-1)
                                
                                set[jokerindex[0]]= maketojokercard+"-"+countforjoker[0];
                            }
                        }

                    }
                    if(sort == undefined){
                        copyset=set.filter((elem)=>{
                            return elem !== null && elem != 'j-0' && elem != 'j-1';
                        })
                        
                        if(copyset.length > 1){
                            
                            var order = parseInt(copyset[0].split("-")[1]) - parseInt(copyset[1].split("-")[1])
                            
                            if(order > 0){ // [k-13,'k-11'] //joker na card me moti value thi nani value sorting karvanu
                                
                                sort = -1;
                            }else{
                                
                                sort = 1;
                            }
                        }
                    }
                    //Second joker card mate 

                    if(jokerindex[1] == 0){
                        
                        if(sort == -1){
                            if(eval(parseInt(set[jokerindex[1]+1].split("-")[1])+1) < 14){
                                maketojokercard = set[jokerindex[1]+1].split("-")[0]+"-"+eval(parseInt(set[jokerindex[1]+1].split("-")[1])+1)
                                
                                set[jokerindex[0]]= maketojokercard+"-"+countforjoker[1];
                            }
                        }else{
                            if(eval(parseInt(set[jokerindex[1]+1].split("-")[1])-1) > 0){
                                maketojokercard = set[jokerindex[1]+1].split("-")[0]+"-"+eval(parseInt(set[jokerindex[1]+1].split("-")[1])-1)
                                
                                set[jokerindex[0]]= maketojokercard+"-"+countforjoker[1];
                            }
                        }

                    }else if(jokerindex[1] == (set.length -1) ){
                        
                        if(sort == 1){
                            if(eval(parseInt(set[jokerindex[1]-1].split("-")[1])+1) < 14 && set[jokerindex[1]-1].split("-")[0] != "j"){
                                maketojokercard = set[jokerindex[1]-1].split("-")[0]+"-"+eval(parseInt(set[jokerindex[1]-1].split("-")[1])+1)
                                
                                set[jokerindex[1]]= maketojokercard+"-"+countforjoker[1];
                            }
                        }else{
                            if(eval(parseInt(set[jokerindex[1]-1].split("-")[1])-1) > 0 && set[jokerindex[1]-1].split("-")[0] != "j"){
                                maketojokercard = set[jokerindex[1]-1].split("-")[0]+"-"+eval(parseInt(set[jokerindex[1]-1].split("-")[1])-1)
                                
                                set[jokerindex[1]]= maketojokercard+"-"+countforjoker[1];
                            }
                        }

                    }else{
                        //Middle of joker 
                        
                        if(sort == 1){
                            if(eval(parseInt(set[jokerindex[1]+1].split("-")[1])-1) > 0){
                                maketojokercard = set[jokerindex[1]+1].split("-")[0]+"-"+eval(parseInt(set[jokerindex[1]+1].split("-")[1])-1)
                                
                                set[jokerindex[1]]= maketojokercard+"-"+countforjoker[1];
                            }
                        }else{
                            if(eval(parseInt(set[jokerindex[1]+1].split("-")[1])+1) < 14){
                                maketojokercard = set[jokerindex[1]+1].split("-")[0]+"-"+eval(parseInt(set[jokerindex[1]+1].split("-")[1])+1)
                                
                                set[jokerindex[1]]= maketojokercard+"-"+countforjoker[1];
                            }
                        }
                    }
                }  
            }
        }
        
        return set;
    },
	//check to high card length to robot mini length throw
	checkhighcardlength:(toarray)=>{

		var cardlength=[[0]];

        

        var spadeslist=[];

        for(var i=0;i<toarray.length;i++){
            if(toarray[i].length >= 3 && gamelogicClass.CheckCardCases(toarray[i]) ){
                spadeslist.push(toarray[i]);
            }
        }
        spadeslist=_.flatten(spadeslist);

		for(var i=0;i<toarray.length;i++){
            
			if(cardlength[0].length < toarray[i].length && (!gamelogicClass.CheckCardCases(toarray[i]) || toarray[i].length == 2) && _.intersection(spadeslist,toarray[i]).length == 0){
				cardlength[0]=toarray[i];
			}
		}

	
        if(cardlength.length > 0 && cardlength[0].length == 1){
            for(var i=0;i<toarray.length;i++){
                if(cardlength[0].length < toarray[i].length){
                    cardlength[0]=toarray[i];
                }
            }
        }


		return cardlength[0];
	},
	//check to gap card to two and add joker to spades
    gaptotwocard:(card)=>{
		var a= gamelogicClass.DiffColor(card);	
	    var flag = true;

        a.cards.sort(function(e, f) {
            return e - f
        }); //sorting the element in sequence

        //Adjust A - 1 in sorting       
        /*if (a.cards[0] == 1) {
            if ((!com.InArray(2, a.cards) || !com.InArray(3, a.cards) || !com.InArray(4, a.cards)) && (com.InArray(10, a.cards) || com.InArray(11, a.cards) || com.InArray(12, a.cards) || com.InArray(13, a.cards))) {
                removedCard = a.cards.splice(0, 1);
                a.cards.push(removedCard[0]);
            }
        }*/

        if (flag == true) {
            for (var x in a.color) {
                if (a.color[x] != a.color[0]) {
                    flag = false;
                    break;
                }
            }
        }

        var k=0; 
        //special condition for Q,K,A       
        if (flag == true) {
            for(var i = 1; i < a.cards.length; i++) {

                if (a.cards[i] - a.cards[i - 1] == 1 || a.cards[i] - a.cards[i - 1] == 2 /*|| a.cards[i] - a.cards[i - 1] == -12 || a.cards[i] - a.cards[i - 1] == -11*/) {
                    
                	if(a.cards[i] - a.cards[i - 1] == 2)
                	{
                		k++;
                	}

                	if(k >= 2){
                		flag=false
                		break;
                	}

                    flag = true;
                } else {
                    flag = false;
                    break;
                }
            }
        }

        return flag;
	},
	//card set create to....
	cardset:(card)=>{

		var getposs=[];

		for(var i=0;i<card.length;i++){
			for(var j=i+1;j<card.length;j++){
				getposs.push([card[i],card[j]]);
			}
		}


		for(var i=0;i<card.length;i++){
			for(var j=i+1;j<card.length;j++){
				for(var t=j+1;t<card.length;t++){
					getposs.push([card[i],card[j],card[t]]);
				}
			}
		}

		for(var i=0;i<card.length;i++){
			for(var j=i+1;j<card.length;j++){
				for(var t=j+1;t<card.length;t++){
					for(var p=t+1;p<card.length;p++){
						getposs.push([card[i],card[j],card[t],card[p]]);
					}
				}
			}
		}


		for(var i=0;i<card.length;i++){
			for(var j=i+1;j<card.length;j++){
				for(var t=j+1;t<card.length;t++){
					for(var p=t+1;p<card.length;p++){
						for(var u=p+1;u<card.length;u++){
							getposs.push([card[i],card[j],card[t],card[p],card[u]]);
						}
					}
				}
			}
		}


		for(var i=0;i<card.length;i++){
			for(var j=i+1;j<card.length;j++){
				for(var t=j+1;t<card.length;t++){
					for(var p=t+1;p<card.length;p++){
						for(var u=p+1;u<card.length;u++){
							for(var y=u+1;y<card.length;y++){
								getposs.push([card[i],card[j],card[t],card[p],card[u],card[y]]);
							}
						}
					}
				}
			}
		}


		return getposs;
	},
	//joker card to find gap find card
	JokerFutureCardSet:(set)=>{
        var color1=["l","k","c","f"];
       
        needcard=[];

      	var a=gamelogicClass.DiffColor(set);

        if(gamelogicClass.TeenForCheck(a))
        {
        	
            var col=gamelogicClass.DiffColor(set);
            needcard.push("a-"+col.cards[0])  
          
        }else if(gamelogicClass.RonForCheck(a)){
            
            var diffcol= gamelogicClass.DiffColor(set)
            
            diffcol.cards.sort(function(e, f) {
              return parseInt(e) - parseInt(f)
            });

            if(eval(diffcol.cards[0]-1) > 0){
                needcard.push(diffcol.color[0]+"-"+eval(diffcol.cards[0]-1));
            }else if(eval(diffcol.cards[diffcol.cards.length-1]+1) < 14){
                needcard.push(diffcol.color[0]+"-"+eval(diffcol.cards[diffcol.cards.length-1]+1));
            }
           
            
        }else if(jokerCalss.gaptotwocard(set)){
        	needcard=jokerCalss.needtogapcardfind(set)
            
        }
  
    	return needcard;
	},
	//check to gap card to two and add joker to spades
    needtogapcardfind:function(card){
		var a=gamelogicClass.DiffColor(card);	
	    var flag = true;

        a.cards.sort(function(e, f) {
            return e - f
        }); //sorting the element in sequence

        //Adjust A - 1 in sorting       
        /*if (a.cards[0] == 1) {
            if ((! com.InArray(2, a.cards) || !com.InArray(3, a.cards) || !com.InArray(4, a.cards)) && (com.InArray(10, a.cards) || com.InArray(11, a.cards) || com.InArray(12, a.cards) || com.InArray(13, a.cards))) {
                removedCard = a.cards.splice(0, 1);
                a.cards.push(14);
            }
        }*/

        if (flag == true) {
            for (var x in a.color) {
                if (a.color[x] != a.color[0]) {
                    flag = false;
                    break;
                }
            }
        }

        var k=0;
        var needcard=[];

        //special condition for Q,K,A       
        if (flag == true) {
            for(var i = 1; i < a.cards.length; i++) {
                if (a.cards[i] - a.cards[i - 1] == 1 || a.cards[i] - a.cards[i - 1] == 2 /*|| a.cards[i] - a.cards[i - 1] == -12 || a.cards[i] - a.cards[i - 1] == -11*/) {
                    
                	if(a.cards[i] - a.cards[i - 1] == 2)
                	{
                			
                		needcard.push(a.color[0]+"-"+eval(a.cards[i-1]+1))
                		k++;
                	}

                	if(k >= 2){
                		flag=false
                		break;
                	}

                    flag = true;
                } else {
                    flag = false;
                    break;
                }
            }
        }
        return needcard;
	},
	TeenForCheck: function(set) {
        var flag = true;

        var a=gamelogicClass.DiffColor(set);

        var point = _.filter(a.cards, function(num){ return num != 0; });
        if(point.length == 1){
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
    RonForCheck: function(set) {

        var flag = true;
        var a=gamelogicClass.DiffColor(set);

        a.cards.sort(function(e, f) {
            return e - f
        }); 

        //Adjust A - 1 in sorting       
       /* if (a.cards[0] == 1) {
            if (com.InArray(13, a.cards) && !com.InArray(2, a.cards) && com.InArray(12, a.cards)) {
                removedCard = a.cards.splice(0, 1);
                a.cards.push(removedCard[0]);
            }
        }*/

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
            for(var i = 1; i < a.cards.length; i++) {
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
    //two card joiye atle ke 2 card add karvana 
    threegapvalaset:function (card){
        var a= gamelogicClass.DiffColor(card); 
        var flag = true;

        a.cards.sort(function(e, f) {
            return e - f
        }); //sorting the element in sequence

        //Adjust A - 1 in sorting       
        /*if (a.cards[0] == 1) {
            if ((!com.InArray(2, a.cards) || !com.InArray(3, a.cards) || !com.InArray(4, a.cards)) && (com.InArray(10, a.cards) || com.InArray(11, a.cards) || com.InArray(12, a.cards) || com.InArray(13, a.cards))) {
                removedCard = a.cards.splice(0, 1);
                a.cards.push(removedCard[0]);
            }
        }*/

        if (flag == true) {
            for (var x in a.color) {
                if (a.color[x] != a.color[0]) {
                    flag = false;
                    break;
                }
            }
        }

        var k=0;
        
        //special condition for Q,K,A       
        if (flag == true) {
            for(var i = 1; i < a.cards.length; i++) {

                if (a.cards[i] - a.cards[i - 1] == 1 || a.cards[i] - a.cards[i - 1] == 3 /*|| a.cards[i] - a.cards[i - 1] == -12 || a.cards[i] - a.cards[i - 1] == -11 || a.cards[i] - a.cards[i - 1] == -10*/) {
                    
                    if(a.cards[i] - a.cards[i - 1] == 3)
                    {
                        k++;
                    }

                    if(k >= 2){
                        flag=false
                        break;
                    }

                    flag = true;
                } else {
                    flag = false;
                    break;
                }
            }
        }

        return flag;
    },
    //robot mate 
    JokerFutureCardSettwojokermate:function(set){
        var color1=["l","k","c","f"];
       
        needcard=[];

        var a=gamelogicClass.DiffColor(set);
        
        if(gamelogicClass.TeenForCheck(a))
        {
            
              var col=gamelogicClass.DiffColor(set);
              
              var needcol=_.difference(color1,col.color);

            
                needcard.push("a-"+col.cards[0])
                needcard.push("a-"+col.cards[0])  
              
        
        }else if(gamelogicClass.RonForCheck(a)){
            
            var diffcol= gamelogicClass.DiffColor(set)
            

            diffcol.cards.sort(function(e,f){
                return e - f;
            });

            /*if (diffcol.cards[0] == 1) {
                if (com.InArray(13, diffcol.cards) && !com.InArray(2, diffcol.cards) && com.InArray(12, diffcol.cards)) {
                    removedCard = diffcol.cards.splice(0, 1);
                    diffcol.cards.push(removedCard[0]);
                }
            }*/

           
            if(!com.InArray(13, diffcol.cards) && com.InArray(2, diffcol.cards) && !com.InArray(12, diffcol.cards) &&  eval(diffcol.cards[diffcol.cards.length-1]+1)  < 13){
                
                var k=eval(diffcol.cards[diffcol.cards.length-1]+1);

                needcard.push(diffcol.color[0]+"-"+eval(diffcol.cards[diffcol.cards.length-1]+1))

                if(eval(k+1) < 13){
                    needcard.push(diffcol.color[0]+"-"+eval(k+1))
                }else if(eval(diffcol.cards[0]-1) > 0){
                    needcard.push(diffcol.color[0]+"-"+eval(diffcol.cards[0]-1));
                }
            
            }else if(eval(diffcol.cards[0]-1) > 0){
                
                needcard.push(diffcol.color[0]+"-"+eval(diffcol.cards[0]-1));
                var k=eval(diffcol.cards[0]-1);

                if(eval(k-1) > 0){
                    needcard.push(diffcol.color[0]+"-"+eval(k-1))
                }else if(eval(diffcol.cards[diffcol.cards.length-1]+1)  < 13){
                    needcard.push(diffcol.color[0]+"-"+eval(diffcol.cards[diffcol.cards.length-1]+1));
                }
                
            }
        }else if(jokerCalss.gaptotwocardfortwojoker(set)){
            
            needcard=jokerCalss.needtogapcardfind(set)
            var diffcol=gamelogicClass.DiffColor(set)
           
                
            diffcol.cards.sort(function(e,f){
                return e - f;
            });

            if(needcard.length <= 1){

                if((!com.InArray(13, diffcol.cards) || !com.InArray(12, diffcol.cards)) && (com.InArray(2, diffcol.cards) || com.InArray(3, diffcol.cards)) && eval(diffcol.cards[diffcol.cards.length-1]+1)  < 13){
                    
                   
                    needcard.push(diffcol.color[0]+"-"+eval(diffcol.cards[diffcol.cards.length-1]+1))
                
                }else if(eval(diffcol.cards[0]-1) > 0){
                    
                    needcard.push(diffcol.color[0]+"-"+eval(diffcol.cards[0]-1));
             
                }
            }
        }else if(jokerCalss.threegapvalaset(set)){
           
            needcard=jokerCalss.needtogapcardfindforthree(set)

        }
        
        return needcard;
    },
    gaptotwocardfortwojoker:function(card){
        var a= gamelogicClass.DiffColor(card);  
        var flag = true;

        a.cards.sort(function(e, f) {
            return e - f
        }); //sorting the element in sequence

        //Adjust A - 1 in sorting       
       /* if (a.cards[0] == 1) {
            if ((!com.InArray(2, a.cards) || !com.InArray(3, a.cards) || !com.InArray(4, a.cards)) && (com.InArray(10, a.cards) || com.InArray(11, a.cards) || com.InArray(12, a.cards) || com.InArray(13, a.cards))) {
                removedCard = a.cards.splice(0, 1);
                a.cards.push(removedCard[0]);
            }
        }*/

        if (flag == true) {
            for (var x in a.color) {
                if (a.color[x] != a.color[0]) {
                    flag = false;
                    break;
                }
            }
        }
        var k=0;
        
        //special condition for Q,K,A       
        if (flag == true) {
            for(var i = 1; i < a.cards.length; i++) {
                
                if (a.cards[i] - a.cards[i - 1] == 1 || a.cards[i] - a.cards[i - 1] == 2 /*|| a.cards[i] - a.cards[i - 1] == -12 || a.cards[i] - a.cards[i - 1] == -11*/) {
                    
                    if(a.cards[i] - a.cards[i - 1] == 2)
                    {
                        
                        k++;
                    }

                    if(k >= 3){
                        flag=false
                        break;
                    }

                    flag = true;
                } else {
                    flag = false;
                    break;
                }
            }
        }

        return flag;
    },
    needtogapcardfindforthree:function(card){
        var a=gamelogicClass.DiffColor(card);   
        var flag = true;

        a.cards.sort(function(e, f) {
            return e - f
        }); //sorting the element in sequence

        //Adjust A - 1 in sorting       
       /* if (a.cards[0] == 1) {
            if ((!com.InArray(2, a.cards) || !com.InArray(3, a.cards) || !com.InArray(4, a.cards)) && (com.InArray(10, a.cards) || com.InArray(11, a.cards) || com.InArray(12, a.cards) || com.InArray(13, a.cards))) {
                removedCard = a.cards.splice(0, 1);
                a.cards.push(14);
            }
        }*/

        if (flag == true) {
            for (var x in a.color) {
                if (a.color[x] != a.color[0]) {
                    flag = false;
                    break;
                }
            }
        }

        var k=0;
        var needcard=[];

        //special condition for Q,K,A       
        if (flag == true) {
            for(var i = 1; i < a.cards.length; i++) {
                if (a.cards[i] - a.cards[i - 1] == 1 || a.cards[i] - a.cards[i - 1] == 2 ||  a.cards[i] - a.cards[i - 1] == 3 /*||a.cards[i] - a.cards[i - 1] == -12 || a.cards[i] - a.cards[i - 1] == -11*/) {
                    
                    if(a.cards[i] - a.cards[i - 1] == 3)
                    {
                            
                        needcard.push(a.color[0]+"-"+eval(a.cards[i-1]+1))
                        needcard.push(a.color[0]+"-"+eval(a.cards[i-1]+2))
                        
                       
                        k++;
                    }

                    if(k >= 2){
                        flag=false
                        break;
                    }

                    flag = true;
                } else {
                    flag = false;
                    break;
                }
            }
        }

        return needcard;
    },
    //joker hit card to find
    hitCardToJoker:(robotcard,spc)=>{

        if(!com.InArray('j-0',robotcard) && !com.InArray('j-1',robotcard)){
            return false;
        }

        var d=false;
        for(var i=0;i<=spc.length-1;i++){
            var needcard=jokerCalss.Needfirstcardset(spc[i]);


            var check=_.intersection(needcard,robotcard);

      
            if(needcard.length > 0 && check.length == 0){
               
                d=needcard;
                break;
            }

        }

        
            
        if(d){
           
            return "j-0-"+d[0].split('-')[0]+"-"+eval(parseInt(d[0].split('-')[1]));
        }


        for(var i=0;i<=spc.length-1;i++){


            var needcard= jokerCalss.Needsecondcardset(spc[i]);
            var check=_.intersection(needcard,robotcard);
            
            
            if(needcard.length > 0 && check.length == 0){
                
                d=needcard;
                break;
            }
        }

       
        if(d){
            
            if(d[0].split('-')[1] == 1)
            {
                return "j-0-"+d[0].split('-')[0]+"-13";
            }

            return "j-0-"+d[0].split('-')[0]+"-"+eval(d[0].split('-')[1]);
        
        }

        return false;
    },
    //hit card mate left (first  card to hit)
    Needfirstcardset:(set)=>{
        var needcard=[];
        var diffcol= gamelogicClass.DiffColor(set)
            
        if(gamelogicClass.RonForCheck(diffcol)){
            
            diffcol.cards.sort(function(e,f){
                return e - f;
            });

            //for(var i=2;i<=2;i++){     
            //Q K ace time sorting ma 1 is first so joker card hit time issue 1 - 0 is < 0 not hit so add condition 
                if(diffcol.cards[0] == 1 && com.InArray(13,diffcol.cards)){

                    needcard.push(diffcol.color[1]+"-"+eval(diffcol.cards[1]-1));    

                }else if(eval(diffcol.cards[0]-1) > 0){
                    needcard.push(diffcol.color[0]+"-"+eval(diffcol.cards[0]-1));
                }     
            //}
        }else if(gamelogicClass.TeenForCheck(diffcol)){
            
            diffcol.cards.sort(function(e,f){
                return e - f;
            });


            
            if( typeof diffcol.cards[0]){
                needcard.push("a-"+diffcol.cards[0]);
            }     

        }
        return needcard;
    },
    //hit card mate right (second  card to hit)
    Needsecondcardset:(set)=>{
        var needcard=[];
        var diffcol=gamelogicClass.DiffColor(set)
            
        if(gamelogicClass.RonForCheck(diffcol)){
            
            diffcol.cards.sort(function(e,f){
                return e - f;
            });
            
            //for(var i=1;i<=2;i++){
                if(eval(diffcol.cards[diffcol.cards.length-1]+1) <= 13){
                    needcard.push(diffcol.color[0]+"-"+eval(diffcol.cards[diffcol.cards.length-1]+1))
                }

                if(eval(diffcol.cards[diffcol.cards.length-1]-1) == 12){
                    needcard.push(diffcol.color[0]+"-1")
                }

            //}
        }
        return needcard;
    },
    jokercardmake:(cards)=>{

        var countforjoker=cards.filter((elem)=>{
              return  elem == 'j-0' || elem == 'j-1';
        })

        if(countforjoker.length == 1){
            
            cardset = [cards[cards.length-3],cards[cards.length-2]];

            needcard=[];

            var a=gamelogicClass.DiffColor(cardset);

            if(gamelogicClass.TeenForCheck(a)){
                var col=gamelogicClass.DiffColor(cardset);
                needcard.push("a-"+col.cards[0]+"-"+countforjoker[0])
            }else if(gamelogicClass.SequenceRonForCheck(a)){
                if(a.cards[0]-a.cards[1] == 1){ 
                    if(eval(a.cards[1]-1) > 0){
                      needcard.push(a.color[0]+"-"+eval(a.cards[1]-1)+"-"+countforjoker[0]);
                    }
                }else if(a.cards[0]-a.cards[1] == -1){ 

                    if(eval(a.cards[1]+1) <= 13){
                      needcard.push(a.color[0]+"-"+eval(a.cards[1]+1)+"-"+countforjoker[0]);
                    }
                }   
            }

            if(needcard.length > 0){
                cards.pop()
                cards = cards.concat(needcard)
            }
            
        }else{
              
            cardset = [cards[cards.length-4],cards[cards.length-3]];

            var color1=["l","k","c","f"];
          

            needcard=[];

            var a=gamelogicClass.DiffColor(cardset);

            if(gamelogicClass.SequenceRonForCheck(a)){
                if(a.cards[0]-a.cards[1] == 1){
                    if(eval(a.cards[1]-1) > 0){
                        needcard.push(a.color[0]+"-"+eval(a.cards[1]-1)+"-"+countforjoker[0]);
                        if(eval(parseInt(needcard[0].split('-')[1])-1) > 0){
                          needcard.push(a.color[0]+"-"+eval(parseInt(needcard[0].split('-')[1])-1)+"-"+countforjoker[1]);  
                        }
                    }
                }else if(a.cards[0]-a.cards[1] == -1){ 
                    if(eval(a.cards[1]+1) <= 13){
                        needcard.push(a.color[0]+"-"+eval(a.cards[1]+1)+"-"+countforjoker[0]);
                        //console.log("a.cards[0]-a.cards[1]",needcard[0].split('-')[1]+1)
                        if(eval(parseInt(needcard[0].split('-')[1])+1) <= 13){
                          needcard.push(a.color[0]+"-"+eval(parseInt(needcard[0].split('-')[1])+1)+"-"+countforjoker[1]);  
                        }
                    }
                }
            }

            if(needcard.length < 2){
                needcard = []
                //var col=gamelogicClass.DiffColor(cardset);
                needcard.push("a-"+cardset[cardset.length -1].split("-")[1]+'-'+countforjoker[0])
                needcard.push("a-"+cardset[cardset.length -1].split("-")[1]+'-'+countforjoker[1])
            }

            
            if(needcard.length > 0){
                cards.pop()
                cards.pop()
                cards = cards.concat(needcard)
            }
        }

        return cards;
    },
    RonForCheckJokerCard:(cards)=>{

        
        jokercard = cards.filter((elem)=>{
            return elem !== null && (elem.split("-")[0] == 'j' || elem.split("-")[2] == 'j')
        });

        cards = cards.filter((elem)=>{
            return elem !== null && elem.split("-")[0] != 'j'
        });

        cards = cards.filter((elem)=>{
            return elem !== null &&  elem.split("-")[2] != 'j'
        });
        
        if(jokercard.length == 1){
                
            return jokerCalss.gaptotwocard(cards)

        }else if(jokercard.length == 2){
            
            return jokerCalss.gaptotwocardfortwojoker(cards)

        }else{
            return false
        }
    },
    RonForCheckJokerCardonlynotuse:(cards)=>{ //j-0 joker card use not a f-1-j-0

        jokercard = cards.filter((elem)=>{
            return elem !== null && elem.split("-")[0] == 'j'
        });

        cards = cards.filter((elem)=>{
            return elem !== null && elem.split("-")[0] != 'j'
        });
        if(jokercard.length == 1){
                
            return jokerCalss.gaptotwocard(cards)

        }else if(jokercard.length == 2){
            
            return jokerCalss.gaptotwocardfortwojoker(cards)

        }else{
            return false
        }
    },
    CheckCardCasesmiddelofjoker:(cards)=>{
        
        /*jokercard = cards.filter((elem)=>{
            return elem !== null && (elem.split("-")[0] == 'j' || elem.split("-")[2] == 'j')
        });*/

        cards = cards.filter((elem)=>{
            return elem !== null && elem.split("-")[0] != 'j'
        });

        /*cards = cards.filter((elem)=>{
            return elem !== null &&  elem.split("-")[2] != 'j'
        });*/ 
        //Bcz [ 'c-9', 'c-10-j-1', 'c-11', 'c-12' ] remove this card  [ 'c-9', 'c-11', 'c-12' ] it not true

        if(gamelogicClass.CheckCardCases(cards)){
            return true;
        }else{
            return false;
        }
    },
    checkForRon:(startindex,cards)=>{
        
        
        if (startindex >= cards.length-2) {
           
            return false;
        }

        var SingleSpread = []
        SingleSpread.push(cards[startindex]);
        SingleSpread.push(cards[startindex + 1]);

        if (cdClass.GetcardColor(SingleSpread[0]) != "j" && cdClass.GetcardColor(SingleSpread[1]) != "j" &&  parseInt(SingleSpread[0].split("-")[1]) == parseInt(SingleSpread[1].split("-")[1])) {//joker avse tyare
            
            return false;
        }else if(
            (cdClass.GetcardColor(SingleSpread[0]) == "j" && (cdClass.GetcardValue(SingleSpread[1]) == 13 || cdClass.GetcardValue(SingleSpread[1]) == 1))
            || (SingleSpread.length > 2 && cdClass.GetcardColor(SingleSpread[0]) == "j" && cdClass.GetcardColor(SingleSpread[1]) == "j" && (cdClass.GetcardValue(SingleSpread[1]) == 13 || cdClass.GetcardValue(SingleSpread[1]) == 1) )
             ){
            
            return false;

        }

        var isJokerCenter = false;//starting na 2 card ne join kevanu k joker center ma che k nai
        var color = "";
        if (cdClass.GetcardColor(SingleSpread[0]) != "j" || cdClass.GetcardColor(SingleSpread[1]) != "j") {
            color = cdClass.GetcardColor(SingleSpread[0]) == "j" ? cdClass.GetcardColor(SingleSpread[1]) : cdClass.GetcardColor(SingleSpread[0]);
        }
        
        var  jokerCount = (color == "")? 2 : ((cdClass.GetcardColor(SingleSpread[0]) == "j") ? 1 : (cdClass.GetcardColor(SingleSpread[1]) == "j" ? 1 : 0));
        var  JokerUsed = 0;
        var  ActualIncr = 2;

        if (color !=  "") {

            isJokerCenter = (cdClass.GetcardColor(SingleSpread[0]) != "j")?true:false //!SingleSpread.get(0).contains("j");

            if (jokerCount == 0 && (cdClass.GetcardColor(SingleSpread[0]) != cdClass.GetcardColor(SingleSpread[1]) || 
              (Math.abs(cdClass.GetcardValue(SingleSpread[0]) - cdClass.GetcardValue(SingleSpread[1]))) != 1)) {
                
                return false;
            }

        } else {//starting ma 2 joker mala
            if ((startindex + 2) >= cards.length) {
                return false;
            }

            SingleSpread.push(cards[startindex + 2]);
            color = cdClass.GetcardColor(SingleSpread[2])
            JokerUsed = jokerCount;
            ActualIncr++;
        }

        var declared = false;
        var isPlus = (cdClass.GetcardValue(SingleSpread[1]) - cdClass.GetcardValue(SingleSpread[0]) > 0)?true:false;

        for (var  j = startindex + ActualIncr; j < cards.length; j++) {
            if (color == cdClass.GetcardColor(cards[j]) || cdClass.GetcardColor(cards[j]) == "j") {

                
                //middle ma scan larta joker male ne to aya handle thase
                if (cdClass.GetcardColor(cards[j]) == "j") {//CASE: c-6 c-5 c-4 j-0 c-3
                    jokerCount++;
                    isJokerCenter = true;
                    SingleSpread.push(cards[j]);
                    
                    if(SingleSpread.length >= 3 &&
                        (
                        (isPlus && cdClass.GetcardValue(SingleSpread[SingleSpread.length - 2]) == 13) 
                        || (!isPlus && cdClass.GetcardValue(SingleSpread[SingleSpread.length - 2]) == 1))

                            && cdClass.GetcardColor(SingleSpread[SingleSpread.length - 1]) == "j") {
                        SingleSpread.pop(); // Last joker hoi to pop
                        
                        break;
                    }

                    continue;
                }

                if (!declared) {
                    var copyspread = _.difference(SingleSpread,["j-0","j-1"])
                    copyspread.push(cards[j])
                   
                    if (copyspread.length < 2) {
                        continue;
                    } else {
                        declared = true;
                        isPlus = (cdClass.GetcardValue(copyspread[1]) - cdClass.GetcardValue(copyspread[0]) > 0)?true:false;

                    }
                }
                
                var comparevalue = (isPlus)?1:-1;
                var compareseconds = (isPlus)?2:-2;
                var comparethird = (isPlus)?3:-3;

               

                if ((JokerUsed == jokerCount || !isJokerCenter) && (cdClass.GetcardValue(cards[j]) - cdClass.GetcardValue(SingleSpread[SingleSpread.length -1]))  == comparevalue) {
                    SingleSpread.push(cards[j]);

                } else if (isJokerCenter && JokerUsed != jokerCount &&
                    (
                        (cdClass.GetcardColor(SingleSpread[SingleSpread.length - 2]) != "j" 
                        && (cdClass.GetcardValue(cards[j]) - cdClass.GetcardValue(SingleSpread[SingleSpread.length - 2]) == compareseconds)) 
                        ||//ek muki ne ek joker che
                        (JokerUsed == 0 
                        && jokerCount == 2 
                        && (cdClass.GetcardValue(cards[j]) - 
                        cdClass.GetcardValue(SingleSpread[SingleSpread.length - 3]) 
                        == comparethird)))) {//upra upri center ma joker che
                            
                    SingleSpread.push(cards[j]);
                    JokerUsed++;
                    //JokerUsed = (jokerCount == 2)?2:JokerUsed+1;
                } else {
                    break;
                }

            } else {
                break;
            }
        }
       
       if(SingleSpread.length >= 3){
            
            if(SingleSpread.length == 3 && 
                ((SingleSpread.indexOf("j-0") != -1 && SingleSpread.indexOf("j-1") != -1)
                    || (cdClass.GetcardColor(SingleSpread[2]) == "j" && cdClass.GetcardValue(SingleSpread[1]) == 1) || (cdClass.GetcardColor(SingleSpread[2]) == "j" && cdClass.GetcardValue(SingleSpread[1]) == 13))   
                    || cdClass.GetcardColor(SingleSpread[0]) == "j" && cdClass.GetcardColor(SingleSpread[1]) == "j" && !isPlus && cdClass.GetcardValue(SingleSpread[2]) == 12) {
                return false;
            }

            return true

        }

        return false;
    },
    checkForTin:(startindex,cards)=>{
        
        if (startindex >= cards.length-2) {
            return false;
        }
 
        var SingleSpread = []
        SingleSpread.push(cards[startindex]);
        SingleSpread.push(cards[startindex + 1]);

        if(cdClass.GetcardColor(SingleSpread[0]) != "j" && cdClass.GetcardColor(SingleSpread[1]) != "j" &&  cdClass.GetcardValue(SingleSpread[0]) != cdClass.GetcardValue(SingleSpread[1])) {//joker avse tyare
            return false;
        }

        //var value = (SingleSpread[0].split("-")[0] == "j") ? (SingleSpread[1].split("-")[0] == 'j')?0:parseInt(SingleSpread[1].split("-")[1]) : parseInt(SingleSpread[0].split("-")[1]);
        
        var value = -1;
        var counter = 2;

        if (cdClass.GetcardColor(SingleSpread[0]) == "j" && cdClass.GetcardColor(SingleSpread[1]) == "j") {
            if ((startindex + 2) >= cards.length) {
                return false;
            }
            counter++;
            SingleSpread.push(cards[startindex + 2]);
            value = cdClass.GetcardValue(cards[startindex + 2]);

        } else {
            value = (SingleSpread[0].split("-")[0] == "j") ? cdClass.GetcardValue(SingleSpread[1]) : cdClass.GetcardValue(SingleSpread[0]);
        }
        
        for (var j = startindex + counter; j < cards.length; j++) {
            
            if (value == cdClass.GetcardValue(cards[j]) || cdClass.GetcardColor(cards[j]) == 'j') {
                
                //middle ma scan larta joker male ne to aya handle thase
                if (cdClass.GetcardColor(cards[j]) == "j") {//CASE: c-6 c-5 c-4 j-0 c-3
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
            return true;
        }

        return false;
    }   
}