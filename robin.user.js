// ==UserScript==
// @name         Robin Grow
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Try to take over the world!
// @author       /u/mvartan
// @include      https://www.reddit.com/robin*
// @grant   GM_getValue
// @grant   GM_setValue
// ==/UserScript==
function addMins(date,mins) {
    var newDateObj = new Date(date.getTime() + mins*60000);
    return newDateObj;
}

function howLongLeft() { // mostly from /u/Yantrio
    var remainingMessageContainer = $(".robin--user-class--system:contains('approx')");
    if(remainingMessageContainer.length == 0) {
        // for cases where it says "soon" instead of a time on page load
        return 0;
    }
    var message = $(".robin-message--message", remainingMessageContainer).text();
    var time = new Date($(".robin--user-class--system:contains('approx') .robin-message--timestamp").attr("datetime"));
    try {
        var endTime = addMins(time,message.match(/\d+/)[0]);
        return Math.floor((endTime - new Date())/60/1000*10)/10;
    } catch(e){
        return 0;
    }

    //grab the timestamp from the first post and then calc the difference using the estimate it gives you on boot
}

(function() {
    'use strict';


    $("#robinVoteWidget").prepend("<div class='addon'><div class='timeleft robin-chat--vote' style='font-weight:bold;'></div></div>");
    $('.robin-chat--buttons').prepend("<div class='robin-chat--vote robin--vote-class--novote'><span class='robin--icon'></span><div class='robin-chat--vote-label'></div></div>");
    $('#robinVoteWidget .robin-chat--vote').css('padding', '5px');

    var timeStarted = new Date();
    var name = $(".robin-chat--room-name").text();
    function update() {
        $(".timeleft").text(howLongLeft()+" minutes remaining");
        $('#robinVoteWidget .robin--vote-class--increase .robin-chat--vote-label').html('grow<br>('+$(".robin-room-participant.robin--vote-class--increase").length+')');
        $('#robinVoteWidget .robin--vote-class--abandon .robin-chat--vote-label').html('abandon<br>('+$(".robin-room-participant.robin--vote-class--abandon").length+')');
        $('#robinVoteWidget .robin--vote-class--novote .robin-chat--vote-label').html('no vote<br>('+$(".robin-room-participant.robin--vote-class--novote").length+')');
        $('#robinVoteWidget .robin--vote-class--continue .robin-chat--vote-label').html('stay<br>('+$(".robin-room-participant.robin--vote-class--continue").length+')');

        var lastChatString = $(".robin-message--timestamp").last().attr("datetime");
        var timeSinceLastChat = new Date() - (new Date(lastChatString));
        var now = new Date();
        if(timeSinceLastChat !== undefined && (timeSinceLastChat > 60000 && now-timeStarted > 60000)) {
            window.location.reload(); // reload if we haven't seen any activity in a minute.
        }
        if($(".robin-message--message:contains('that is already your vote')").length === 0
		&& $(".robin-message--message:contains('Voting will end in approximately 31 minutes')").length === 0) {
            $(".text-counter-input").val("/vote grow").submit();
        }
		else if ($(".robin-message--message:contains('Voting will end in approximately 31 minutes')").length > 0) {
			$(".text-counter-input").val("/vote stay").submit();
		}

        // Try to join if not currently in a chat
        if ($("#joinRobinContainer").length) {
            $("#joinRobinContainer").click();
            setTimeout(function(){
                $("#joinRobin").click();
            }, 1000);
            return;
        }



    }
    update();

    if(GM_getValue("chatName") != name) {
        GM_setValue("chatName", name);
        setTimeout(function() {
            var x = "!", n=Math.floor(Math.random()*15); for(var i = 0; i < n; i++)x+="!";
            $(".text-counter-input").val("[Robin-Settle] I automatically voted to grow, then settle, and so can you! http://tiny.cc/e3khay "+x).submit();


        }, 10000);
    }

    setInterval(update, 1000);

})();
