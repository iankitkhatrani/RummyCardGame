/*process.on('uncaughtException', (err) => {
    console.log("err::---->>>>",err);
});*/

var valArr = ['string', 'number'];
module.exports = {
    ValiDate: (request, client) => {
        if (typeof db == 'undefined')
            return false;

        var data = (request.data == null) ? {} : request.data;
        var en = request.en;
        var clientuid = (typeof client.uid != 'string' || client.uid == null || client.uid.length != 24)
        
        //here we validate all the parameters with it's actual type.
        var fl = true;

        switch (en) {
            case 'SP':
                if (
                    (data.ult == 'FB' && (typeof data.fid == 'undefined' || data.fid == null || data.fid == ""))
                    //|| (data.ult == 'guest' && (typeof data.player_id == 'undefined' || data.player_id == null || data.player_id == ""))
                    || (data.ult == 'google' && (typeof data.gid == 'undefined' || data.gid == null || data.gid == ""))
                ) {

                    fl = false;
                }
                break;

            case "HDD"://
            case "MDB"://make Daily bonus
            case "CDB"://collect Daily bonus 
            case "MB"://Magic Bonus
            case "CMB"://Collect Magic bonus
            case "GGD"://Get Gift Data 
            case "SGTU"://Send Gift To User
            case "VR":
            case "NC":
            case "ITP":
            case "ND":
            case "RND":
            case "RNID":
            case "HN":
            case "OUP":
            case "MP":
            case "JTOF":
            case "UUP":
            case "LT":
            case "PT":
            case "RFR":
            case "RGTI":
            case "TRGTI":
            case "QUD":
            case "SPINWIN":
            case "JTOGR":
            case "RGR":
            case "MBV":
            case "UENG":
            case "TS":
            case "ULGS":
            case "ST":
            case "EGT":
            case "DWV":
            case "WWL":
            case "IS":
            case "GMAM"://Get My All Message
            case "DCM"://Delete Chat message
            case "SORT":
            case "PC":
            case "BH":
            case "FFBU":
            case "ULGSN":
            case "LB":
            case "GLL":
            case "LTD":
            case "OTN":
            case "LLTI":
            case "EO":
            case "GSEO":
            case "LI":
            case "LLA":
            case "CR":
            case "GHB":
            case "UHT":
            case "GQD":
            case "GQBC":
            case "SHG":
            case "TA":
            case "GCTGEMS":
            case "HPG":
            case "ED":
            case "JE":
            case "RJOIN":
            case "ECSR":
            case "ECR":
            case "GLS":
            case "PlaySPIN":
            case "UPI":
            case "UPF":
            case "ULSF":
            case "SPG":
            case "DWL":
            case "CSNHG":
            case "CHLG":
            case "RJMINI":
            case "SU":
            case 'GS'://Gold Store
            case 'GEMSS'://Gems Stroe
            case 'UPT'://unlock vip
            case "NOTESS":
            case "NBS":
            case 'SSAH'://start spades and heart game
            case 'UserTurn'://user Turn to card is heart or spades
            case 'CWA'://Collect win Amount
            case 'SHLG': //Start Game Hi LO 
            case 'UserTurnHILO': //User Turn HI LO
            case 'CWAHILO': //hi lo 
            case "GL"://guest Login
            case 'CVIP'://Check Vip Private table 
            case "SB": //score data,
            case "SFR"://Send freinds request 
            case 'ITPL'://Invite Table Playing List  
            case 'BU'://Block User
            case 'UBU'://UnBlock User
            case 'RF'://Remove Freind
            case 'OFC'://Online freinds list
            case 'MUP'://Manage User Profile
            case 'AL'://Avatar List
            case 'PA'://Purchase Avatar List
            case 'VLD'://Vip Level Data
            case 'UGH'://User Golds History
            case 'VCD'://Vip Club data
            case "LOPT": // List Of Playing Table 
			case "PLAYGAME":
			case "EG": //exit game
			case "PFCD"://pick from closed deck
			case 'TC': //throw card
			case "PFOD"://pick from open deck			
			case 'CPT'://Create private table  		
			case "PASS":
			case "KNOCK":
			case "GIN":
			case "PFODPU":
			case "BIGGIN":
			case "EGS": //Exit Game Star Player
			case "DLT"://DLT Delete Live Table
			case "LOTS":
			case "NCTS":
			case "NCTH":
			case "NWWL":
			case "COT"://Chat On Table
			case "URMC"://unread message count
			case "OCH"://Old chat history
			case "QSPIN": //quest spin
			case "QB": //quest bonus
			case "QVIP": //quest vip 
			case "SGTUNEW":
			case "VBN":
			case "CVB":
			case 'HPGEMS'://GEMS Buy
			case "HPNOTES":
			case "FGS":
			case "HPLEAF":
			case "QBC":
			case "IPG":
			case "FLC":
			case "SMI":
			case "HEART":
			case "SSD":
			case "MGE":
			case "MGSPIN":
			case "CSPIN":
			case "FGE":
			case "FGSPIN":
			case "CFSPIN":
			case "MI":
			case "CRC":
			case "MIA":
			case "CMR":
			case "LS":
			case "CLSB":
			case "GHL":
			case "CRH":
			case "LD":
			case "CSTC":
			case "SC":
			case "SCT": //Start Card Time 
			case "STOPC":
			case "SPL":
			case "JSP":
			case "TMD":
			case "TMCR":
			case "UNTC":
			case "OTC":
			case "TCCR":
			case "TCST":
			case "RTC":
			case "SCR":
			case "AI": //Achievements Info
			case "ARC": //Achievements Reward Claim
            case "GTD":
            case "PTHEME":
            case "STHEME":
            case "EXTHEME":
            case "PAYTHEME":
            case "GGF":
            case "SGF": 
            case "ILS":
            case "ICS":
                if (clientuid) {
                  
                    fl = false;
                }
                break;

            default:
                fl = true;
                break;
        }

        return fl;
    }

}