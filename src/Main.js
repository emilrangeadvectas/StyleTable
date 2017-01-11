define( ["./StyleSettings","./ScrolldownHandler", "jquery","./DragResizeColumnHandler"], function (StyleSettings,ScrolldownHandler,$,ColResizeManager) {
  'use strict';

  var Main = function(backendApi,$element,layout,hideControlls,self) {

  var self = self;
  var backendApi = backendApi;
  var $element = $element;
  var layout = layout;
  var styleSettings = new StyleSettings(backendApi);
  var hideControlls = hideControlls;
  var rows = new Array();
  var colResizeManager = new ColResizeManager(backendApi);
  var isEnableSortWhenOnHeaderClick = false;
  var isEnableSortArrow = false;
  var columns = new Array();

  var SelectedValuesHandler = function() {

  var selected = new Array();
  var values = new Array();

  var switchValue = function(x,y) {
  if(selected[x]===undefined) {
  selected[x] = new Array();
  selected[x][y] = true;
  return selected[x][y];
  }
  selected[x][y] = selected[x][y] ? false : true;
  return selected[x][y];
  }

  var getValue = function(x,y) {
  if(selected[x]===undefined) {
  return false;
  }
  return selected[x][y] ? true : false;
  }

  var _click = function(dimIndex,rowIndex,span) {


  switchValue(dimIndex,rowIndex);

  for(var i =0; i<values.length; i++) {
  values[i].refresh();
  }

  self.selectValues(dimIndex, [rowIndex], true);

  }

  this.addValue = function(dimIndex,rowIndex,span) {
  var o = new Object();
  o.dimIndex = dimIndex;
  o.rowIndex = rowIndex;
  o.span = span;
  o.click = function() {
  _click(dimIndex,rowIndex,span);
  }
  o.refresh = function() {
  if(getValue(dimIndex,rowIndex)) {
  var img = document.createElement("IMG");
  img.src = "/extensions/StyleTable/img/cross.png";
  if(span.childElementCount==0)span.appendChild(img);
  }
  else {
  span.innerHTML = "";
  }
  }
  values.push(o);
  return o;
  }

  };

  var selectedValuesHandler = new SelectedValuesHandler();

  this.enableSortWhenOnHeaderClick = function() {
    isEnableSortWhenOnHeaderClick = true;
  }
  this.enableSortArrow = function() {
    isEnableSortArrow = true;
  }

  /*                                                                                                            */
  /* Html builders - these method takes care of building html-element based on param data (and nothing else)    */
  /*                                                                                                            */
  var htmlStyleControlPanel = function(controlInputsCallback) {

  var tdController = document.createElement("TD");

  // "Set to bold"-button
  var boldButton = document.createElement("BUTTON");
  var textBold = document.createTextNode("Bold")
  boldButton.appendChild(textBold);
  tdController.appendChild(boldButton);

  // Background color picker
  var colorInput = document.createElement("INPUT");
  colorInput.type = "color";
  tdController.appendChild(colorInput);

  // "Unset color"-button
  var unsetColorButton = document.createElement("BUTTON");
  var textUnsetColor = document.createTextNode("Unset color");
  unsetColorButton.appendChild(textUnsetColor);
  tdController.appendChild(unsetColorButton);

  // "Border"-button
  var borderButton = document.createElement("BUTTON");
  var textBorder = document.createTextNode("Border")
  borderButton.appendChild(textBorder);
  tdController.appendChild(borderButton);

  var o = new Object();
  o.boldButton = boldButton;
  o.borderButton = borderButton;
  o.unsetColorButton = unsetColorButton;
  o.colorInput = colorInput;
  if(controlInputsCallback) controlInputsCallback(o);

  return tdController;
  }

    var htmlControlPanelRowForColumns = function(headers,callback) {
      var tr = document.createElement("TR");

      for(var i=0; i<headers.length; i++) {
        if(!hideControlls){
        var tdController = htmlStyleControlPanel(function(controlPanel){
          callback(controlPanel,i);
        });
        tr.append(tdController);
      }

        tr.append(document.createElement("TD"));
      }
    return tr;
  }

  var htmlDataTableHeader = function(headers,callback) {

  var table = document.createElement("TABLE");

  //Draw header
  var tr = document.createElement("TR");

  var controlPanels = new Array();
  var c = htmlControlPanelRowForColumns(headers,function(l,index){
      controlPanels[index] = l;
  });


  for(var i=0; i<headers.length; i++) {
  var th = document.createElement("TH");
  var tdColResize = document.createElement("TD");
  $(tdColResize).addClass("resizeGrab");

  var textHeader = document.createTextNode(headers[i]);

  if(isEnableSortArrow && getCurrentSort()[0]===i) {
    var img = document.createElement("IMG");
    img.src = "/extensions/StyleTable/img/arrow.png";
    th.appendChild(img);
  }

  if(isEnableSortWhenOnHeaderClick) {
    (function(i){  th.onclick= function(){  setSort(i); };  })(i); //TODO: move this logic to other function. html-method should only handle build html
    $(th).addClass("clicksort");
  }




  var divDragColResize = document.createElement("DIV");


/*
  function(tdControlPanel){

//    var identify = "#"+headers[i];
  //  var styleSetting = styleSettingsMap.get(identify);
//    var column = new ColumnController(styleSetting);


    //bindControllerSettingsControlPanel(column,styleSetting,controlPanel,identify);

  });*/


  callback(tdColResize,th,i,headers[i],controlPanels[i]);
  tr.appendChild(th);
  tr.appendChild(tdColResize);
  th.appendChild(textHeader);
  $(th).addClass(i<getNumberOfDimensions() ? "dim" : "mes");


  }

  table.appendChild(tr);
  table.append(c);


  var td = document.createElement("TD");
  tr.appendChild(td);

  if(!hideControlls)
  tr.appendChild(htmlControlPanelHeader());

  return table;
  };

    var htmlControlPanelHeader = function() {
      var th = document.createElement("TH");
      var textHeader = document.createTextNode("STYLE CONTROLPANEL");
      th.appendChild(textHeader);
      return th;
    }

  var htmlDataRow = function(rowData,callback) {
    var tr = document.createElement("TR");
    for(var u=0; u<rowData.length; u++) {
      var td = document.createElement("TD");
      var td2 = document.createElement("TD");
      td2.style.padding=0;
      var elementText = document.createTextNode(rowData[u].qText)
      var span = document.createElement("SPAN");
      tr.appendChild(td);
      tr.appendChild(td2);
      td.appendChild(span);
      td.appendChild(elementText);
      $(td).addClass(u<getNumberOfDimensions() ? "dim" : "mes");
      callback(u,rowData[u].qElemNumber,span,td);
    }
    var td = document.createElement("TD");
    tr.appendChild(td);
    return tr;
  }

  var htmlRootDivAndTable = function(callback) {
  var rootDiv = document.createElement("DIV");
  var canvasWidth = $element[0].clientWidth;
  var canvasHeight = $element[0].clientHeight;
  rootDiv.style.width = canvasWidth+"px";
  rootDiv.style.height = canvasHeight+"px";
  rootDiv.style.overflowY = "scroll";

  var table = htmlDataTableHeader(getHeaders(),callback);
  table.style.width = (canvasWidth-10)+"px";
  rootDiv.appendChild(table);
  return { "rootDiv":rootDiv, "table":table};
  }

  /*  -- */

  var getCurrentSort = function() {
  return layout.qHyperCube.qEffectiveInterColumnSortOrder;
  };

  var switchValues = function(dimIndex,rowIndex,span) {
  selectedValuesHandler.click(dimIndex,rowIndex,span);
  };

  var setSort = function(i) {

  backendApi.getProperties().then(function(reply){

  var n = reply.qHyperCubeDef.qInterColumnSortOrder;
  var index = n.indexOf(i);
  if(index>-1) n.splice(index,1);
  n.unshift(i);
  reply.qHyperCubeDef.qInterColumnSortOrder = n;
  backendApi.setProperties(reply);
  });
  };

  var getNumberOfDimensions = function() {
  return layout.qHyperCube.qDimensionInfo.length;
  };



    var bindControlPanelToBackend = function(htmlControlPanelElements, identify) {

      $(htmlControlPanelElements.boldButton).click(function(){
        styleSettings.switchBold(identify);
      });

      $(htmlControlPanelElements.borderButton).click(function(){
        styleSettings.switchBorder(identify);
      });

      $(htmlControlPanelElements.colorInput).change(function(){
        styleSettings.setColor(identify,$(this).val());
      });

      $(htmlControlPanelElements.unsetColorButton).click(function(){
        styleSettings.unsetColor(identify);
        $(htmlControlPanelElements.colorInput).val("#000000");
      });
    }


    var ColumnController = function(styleSetting) {


      this.tds = new Array();
      this.updateStyle = function() {
        for(var i=0; i<this.tds.length; i++) {
          var td = this.tds[i];
          if(styleSetting.color) td.style.backgroundColor = styleSetting.color;
        }
        if(this.afterUpdateStyleCallback) this.afterUpdateStyleCallback();
      }
    }

  // RowController handles control panel logic form style settings and updating style on html rows
  var RowController = function(tr,identify,styleSetting,index) {


  var row = this;
  this.styleSetting = styleSetting;
  var controlPanel = null;

  var tds = Array.prototype.slice.call( tr.getElementsByTagName("td") );
  this.tds = tds;

  var getAboveRowController = function() {
  return rows[index-1] !== undefined ? rows[index-1] : null;
  }

  var getBelowRowController = function() {
  return rows[index+1] !== undefined ? rows[index+1] : null;
  }

  this.updateStyle = function() {


  if( styleSetting === null ) return;
  if( styleSetting === undefined ) return;

  var aboveRowController = getAboveRowController();
  var belowRowController = getBelowRowController();

  var styleAbove = aboveRowController ? aboveRowController.styleSetting : null;
  var styleBelow = belowRowController ? belowRowController.styleSetting : null;;

  if(styleBelow===undefined) styleBelow = null;
  if(styleAbove===undefined) styleAbove = null;

  for(var i=0; i<tds.length-2; i++) {
  var td = tds[i];
  td.style.backgroundColor = styleSetting.color;
  td.style.fontWeight = styleSetting.bold === true ? "bold" : "normal"
  if(styleSetting.border === true && styleAbove!==null) {
  if(styleAbove.border!==true) aboveRowController.tds[i].style.borderBottom = "1px solid #000";
  }

  if(styleSetting.border === true && styleBelow!==null) {
  if(styleBelow.border!==true) td.style.borderBottom = "1px solid #000";
  else td.style.borderBottom = "1px solid "+styleSetting.color;
  }
  td.style.borderRight = "0";

  }

  if(styleSetting.border === true) {
  tds[0].style.borderLeft = "1px solid #000";
  tds[tds.length-3].style.borderRight = "1px solid #000";
  }

    if(this.afterUpdateStyleCallback) this.afterUpdateStyleCallback();
  };

  }

  // Data Row hold the html data for a row and what identify-hash the row has
  var DataRow = function(tr,identify,tds) {
    this.tr = tr;
    this.identify = identify;
    this.tds = tds;
  }

  var getHeaders = function() {
  var headers = [];
  var hc = layout.qHyperCube;
  for (var i = 0; i < hc.qDimensionInfo.length; i++) {
  headers.push(hc.qDimensionInfo[i].qFallbackTitle);
  }
  for (var i = 0; i < hc.qMeasureInfo.length; i++) {
  headers.push(hc.qMeasureInfo[i].qFallbackTitle);
  }
  return headers;
  }

  var calcIdentifyHash = function(rowData) {
  var hash = "";
  var hc = layout.qHyperCube;
  for(var u=0; u<hc.qDimensionInfo.length; u++) {
  var us = ""+u;
  hash +=  "|"+us+"|"+rowData[u].qText;
  }
  return hash;
  }

    var getDataRows = function(data) {
      var qMatrix = data.qMatrix;
      var trs = new Array();
      for(var i=0; i<qMatrix.length; i++) {
        var rowData = qMatrix[i];
        var tds = new Array();
        var tr = htmlDataRow(qMatrix[i],function(u,i,span,td,y){
          tds.push(td);
          var v = selectedValuesHandler.addValue(u,i,span);
          (function(v){td.onclick= function(){ v.click(); }})(v);
        });
        var dataRow = new DataRow(tr,calcIdentifyHash(rowData));
        trs.push(new DataRow(tr,calcIdentifyHash(rowData),tds));
      }
      return trs;
    };

  var bindControllerSettingsControlPanel = function(row,styleSetting,controlPanel,identify) {
    if(!controlPanel) return;

    bindControlPanelToBackend(controlPanel,identify);
    row.afterUpdateStyleCallback = function() {
      controlPanel.boldButton.style.fontWeight = styleSetting.bold===true ? "bold" : "normal";
      controlPanel.borderButton.style.fontWeight = styleSetting.border===true ? "bold" : "normal";
      controlPanel.colorInput.value = styleSetting.color ? styleSetting.color :"#000000";
    };
    row.updateStyle();
  }

    var requestAndDrawData = function(top,height,table,callbackWhenDone) {

      var requestPages = [{
      qTop: top,
      qLeft: 0,
      qWidth: getHeaders().length, //TODO: figure oout if this is the correct way to view all columns
      qHeight: height
      }];
      // first, get data from backend api and build and append html rows based on data...
      backendApi.getData( requestPages ).then( function ( dataPages ) {
      if( dataPages.length!==1 ) throw "can only draw one data page at a time";
      var dataPage = dataPages[0];
      var trs = getDataRows(dataPage); // build html row based on data

      for(var i=0; i<trs.length; i++) {
        var tr = trs[i].tr;
        table.appendChild(tr);

        for(var c=0; c<columns.length; c++) {
          var tdd = trs[i].tds[c];
          columns[c].tds.push(tdd);
        }
      }

  //...then get style settings from backend
  styleSettings.getStyleSettings(function(styleSettingsMap){

  //...last, build RowControllers (and based on variable, build control panels)
  for(var i=0; i<trs.length; i++) {

  var globalRowIndex = top+i;

  var tr = trs[i].tr;
  var identify = trs[i].identify;
  var styleSetting = styleSettingsMap.get(identify);

  var row = new RowController(tr,identify,styleSetting,globalRowIndex);

  if(!hideControlls) { // TODO: force hide if in "done"-mode
  var tdController = htmlStyleControlPanel(function(controlPanel){
    //(function(row,styleSetting,controlPanel,identify){
      bindControllerSettingsControlPanel(row,styleSetting,controlPanel,identify);
    //})(row,styleSetting,controlPanel,identify);
  });
  tr.appendChild( tdController )
  }
  rows[globalRowIndex] = row;  // save all row controllers at global
  }

  var qArea = dataPage.qArea;
  var nextTop = qArea.qTop+qArea.qHeight;
  var isNoMoreData = qArea.qHeight===0;
  callbackWhenDone(nextTop,isNoMoreData);
  });
  });
}

    // (re)draw to canvas (root div and table(headers))
    // @return root div and table
    var redraw = function($element,layout,callback) {

      styleSettings.getStyleSettings(function(styleSettingsMap){
        $element.empty();
        var rootDivAndTable = htmlRootDivAndTable(function(td,th,column,columnText,m){


          // Add col-reize handler on headers
          colResizeManager.addColResizeDragElement(td,th,columnText);

          // Add (column)ControlPanel handler to header
          var identify = "#"+columnText;
          var styleSetting = styleSettingsMap.get(identify);
          var columnController = new ColumnController(styleSetting);
          bindControllerSettingsControlPanel(columnController,styleSetting,m,identify);
          columns[column] = columnController;

        });
        $element.append(rootDivAndTable.rootDiv);
        callback(rootDivAndTable);
      });
    };

    // Sets Main to works as "Scroll mode" (load data while scroll down)
    this.scrollMode = function(rowsPerPage) {

      redraw($element,layout,function(elements) {

        var top = 0; // from what index to fetch data next

        // Handle scrolldown
        var scrolldownHandler = new ScrolldownHandler(elements.rootDiv,function(callback) { // defines function to be called when scrollhander tells it is time to fetch more data to table. call callback when data have been fetched

          requestAndDrawData(top,rowsPerPage,elements.table,function(next,end) {
            top = next;  // keep track of what "index"(top) to get data from next
            callback(end); // tell scrollhandler that data have been fetch and drawn. (it is now secure(thread safe) for scrollhandler to call fetch adn draw more data)
            // param end. Tells if there are no more data to be fecth

            // update style on the new rows. (TODO: now it is all rows. Fix so only required rows are update (all new and the last before them))
            for(var i=0; i<rows.length; i++) {
              rows[i].updateStyle();
            }

            for(var i=0; i<columns.length; i++) {
              columns[i].updateStyle();
            }

          });
        });
      });
    }
  };

  return Main;
});
