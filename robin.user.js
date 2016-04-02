// ==UserScript==
// @name         Robin Grow
// @namespace    http://tampermonkey.net/
// @version      1.661
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

    function hasChannel(source, channel) {
        channel = String(channel).toLowerCase();
        return String(source).toLowerCase().startsWith(channel);
    }

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
        localStorage["robin-grow-settings"] = JSON.stringify(settings);
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

        defaultSetting = settings[name] || defaultSetting;

        $("#settingContent").append('<div class="robin-chat--sidebar-widget robin-chat--notification-widget"><label><input type="checkbox" name="setting-' + name + '">' + description + '</label></div>');
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

    function addInputSetting(name, description, defaultSetting) {

        defaultSetting = settings[name] || defaultSetting;

        $("#settingContent").append('<div id="robinDesktopNotifier" class="robin-chat--sidebar-widget robin-chat--notification-widget"><label><input type="text" name="setting-' + name + '">' + description + '</label></div>');
        $("input[name='setting-" + name + "']").prop("defaultValue", defaultSetting)
            .on("change", function() {
                settings[name] = $(this).val();
                saveSetting(settings);
            });
        settings[name] = defaultSetting;
    }

    // Options begin
    addBoolSetting("removeSpam", "Remove bot spam", true);
    addBoolSetting("findAndHideSpam", "Removes messages that have been send more than 3 times", true);
    addInputSetting("channel", "Channel filter", "");
    addBoolSetting("filterChannel", "Filter by channel", false);
    // Options end
    $("#robinDesktopNotifier").detach().appendTo("#settingContent");
    // Add version at the end
    $("#settingContent").append('<div class="robin-chat--sidebar-widget robin-chat--report" style="text-align:center;"><a target="_blank" href="https://github.com/vartan/robin-grow">robin-grow - Version ' + GM_info.script.version + '</a></div>');
    // Settings end

    if (!settings["vote"]) {
        settings["vote"] = "grow";
        saveSetting(settings);
    }

    function setVote(vote) {
        settings["vote"] = vote;
        saveSetting(settings);
    }

    $(".robin--vote-class--abandon").on("click", function() {
        setVote("abandon");
    });

    $(".robin--vote-class--continue").on("click", function() {
        setVote("stay");
    });

    $(".robin--vote-class--increase").on("click", function() {
        setVote("grow");
    });

    function addMins(date, mins) {
        var newDateObj = new Date(date.getTime() + mins * 60000);
        return newDateObj;
    }

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
    var list = {};
    $(".text-counter-input").keydown(function(e) {
        console.log('keyup called');
        var text = $(".text-counter-input").val();
        var code = e.keyCode || e.which;
        if (code == '9') {
            var nameParts = text.split(" ");
            var namePart = nameParts[nameParts.length-1].toLowerCase();
            var allNames = list.map(function(a){return a.name;});
            console.log(allNames);
            for(var i = 0; i < allNames.length; i++) {
                if(allNames[i].toLowerCase().indexOf(namePart) == 0) {
                    var goodText = "";
                    for(var j = 0; j < nameParts.length-1; j++) {
                        goodText = goodText+nameParts[j]+" ";
                    }
                    goodText = goodText+allNames[i];
                    $(".text-counter-input").val(goodText);
                    break;
                }
            }
        }
    });
    function update() {
        switch(settings["vote"]) {
            case "abandon":
                $(".robin-chat--vote.robin--vote-class--abandon:not('.robin--active')").click();
                break;
            case "stay":
                $(".robin-chat--vote.robin--vote-class--continue:not('.robin--active')").click();
                break;
            case "grow":
            default:
                $(".robin-chat--vote.robin--vote-class--increase:not('.robin--active')").click();
                break;
        }
        $(".timeleft").text(formatNumber(howLongLeft()) + " minutes remaining");

        var users = 0;
        $.get("/robin/", function(a) {
            var start = "{" + a.substring(a.indexOf("\"robin_user_list\": ["));
            var end = start.substring(0, start.indexOf("}]") + 2) + "}";
            list = JSON.parse(end).robin_user_list;
            var increaseCount = list.filter(function(voter) {
                return voter.vote === "INCREASE";
            }).length;
            var abandonCount = list.filter(function(voter) {
                return voter.vote === "ABANDON";
            }).length;
            var novoteCount = list.filter(function(voter) {
                return voter.vote === "NOVOTE";
            }).length;
            var continueCount = list.filter(function(voter) {
                return voter.vote === "CONTINUE";
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

        // Try to join if not currently in a chat
        if ($("#joinRobinContainer").length) {
            $("#joinRobinContainer").click();
            setTimeout(function() {
                $("#joinRobin").click();
            }, 1000);
        }
    }

    // credit to wwwroth for idea
    // i think this method is better

    var notif = new Audio("https://slack.global.ssl.fastly.net/dfc0/sounds/push/knock_brush.mp3");

    var currentUsersName = $('div#header span.user a').html();

    $('#robinChatMessageList').on('DOMNodeInserted', function (e) {
        if ($(e.target).is('.robin--message-class--message.robin--user-class--user')) {
            console.log("got new message");
            if ($(".robin--message-class--message.robin--user-class--user").last().is(':contains("'+currentUsersName+'")')) {
                $(".robin--message-class--message.robin--user-class--user").last().css("background","orangered").css("color","white");
                notif.play();
                console.log("got new mention");
            }
        }
    });

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

    // Searches through all messages to find and hide spam
    var spamCounts = {};

    function findAndHideSpam() {
        if (settings["findAndHideSpam"]) {
            var messages = $(".robin--user-class--user");
            for (var i = messages.length - 1000; i >= 0; i--) {
                $(messages[i]).remove();
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
    }

    function filterMessages() {

        $(".robin--user-class--user").filter(function(num, message) {
            var text = $(message).find(".robin-message--message").text();

            if (settings["removeSpam"] && (text.indexOf("[") === 0 ||
                    text == "voted to STAY" ||
                    text == "voted to GROW" ||
                    text == "voted to ABANDON" ||
                    text.indexOf("Autovoter") > -1 ||
                    (/[\u0080-\uFFFF]/.test(text)))) {

                return true;
            }

            if(settings['filterChannel'] &&
                String(settings['channel']).length > 0 &&
                !hasChannel($(message).find(".robin-message--message").text(), settings['channel'])) {
                return true;
            }

            return false;

        }).remove();

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
            findAndHideSpam();
            var jq = $(mutation.addedNodes);
            var $messageUser = $(jq[0] && jq[0].children && jq[0].children[1]);
            var $messageText = $(jq[0] && jq[0].children && jq[0].children[2]);
            console.log("Mutation.");
            // There are nodes added
            if (jq.length > 0) {
                // Mute user
                console.log("Have message");
                // cool we have a message.
                var thisUser = $messageUser.text();
                var message = $messageText.text();
                console.log(thisUser);
                // Check if the user is muted.
                if (mutedList.indexOf(thisUser) >= 0 || isBotSpam(message)) {
                    // He is, hide the message.
                    $(jq[0]).remove();
                } else {
                    // He isn't register an EH to mute the user on name-click.
                    $messageUser.click(function() {
                        // Check the user actually wants to mute this person.
                        var shouldMute = confirm('You are about to mute ' + $(this).text() + ". Press OK to confirm.");
                        if (shouldMute) {
                            // Mute our user.
                            mutedList.push($(this).text());
                            $(this).css("text-decoration", "line-through");
                            $(this).hide();
                        }

                        // Output currently muted people in the console for debuggery.
                        // console.log(mutedList);
                    });

                }

                //// He isn't register an EH to mute the user on name-click.
                //$(jq[0].children[1]).click(function() {
                //    // Check the user actually wants to mute this person.
                //    if (confirm('You are about to mute ' + $(this).text() + ". Press OK to confirm.")) {
                //        // Mute our user.
                //        mutedList.push($(this).text());
                //        $(this).css("text-decoration", "line-through");
                //        $(this).remove();
                //    }

                //    // Output currently muted people in the console for debuggery.
                //    // console.log(mutedList);
                //});

                filterMessages();
            }
        });
    }

    function openSettings() {
        $(".robin-chat--sidebar").hide();
        $("#settingContainer").show();
    }
    $("#openBtn").on("click", openSettings);

    function closeSettings() {
        $(".robin-chat--sidebar").show();
        $("#settingContainer").hide();
    }

    function saveSetting(settings) {
        localStorage["robin-grow-settings"] = JSON.stringify(settings);
    }

    function loadSetting() {
        var setting = localStorage["robin-grow-settings"];
        if(setting) {
            setting = JSON.parse(setting);
        } else {
            setting = {};
        }
        return setting;
    }

    var settings = loadSetting();

    function addBoolSetting(name, description, defaultSetting) {
        $("#settingContent").append('<div id="robinDesktopNotifier" class="robin-chat--sidebar-widget robin-chat--notification-widget"><label><input type="checkbox" name="setting-' + name + '">' + description + '</label></div>');
        $("input[name='setting-" + name + "']").prop("checked", defaultSetting)
            .on("click", function() {
                settings[name] = !settings[name];
                saveSetting(settings);
            });
        settings[name] = defaultSetting;
    }

    setInterval(update, 10000);
    update();

    var flairColor = [
        '#e50000', // red
        '#db8e00', // orange
        '#ccc100', // yellow
        '#02be01', // green
        '#0083c7', // blue
        '#820080'  // purple
    ];

    function colorFromName(name) {
        sanitizedName = name.toLowerCase().replace(/[^a-z0-9]/g, "");
        flairNum = parseInt(sanitizedName, 36) % 6;
        return flairColor[flairNum];
    }

    // Color names in user list
    $('#robinUserList .robin--username').each(function(){
        $(this).css('color', colorFromName($(this).text()));
    });

    // Bold current user's name in user list
    $('#robinUserList .robin--user-class--self .robin--username').css('font-weight', 'bold');

    // Color current user's name in chat and darken post backgrounds
    var currentUserColor = colorFromName($('#robinUserList .robin--user-class--self .robin--username').text());
    $('<style>.robin--user-class--self { background: #F5F5F5; } .robin--user-class--self .robin--username { color: ' + currentUserColor + ' !important; font-weight: bold;}</style>').appendTo('body');

    // Send message button
    $("#robinSendMessage").append('<div onclick={$(".text-counter-input").submit();} class="robin-chat--vote" style="font-weight: bold; padding: 5px;cursor: pointer; margin-left:0;" id="sendBtn">Send Message</div>'); // Send message
    $('#robinChatInput').css('background', '#EFEFED');
})();
