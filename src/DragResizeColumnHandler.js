define( [], function () {
	'use strict';

  var ColResizeManager = function() {
    var widths = new Array();
    var lastX = null;
    var colResizeDragElements = new Array();
    var currentDragElement = null;

    var ColResizeDragElement = function(html,html2,index) {
      this.html = html;
      this.index = index;

			if(widths[index]===undefined) {
				widths[index] = 200;
			}

      var startX;
      var initWidth = widths[index];
      html2.width = widths[index];

			var setShowWidth = function(w) {
				html2.width = w;
			}

      this.startDrag = function(_startX) {
        startX = _startX;
        initWidth = widths[index];
        html2.width = widths[index];
        return this;
      }
      this.updateWidth = function(x) {
				setShowWidth(parseInt(html2.width) - x);
      }
      this.onRelease = function() {
        widths[index] = html2.offsetWidth;
      }
    }
    this.addColResizeDragElement = function(td,th,index) {
      colResizeDragElements.push( new ColResizeDragElement(td,th,index) );
    }

    $(document).on('mousemove',function(e){
      if(lastX==null) {
        lastX = e.clientX;
        return;
      }
      var dx = lastX - e.clientX;
      lastX = e.clientX;
      if(currentDragElement) {
        currentDragElement.updateWidth(dx);
      }
    });

    $(document).on('mouseup',function(e){
      if(currentDragElement) {
        currentDragElement.onRelease(e.clientX);
        currentDragElement = null;
      }
    });

    $(document).on('mousedown',function(e){
      for(var i=0; i<colResizeDragElements.length; i++) {
        var dragElement = colResizeDragElements[i];
        if(e.target===dragElement.html) {
          currentDragElement = dragElement.startDrag(e.clientX);
        }
      }
    });
  }



  return ColResizeManager;
});
