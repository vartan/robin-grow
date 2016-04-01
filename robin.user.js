// ==UserScript==
// @name         New Userscript
// @namespace    http://tampermonkey.net/
// @version      0.4
// @description  try to take over the world!
// @author       You
// @include      https://www.reddit.com/robin/
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    function grow() {
        if($(".robin-message--message:contains('that is already your vote')").length === 0) {
            $(".text-counter-input").val("/vote grow").submit();
        }
    }
grow();
setTimeout(function() {
            $(".text-counter-input").val("I voted automatically to grow and so can you! http://redd.it/4cwk2s").submit();


}, 10000);
setInterval(grow, 1000);

})();