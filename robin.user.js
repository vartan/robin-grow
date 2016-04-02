// ==UserScript==
// @name        Robin Assistant
// @description Growth in peace
// @namespace   com.github.leoverto
// @include     https://www.reddit.com/robin/
// @include     https://www.reddit.com/robin
// @version     1.6
// @author      LeoVerto, Wiiplay123, Getnamo
// @grant       none
// ==/UserScript==

var autoVote = true;
var disableVoteMsgs = true;
var filterSpam = true;
var version = "1.6";

var ownName = $('.user a').text();
var spamCount = 0;
var voteCount = 0;
var userCount = 0;

var votes = {
  grow: 0,
  stay: 0,
  abandon: 0,
  abstain: 0,
  action: 'Unknown'
}


var startTime = new Date();

var spamBlacklist = ["autovote", "staying", "group to stay", "pasta",
  "automatically voted", "stayers are betrayers", "stayers aint players",
  "mins remaining. status", ">>>>>>>>>>>>>>>>>>>>>>>",
  "TRUMPSBUTTPIRATES2016", "TRUMPSFIERYPOOPS2016",
  "ALL HAIL THE TACO BELL BOT", "#420","้","็","◕_◕",
  "<<<<<<<<<<<<<<<<<<<<<<", "growing is all we know", "f it ends on you",
  "timecube", "( ͡° ͜ʖ ͡°)"
];

function rewriteCSS() {
  $(".robin-chat--body").css({
    "height": "80vh"
  });
}

function sendMessage(msg) {
  $(".text-counter-input")[0].value = msg;
  $(".text-counter-input")[0].nextSibling.click();
}

// Custom options
function addOptions() {
  // Remove possible existing custom options
  $("#customOptions").remove();

  var customOptions = document.createElement("div");
  customOptions.id = "customOptions";
  customOptions.className =
    "robin-chat--sidebar-widget robin-chat--notification-widget";

  var header = "<b style=\"font-size: 14px;\">Robin-Assistant " + version +
    " Configuration</b>"

  var autoVoteOption = createCheckbox("auto-vote",
    "Automatically vote Grow", autoVote, autoVoteListener, false);
  var voteMsgOption = createCheckbox("disable-vote-msgs",
    "Hide Vote Messages", disableVoteMsgs, disableVoteMsgsListener, true);
  var filterSpamOption = createCheckbox("filter-spam",
    "Filter common spam", filterSpam, filterSpamListener, true);

  var userCounter =
    "<br><span style=\"font-size: 14px;\">Users here: <span id=\"user-count\">0</span></span>";
  var voteGrow =
    "<br><span style=\"font-size: 14px;\">Grow: <span id=\"vote-grow\">0</span></span>";
  var voteStay =
    "<br><span style=\"font-size: 14px;\">Stay: <span id=\"vote-stay\">0</span></span>";
  var voteAbandon =
    "<br><span style=\"font-size: 14px;\">Abandon: <span id=\"vote-abandon\">0</span></span>";
  var voteAbstain =
    "<br><span style=\"font-size: 14px;\">Abstain: <span id=\"vote-abstain\">0</span></span>";
  var timer =
    "<br><span style=\"font-size: 14px;\">Time Left: <span id=\"time-left\">0</span></span>";
  var nextAction =
    "<br><i><span id=\"next-action\" style=\"font-size: 14px;\">Unknown</span></i>";

  $(customOptions).insertAfter("#robinDesktopNotifier");
  $(customOptions).append(header);
  $(customOptions).append(autoVoteOption);
  $(customOptions).append(voteMsgOption);
  $(customOptions).append(filterSpamOption);
  $(customOptions).append(userCounter);
  $(customOptions).append(voteGrow);
  $(customOptions).append(voteStay);
  $(customOptions).append(voteAbandon);
  $(customOptions).append(voteAbstain);
  $(customOptions).append(nextAction);
  $(customOptions).append(timer);
}

function createCheckbox(name, description, checked, listener, counter) {
  var label = document.createElement("label");

  var checkbox = document.createElement("input");
  checkbox.name = name;
  checkbox.type = "checkbox";
  checkbox.onclick = listener;
  $(checkbox).prop("checked", checked);

  var description = document.createTextNode(description);

  label.appendChild(checkbox);
  label.appendChild(description);

  if (counter) {
    var counter = "&nbsp;Blocked: <span id=\"" + name + "-counter\">0</span>";
    $(label).append(counter);
  }

  return label;
}

// Listeners
function disableVoteMsgsListener(event) {
  if (event !== undefined) {
    disableVoteMsgs = $(event.target).is(":checked");
  }
}

