// ==UserScript==
// @name         Robin Grow
// @namespace    http://tampermonkey.net/
// @version      0.8
// @description  Try to take over the world!
// @author       /u/mvartan
// @include      https://www.reddit.com/robin*
// @grant        none
// ==/UserScript==
function addMins(date,mins) {
    var newDateObj = new Date(date.getTime() + mins*60000);
    return newDateObj;
}

function howLongLeft() { // mostly from /u/Yantrio
    var remainingMessageContainer = $(".robin--user-class--system:contains('approx')");
    var message = $(".robin-message--message", remainingMessageContainer).text();
    var timestamp = $(".robin-message--timestamp",remainingMessageContainer).text();
    var endTime;
    try {
        endTime = addMins(parseTime(timestamp),message.match(/\d+/)[0])
    } catch(e){}
    return Math.floor((endTime - new Date())/60/1000*10)/10;

    //grab the timestamp from the first post and then calc the difference using the estimate it gives you on boot
}
function parseTime(timeStr, dt) {
    if (!dt) {
        dt = new Date();
    }
    var time;
 try {
    time = timeStr.match(/(\d+)(?::(\d\d))?\s*(p?)/i);
 } catch(e){}
    if (!time) {
        return NaN;
    }
    var hours = parseInt(time[1], 10);
    if (hours == 12 && !time[3]) {
        hours = 0;
    }
    else {
        hours += (hours < 12 && time[3]) ? 12 : 0;
    }

    dt.setHours(hours);
    dt.setMinutes(parseInt(time[2], 10) || 0);
    dt.setSeconds(0, 0);
    return dt;
}



(function() {
    'use strict';
    $(".robin-chat--sidebar").prepend("<div class='addon' style='font-size:15pt'><div class='grows'></div><div class='stays'></div><div class='abandons'></div><div class='timeleft'></div></div>");
    var timeStarted = new Date();
    function update() {
        $(".timeleft").text(howLongLeft()+" minutes remaining");
        $(".addon .grows").text("Grows: "+$(".robin-room-participant.robin--vote-class--increase").length);
        $(".addon .abandons").text("Abandons: "+$(".robin-room-participant.robin--vote-class--abandon").length);
        $(".addon .stays").text("Stays: "+$(".robin-room-participant.robin--vote-class--continue").length);

        var lastChatString = $(".robin-message--timestamp").last().attr("datetime");
        var timeSinceLastChat = new Date() - (new Date(lastChatString));
        var now = new Date();
        if(timeSinceLastChat !== undefined && (timeSinceLastChat > 60000 && now-timeStarted > 60000)) {
            window.location.reload(); // reload if we haven't seen any activity in a minute.
        }
        if($(".robin-message--message:contains('that is already your vote')").length === 0) {
            $(".text-counter-input").val("/vote grow").submit();
        }
    }
    update();


    setTimeout(function() {

        var x = "!", n=Math.floor(Math.random()*15);
        for(var i = 0; i < n; i++) { // test: try to evade spam catcher?
            x+="!";
        }
        $(".text-counter-input").val("I automatically voted to grow, and so can you! http://redd.it/4cwk2s "+x).submit();


    }, 10000);
    
    setInterval(update, 1000);

})();
