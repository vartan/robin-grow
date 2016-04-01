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


    $(".robin-chat--sidebar").prepend("<div class='addon' style='font-size:15pt;display:block;'><div class='grows'></div><div class='stays'></div><div class='abandons'></div><div class='novote'></div><div class='timeleft'></div></div>");
    var timeStarted = new Date();

    function addParticipants(){
        var buttons=document.getElementById("robinVoteWidget");
        if (!document.getElementById("participants")){
            buttons.innerHTML+="<div id='participants' class 'addon user-count'></div>";
        }
        document.getElementById("participants").innerText="Users in Chat: "+document.getElementsByClassName("robin-room-participant").length;
    }

    function writeToButton(str,count){
        var button= document.getElementsByClassName("robin-chat--vote-"+str)[0];
        if (!document.getElementById(str+"-count")){
            button.innerHTML+="<br><span id='"+str+"-count' class='addon vote-count'></span>";
        }
        document.getElementById(str+"-count").innerText=count;
    }

    function update() {
        $(".timeleft").text(howLongLeft()+" minutes remaining");
        writeToButton("abandon",$(".robin-room-participant.robin--vote-class--abandon").length);
        writeToButton("continue",$(".robin-room-participant.robin--vote-class--continue").length);
        writeToButton("increase",$(".robin-room-participant.robin--vote-class--increase").length);
        $(".addon .novote").text("No Vote: "+$(".robin-room-participant.robin--vote-class--novote").length);

        var lastChatString = $(".robin-message--timestamp").last().attr("datetime");
        var timeSinceLastChat = new Date() - (new Date(lastChatString));
        var now = new Date();
        if(timeSinceLastChat !== undefined && (timeSinceLastChat > 60000 && now-timeStarted > 60000)) {
            window.location.reload(); // reload if we haven't seen any activity in a minute.
        }
        if($(".robin-message--message:contains('that is already your vote')").length === 0) {
            $(".text-counter-input").val("/vote grow").submit();
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


setTimeout(function() {
    var x = "!", n=Math.floor(Math.random()*15); for(var i = 0; i < n; i++)x+="!";
            $(".text-counter-input").val("[Robin-Grow] I automatically voted to grow, and so can you! http://redd.it/4cwk2s "+x).submit();


}, 10000);
setInterval(update, 1000);

})();
