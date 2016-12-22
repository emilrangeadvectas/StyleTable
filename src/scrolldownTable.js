define( [], function () {
	'use strict';

    //TODO: handle a button for fallback if scrollAtBottom fails. A good idea is to simulate 'scroll'-event
    //          since its secure way to make sure that only on scroll call can be called at a time to prevent parallel fetch

	var ScrolldownTable = function(rowsPerPage,scrollDiv,load) {
			
        var nextRequestRow = 0;
                  
        var hasScroll = function() {
            return !($(scrollDiv).innerHeight() === $(scrollDiv)[0].scrollHeight);
        };
        
        var scrollAtBottom = function() {
            return $(scrollDiv).scrollTop() + $(scrollDiv).innerHeight() >= $(scrollDiv)[0].scrollHeight
        }
        
        var fetch = function(callback) {

            // Some extra security to even more make sure that fetch is called before last one is callbacked
            if(nextRequestRow===undefined) throw "";
            var _nextRequestRow = nextRequestRow;
            nextRequestRow = undefined;
            // ---
            
            load(_nextRequestRow,rowsPerPage,function(next,end){
                nextRequestRow = next;
                if(callback!==undefined && !end) callback();
            });
        }

        var scrollHandler = function() {
            $(scrollDiv).one('scroll', function(event) {
                if(scrollAtBottom()) {
                    $(this).off(event);
                    fetch(function(){scrollHandler()});
                }
                else {
                    scrollHandler();
                }
            }); 
        }
        
        /* A Recursive method that recalls until get a "scroll" (view-page is than filled enough) */
        /*  - when there are no more pages this recursive methods stops since no callback for moreData*/
        var loadInitPages = function(callbackWhenDone) {
            if(!hasScroll()) {
                fetch(function(){loadInitPages(callbackWhenDone)});
            }
            else callbackWhenDone();
        }
        
        
        loadInitPages(function(){
            scrollHandler();
        });
    }

    return ScrolldownTable;
});