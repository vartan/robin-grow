// ==UserScript==
// @name         Robin Grow
// @namespace    http://tampermonkey.net/
// @version      1.31
// @description  Try to take over the world!
// @author       /u/mvartan
// @include      https://www.reddit.com/robin*
// @updateURL    https://github.com/vartan/robin-grow/raw/master/robin.user.js
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

$("#robinDesktopNotifier").after('<div class="robin-chat--sidebar-widget" style="text-align:center;"><a target="_blank" href="https://github.com/vartan/robin-grow">robin-grow - Version ' + GM_info.script.version + '</a></div>')
$("#robinVoteWidget").prepend("<div class='addon'><div class='timeleft robin-chat--vote' style='font-weight:bold;'></div></div>");
$('.robin-chat--buttons').prepend("<div class='robin-chat--vote robin--vote-class--novote'><span class='robin--icon'></span><div class='robin-chat--vote-label'></div></div>");
$('#robinVoteWidget .robin-chat--vote').css('padding', '5px');

var timeStarted = new Date();
var name = $(".robin-chat--room-name").text();

function update() {
    $(".timeleft").text(howLongLeft()+" minutes remaining");

    var list = {}
    $.get("/robin/",function(a){
        var start = "{"+a.substring(a.indexOf("\"robin_user_list\": ["));
        var end = start.substring(0,start.indexOf("}]")+2)+"}";
        list = JSON.parse(end).robin_user_list;
        var increaseCount = list.filter(function(voter){return voter.vote === "INCREASE"}).length;
        var abandonCount = list.filter(function(voter){return voter.vote === "ABANDON"}).length;
        var novoteCount = list.filter(function(voter){return voter.vote === "NOVOTE"}).length;
        var continueCount = list.filter(function(voter){return voter.vote === "CONTINUE"}).length;
        $('#robinVoteWidget .robin--vote-class--increase .robin-chat--vote-label').html('grow<br>('+increaseCount+')');
        $('#robinVoteWidget .robin--vote-class--abandon .robin-chat--vote-label').html('abandon<br>('+abandonCount+')');
        $('#robinVoteWidget .robin--vote-class--novote .robin-chat--vote-label').html('no vote<br>('+novoteCount+')');
        $('#robinVoteWidget .robin--vote-class--continue .robin-chat--vote-label').html('stay<br>('+continueCount+')');
    });
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
    }
}

if(GM_getValue("chatName") != name) {
    GM_setValue("chatName", name);
    setTimeout(function() {
            $(".text-counter-input").val("[Robin-Grow] I automatically voted to grow, and so can you! http://redd.it/4cwk2s !").submit();
        }, 10000);
}

// hash string so finding spam doesn't take up too much memory
function hashString(str) {
    var hash = 0;

    if (str == 0) return hash;

    for (i = 0; i < str.length; i++) {
        char = str.charCodeAt(i);
        hash = ((hash<<5)-hash)+char;
        hash = hash & hash; // Convert to 32bit integer
    }

    return hash;
}

// Searches through all messages to find and hide spam
var spamCounts = {};

function findAndHideSpam() {
    $('.robin-message--message:not(.addon--hide)').each(function() {

        // skips over ones that have been hidden during this run of the loop
        var hash = hashString($(this).text());
        var user = $('.robin-message--from', $(this).closest('.robin-message')).text();

        if (!(user in spamCounts)) {
            spamCounts[user] = {};
        }

        if (hash in spamCounts[user]) {
            spamCounts[user][hash].count++;
            spamCounts[user][hash].elements.push(this);
        } else {
            spamCounts[user][hash] = {
                count: 1,
                text: $(this).text(),
                elements: [this]
            };
        }
    });

    $.each(spamCounts, function(user, messages) {
        $.each(messages, function(hash, message) {
            if (message.count >= 3) {
                $.each(message.elements, function(index, element) {
                    $(element).closest('.robin-message').addClass('addon--hide').hide();
                });
            } else {
                message.count = 0;
            }

            message.elements = [];
        });
    });
}

function removeSpam() {
    $(".robin-message").filter(function(num,message){
        return $(message).find(".robin-message--message").text().indexOf("[") === 0
			|| $(message).find(".robin-message--message").text().indexOf("Autovoter") > -1; // starts with a [ or has "Autovoter"
        }).hide();
}

setInterval(findAndHideSpam, 1000);
setInterval(removeSpam, 1000);
setInterval(update, 10000);
update();
