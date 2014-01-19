//for more information and a tutorial visit: http://filtered.com/blog/post/i/learn-how-to-add-interactive-closed-captions-to-your-videos

var readyArray = new Array();
var captionsArray = new Array();
captionsArray['player1'] = new Array(); //assuming your vimeo video url contains ?api=1&player_id=YOUR_PLAYER_ID

$(document).ready(function() {

	// Listen for messages from the player
	if (window.addEventListener){
	    window.addEventListener('message', onMessageReceived, false);
	} else {
	    window.attachEvent('onmessage', onMessageReceived, false);
	}
	
	// Handle messages received from the player
	function onMessageReceived(e) {
	    var data = JSON.parse(e.data);
	    switch (data.event) {
	        case 'ready':
	            onReady();
	            break;
	        case 'playProgress':
	            onPlayProgress(data.data,data.player_id);
	            break;
	    }
	    //console.log(e);
	}
	
	
	// Helper function for sending a message to the player
	function post(action, value) {
	    var data = { method: action };
	    if (value) {
	        data.value = value;
	    }   
	     
	    $('.players').each(function(){
		    $(this)[0].contentWindow.postMessage(JSON.stringify(data), $(this).attr('src').split('?')[0]);
	    });
	}
	
	function onReady() {
	    post('addEventListener', 'playProgress');
	}
	
	function onPlayProgress(data,player_id) {
		var currentSecond = (data.seconds).toFixed(0);
		var currentSecondFormatted = convertToTime(currentSecond);
	    
	    var videoId = $("#"+player_id).data("videoid");
	    
	    if(captionsArray[player_id][0] == undefined){
		    loadCaptionFile(player_id,videoId);
		    console.log(captionsArray[player_id]);
	    }
	    //console.log(captionsArray[player_id][0]);
	    
	    for(var i=0;i<captionsArray[player_id].length;i++){
	    	var captionTitle = captionsArray[player_id][i][2]; //get the title of each caption
	    	var captionStartTime = captionsArray[player_id][i][0];
	    	captionStartTime = captionStartTime.split(":");
	    	captionStartTimeSecs = captionStartTime[1].split(".");
	    	captionStartTimeInSeconds = (parseInt(captionStartTime[0]) * 60) + parseInt(captionStartTimeSecs[0]);
	    	
	    	var captionEndTime = captionsArray[player_id][i][1];
	    	captionEndTime = captionEndTime.split(":");
	    	captionEndTimeSecs = captionEndTime[1].split(".");
	    	captionEndTimeInSeconds = (parseInt(captionEndTime[0]) * 60) + parseInt(captionEndTimeSecs[0]);
	    	
	    	if(currentSecond >= captionStartTimeInSeconds && currentSecond < captionEndTimeInSeconds){
	    		$("#" + player_id + "_status").html("<p>" + captionTitle + "</p>");
	    		
	    	}
	    }
	}
	
	function loadCaptionFile(player_id,videoId){
	    //get captions file
	    $.ajax({
		    url : "/videos/subtitles/" + videoId + ".vtt",
		    dataType: "text",
		    success : function (data) {
		        var mySubtitle = data.replace('WEBVTT\n', '');
		        mySubtitle = mySubtitle.replace('\n', '');
		        mySubtitle = mySubtitle.replace(/\n/g,'||||');
		        mySubtitle = mySubtitle.split("||||");
		        //$(".test11").html(mySubtitle[3]);
		        //remove empty elements fomr array
		        var newArray = new Array();
		        var count = 0;
		        for(var i=0;i<mySubtitle.length;i++){
			        if(mySubtitle[i] != "" && mySubtitle[i] != " "){
				        newArray[count] = mySubtitle[i];
				        count++;
			        }
			    }
			    var count = 0;
			    for(var i=0;i<(newArray.length-1);i+=2){
			    	var times = newArray[i].split(" --> ");
			    	readyArray[count] = new Array(times[0],times[1],newArray[i+1]);
			    	captionsArray[player_id][count] = new Array(times[0],times[1],newArray[i+1]);
			    	count++;
			    }
		    }
		});
	}
	
	function convertToTime(seconds){
		var minutes = "00";
		
		if(seconds > 59){
			minues = (seconds / 60).toFixed(0);
			seconds = seconds % 60;
			if(minues < 10){
				minutes = "0" + minues;
			}
		}
		
		if(seconds < 10){
			seconds = "0" + seconds;
		}
		
		return minutes + ":" + seconds + ".000";
	}

});