// ==UserScript==
// @name         Robin Grow
// @namespace    http://tampermonkey.net/
// @version      1.59
// @description  Try to take over the world!
// @author       /u/mvartan
// @include      https://www.reddit.com/robin*
// @updateURL    https://github.com/vartan/robin-grow/raw/master/robin.user.js
// @require       http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js
// @grant   GM_getValue
// @grant   GM_setValue
// ==/UserScript==
(function() {
    // Settings
    // DOM Setup begin
    $("#robinVoteWidget").append('<div class="addon"><div class="robin-chat--vote" style="font-weight: bold; padding: 5px;cursor: pointer;" id="openBtn">Open Settings</div></div>'); // Open Settings
    $(".robin-chat--sidebar").before('<div class="robin-chat--sidebar" style="display:none;" id="settingContainer"><div class="robin-chat--sidebar-widget robin-chat--vote-widget" id="settingContent"></div></div>'); // Setting container

    function openSettings() {
        $(".robin-chat--sidebar").hide();
        $("#settingContainer").show();
    }
    $("#openBtn").on("click", openSettings);

    function closeSettings() {
        $(".robin-chat--sidebar").show();
        $("#settingContainer").hide();
    }
    $("#settingContent").append('<div class="robin-chat--vote" style="font-weight: bold; padding: 5px;cursor: pointer;" id="closeBtn">Close Settings</div>');
    $("#closeBtn").on("click", closeSettings);
    // Dom Setup end
    function saveSetting(settings) {
        localStorage["robin-grow-settings"] = JSON.stringify(settings)
    }

    function loadSetting() {
        var setting = localStorage["robin-grow-settings"];
        if (setting) {
            setting = JSON.parse(setting);
        } else {
            setting = {};
        }
        return setting;
    }

    var settings = loadSetting();

    function addBoolSetting(name, description, defaultSetting) {
        $("#settingContent").append('<div class="robin-chat--sidebar-widget robin-chat--notification-widget"><label><input type="checkbox" name="setting-' + name + '">' + description + '</label></div>')
        $("input[name='setting-" + name + "']").on("click", function() {
            settings[name] = !settings[name];
            saveSetting(settings);
        });
        if (settings[name] !== undefined) {
            $("input[name='setting-" + name + "']").prop("checked", settings[name]);
        } else {
            settings[name] = defaultSetting;
        }
    }

    // Options begin
    addBoolSetting("removeSpam", "Remove bot spam", true);
    addBoolSetting("findAndHideSpam", "Removes messages that have been send more than 3 times", true);
    // Options end
    $("#robinDesktopNotifier").detach().appendTo("#settingContent");
    // Add version at the end
    $("#settingContent").append('<div class="robin-chat--sidebar-widget robin-chat--report" style="text-align:center;"><a target="_blank" href="https://github.com/vartan/robin-grow">robin-grow - Version ' + GM_info.script.version + '</a></div>');
    // Settings end

    if (!settings["vote"]) {
        settings["vote"] = "grow";
        saveSetting(settings);
    }

    var needToVote = true;

    function setVote(vote) {
        settings["vote"] = vote;
        saveSetting(settings);
        needToVote = true;
    }

    $(".robin--vote-class--abandon").on("click", function() {
        setVote("abandon")
    })

    $(".robin--vote-class--continue").on("click", function() {
        setVote("stay")
    })

    $(".robin--vote-class--increase").on("click", function() {
        setVote("grow")
    })

    function addMins(date, mins) {
        var newDateObj = new Date(date.getTime() + mins * 60000);
        return newDateObj;
    }

    var notif = new Audio("data:audio/mpeg;base64,SUQzAgAAAAAfdlRTUwAAEABMb2dpYyBQcm8gOC4wLjBDT00AAGgAZW5naVR1bk5PUk0AIDAwMDAwMDU4IDAwMDAwMDU4IDAwMDAwNEQ1IDAwMDAwNEQ1IDAwMDAwMUQ2IDAwMDAwMUQ2IDAwMDAyNjhDIDAwMDAyNjhDIDAwMDAwMEVCIDAwMDAwMEVCAENPTQAAggBlbmdpVHVuU01QQgAgMDAwMDAwMDAgMDAwMDAyMTAgMDAwMDA4NDggMDAwMDAwMDAwMDAwNTQyOCAwMDAwMDAwMCAwMDAwMUE4OCAwMDAwMDAwMCAwMDAwMDAwMCAwMDAwMDAwMCAwMDAwMDAwMCAwMDAwMDAwMCAwMDAwMDAwMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA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AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/7oEDUgABAAreDaRACCABW8G0iAECwCN4NDAAIFgEbwaGAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==");


    function howLongLeft() { // mostly from /u/Yantrio
        var remainingMessageContainer = $(".robin--user-class--system:contains('approx')");
        if (remainingMessageContainer.length == 0) {
            // for cases where it says "soon" instead of a time on page load
            return 0;
        }
        var message = $(".robin-message--message", remainingMessageContainer).text();
        var time = new Date($(".robin--user-class--system:contains('approx') .robin-message--timestamp").attr("datetime"));
        try {
            var endTime = addMins(time, message.match(/\d+/)[0]);
            return Math.floor((endTime - new Date()) / 60 / 1000 * 10) / 10;
        } catch (e) {
            return 0;
        }

        //grab the timestamp from the first post and then calc the difference using the estimate it gives you on boot
    }

    $("#robinVoteWidget").prepend("<div class='addon'><div class='usercount robin-chat--vote' style='font-weight:bold;pointer-events:none;'></div></div>");
    $("#robinVoteWidget").prepend("<div class='addon'><div class='timeleft robin-chat--vote' style='font-weight:bold;pointer-events:none;'></div></div>");
    $('.robin-chat--buttons').prepend("<div class='robin-chat--vote robin--vote-class--novote'><span class='robin--icon'></span><div class='robin-chat--vote-label'></div></div>");
    $('#robinVoteWidget .robin-chat--vote').css('padding', '5px');
    $('.robin--vote-class--novote').css('pointer-events', 'none');

    var timeStarted = new Date();
    var name = $(".robin-chat--room-name").text();

    function formatNumber(n) {
        var part = n.toString().split(".");
        part[0] = part[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return part.join(".");
    }

    function update(allMentionsCount) {
        $(".robin-chat--vote.robin--vote-class--increase:not('.robin--active')").click(); // fallback to click
        $(".timeleft").text(formatNumber(howLongLeft()) + " minutes remaining");
        var messages = $(".robin--user-class--user");
        for (var i = messages.length - 1000; i >= 0; i--) {
            $(messages[i]).remove()
        }
        var list = {}
        var users = 0
        $.get("/robin/", function(a) {
            var start = "{" + a.substring(a.indexOf("\"robin_user_list\": ["));
            var end = start.substring(0, start.indexOf("}]") + 2) + "}";
            list = JSON.parse(end).robin_user_list;
            var increaseCount = list.filter(function(voter) {
                return voter.vote === "INCREASE"
            }).length;
            var abandonCount = list.filter(function(voter) {
                return voter.vote === "ABANDON"
            }).length;
            var novoteCount = list.filter(function(voter) {
                return voter.vote === "NOVOTE"
            }).length;
            var continueCount = list.filter(function(voter) {
                return voter.vote === "CONTINUE"
            }).length;
            $('#robinVoteWidget .robin--vote-class--increase .robin-chat--vote-label').html('grow<br>(' + formatNumber(increaseCount) + ')');
            $('#robinVoteWidget .robin--vote-class--abandon .robin-chat--vote-label').html('abandon<br>(' + formatNumber(abandonCount) + ')');
            $('#robinVoteWidget .robin--vote-class--novote .robin-chat--vote-label').html('no vote<br>(' + formatNumber(novoteCount) + ')');
            $('#robinVoteWidget .robin--vote-class--continue .robin-chat--vote-label').html('stay<br>(' + formatNumber(continueCount) + ')');
            users = list.length;
            $(".usercount").text(formatNumber(users) + " users in chat");
        });
        var lastChatString = $(".robin-message--timestamp").last().attr("datetime");
        var timeSinceLastChat = new Date() - (new Date(lastChatString));
        var now = new Date();
        if (timeSinceLastChat !== undefined && (timeSinceLastChat > 60000 && now - timeStarted > 60000)) {
            window.location.reload(); // reload if we haven't seen any activity in a minute.
        }
        /*
        if ($(".robin-message--message:contains('that is already your vote')").length === 0) {
            var oldVal = $(".text-counter-input").val();
            $(".text-counter-input").val("/vote grow").submit();
            $(".text-counter-input").val(oldVal);
        }*/

        if ($(".robin-message--message:contains('that is already your vote')").length) {
            needToVote = false;
        }

        if (needToVote && $(".robin-message--message:contains('that is already your vote')").length === 0) {
            var oldVal = $(".text-counter-input").val();
            $(".text-counter-input").val("/vote " + settings["vote"]).submit();
            $(".text-counter-input").val(oldVal);
        }

        // Try to join if not currently in a chat
        if ($("#joinRobinContainer").length) {
            $("#joinRobinContainer").click();
            setTimeout(function() {
                $("#joinRobin").click();
            }, 1000);
        }
    }

    // credit to wwwroth

    // Let's ping a user if their name is mentioned.
    var currentUsersName = $('div#header span.user a').html();

    // Set the current amount of mentions for this check and compare it to the total mentions in chat log
    var currentMentionsCheck = 0;
    $('span.robin-message--message').each(function() {
        if ($(this).is(':contains("' + currentUsersName + '")')) {
            currentMentionsCheck++;
        }
    });
    if (currentMentionsCheck > allMentionsCount) {
        notif.play();
    }

    if (GM_getValue("chatName") != name) {
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
            if (str.charCodeAt(i) > 0x40) { // Let's try to not include the number in the hash in order to filter bots
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // Convert to 32bit integer
            }
        }

        return hash;
    }

    var messageCount = 0;

    function removeOldMsgs() {
        if (messageCount >= 1000) {
            var msg = document.getElementById("robinChatMessageList").children[0];
            $(msg).remove();

            messageCount--;
        }
    }

    // Searches through all messages to find and hide spam
    var spamCounts = {};

    function findAndHideSpam() {
        if (settings["findAndHideSpam"]) {
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

                            // Decrease global messageCount.
                            messageCount--;
                        });
                    } else {
                        message.count = 0;
                    }

                    message.elements = [];
                });
            });
        }
    }

    function removeSpam() {
        if (settings["removeSpam"]) {
            $(".robin--user-class--user").filter(function(num, message) {
                var text = $(message).find(".robin-message--message").text();
                var filter = text.indexOf("[") === 0 ||
                    text == "voted to STAY" ||
                    text == "voted to GROW" ||
                    text == "voted to ABANDON" ||
                    text.indexOf("Autovoter") > -1 ||
                    (/[\u0080-\uFFFF]/.test(text));

                ; // starts with a [ or has "Autovoter"
                // if(filter)console.log("removing "+text);
                return filter;
            }).remove();
        }
    }

    function isBotSpam(text) {
        // starts with a [, has "Autovoter", or is a vote
        var filter = text.indexOf("[") === 0 ||
            text == "voted to STAY" ||
            text == "voted to GROW" ||
            text == "voted to ABANDON" ||
            text.indexOf("Autovoter") > -1 ||
            /* Detects unicode spam - Credit to travelton
             * https://gist.github.com/travelton */
            (/[\u0080-\uFFFF]/.test(text));

        // if(filter)console.log("removing "+text);
        return filter;
    }

    // Individual mute button /u/verox-
    var targetNodes = $("#robinChatMessageList");
    var myObserver = new MutationObserver(mutationHandler);
    // XXX Shou: we should only need to watch childList, more can slow it down.
    var obsConfig = {
        childList: true
    };
    var mutedList = [];

    $(".robin--username").click(function() {
        var clickedUser = mutedList.indexOf($(this).text());

        if (clickedUser == -1) {
            // Mute our user.
            mutedList.push($(this).text());
            $(this).css("text-decoration", "line-through");
        } else {
            // Unmute our user.
            $(this).css("text-decoration", "none");
            mutedList.splice(clickedUser, 1);
        }
    });

    //--- Add a target node to the observer. Can only add one node at a time.
    targetNodes.each(function() {
        myObserver.observe(this, obsConfig);
    });

    function mutationHandler(mutationRecords) {
        mutationRecords.forEach(function(mutation) {
            var jq = $(mutation.addedNodes);

            // There are nodes added
            if (jq.length > 0) {
                // Mute user

                // cool we have a message.
                var thisUser = $(jq[0] && jq[0].children[1]).text();

                // Check if the user is muted.
                if (mutedList.indexOf(thisUser) >= 0) {
                    // He is, hide the message.
                    $(jq[0]).hide();
                } else {
                    // He isn't register an EH to mute the user on name-click.
                    $(jq[0].children[1]).click(function() {
                        // Check the user actually wants to mute this person.
                        if (confirm('You are about to mute ' + $(this).text() + ". Press OK to confirm.")) {
                            // Mute our user.
                            mutedList.push($(this).text());
                            $(this).css("text-decoration", "line-through");
                            $(this).hide();
                        }

                        // Output currently muted people in the console for debuggery.
                        // console.log(mutedList);
                    });
                }
            }
        });
    }

    setInterval(update, 10000);
    update();

})();
