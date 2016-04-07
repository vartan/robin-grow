// ==UserScript==
// @name         Robin Grow
// @namespace    http://tampermonkey.net/
// @version      2.1.1
// @description  Try to take over the world!
// @author       /u/mvartan
// @include      https://www.reddit.com/robin*
// @updateURL    https://github.com/vartan/robin-grow/raw/master/robin.user.js
// @require       http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js
// @grant   GM_getValue
// @grant   GM_setValue
// @grant   GM_addStyle
// ==/UserScript==
(function() {
    if (!window.GM_addStyle) {
        window.GM_addStyle = function(styles) {
            $("body").append($(document.createElement("style")).attr("type", "text/css").text(styles));
        };
    }

    // Styles
    GM_addStyle('.robin--username {cursor: pointer} #robin-grow-tabbar {padding-left:10px;} .robin-grow-tab {cursor:pointer; display: inline-block !important;width: auto;padding: 7px;font-size: 16pt !important;text-transform:none !important;}');
    GM_addStyle('.robin--username {cursor: pointer}');
	GM_addStyle('#standingsTable table {width: 100%}');
	GM_addStyle('#standingsTable table th {font-weight: bold}');
    var currentChannelTab = "";
    function getChannelPrefix() {
        var channels = settings.channel && settings.channel.split(",") || "";
        return currentChannelTab || settings.filterChannel && settings.channel && settings.channel[0] || "";
    }
    // Utils
    function hasChannel(source, channels) {
        var channelParts = channels.split(",");
        for(var ci in channelParts) {
            var channel = channelParts[ci];
            console.log("checking "+channel)
            if(String(source).toLowerCase().startsWith(channel))
                return true;
        }
        return false;
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

	function grabStandings() {
		var standings;
		$.ajax({
			url: 'https://www.reddit.com/r/robintracking/comments/4czzo2/robin_chatter_leader_board_official/.rss?limit=1',
			data: {},
			success: function( data ) {
				var currentRoomName = $('.robin-chat--room-name').text();
				var standingsPost = $(data).find("entry > content").first();
				var decoded = $($('<div/>').html(standingsPost).text()).find('table').first();
				decoded.find('tr').each(function(i) { var row = $(this).find('td,th');
													var nameColumn = $(row.get(2));
													nameColumn.find('a').prop('target','_blank');
													if (currentRoomName.startsWith(nameColumn.text().substring(0,6))) {
														row.css('background-color', '#22bb45');
													}
													row.each(function(j) {if (j == 3 || j == 4 || j > 5) {
														$(this).remove();
													}});
				});
				$("#standingsTable").html(decoded);
			},
			dataType: 'xml'
		});
	}

	var standingsInterval = 0;
	function startStandings() {
		stopStandings();
		standingsInterval = setInterval(grabStandings, 120000);
		grabStandings();
	}

	function stopStandings() {
		if (standingsInterval){
			clearInterval(standingsInterval);
			standingsInterval = 0;
		}
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
    function filterChannelMessage(message) {
        console.log(message);
        var messageTextNode = (message && message.childNodes && message.childNodes[5]);
        var messageText = (messageTextNode && messageTextNode.innerText) || "";
        if(messageText.indexOf(currentChannelTab) !== 0) {
            $(message).hide();
            console.log("Should filter "+messageText);
        }
    }
    function configureTabs() {

    }
    function filterChannelAllMessages() {
        $(".robin-message.robin--user-class--user, .robin-message.robin--user-class--self").each(function(i, el) {
            $(el).show();
            filterChannelMessage(el);
        });

    }
    function clearChat() {
        $("#robinChatMessageList").text("");
    }
    function chooseChannel(el) {
        el = el.target || el;
        $(".robin-grow-tab").removeClass("robin--active");
        $(el).addClass("robin--active");
        if(el.innerText == "All") {
            currentChannelTab = "";
        } else {
            currentChannelTab = el.innerText;
        }
        filterChannelAllMessages();
    }
    function setupTabs() {
        $("#robin-grow-tabbar").html("<span style='font-size:16pt'>Channels: </span>");
        $("#robin-grow-tabbar").append("<div class='robin-chat--vote robin-grow-tab robin--active'>All</div>");
        var channels = settings.channel.split(",").map(function(filter) { return filter.trim().toLowerCase() });
        channels.forEach(function(channel) {
            if(channel.length > 0)
                $("#robin-grow-tabbar").append("<div class='robin-chat--vote robin-grow-tab'>"+channel+"</div>");
        })
        var foundChannel = false;
        $(".robin-grow-tab").each(function(i, el) {
            if(el.innerText == currentChannelTab) {
                foundChannel = true;
                chooseChannel(el);
            }
        })
        if(!foundChannel) {
            currentChannelTab = "";
        }

        $(".robin-grow-tab").click(chooseChannel);

    }


    var Settings = {
        setupUI: function() {
            $robinVoteWidget.prepend("<div class='addon'><div class='usercount robin-chat--vote' style='font-weight:bold;pointer-events:none;'></div></div>");
            $robinVoteWidget.prepend("<div class='addon'><div class='timeleft robin-chat--vote' style='font-weight:bold;pointer-events:none;'></div></div>");
            // Open Settings button
            $robinVoteWidget.append('<div class="addon"><div class="robin-chat--vote" style="font-weight: bold; padding: 5px;cursor: pointer;" id="openBtn">Open Settings</div></div>');
            $(".robin-chat--main").prepend("<div id='robin-grow-tabbar'></div>")
			$robinVoteWidget.append('<div class="addon"><div class="robin-chat--vote" style="font-weight: bold; padding: 5px;cursor: pointer;" id="standingsBtn">Show Standings</div></div>');

            // Setting container
            $(".robin-chat--sidebar").before(
                '<div class="robin-chat--sidebar" style="display:none;" id="settingContainer">' +
                    '<div class="robin-chat--sidebar-widget robin-chat--vote-widget" id="settingContent">' +
                        '<div class="robin-chat--vote" style="font-weight: bold; padding: 5px;cursor: pointer;" id="closeBtn">Close Settings</div>' +
                    '</div>' +
                '</div>'
            );

			// Standing container
			$("#settingContainer").before(
			    '<div class="robin-chat--sidebar" style="display:none;" id="standingsContainer">' +
                    '<div class="robin-chat--sidebar-widget robin-chat--vote-widget" id="standingsContent">' +
					    '<div id="standingsTable"></div>' +
						'<div class="robin-chat--vote" style="font-weight: bold; padding: 5px;cursor: pointer;"><a href="https://www.reddit.com/r/robintracking/comments/4czzo2/robin_chatter_leader_board_official/" target="robinStandingsTab">Full Leaderboard</a></div>' +
                        '<div class="robin-chat--vote" style="font-weight: bold; padding: 5px;cursor: pointer;" id="closeStandingsBtn">Close Standings</div>' +
                    '</div>' +
                '</div>'
			);

            $("#robinDesktopNotifier").detach().appendTo("#settingContent");

            $("#openBtn").on("click", function openSettings() {
                $(".robin-chat--sidebar").hide();
                $("#settingContainer").show();
            });

			$("#standingsBtn").on("click", function openStandings() {
				$(".robin-chat--sidebar").hide();
				startStandings();
				$("#standingsContainer").show();
			});

            $("#closeBtn").on("click", function closeSettings() {
                $(".robin-chat--sidebar").show();
                $("#settingContainer").hide();
				$("#standingsContainer").hide();
            });

			$("#closeStandingsBtn").on("click", function closeStandings() {
				$(".robin-chat--sidebar").show();
				stopStandings();
				$("#standingsContainer").hide();
				$("#settingContainer").hide();
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
            if (navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1) $('.robin-chat--user-list-widget').css('margin-top', '122px');
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

        addBool: function addBoolSetting(name, description, defaultSetting) {
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
        },

        addInput: function addInputSetting(name, description, defaultSetting) {
            defaultSetting = settings[name] || defaultSetting;

            $("#settingContent").append('<div id="robinDesktopNotifier" class="robin-chat--sidebar-widget robin-chat--notification-widget"><label><input type="text" name="setting-' + name + '"><br>' + description + '</label></div>');
            $("input[name='setting-" + name + "']").prop("defaultValue", defaultSetting)
                .on("change", function() {
                    settings[name] = $(this).val();
                    Settings.save(settings);
                    setupTabs();
                });
            settings[name] = defaultSetting;
        },
        addButton: function(id, description, callback, options) {
            options = options || {};
            $("#settingContent").append('<div class="addon"><div class="robin-chat--vote" style="font-weight: bold; padding: 5px;cursor: pointer;" id="' + id + '">' + description + '</div></div>');
            $('#' + id).on('click', function(e) { callback(e, options); });
        }
    };


    var currentUsersName = $('div#header span.user a').html();

    // Settings
    var $robinVoteWidget = $("#robinVoteWidget");

    // IF the widget isn't there, we're probably on a reddit error page.
    if (!$robinVoteWidget.length) {
        // Don't overload reddit, wait a bit before reloading.
        setTimeout(function() {
            window.location.reload();
        }, 15000);
        return;
    }

    Settings.setupUI($robinVoteWidget);
    var settings = Settings.load();

    // Options begin
    Settings.addButton("clearChat", "Clear Chat", clearChat);

    Settings.addBool("removeSpam", "Remove bot spam", true);
    Settings.addBool("findAndHideSpam", "Remove messages that have been sent more than 3 times", true);
    Settings.addInput("maxprune", "Max messages before pruning", "500");
    Settings.addInput("spamFilters", "Custom spam filters, comma delimited.", "spam example 1, spam example 2");
    Settings.addInput("channel", "Channel filter", "");
    Settings.addBool("filterChannel", "Filter by channel", false);
    Settings.addBool("showtrivia", "Username Highlighing", false);
    Settings.addInput("triviahosts", "Usernames to highlight, comma delimited.", "dthunder,nbagf");
    Settings.addBool("reportStats", "Contribute statistics to the <a href='https://monstrouspeace.com/robintracker/'>Automated Leaderboard</a>.", false);
    Settings.addInput("statReportingInterval", "Report Statistics Interval (seconds)", "60");
    // Options end

    // Add version at the end (if available from script engine)
    var versionString = "";
    if (typeof GM_info !== "undefined") {
        versionString = " - v" + GM_info.script.version;
    }
    $("#settingContent").append('<div class="robin-chat--sidebar-widget robin-chat--report" style="text-align:center;"><a target="_blank" href="https://github.com/vartan/robin-grow">robin-grow' + versionString + '</a></div>');
    // Settings end

    var timeStarted = new Date();
    var name = $(".robin-chat--room-name").text();
    var urlRegex = new RegExp(/(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?/ig);

    var list = {};

    // Instead of forcing the channel filter into the box all the time, lets hook this more intuitively
    var targetTextBox = $("#robinSendMessage").find("input[type='text']");
    targetTextBox.next().on('click', function ()
    {
        if( settings.filterChannel && String(settings.channel).length > 0 )
        {
            var sendingMessage = targetTextBox.val();
            if( sendingMessage.length <= 0 ) return false;

            if( sendingMessage.startsWith("/") ) return true; // this is a command, we dont need to do anything
            if( sendingMessage.startsWith("-") )
            {
                targetTextBox.val(sendingMessage.substring(1)); // Remove the - character from the beginning of the string
                return true; // this prefix means we should not touch output (raw)
            }

            // Append our chat prefix to the outgoing message
            if( sendingMessage.indexOf(currentChannelTab) != 0 ) {
                console.log("adding channel to message");
                targetTextBox.val(currentChannelTab + " " + sendingMessage);
            }
        }
    });

    /*
    $(".text-counter-input").val(settings.filterChannel? settings.channel+" " :"")
    $(".text-counter-input").keyup(function(e) {
        if(settings.filterChannel && $(".text-counter-input").val().indexOf(settings.channel) != 0) {
            $(".text-counter-input").val(settings.channel+" "+$(".text-counter-input").val())
        }
    });
*/
function fixMessage() {
    var messageText = $(".text-counter-input").val();
    if(messageText.indexOf(getChannelPrefix()) != 0) {
        $(".text-counter-input").val(getChannelPrefix()+" "+messageText);
    }
    if(messageText.indexOf("/me") == 0) {
        $(".text-counter-input").val("/me "+getChannelPrefix()+" " + messageText.substring(currentChannelTab.length+3));
    }
}
$("#robinSendMessage").submit(fixMessage);

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

    var lastStatisticsUpdate = 0;
    function update() {
        switch(settings.vote) {
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
        if (endTime === null && !isEndingSoon) {
            $(".timeleft").hide();
            endTime = getEndTime();
        } else {
            $(".timeleft").show().text(isEndingSoon ? "ending soon" : formatNumber(howLongLeft(endTime)) + " minutes remaining");
        }

        var users = 0;
        $.get("/robin/", function(a) {
            var START_TOKEN = "<script type=\"text/javascript\" id=\"config\">r.setup(";
            var END_TOKEN = ")</script>";
            var start = a.substring(a.indexOf(START_TOKEN)+START_TOKEN.length);
            var end = start.substring(0,start.indexOf(END_TOKEN));
            config = JSON.parse(end);
            list = config.robin_user_list;

            var counts = list.reduce(function(counts, voter) {
                counts[voter.vote] += 1;
                return counts;
            }, {
                INCREASE: 0,
                ABANDON: 0,
                NOVOTE: 0,
                CONTINUE: 0
            });

            $robinVoteWidget.find('.robin--vote-class--increase .robin-chat--vote-label').html('grow<br>(' + formatNumber(counts.INCREASE) + ')');
            $robinVoteWidget.find('.robin--vote-class--abandon .robin-chat--vote-label').html('abandon<br>(' + formatNumber(counts.ABANDON) + ')');
            $robinVoteWidget.find('.robin--vote-class--novote .robin-chat--vote-label').html('no vote<br>(' + formatNumber(counts.NOVOTE) + ')');
            $robinVoteWidget.find('.robin--vote-class--continue .robin-chat--vote-label').html('stay<br>(' + formatNumber(counts.CONTINUE) + ')');
            users = list.length;
            $(".usercount").text(formatNumber(users) + " users in chat");

            currentTime = Math.floor(Date.now()/1000);
            if(settings.reportStats && (currentTime-lastStatisticsUpdate)>=parseInt(settings.statReportingInterval))
            {
                lastStatisticsUpdate = currentTime;

                // Report statistics to the automated leaderboard
                trackers = [
                    "https://monstrouspeace.com/robintracker/track.php"
                ];

                queryString = "?id=" + config.robin_room_name.substr(0,10) +
                    "&guid=" + config.robin_room_id +
                    "&ab=" + counts.ABANDON +
                    "&st=" + counts.CONTINUE +
                    "&gr=" + counts.INCREASE +
                    "&nv=" + counts.NOVOTE +
                    "&count=" + users +
                    "&ft=" + Math.floor(config.robin_room_date / 1000) +
                    "&rt=" + Math.floor(config.robin_room_reap_time / 1000);

                trackers.forEach(function(tracker){
                    $.get(tracker + queryString);
                });
            }

        });
        var lastChatString = $(".robin-message--timestamp").last().attr("datetime");
        var timeSinceLastChat = new Date() - (new Date(lastChatString));
        var now = new Date();
        if (timeSinceLastChat !== undefined && (timeSinceLastChat > 5*60000 && now - timeStarted > 5*60000)) {
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

    // if (GM_getValue("chatName") != name) {
    //     GM_setValue("chatName", name);
    //     setTimeout(function() {
    //         var oldVal = $(".text-counter-input").val();
    //         $(".text-counter-input").val("[Robin-Grow] I automatically voted to grow, and so can you! http://redd.it/4cwk2s !");
    //         $("#sendBtn").click();
    //         $(".text-counter-input").val(oldVal);
    //
    //     }, 10000);
    // }

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
            (UNICODE_SPAM_RE.test(text));
        var spamFilters = settings.spamFilters.split(",").map(function(filter) { return filter.trim().toLowerCase() });
        spamFilters.forEach(function(filterVal) {
            filter = filter || filterVal.length > 0 && text.toLowerCase().indexOf(filterVal) >= 0
        })
        // if(filter)console.log("removing "+text);
        return filter;
    }

    // Individual mute button /u/verox-
    var mutedList = settings.mutedUsersList || [];
    $('body').on('click', ".robin--username", function() {
        var username = $(this).text();
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

    $("#settingContent").append("<span style='font-size:12px;text-align:center;'>Muted Users</label>");
    $("#settingContent").append("<div id='blockedUserList' class='robin-chat--sidebar-widget robin-chat--user-list-widget'></div>");

    function listMutedUsers() {
        $("#blockedUserList").html("");

        $.each(mutedList, function(index, value){

            var mutedHere = "present";

            var userInArray = $.grep(list, function(e) {
                return e.name === value;
            });

            if (userInArray[0].present === true) {
                mutedHere = "present";
            } else {
                mutedHere = "away";
            }

            $("#blockedUserList").append(
                $("<div class='robin-room-participant robin--user-class--user robin--presence-class--" + mutedHere + " robin--vote-class--" + userInArray[0].vote.toLowerCase() + "'></div>")
                    .append("<span class='robin--icon'></span><span class='robin--username' style='color:" + colorFromName(value) + "'>" + value + "</span>")
            );
        });
    }
    setTimeout(function() {
        listMutedUsers();
    }, 1500);

    // credit to wwwroth for idea (notification audio)
    // i think this method is better
    var notifAudio = new Audio("https://slack.global.ssl.fastly.net/dfc0/sounds/push/knock_brush.mp3");

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
                // cool we have a message.
                var thisUser = $(jq[0].children && jq[0].children[1]).text();
                var $message = $(jq[0].children && jq[0].children[2]);
                var messageText = $message.text();
                if($message[0])
                    filterChannelMessage(jq[0]);
                var remove_message =
                    (mutedList.indexOf(thisUser) >= 0) ||
                    (settings.removeSpam && isBotSpam(messageText)) ||
                    (settings.filterChannel &&
                        !jq.hasClass('robin--user-class--system') &&
                        String(settings.channel).length > 0 &&
                        !hasChannel(messageText, settings.channel));

                // Trivia bot highlighting
                if( settings.showtrivia ) {
                    $.each(settings.triviahosts.split(','), function(key, value) {
                        if( value.toLowerCase() == thisUser.toLowerCase() ) {
                            $(jq[0]).css("background", "rgba(107, 207, 95, 0.8)").css("color", "white").css("font-weight", "bold");
                            remove_message = false;
                            return;
                        }
                    });
                }

                if(nextIsRepeat && jq.hasClass('robin--user-class--system')) {
                }
                var nextIsRepeat = jq.hasClass('robin--user-class--system') && messageText.indexOf("try again") >= 0;
                if(nextIsRepeat) {
                    $(".text-counter-input").val(jq.next().find(".robin-message--message").text());
                }

                remove_message = remove_message && !jq.hasClass("robin--user-class--system");
                if (remove_message) {
                    $message = null;
                    $(jq[0]).remove();
                } else {
                    if(settings.filterChannel) {
                        if(messageText.indexOf(settings.channel) == 0) {
                            $message.text(messageText.substring(settings.channel.length).trim());
                        }
                    }
                    if (messageText.toLowerCase().indexOf(currentUsersName.toLowerCase()) !== -1) {
                        $message.parent().css("background","#FFA27F").css("color","white");
                        notifAudio.play();
                        console.log("got new mention");
                    }
                    if(urlRegex.test(messageText)) {
                        urlRegex.lastIndex = 0;
                        var url = encodeURI(urlRegex.exec(messageText)[0]);
                        var parsedUrl = url.replace(/^/, "<a target=\"_blank\" href=\"").replace(/$/, "\">"+url+"</a>");
                        var oldHTML = $(jq[0]).find('.robin-message--message').html();
                        var newHTML = oldHTML.replace(url, parsedUrl);
                        $(jq[0]).find('.robin-message--message').html(newHTML);
                    }
                    findAndHideSpam();
                }
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
    $('<style>.robin--user-class--self { background: #F5F5F5; font-weight: bold; } .robin--user-class--self .robin--username { color: ' + currentUserColor + ' !important; font-weight: bold;}</style>').appendTo('body');

    // Send message button
    $("#robinSendMessage").append('<div onclick={$(".text-counter-input").submit();} class="robin-chat--vote" style="font-weight: bold; padding: 5px;cursor: pointer; margin-left:0;" id="sendBtn">Send Message</div>'); // Send message
    $("#sendBtn").bind("mousedown touchstart", function(e) {
        fixMessage();
    });
    $('#robinChatInput').css('background', '#EFEFED');

    // Full-screen-height chat
    $('<style>@media(min-width:769px){.content {border:none}.footer-parent{margin-top:0;font-size:inherit}.debuginfo{display:none}.bottommenu{padding:0 3px;display:inline-block}#robinChatInput{padding:2px}#sendBtn{margin-bottom:0}.robin-chat .robin-chat--body{height:calc(100vh - 130px)}}</style>').appendTo('body');

    // RES Night Mode support
    if ($("body").hasClass("res")) {
        $('<style>.res-nightmode .robin-message, .res-nightmode .robin--user-class--self .robin--username, .res-nightmode .robin-room-participant .robin--username, .res-nightmode :not([class*=flair]) > .robin--username, .res-nightmode .robin-chat .robin-chat--vote, .res-nightmode .robin-message[style="color: white; background: rgb(255, 162, 127);"] { color: #DDD; } .res-nightmode .robin-chat .robin-chat--sidebar, .res-nightmode .robin-chat .robin-chat--vote { background-color: #262626; } .res-nightmode #robinChatInput { background-color: #262626 !important; } .res-nightmode .robin-chat .robin-chat--vote { box-shadow: 0px 0px 2px 1px #888; } .res-nightmode .robin-chat .robin-chat--vote.robin--active { background-color: #444444; box-shadow: 1px 1px 5px 1px black inset; } .res-nightmode .robin-chat .robin-chat--vote:focus { background-color: #848484; outline: 1px solid #9A9A9A; } .res-nightmode .robin--user-class--self { background-color: #424242; } .res-nightmode .robin-message[style="color: white; background: rgb(255, 162, 127);"] { background-color: #520000 !important; } .res-nightmode .robin-chat .robin-chat--user-list-widget { overflow-x: hidden; } .res-nightmode .robin-chat .robin-chat--sidebar-widget { border-bottom: none; }</style>').appendTo('body');
    }
    setupTabs();

})();
