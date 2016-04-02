// ==UserScript==
// @name         Robin Grow
// @namespace    http://tampermonkey.net/
// @version      1.55
// @description  Try to take over the world!
// @author       /u/mvartan
// @include      https://www.reddit.com/robin*
// @updateURL    https://github.com/vartan/robin-grow/raw/master/robin.user.js
// @require       http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js
// @grant   GM_getValue
// @grant   GM_setValue
// ==/UserScript==

// Audio source for ping when a user is mentioned.
var beep = new  Audio("data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");

(function() {
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

    function update(allMentionsCount) {
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
            var oldVal = $(".text-counter-input").val();
            $(".text-counter-input").val("/vote grow").submit();
            $(".text-counter-input").val(oldVal);
        }

        // Try to join if not currently in a chat
        if ($("#joinRobinContainer").length) {
            $("#joinRobinContainer").click();
            setTimeout(function(){
                $("#joinRobin").click();
            }, 1000);
        }

        // Let's ping a user if their name is mentioned.
        var currentUsersName = $('div#header span.user a').html();

        // Set the current amount of mentions for this check and compare it to the total mentions in chat log
        var currentMentionsCheck = 0;
        $('span.robin-message--message').each(function(){
            if ($(this).is(':contains("'+currentUsersName+'")')) {
                currentMentionsCheck++;
            }
        });
        if (currentMentionsCheck > allMentionsCount) {
            console.log(currentMentionsCheck + " > " . allMentionsCount)
            console.log('beep');
            beep.play();
        }
    }

    if(GM_getValue("chatName") != name) {
        GM_setValue("chatName", name);
        setTimeout(function() {
            var oldVal = $(".text-counter-input").val();

            $(".text-counter-input").val("[Robin-Grow] I automatically voted to grow, and so can you! http://redd.it/4cwk2s !").submit();
            $(".text-counter-input").val(oldVal);

        }, 10000);
    }

// hash string so finding spam doesn't take up too much memory
    function hashString(str) {
        var hash = 0;

        if (str == 0) return hash;

        for (i = 0; i < str.length; i++) {
            char = str.charCodeAt(i);
            if(str.charCodeAt(i) >  0x40) { // Let's try to not include the number in the hash in order to filter bots
                hash = ((hash<<5)-hash)+char;
                hash = hash & hash; // Convert to 32bit integer
            }
        }

        return hash;
    }

// Searches through all messages to find and hide spam
    var spamCounts = {};

    function findAndHideSpam() {
        var messages = $(".robin--user-class--user");
        for(var i = messages.length-1000; i >= 0; i--) {
            $(messages[i]).remove()
        }
        $('.robin--user-class--user .robin-message--message:not(.addon--hide)').each(function() {
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
                        //console.log("SPAM REMOVE: "+$(element).closest('.robin-message').text())
                        $(element).closest('.robin-message').addClass('addon--hide').remove();
                    });
                } else {
                    message.count = 0;
                }

                message.elements = [];
            });
        });
    }




    function removeSpam() {
        $(".robin--user-class--user").filter(function(num,message){
            var text = $(message).find(".robin-message--message").text();
            var filter = text.indexOf("[") === 0
                || text == "voted to STAY"
                || text == "voted to GROW"
                || text == "voted to ABANDON"
                || text.indexOf("Autovoter") > -1
                || (/[\u0080-\uFFFF]/.test(text));

            ; // starts with a [ or has "Autovoter"
            // if(filter)console.log("removing "+text);
            return filter;
        }).remove();
    }

    /* Detects unicode spam - Credit to travelton (https://gist.github.com/travelton)*/
    $(document).on('DOMNodeInserted', function(e) {
        findAndHideSpam();
        removeSpam();
    });

    setInterval(update, 10000);
    update();

})();
