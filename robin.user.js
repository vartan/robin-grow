// ==UserScript==
// @name         parrot (color multichat for robin!)
// @namespace    http://tampermonkey.net/
// @version      2.34
// @description  Try to take over the world!
// @author       /u/_vvvv_
// @include      https://www.reddit.com/robin*
// @updateURL    https://github.com/5a1t/robin-grow/raw/master/robin.user.js
// @require       http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js
// @grant   GM_getValue
// @grant   GM_setValue
// @grant   GM_addStyle
// ==/UserScript==
(function() {
    // hacky solutions
    var CURRENT_CHANNEL = "";
    var GOTO_BOTTOM = true;
    var robinChatWindow = $('#robinChatWindow');

    String.prototype.lpad = function(padString, length) {
        var str = this;
        var prepend_str = "";
        for (var i = str.length; i < length; i++) {
            prepend_str = padString + prepend_str;
        }
        return prepend_str + str;
    };

    String.prototype.rpad = function(padString, length) {
        var str = this;
        var prepend_str = "";
        for (var i = str.length; i < length; i++) {
            prepend_str = padString + prepend_str;
        }
        return str + prepend_str;
    };


    function tryHide(){
        if(settings.hideVote){
            console.log("hiding vote buttons.");
            $('.robin-chat--buttons').hide();
        }
        else{
            $('.robin-chat--buttons').show();
        }
    }

    function buildDropdown(){
        $("#chat-prepend-area").remove();
        //select dropdown chat.
        //generate dropdown html
        split_channels= settings.channel.split(",");
        drop_html = "";
        for (var tag in split_channels){
            var channel_name = split_channels[tag].trim();
            drop_html = drop_html + '<option value="'+channel_name+'">'+channel_name+'</option>';
        }

        $("#robinSendMessage").prepend('<div id= "chat-prepend-area"<span> Send chat to: </span> <select id="chat-prepend-select" name="chat-prepend-select">' + drop_html + '</select>');

        $("#chat-prepend-select").change(function() {

            var new_channel = String($('option:selected', this).text()).toLowerCase().trim();
            var source = String($(".text-counter-input").val()).toLowerCase();

            CURRENT_CHANNEL = String(CURRENT_CHANNEL).trim();

            if(CURRENT_CHANNEL.length > 0 && source.startsWith(CURRENT_CHANNEL)) {
                source = source.substring(CURRENT_CHANNEL.length);
                source = source.startsWith(" ") ? source.substring(1) : source;
            }

            CURRENT_CHANNEL = new_channel;
            IDX_CURRENT_CHANNEL = $(this).prop('selectedIndex');

            $(".text-counter-input").val(new_channel + " " + source);
        });

    }

    // Utils
    function getChannelList()
    {
        var channels = String(settings.channel).split(",");
        var channelArray = [];

        for (i = 0; i < channels.length; i++)
        {
            var channel = channels[i].trim();
            if (channel.length > 0)
                channelArray.push(channel.toLowerCase());
        }

        return channelArray;
    }

    function hasChannel(source)
    {
        channel_array = getChannelList();
        source = String(source).toLowerCase();

        for (idx = 0; idx < channel_array.length; idx++)
        {
            var current_chan = channel_array[idx];

            if(source.startsWith(current_chan.toLowerCase())) {
                return {
                    name: current_chan,
                    has: true,
                    index: idx
                };
            }
        }

        return {
            name: "",
            has: false,
            index: 0
        };
    }

    function formatNumber(n) {
        var part = n.toString().split(".");
        part[0] = part[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return part.join(".");
    }

    function addMins(date, mins) {
        var newDateObj = new Date(date.getTime() + mins * 60000);
        return newDateObj;
    }

    function howLongLeft(endTime) {
        if (endTime === null) {
            return 0;
        }
        try {
            return Math.floor((endTime - new Date()) / 60 / 1000 * 10) / 10;
        } catch (e) {
            return 0;
        }
    }

    var Settings = {
        setupUI: function() {
            // Open Settings button
            $robinVoteWidget.prepend("<div class='addon'><div id='chatstats' class='robin-chat--vote' style='font-weight:bold;pointer-events:none;'></div></div>");
            $robinVoteWidget.prepend("<div class='addon'><div class='usercount robin-chat--vote' style='font-weight:bold;pointer-events:none;'></div></div>");
            $robinVoteWidget.prepend("<div class='addon'><div class='timeleft robin-chat--vote' style='font-weight:bold;pointer-events:none;'></div></div>");
            $robinVoteWidget.prepend('<div class="addon"><div class="robin-chat--vote" id="openBtn">Open Settings</div></div>');


            // Setting container
            $(".robin-chat--sidebar").before(
                '<div class="robin-chat--sidebar" style="display:none;" id="settingContainer">' +
                    '<div class="robin-chat--sidebar-widget robin-chat--vote-widget" id="settingContent">' +
                         '<div class="robin-chat--vote" id="closeBtn">Close Settings</div>' +
                    '</div>' +
                '</div>'
            );

            $("#settingContent").append('<div class="robin-chat--sidebar-widget robin-chat--notification-widget"><ul style="list-style-type: circle;"><li>Left click usernames to mute.</li><li>Right click usernames to copy to message.<li>Tab autocompletes usernames in the message box.</li><li>Report any bugs or issues <a href="https://github.com/5a1t/robin-grow/issues/new"><strong>HERE<strong></a></li><li>Created for soKukuneli chat (T16)</li></ul></div>');

            $("#robinDesktopNotifier").detach().appendTo("#settingContent");

            $("#openBtn").on("click", function openSettings() {
                $(".robin-chat--sidebar").hide();
                $("#settingContainer").show();
                buildDropdown();
            });

            $("#closeBtn").on("click", function closeSettings() {
                $(".robin-chat--sidebar").show();
                $("#settingContainer").hide();
                buildDropdown();
        	tryHide();
            });

            function setVote(vote) {
                return function() {
                    settings.vote = vote;
                    Settings.save(settings);
                };
            }

            $(".robin-chat--vote.robin--vote-class--abandon").on("click", setVote("abandon"));
            $(".robin-chat--vote.robin--vote-class--continue").on("click", setVote("stay"));
            $(".robin-chat--vote.robin--vote-class--increase").on("click", setVote("grow"));

            $('.robin-chat--buttons').prepend("<div class='robin-chat--vote robin--vote-class--novote'><span class='robin--icon'></span><div class='robin-chat--vote-label'></div></div>");
            $robinVoteWidget.find('.robin-chat--vote').css('padding', '5px');
            $('.robin--vote-class--novote').css('pointer-events', 'none');
        },

        load: function loadSetting() {
            var setting = localStorage["robin-grow-settings"];

            try {
                setting = setting ? JSON.parse(setting) : {};
            } catch(e) {}

            setting = setting || {};

            if (!setting.vote)
                setting.vote = "grow";

            return setting;
        },

        save: function saveSetting(settings) {
            localStorage["robin-grow-settings"] = JSON.stringify(settings);
        },

        addBool: function addBoolSetting(name, description, defaultSetting, callback) {
            defaultSetting = settings[name] || defaultSetting;

            $("#settingContent").append('<div class="robin-chat--sidebar-widget robin-chat--notification-widget"><label><input type="checkbox" name="setting-' + name + '">' + description + '</label></div>');
            $("input[name='setting-" + name + "']").on("click", function() {
                settings[name] = !settings[name];
                Settings.save(settings);
            });
            if (settings[name] !== undefined) {
                $("input[name='setting-" + name + "']").prop("checked", settings[name]);
            } else {
                settings[name] = defaultSetting;
            }

            if(callback) {
                callback();
            }
        },

        addInput: function addInputSetting(name, description, defaultSetting, callback) {
            defaultSetting = settings[name] || defaultSetting;

            $("#settingContent").append('<div id="robinDesktopNotifier" class="robin-chat--sidebar-widget robin-chat--notification-widget"><label><input type="text" name="setting-' + name + '"><br>' + description + '</label></div>');
            $("input[name='setting-" + name + "']").prop("defaultValue", defaultSetting)
                .on("change", function() {
                settings[name] = $(this).val();
                Settings.save(settings);

                if(callback) {
                    callback();
                }
            });
            settings[name] = defaultSetting;
        },

        addButton: function(id, description, callback, options) {
            options = options || {};
            $("#settingContent").append('<div class="addon"><div class="robin-chat--vote" style="font-weight: bold; padding: 5px;cursor: pointer;" id="' + id + '">' + description + '</div></div>');
            $('#' + id).on('click', function(e) { callback(e, options); });
        },

        addMainButton: function(id, description, callback, options) {
            options = options || {};
            $("#robinChatInput").append('<div class="addon"><div class="robin-chat--vote" style="font-weight: bold; padding: 5px;cursor: pointer;" id="' + id + '">' + description + '</div></div>');
            $('#' + id).on('click', function(e) { callback(e, options); });
        }
    };

    function clearChat() {
        console.log("chat cleared!");
        getChannelMessageList(selectedChannel).empty();
    }

    var currentUsersName = $('div#header span.user a').html();

    // Settings
    var $robinVoteWidget = $("#robinVoteWidget");

    // IF the widget isn't there, we're probably on a reddit error page.
    if (!$robinVoteWidget.length) {
        // Don't overload reddit, wait a bit before reloading.
        setTimeout(function() {
            window.location.reload();
        }, 300000);
        return;
    }

    Settings.setupUI($robinVoteWidget);
    var settings = Settings.load();

    // Options begin
    //Settings.addButton("clearChat", "Clear Chat", clearChat);
    Settings.addMainButton("clear-chat-button", "Clear Chat",  clearChat);

    Settings.addBool("hideVote", "Hide voting panel to prevent misclicks.", false, tryHide());
    Settings.addBool("removeSpam", "Remove bot spam", true);
    Settings.addBool("enableUnicode", "Allow unicode characters. Unicode is considered spam and thus are filtered out.", false);
    Settings.addBool("findAndHideSpam", "Remove messages that have been sent more than 3 times", true);
    Settings.addInput("maxprune", "Max messages before pruning", "500");
    Settings.addInput("fontsize", "Chat font size", "12");
    Settings.addInput("fontstyle", "Font Style (will default to Consolas if unavailable)", "");
    Settings.addBool("alignment", "Username alignment (false = left; true = right)", true);
    Settings.addInput("username_bg", "Background color of usernames (leave blank to disable)", "");
    Settings.addInput("channel", "Channel filter (separate rooms with commas for multi-listening; names are case-insensitive;spaces are NOT stripped)", "", buildDropdown);
    Settings.addBool("filterChannel", "Filter by channels (check = on; uncheck = off)", true);
    Settings.addBool("tabChanColors", "Use color on regular channel messages in tabs", true);
    Settings.addBool("twitchEmotes", "Twitch emotes. https://twitchemotes.com/filters/global", false);
    Settings.addBool("timeoutEnabled", "Reload the page after inactivity timeout.", true);
    Settings.addInput("spamFilters", "Custom spam filters, comma delimited, spaces are NOT stripped", "spam example 1, spam example 2");
    // Options end

    // Add version at the end (if available from script engine)
    var versionString = "";
    if (typeof GM_info !== "undefined") {
        versionString = " - v" + GM_info.script.version;
    }
    $("#settingContent").append('<div class="robin-chat--sidebar-widget robin-chat--report" style="text-align:center;"><a target="_blank" href="https://github.com/5a1t/robin-grow">parrot - soKukunelits fork' + versionString + '</a></div>');
    // Settings end

    var timeStarted = new Date();
    var name = $(".robin-chat--room-name").text();
    var urlRegex = new RegExp(/(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?/ig);

    var list = {};

    buildDropdown();

    // hacky solution
    CURRENT_CHANNEL = $("#chat-prepend-select").val().trim();
    IDX_CURRENT_CHANNEL = $("#chat-prepend-select").prop('selectedIndex');

    $(".text-counter-input").val(settings.filterChannel? $("#chat-prepend-select").val().trim() + " " : "");

    $(".text-counter-input").keyup(function(e) {

        var channel_needle = $("#chat-prepend-select").val().trim();
        var source = String($(".text-counter-input").val());

        if (selectedChannel >= 0 && !(source.toLowerCase().startsWith(channelList[selectedChannel].toLowerCase())))
            $(".text-counter-input").val(channelList[selectedChannel] + " " + source);
        else if (settings.filterChannel && !(source.toLowerCase().startsWith(channel_needle.toLowerCase()))) {
            $(".text-counter-input").val(channel_needle + " " + source);
        }
    });

    $(".text-counter-input").keydown(function(e) {
        var text = $(".text-counter-input").val();
        var code = e.keyCode || e.which;
        if(code == 13) {
            if(settings.filterChannel && String(settings.channel).length > 0) {
                setTimeout(function() {
                    $(".text-counter-input").val($("#chat-prepend-select").val().trim() +" ");
                }, 10);
            }
        }
    });

    var isEndingSoon = false;
    var endTime = null;

    // Grab the timestamp from the time remaining message and then calc the ending time using the estimate it gives you
    function getEndTime() { // mostly from /u/Yantrio, modified by /u/voltaek
        var remainingMessageContainer = $(".robin--user-class--system:contains('approx')");
        if (remainingMessageContainer.length === 0) {
            // for cases where it says "soon" instead of a time on page load
            var endingSoonMessageContainer = $(".robin--user-class--system:contains('soon')");
            if (endingSoonMessageContainer.length !== 0) {
                isEndingSoon = true;
            }
            return null;
        }
        var message = $(".robin-message--message", remainingMessageContainer).text();
        var time = new Date($(".robin-message--timestamp", remainingMessageContainer).attr("datetime"));
        try {
            return addMins(time, message.match(/\d+/)[0]);
        } catch (e) {
            return null;
        }
    }

    endTime = getEndTime();

    function update() {
        switch(settings.vote) {
            case "abandon":
                $(".robin-chat--vote.robin--vote-class--abandon:not('.robin--active')").click();
                break;
            case "stay":
                $(".robin-chat--vote.robin--vote-class--continue:not('.robin--active')").click();
                break;
            case "grow":
                $(".robin-chat--vote.robin--vote-class--increase:not('.robin--active')").click();
                break;
            default:
                $(".robin-chat--vote.robin--vote-class--increase:not('.robin--active')").click();
                break;
        }
        if (endTime === null && !isEndingSoon) {
            $(".timeleft").hide();
        }
        else {
            $(".timeleft").text(isEndingSoon ? "Waiting to Merge" : formatNumber(howLongLeft(endTime)) + " minutes remaining");
        }

        var users = 0;
        $.get("/robin/", function(a) {
            var start = "{" + a.substring(a.indexOf("\"robin_user_list\": ["));
            var end = start.substring(0, start.indexOf("}]") + 2) + "}";
            list = JSON.parse(end).robin_user_list;

            var counts = list.reduce(function(counts, voter) {
                counts[voter.vote] += 1;
                return counts;
            }, {
                INCREASE: 0,
                ABANDON: 0,
                NOVOTE: 0,
                CONTINUE: 0
            });

            var GROW_STR = formatNumber(counts.INCREASE);
            var ABANDON_STR = formatNumber(counts.ABANDON);
            var NOVOTE_STR = formatNumber(counts.NOVOTE);
            var STAY_STR = formatNumber(counts.CONTINUE);

            $robinVoteWidget.find('.robin--vote-class--increase .robin-chat--vote-label').html('grow<br>(' + GROW_STR + ')');
            $robinVoteWidget.find('.robin--vote-class--abandon .robin-chat--vote-label').html('abandon<br>(' + ABANDON_STR + ')');
            $robinVoteWidget.find('.robin--vote-class--novote .robin-chat--vote-label').html('no vote<br>(' + NOVOTE_STR + ')');
            $robinVoteWidget.find('.robin--vote-class--continue .robin-chat--vote-label').html('stay<br>(' + STAY_STR + ')');
            users = list.length;
            $(".usercount").text(formatNumber(users) + " users in chat");

            var $chatstats = $("#chatstats");

            if(settings.hideVote){
                $chatstats.text("GROW: " + GROW_STR + " (" + (counts.INCREASE / users * 100).toFixed(0) + "%) STAY: " + STAY_STR + " (" + (counts.CONTINUE / users * 100).toFixed(0) + "%)");
                $chatstats.show();
            } else {
                $chatstats.hide();
            }
        });
        var lastChatString = $(".robin-message--timestamp").last().attr("datetime");
        var timeSinceLastChat = new Date() - (new Date(lastChatString));
        var now = new Date();
        if (timeSinceLastChat !== undefined && (timeSinceLastChat > 600000 && now - timeStarted > 600000)) {
            if (settings.timeoutEnabled)
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

    // hash string so finding spam doesn't take up too much memory
    function hashString(str) {
        var hash = 0;

        if (str != 0) {
            for (i = 0; i < str.length; i++) {
                char = str.charCodeAt(i);
                if (str.charCodeAt(i) > 0x40) { // Let's try to not include the number in the hash in order to filter bots
                    hash = ((hash << 5) - hash) + char;
                    hash = hash & hash; // Convert to 32bit integer
                }
            }
        }

        return hash;
    }

    // Searches through all messages to find and hide spam
    var spamCounts = {};

    function findAndHideSpam() {
        var $messages = $(".robin-message");

        var maxprune = parseInt(settings.maxprune || "1000", 10);
        if (maxprune < 10 || isNaN(maxprune)) {
            maxprune = 1000;
        }

        if ($messages.length > maxprune) {
            $messages.slice(0, $messages.length - maxprune).remove();
        }

        if (settings.findAndHideSpam) {
            // skips over ones that have been hidden during this run of the loop
            $('.robin--user-class--user .robin-message--message:not(.addon--hide)').each(function() {
                var $this = $(this);

                var hash = hashString($this.text());
                var user = $('.robin-message--from', $this.closest('.robin-message')).text();

                if (!(user in spamCounts)) {
                    spamCounts[user] = {};
                }

                if (hash in spamCounts[user]) {
                    spamCounts[user][hash].count++;
                    spamCounts[user][hash].elements.push(this);
                } else {
                    spamCounts[user][hash] = {
                        count: 1,
                        text: $this.text(),
                        elements: [this]
                    };
                }
                $this = null;
            });

            $.each(spamCounts, function(user, messages) {
                $.each(messages, function(hash, message) {
                    if (message.count >= 3) {
                        $.each(message.elements, function(index, element) {
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

    // faster to save this in memory
    /* Detects unicode spam - Credit to travelton
     * https://gist.github.com/travelton */
    var UNICODE_SPAM_RE = /[\u0080-\uFFFF]/;
    function isBotSpam(text) {
        // starts with a [, has "Autovoter", or is a vote
        var filter = text.indexOf("[") === 0 ||
            text == "voted to STAY" ||
            text == "voted to GROW" ||
            text == "voted to ABANDON" ||
            text.indexOf("Autovoter") > -1 ||
            (!settings['enableUnicode'] && UNICODE_SPAM_RE.test(text));
        var spamFilters = settings.spamFilters.split(",").map(function(filter) { return filter.trim().toLowerCase(); });
        spamFilters.forEach(function(filterVal) {
            filter = filter || filterVal.length > 0 && text.toLowerCase().indexOf(filterVal) >= 0;
        });
        // if(filter)console.log("removing "+text);
        return filter;
    }

    // Individual mute button /u/verox-
    var mutedList = settings.mutedUsersList || [];
    $('body').on('click', ".robin--username", function() {
        var username = String($(this).text()).trim();
        var clickedUser = mutedList.indexOf(username);

        if (clickedUser == -1) {
            // Mute our user.
            mutedList.push(username);
            this.style.textDecoration = "line-through";
        } else {
            // Unmute our user.
            this.style.textDecoration = "none";
            mutedList.splice(clickedUser, 1);
        }

        settings.mutedUsersList = mutedList;
        Settings.save(settings);
        listMutedUsers();
    });

    // Copy cliked username into textarea /u/tW4r based on /u/verox-'s Individual mute button
    $('body').on('contextmenu', ".robin--username", function (event) {
        // Prevent context-menu from showing up
        event.preventDefault();
        // Get clicked username and previuos input source
        var username = String($(this).text()).trim();
        var source = String($(".text-counter-input").val());
        // Focus textarea and set the value of textarea
        $(".text-counter-input").focus().val("").val(source + " " + username + " ");
    });

    $("#settingContent").append("<span style='font-size:"+settings.fontsize+"px;text-align:center;'>Muted Users (click to unmute)</label>");
    $("#settingContent").append("<div id='blockedUserList' class='robin-chat--sidebar-widget robin-chat--user-list-widget'></div>");

    function listMutedUsers() {
        $("#blockedUserList").html("");

        $.each(mutedList, function(index, value){

            var mutedHere = "present";

            var userInArray = $.grep(list, function(e) {
                return e.name === value;
            });

            if (userInArray && userInArray.length > 0 && userInArray[0].present === true) {
                mutedHere = "present";
            } else {
                mutedHere = "away";
            }

            var votestyle = userInArray && userInArray.length > 0 ?
                " robin--vote-class--" + userInArray[0].vote.toLowerCase()
                : "";

            $("#blockedUserList").append(
                $("<div class='robin-room-participant robin--user-class--user robin--presence-class--" + mutedHere + votestyle + "'></div>")
                .append("<span class='robin--icon'></span><span class='robin--username' style='color:" + colorFromName(value) + "'>" + value + "</span>")
            );
        });
    }
    setTimeout(function() {
        listMutedUsers();
    }, 1500);

    //colored text thanks to OrangeredStilton! https://gist.github.com/Two9A/3f33ee6f6daf6a14c1cc3f18f276dacd
    var colors = ['rgba(255,0,0,0.1)','rgba(0,255,0,0.1)','rgba(0,0,255,0.1)', 'rgba(0,255,255,0.1)','rgba(255,0,255,0.1)', 'rgba(255,255,0,0.1)'];


    //twitch emotes
    var emotes = {};
    $.getJSON("https://twitchemotes.com/api_cache/v2/global.json", function( data ) {
        emotes = data.emotes;
        console.log(emotes);
    });

    // credit to wwwroth for idea (notification audio)
    // i think this method is better
    var notifAudio = new Audio("https://slack.global.ssl.fastly.net/dfc0/sounds/push/knock_brush.mp3");

	//
    // Tabbed channel windows by /u/lost_penguin
    //
    var channelList = [];
    var selectedChannel = -1;

    function setupMultiChannel()
    {
        // Style for tab bar
        $('<style>' +
          ' ul#robinChannelList { list-style-type: none; margin: 30px 0 0 0; padding: 0 0 0.3em 0; }' +
          ' ul#robinChannelList li { display: inline; }' +
          ' ul#robinChannelList li a { color: #42454a; background-color: #dedbde; border: 1px solid #c9c3ba; border-bottom: none; padding: 0.3em; text-decoration: none; }' +
          ' ul#robinChannelList li a:hover { background-color: #f1f0ee; }' +
          ' ul#robinChannelList li a.robin-chan-tab-changed { color: red; font-weight: bold; }' +
          ' ul#robinChannelList li a.robin-chan-tab-selected { color: blue; background-color: #f1f0ee; font-weight: bold; padding: 0.7em 0.3em 0.38em 0.3em; }' +
          '</style>').appendTo('body');

        // Add div to hold tabs
        $("#robinChatWindow").before("<div id=\"robinChannelDiv\" class=\"robin-chat--message-list\"><ul id=\"robinChannelList\"></ul></div>");

        // Add tab for all other messages
        $("#robinChannelList").append("<li id=\"robinChannelTab\"><a id=\"robinChannelLink\" href=\"#robinCh\" style=\"width:10%;display:inline-block\">System</a></li>");

        // Room tab events
        var tab = $("#robinChannelLink");
        tab.on("click", function() { selectChannel(""); });

        // Add rooms
        resetChannels();
    }

    function resetChannels()
    {
        channelList = getChannelList();

        var chatBox = $("#robinChatWindow");
        var tabBar = $("#robinChannelList");

        // Remove all existing rooms
        chatBox.children().each(function() { if (this.id.startsWith("robinChatMessageList-ch")) this.remove(); });
        tabBar.children().each(function() { if (this.id.startsWith("robinChannelTab-ch")) this.remove(); });

        // Create fresh rooms
        for (i = 0; i < channelList.length; i++)
        {
            // Room message window
            chatBox.append("<div id=\"robinChatMessageList-ch" + i + "\" class=\"robin-chat--message-list\">");

            // Room tab
            tabBar.append("<li id=\"robinChannelTab-ch" + i + "\"><a id=\"robinChannelLink-ch" + i + "\" href=\"#robinCh" + i + "\" style=\"width:10%;display:inline-block\">" + channelList[i] + "</a></li>");

            // Room tab event
            var tab = $("#robinChannelLink-ch" + i);
            tab.on("click", function() { selectChannel($(this).attr("href")); });
        }

        selectChannel("");
    }

    function selectChannel(channelLinkId)
    {
	$("#chat-prepend-select").val($("#robinChannelLink-ch" + channelLinkId.substr(channelLinkId.length - 1) ).html());
    console.log(channelLinkId);
        // Get channel index
        var channelIndex = -1;
        if (channelLinkId.length > 8)
            channelIndex = channelLinkId.substring(8);

        // Remember selection
        selectedChannel = channelIndex;

        // autoswitch prefix
        var $dropdown = $("#chat-prepend-select");

        if(channelIndex >= 0) {
            // only switch when inside a specific filter
            $dropdown.prop('selectedIndex', channelIndex);
        } else {
            $dropdown.prop('selectedIndex', IDX_CURRENT_CHANNEL);
        }

        var new_channel = String($('option:selected', $dropdown).text()).toLowerCase().trim();
        var source = String($(".text-counter-input").val()).toLowerCase();

        CURRENT_CHANNEL = String(CURRENT_CHANNEL).trim();

        if(CURRENT_CHANNEL.length > 0 && source.startsWith(CURRENT_CHANNEL)) {
            source = source.substring(CURRENT_CHANNEL.length);
            source = source.startsWith(" ") ? source.substring(1) : source;
        }

        CURRENT_CHANNEL = new_channel;
        IDX_CURRENT_CHANNEL = $dropdown.prop('selectedIndex');

        $(".text-counter-input").val(new_channel + " " + source);

        // Update tab selection
        for (i = -1; i < channelList.length; i++)
            setChannelSelected(getChannelTab(i), getChannelMessageList(i), channelIndex == i);
    }

    function markChannelChanged(index)
    {
        if (index != selectedChannel)
            getChannelTab(index).attr("class", "robin-chan-tab-changed");
    }

    function setChannelSelected(tab, box, select)
    {
        if (select)
        {
            tab.attr("class", "robin-chan-tab-selected");
            box.css("display", "");

            doScroll();
        }
        else
        {
            if (tab.attr("class") == "robin-chan-tab-selected")
                tab.attr("class", "");

            box.css("display", "none");
        }
    }

    function getChannelTab(index)
    {
        if (index == -1) return $("#robinChannelLink");
        return $("#robinChannelLink-ch" + index);
    }

    function getChannelMessageList(index)
    {
        if (index == -1) return $("#robinChatMessageList");
        return $("#robinChatMessageList-ch" + index);
    }

    function moveChannelMessage(channelIndex, message)
    {
        var channel = getChannelMessageList(channelIndex);
        var messageClone = message.cloneNode(true);
        var messageElem = $(messageClone.children && messageClone.children[2]);
        var messageText = messageElem.text();

        // Remove channel name from channel messages
        if (messageText.startsWith(channelList[channelIndex]))
        {
            messageText = messageText.substring(channelList[channelIndex].length).trim();
            messageElem.text(messageText);
        }

        // Remove channel colour from channel messages
        if (!settings.tabChanColors)
            messageElem.parent().css("background", "");

        channel.append(messageClone);

        markChannelChanged(channelIndex);
    }

    function doScroll()
    {
        if(robinChatWindow.scrollTop() < robinChatWindow[0].scrollHeight - robinChatWindow.height())
            robinChatWindow.scrollTop(robinChatWindow[0].scrollHeight);
    }

    var myObserver = new MutationObserver(mutationHandler);
    //--- Add a target node to the observer. Can only add one node at a time.
    // XXX Shou: we should only need to watch childList, more can slow it down.
    $("#robinChatMessageList").each(function() {
        myObserver.observe(this, { childList: true });
    });
    function mutationHandler(mutationRecords) {
        mutationRecords.forEach(function(mutation) {
            var jq = $(mutation.addedNodes);
            // There are nodes added
            if (jq.length > 0) {
                var colors_match = {};
                split_channels = settings.channel.toLowerCase().split(",");

                for(i = 0; i < split_channels.length; i++){
                    colors_match[split_channels[i].trim()] = colors[i];
                }

                // cool we have a message.
                var $timestamp = $(jq[0] && jq[0].children[0]);
                var $user = $(jq[0].children && jq[0].children[1]);
                var thisUser = $(jq[0].children && jq[0].children[1]).text();
                var $message = $(jq[0].children && jq[0].children[2]);
                var messageText = $message.text();

                if(String(settings['username_bg']).length > 0) {
                    $user.css("background",  String(settings['username_bg']));
                }

                var alignedUser = settings['alignment'] ? $user.html().lpad('&nbsp;', 20) : $user.html().rpad('&nbsp;', 20);

                $user.html(alignedUser);
		var stylecalc = "";
		if(settings.fontstyle !== ""){
			stylecalc = '"'+settings.fontstyle.trim()+'"' + ",";
		}
		stylecalc = stylecalc +  'Consolas, "Lucida Console", Monaco, monospace';
                $user.css("font-family", stylecalc).css("font-size", settings.fontsize+"px");
                $message.css("font-family", stylecalc).css("font-size", settings.fontsize+"px");


                var is_muted = (mutedList.indexOf(thisUser) >= 0);
                var is_spam = (settings.removeSpam && isBotSpam(messageText));
                var results_chan = hasChannel(messageText, settings.channel);

                var remove_message = is_muted || is_spam;


                // if(nextIsRepeat && jq.hasClass('robin--user-class--system')) {
                // }
                var nextIsRepeat = jq.hasClass('robin--user-class--system') && messageText.indexOf("try again") >= 0;
                if(nextIsRepeat) {
                    $(".text-counter-input").val(jq.next().find(".robin-message--message").text());
                }

                remove_message = remove_message && !jq.hasClass("robin--user-class--system");
                if (remove_message) {
                    $message = null;
                    $(jq[0]).remove();

                    return;
                }

                if (messageText.toLowerCase().indexOf(currentUsersName.toLowerCase()) !== -1) {
                    $message.parent().css("background","#FFA27F");
                    notifAudio.play();
                } else {

                    //still show mentions in highlight color.

                    var result = hasChannel(messageText, settings.channel);

                    if(result.has) {
                        $message.parent().css("background", colors_match[result.name]);
                    } else {

                    var is_not_in_channels = (settings.filterChannel &&
                         !jq.hasClass('robin--user-class--system') &&
                         String(settings.channel).length > 0 &&
                         !results_chan.has);

                        if (is_not_in_channels) {
                            $message = null;
                            $(jq[0]).remove();

                            return;
                        }
                    }
                }

                if(settings.filterChannel) {
                    if(results_chan.has) {
                        messageText = messageText.substring(results_chan.name.length).trim();
                        $message.text(messageText);
                    }

                    $("<span class='robin-message--from'><strong>" + results_chan.name.lpad("&nbsp", 6) + "</strong></span>").css("font-family", '"Lucida Console", Monaco, monospace')
                        .css("font-size", "12px")
                        .insertAfter($timestamp);
                }

                if(urlRegex.test(messageText)) {
                    urlRegex.lastIndex = 0;
                    var url = encodeURI(urlRegex.exec(messageText)[0]);
                    var parsedUrl = url.replace(/^/, "<a target=\"_blank\" href=\"").replace(/$/, "\">"+url+"</a>");
                    var oldHTML = $(jq[0]).find('.robin-message--message').html();
                    var newHTML = oldHTML.replace(url, parsedUrl);
                    $(jq[0]).find('.robin-message--message').html(newHTML);
                }
                if(settings.twitchEmotes){
                    var split = messageText.split(' ');
                    var changes = false;
                    for (var i=0; i < split.length; i++) {
                        if(emotes.hasOwnProperty(split[i])){
                            split[i] = "<img src=\"https://static-cdn.jtvnw.net/emoticons/v1/"+emotes[split[i]].image_id+"/1.0\">";
                            changes = true;
                        }
                    }
                    if (changes) {
                        $(jq[0]).find('.robin-message--message').html(split.join(' '));
                    }
                }
                findAndHideSpam();

                // Move channel messages to channel tabs
                if (results_chan.has || thisUser.trim() == '[robin]') {
                    moveChannelMessage(results_chan.index, jq[0]);
                }

                doScroll();
            }
        });
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

    // Initial pass to color names in user list
    $('#robinUserList').find('.robin--username').each(function(){
        this.style.color = colorFromName(this.textContent);
    });

    // When a user's status changes, they are removed from the user list and re-added with new status classes,
    // so here we watch for names being added to the user list to re-color
    var myUserListObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length > 0) {
                var usernameSpan = mutation.addedNodes[0].children[1];
                usernameSpan.style.color = colorFromName(usernameSpan.innerHTML);
            }
        });
    });
    myUserListObserver.observe(document.getElementById("robinUserList"), { childList: true });

    // Color current user's name in chat and darken post backgrounds
    var currentUserColor = colorFromName(currentUsersName);
    $('<style>.robin--user-class--self .robin--username { color: ' + currentUserColor + ' !important; }</style>').appendTo('body');

    // Send message button
    $("#robinSendMessage").append('<div onclick={$(".text-counter-input").submit();} class="robin-chat--vote" id="sendBtn">Send Message</div>'); // Send message

    // Setup page for tabbed channels
    setupMultiChannel();

    $('#robinChatWindow').scroll(function() {
        if(robinChatWindow.scrollTop() < robinChatWindow[0].scrollHeight - robinChatWindow.height()) {
            GOTO_BOTTOM = false;
            return;
        }
        GOTO_BOTTOM = true;
    });

GM_addStyle(" \
    .robin--username { \
    	cursor: pointer \
    } \
    #settingContent { \
    	overflow-y: scroll; \
    } \
    #openBtn, \
    #closeBtn, \
    #sendBtn { \
    	font-weight: bold; \
    	padding: 5px; \
    	cursor: pointer; \
    } \
    #sendBtn { \
    	margin-left: 0; \
    } \
    .robin--user-class--self { \
    	background: #F5F5F5; \
    	font-weight: bold; \
    } \
    .robin--user-class--self .robin--username { \
    	font-weight: bold; \
    } \
    #robinChatInput { \
    	background: #EFEFED; \
    } \
 \
    /* Change font to fixed-width */ \
    #robinChatWindow { \
    	font-family: Consolas, 'Lucida Console', Monaco, monospace; \
    } \
 \
    /* Full Height Chat */ \
    @media(min-width:769px) { \
        .content { \
            border: none; \
        } \
        .footer-parent { \
            margin-top: 0; \
            font-size: inherit; \
        } \
        .debuginfo { \
            display: none; \
        } \
        .bottommenu { \
            padding: 0 3px; \
            display: inline-block; \
        } \
        #robinChatInput { \
            padding: 2px; \
        } \
        #sendBtn, #clear-chat-button { \
            margin-bottom: 0; \
        } \
        .robin-chat .robin-chat--body { \
            /* 130 is height of reddit header, chat header, and remaining footer */ \
            height: calc(100vh - 130px) \
        } \
    } \
 \
    /* RES Night Mode Support */ \
    .res-nightmode .robin-message, \
    .res-nightmode .robin--user-class--self .robin--username, \
    .res-nightmode .robin-room-participant .robin--username, \
    .res-nightmode:not([class*=flair]) > .robin--username, \
    .res-nightmode .robin-chat .robin-chat--vote, \
    .res-nightmode .robin-message[style*='color: white'] { \
        color: #DDD; \
    } \
    .res-nightmode .robin-chat .robin-chat--sidebar, \
    .res-nightmode .robin-chat .robin-chat--vote { \
        background-color: #262626; \
    } \
    .res-nightmode #robinChatInput { \
        background-color: #262626 !important; \
    } \
    .res-nightmode .robin-chat .robin-chat--vote { \
        box-shadow: 0px 0px 2px 1px #888; \
    } \
    .res-nightmode .robin-chat .robin-chat--vote.robin--active { \
        background-color: #444444; \
        box-shadow: 1px 1px 5px 1px black inset; \
    } \
    .res-nightmode .robin-chat .robin-chat--vote:focus { \
        background-color: #848484; \
        outline: 1px solid #9A9A9A; \
    } \
    .res-nightmode .robin--user-class--self { \
        background-color: #424242; \
    } \
    .res-nightmode .robin-message[style*='background: rgb(255, 162, 127)'] { \
        background-color: #520000 !important; \
    } \
    .res-nightmode .robin-chat .robin-chat--user-list-widget { \
        overflow-x: hidden; \
    } \
    .res-nightmode .robin-chat .robin-chat--sidebar-widget { \
        border-bottom: none; \
    } \
");
})();
