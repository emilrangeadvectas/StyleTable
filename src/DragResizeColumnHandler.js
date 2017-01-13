define( [], function () {
	'use strict';

  var ColResizeManager = function(backendApi) {

		var WidthDataContainer = function() {
			var widths = {};
 			this.set = function(key,value,saveToBackend) {
				value = parseInt(value);
				if(value<10) return;
				widths[key] = value;
				if(saveToBackend) {
					backendApi.applyPatches([ {"qPath":"/colwidth","qOp":"add","qValue":JSON.stringify(widths)} ],false);
				}
			}
			this.get = function(key) {
				return widths[key];
			}
			this.getFromBackend = function(key,callback) {
				backendApi.getProperties().then(function(r){
					var colwidth = r.colwidth;
					if(colwidth===undefined) {
						callback(undefined);
					}
					else {
						widths[key] = colwidth[key];
						callback(colwidth[key]);
					}
				});
			}
		}

		var lastX = null;
    var colResizeDragElements = new Array();
    var currentDragElement = null;
		var widthDataContainer = new WidthDataContainer();

    var ColResizeDragElement = function(html,html2,index) {
      this.html = html;
      this.index = index;

			widthDataContainer.getFromBackend(index,function(value){
				setShowWidth(value);
			});

			if(widthDataContainer.get(index)===undefined) {
				widthDataContainer.set(index,200); //TODO: make "default" longest string in dimension. (all string or just the one that can be seen?)
			}

			var setShowWidth = function(w) {
				html2.width = w;
			}

      this.startDrag = function() {
        html2.width = widthDataContainer.get(index);
        return this;
      }
      this.updateWidth = function(x) {
				setShowWidth(parseInt(html2.width) - x);
      }
      this.onRelease = function() {
				widthDataContainer.set(index,html2.offsetWidth,true);
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
          currentDragElement = dragElement.startDrag();
        }
      }
    });
  }



  return ColResizeManager;
});