function autoVoteListener(event) {
  if (event !== undefined) {
    autoVote = $(event.target).is(":checked");
  }
}

function filterSpamListener(event) {
  if (event !== undefined) {
    filterSpam = $(event.target).is(":checked");
  }
}

function howLongLeft() { // mostly from /u/Yantrio
  var soonMessageArray = $( ".robin-message--message:contains('soon')");
  if(soonMessageArray.length > 0){
    // for cases where it says "soon" instead of a time on page load
    return "Soon";
  }

  var remainingMessageArray = $( ".robin-message--message:contains('approx')");

  if (remainingMessageArray.length == 0) {
    //This shouldn't happen
    return "Unknown";
  }

  var message = remainingMessageArray.text();
  var time = new Date(jQuery(
    ".robin--user-class--system:contains('approx') .robin-message--timestamp"
  ).attr("datetime"));
  try {
    var endTime = addMins(time, message.match(/\d+/)[0]);
    return Math.floor((endTime - new Date()) / 60 / 1000 * 10) / 10;
  } catch (e) {
    return "Soon";
  }

  //grab the timestamp from the first post and then calc the difference using the estimate it gives you on boot
}

function updateCounter(id, value) {
  $("#" + id).text(value);
}

// Spam Filter
function checkSpam(message) {
  for (o = 0; o < spamBlacklist.length; o++) {
    if (message.toLowerCase().search(spamBlacklist[o]) != -1) {
      spamCount += 1;
      updateCounter("filter-spam-counter", spamCount);
      return true;
    }
  }
  return false;
}

// Generic updates
function update() {

  updateCounter("time-left", howLongLeft());

  // update vote counters
  updateCounter("vote-grow", votes.grow);
  updateCounter("vote-stay", votes.stay);
  updateCounter("vote-abandon", votes.abandon);
  updateCounter("vote-abstain", votes.abstain);

  userCount = votes.grow + votes.stay + votes.abandon + votes.abstain;
  updateCounter("user-count", userCount);

  updateCounter("next-action", "Next round we will " + votes.action);
}

// Triggered whenever someone votes
function updateVotes() {
  jQuery.get("/robin/", function(a) {
    var start = "{" + a.substring(a.indexOf("\"robin_user_list\": ["));
    var end = start.substring(0, start.indexOf("}]") + 2) + "}";
    list = JSON.parse(end).robin_user_list;
    votes.grow = list.filter(function(voter) {
      return voter.vote === "INCREASE"
    }).length;
    votes.stay = list.filter(function(voter) {
      return voter.vote === "CONTINUE"
    }).length;
    votes.abandon = list.filter(function(voter) {
      return voter.vote === "ABANDON"
    }).length;
    votes.abstain = novoteCount = list.filter(function(voter) {
      return voter.vote === "NOVOTE"
    }).length;

    var majority = userCount/2;
    if(votes.grow>majority){
      votes.action = "Grow";
    }
    else if(votes.stay>majority){
      votes.action = "Stay";
    }
    else if(votes.abandon>majority){
      votes.action = "Abandon";
    }
    else if(votes.abstain>majority){
      votes.action = "Abstain";
    }
    else{
      vote.action = "No majority";
    }
  });
}

// Mutation observer for new messages
var observer = new MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {
    var added = mutation.addedNodes[0];

    // Filters all new messages
    if ($(added).hasClass("robin-message")) {
      var msg = added;
      var msgText = $(msg).find(".robin-message--message").text();
      //console.log(msgText)

      // Highlight messages containing own user name
      var re = new RegExp(ownName, "i");
      if (msgText.match(re)) {
        $(msg).css({
          background: 'rgba(255, 0, 0, 0.3)',
          color: '#242424'
        });
      }

      // Filter vote messages
      if ($(msg).hasClass("robin--message-class--action") && msgText.startsWith(
          "voted to ")) {
        updateVotes();
        if (disableVoteMsgs) {
          $(msg).remove();
        }
      }

      // Filter spam
      if (filterSpam) {
        if (checkSpam(msgText)) {
          $(msg).remove();
        }
      }
    }
  });
});
observer.observe($("#robinChatMessageList").get(0), {
  childList: true
});

// Main run
console.log("Robin-Assistant " + version + " enabled!");

rewriteCSS();
addOptions();
updateVotes();
update();

//Check for startup messages for timing
function fetchTimeIntervals(){
  var minArray = $( ".robin-message--message:contains('approx')").text().match("\\d+");

}

// Auto-grow
setTimeout(function() {
  if (autoVote) {
    $(".robin--vote-class--increase")[0].click();
    console.log("Voting grow!");
  }
}, 10000);

// Update every 3 seconds
setInterval(function() {
  update();
}, 3000);
