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
    var lastX = null;
    var colResizeDragElements = new Array();
    var currentDragElement = null;

    this.addColResizeDragElement = function(td,th,index) {
      var colResizeElement = new ColResizeDragElement(td,th,index);
      colResizeDragElements.push( colResizeElement );
      return colResizeElement;
    }

    var ColResizeDragElement = function(html,html2,index) {

      this.canDrag = false;
      this.html = html;
      var defaultWidth = 50;


      var getWidth = function() {
        if(widthDataContainer.get(index)===undefined) {
          return defaultWidth;
        }
        else {
          return widthDataContainer.get(index);
        }
      }

      this.refreshWidth = function(width) {
        defaultWidth = width > defaultWidth ? width : defaultWidth;
        refresh();
      }

      var refresh = function() {
        setShowWidth(getWidth());
      }

      var setShowWidth = function(w) {
        html2.width = w;
      }

      this.enableDrag = function() {
        this.canDrag = true;
      }

      this.onRelease = function() {
        widthDataContainer.set(index,html2.offsetWidth);
        refresh();
      }

      this.startDrag = function() {
        return this;
      }

      this.updateWidth = function(x) {
        setShowWidth(parseInt(html2.width) - x);
      }
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
        if(e.target===dragElement.html && dragElement.canDrag) {
          currentDragElement = dragElement.startDrag();
        }
      }
    });
  }

  return ColResizeManager;
});
