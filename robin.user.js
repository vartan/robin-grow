// ==UserScript==
// @name         Robin Grow
// @namespace    http://tampermonkey.net/
// @version      0.7
// @description  Try to take over the world!
// @author       /u/mvartan
// @include      https://www.reddit.com/robin*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    var timeStarted = new Date();
    function grow() {
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
grow();
setTimeout(function() {
            $(".text-counter-input").val("I automatically voted to grow, and so can you! http://redd.it/4cwk2s").submit();


}, 10000);
setInterval(grow, 1000);

})();
