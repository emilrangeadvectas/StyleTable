define( [], function () {
  'use strict';

  var ColResizeManager = function(backendApi) {

    var _this = this;

    var WidthDataContainer = function() {

      var widths = null;
      var _widthDataContainer = this;
      backendApi.getProperties().then(function(r){
        var colwidth = r.colwidth;
        if(colwidth===undefined) {
          widths = {};
        }
        else {
          widths = {};
          for (var i in colwidth) {
            widths[i] = colwidth[i];
          }
        }
        _widthDataContainer.set = function(key,value) {
          value = parseInt(value);
          if(value<10) return;
          widths[key] = value;
          backendApi.applyPatches([ {"qPath":"/colwidth","qOp":"add","qValue":JSON.stringify(widths)} ],false);
        }
        _widthDataContainer.get = function(key) {
          return widths[key];
        }
      });
    }

    var widthDataContainer = new WidthDataContainer();
    var lastRegisteredClientX = null;
    var colResizeDragElements = new Array();
    var currentDragElement = null;

    this.addColResizeDragElement = function(td,th,index) {
      var colResizeElement = new ColResizeDragElement(td,th,index);
      colResizeDragElements.push( colResizeElement );
      return colResizeElement;
    }

    var ColResizeDragElement = function(grabElement,sizeAffectedElement,index) {

      this.canDrag = false;
      this.grabElement = grabElement;
      var defaultWidth = 50;

      //This methods is to set a new default width if widther than the existing one
      this.expandDefaultWidth = function(width) {
        defaultWidth = width > defaultWidth ? width : defaultWidth;
        refresh();
      }
      this.enableDrag = function() {
        this.canDrag = true;
      }

      this.onRelease = function() {
        widthDataContainer.set(index,sizeAffectedElement.offsetWidth);
        refresh();
      }

      this.onStartDrag = function() {
        return this;
      }

      this.onNewWidthWhenDrag = function(x) {
        setShowWidth(parseInt(sizeAffectedElement.width) - x);
      }

      var refresh = function() {
        setShowWidth(getWidth());
      }

      var setShowWidth = function(w) {
        sizeAffectedElement.width = w;
      }

      var getWidth = function() {
        if(widthDataContainer.get(index)===undefined) {
          return defaultWidth;
        }
        else {
          return widthDataContainer.get(index);
        }
      }
    }

    $(document).on('mousemove',function(e){
      if(lastRegisteredClientX==null) {
        lastRegisteredClientX = e.clientX;
        return;
      }
      var dx = lastRegisteredClientX - e.clientX;
      lastRegisteredClientX = e.clientX;
      if(currentDragElement) {
        currentDragElement.onNewWidthWhenDrag(dx);
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
        if(e.target===dragElement.grabElement && dragElement.canDrag) {
          currentDragElement = dragElement.onStartDrag();
        }
      }
    });
  }

  return ColResizeManager;
});
