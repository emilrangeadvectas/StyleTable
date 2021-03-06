define( ["./StyleSettings","./ScrolldownHandler","./DataFromBackend", "jquery","./DragResizeColumnHandler","./SelectedValuesHandler"], function (StyleSettings,ScrolldownHandler,DataFromBackend,$,ColResizeManager,SelectedValuesHandler) {
  'use strict';

  var Main = function(backendApi,$element,layout,hideControlls,self) {

    var self = self;
    var _this = this;
    var backendApi = backendApi;
    var $element = $element;
    var layout = layout;
    var styleSettings = new StyleSettings(backendApi,layout);
    var hideControlls = hideControlls;
    var rows = new Array();
    var colResizeManager = new ColResizeManager(backendApi,layout);
    var isEnableSortWhenOnHeaderClick = false;
    var isEnableSortArrow = false;
    var isEnableSelectOnValues = false;
    var isEnableDragResizeColumn = false;
    var columns = new Array();
    var colResizeElements = new Array();
    this.dataStack = new DataFromBackend(backendApi,layout);

    var getPixelWidthByTextLength = function(textLength) {
      return textLength*8+5;
    }

    this.enableSelectOnValues = function() {
      isEnableSelectOnValues = true;
    }

    var selectedValuesHandler = new SelectedValuesHandler(self);

    this.enableSortWhenOnHeaderClick = function() {
      isEnableSortWhenOnHeaderClick = true;
    }
    this.enableSortArrow = function() {
      isEnableSortArrow = true;
    }

    this.enableDragResizeColumn = function() {
      isEnableDragResizeColumn = true;
    }

    /* Html builders - these method takes care of building html-element based on param data (and nothing else)    */

    /* htmlStyleControlPanel
    /* @param controlInputsCallback
    /* @param functions Array[integers]. Define what function controlpanal should have (bold text, border...)
    /*                                   0=bold, 1=background color, 2=border */
    var htmlStyleControlPanel = function(controlInputsCallback,functions) {

      if(functions===undefined) functions = [0,1,2]; // if param functions not defined. Use these functions

      var tdController = document.createElement("TD");
      var controlInputs = new Object();

      if(functions.indexOf(0)!==-1) {
        // "Set to bold"-button
        var boldButton = document.createElement("BUTTON");
        var textBold = document.createTextNode("Bold")
        boldButton.appendChild(textBold);
        tdController.appendChild(boldButton);
        controlInputs.boldButton = boldButton;
      }

      if(functions.indexOf(1)!==-1) {
        // Background color picker
        var colorInput = document.createElement("INPUT");
        colorInput.type = "color";
        tdController.appendChild(colorInput);
        controlInputs.colorInput = colorInput;

        // "Unset color"-button
        var unsetColorButton = document.createElement("BUTTON");
        var textUnsetColor = document.createTextNode("Unset color");
        unsetColorButton.appendChild(textUnsetColor);
        tdController.appendChild(unsetColorButton);
        controlInputs.unsetColorButton = unsetColorButton;

      }

      if(functions.indexOf(2)!==-1) {
        // "Border"-button
        var borderButton = document.createElement("BUTTON");
        var textBorder = document.createTextNode("Border")
        borderButton.appendChild(textBorder);
        tdController.appendChild(borderButton);
        controlInputs.borderButton = borderButton;
      }

      if(controlInputsCallback) controlInputsCallback(controlInputs);

      return tdController;
    }

      var htmlControlPanelRowForColumns = function(headers,callback) {
        var tr = document.createElement("TR");
        for(var i=0; i<headers.length; i++) {
          var tdController = htmlStyleControlPanel(function(controlPanel){
            callback(controlPanel,i);
          },[0,1]);
          tr.appendChild(tdController);
          tr.appendChild(document.createElement("TD"));
        }
      return tr;
    }

    var groupLabelHeader = function() {

      var dimensionAndMesasures = layout.qHyperCube.qDimensionInfo.concat(layout.qHyperCube.qMeasureInfo);

      var foundLabelHeader = false;
      for(var i=0; i<dimensionAndMesasures.length; i++) {
        if(dimensionAndMesasures[i].propGroupLabel) {
          foundLabelHeader = true;
          break;
        }
      }
      if(!foundLabelHeader) return null;

      var o = [];
      var olabel = dimensionAndMesasures[0].propGroupLabel;
      var size = 0;
      for(var i=0; i<dimensionAndMesasures.length+1; i++) {

        var label = i<dimensionAndMesasures.length ?
                        dimensionAndMesasures[i].propGroupLabel :
                        dimensionAndMesasures[i-1].propGroupLabel;
        if(olabel!=label || dimensionAndMesasures.length==i) {
          o.push({label:olabel, size:size});
          size = 1;
        }
        else {
          size++;
        }
        olabel = label;
      }

      return o;
    }

    var htmlGroupLabelRow = function(headers) {

      var tr = document.createElement("TR");

      var list = groupLabelHeader();

      if(list===null) return null;

      for(var i=0; i<list.length; i++) {
        var td = document.createElement("TH");
        td.appendChild(document.createTextNode(list[i].label));
        tr.appendChild(td);
        td.colSpan = list[i].size*2;
        $(td).addClass("group_label_container");
      }

      return tr;
    }

    var htmlTable = function() {
      var table = document.createElement("TABLE");
      return table;
    }

    var htmlDataTableHeader = function(headers,callback,table) {


      //Draw header
      var tr = document.createElement("TR");

      var controlPanels = new Array();
      if(!hideControlls){
        var c = htmlControlPanelRowForColumns(headers,function(l,index){
            controlPanels[index] = l;
        });
      }

      var sortArrow = getSortArrow();

      for(var i=0; i<headers.length; i++) {
        var th = document.createElement("TH");
        var tdColResize = document.createElement("TH");
        $(tdColResize).addClass("columnSpace");

        var textHeader = document.createTextNode(headers[i]);

        if(isEnableSortArrow && sortArrow.index===i) {
          var img = document.createElement("IMG");
          var src = "/extensions/StyleTable/img/arrow.png";
          img.src = src;
          if(!sortArrow.down) img.style.transform="rotate(180deg)";
          th.appendChild(img);
        }

        if(isEnableSortWhenOnHeaderClick) {
          (function(i){  th.onclick= function(){  setSort(i); };  })(i); //TODO: move this logic to other function. html-method should only handle build html
          $(th).addClass("clicksort");
        }

        var divDragColResize = document.createElement("DIV");
        callback(tdColResize,th,i,headers[i],controlPanels[i]);
        tr.appendChild(th);
        tr.appendChild(tdColResize);
        th.appendChild(textHeader);
        $(th).addClass(i<getNumberOfDimensions() ? "dim" : "mes");
      }

      table.appendChild(tr);
      if(!hideControlls){
        table.append(c);
      }

      if(hideControlls) {
        var th = document.createElement("TH");
        $(th).addClass("last");
        tr.appendChild(th);
      }
      else {
        var th = htmlControlPanelHeader();
        $(th).addClass("last");
        tr.appendChild(th);
      }

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
        //td.appendChild(document.createTextNode(""));
        var td2 = document.createElement("TD");
        $(td2).addClass("columnSpace");
        td2.style.padding=0;
        var elementText = document.createTextNode(rowData[u].qText)
        var span = document.createElement("SPAN");
        tr.appendChild(td);
        tr.appendChild(td2);
        td.appendChild(span);
        td.appendChild(elementText);
        $(td).addClass(u<getNumberOfDimensions() ? "dim" : "mes");
        callback(u,rowData[u].qElemNumber,span,td,0,td2,rowData[u].qIsNull);
      }
      return tr;
    }

    var htmlTotalsRow = function() {

      var tr = document.createElement("tr");
      $(tr).addClass("totals");
      var th = document.createElement("th");
      th.colSpan=getNumberOfDimensions()*2;
      var totalsheaderText = document.createTextNode("Totals");
      th.appendChild(totalsheaderText);
      tr.appendChild(th);

      var grandTotalRow = layout.qHyperCube.qGrandTotalRow;

      for(var i=0; i<grandTotalRow.length; i++) {
        var measure = grandTotalRow[i];
        var th = document.createElement("th");
        $(th).addClass("mes");
        var text = document.createTextNode(measure.qText);
        th.appendChild(text);
        th.colSpan = 2;
        tr.appendChild(th);
      }
      tr.appendChild(document.createElement("th"));

      return tr;
    }

    var htmlRootDivAndTable = function(callback) {
      var rootDiv = document.createElement("DIV");
      $(rootDiv).addClass("root");
      var canvasWidth = $element[0].clientWidth;
      var canvasHeight = $element[0].clientHeight;
      rootDiv.style.width = canvasWidth+"px";
      rootDiv.style.height = canvasHeight+"px";
      //rootDiv.style.overflowY = "scroll";

      var table = htmlTable();
      var groupLabelRow = htmlGroupLabelRow(getHeaders());
      if(groupLabelRow!==null) table.appendChild(groupLabelRow);
      htmlDataTableHeader(getHeaders(),callback,table);

      var totalsRow = htmlTotalsRow();


      table.appendChild(totalsRow);
      table.style.width = (canvasWidth-20)+"px";
      rootDiv.appendChild(table);
      return { "rootDiv":rootDiv, "table":table};
    }

  /*  -- */

    var getCurrentSort = function() {
    return layout.qHyperCube.qEffectiveInterColumnSortOrder;
    };

    var getSortArrow = function() {

      var index = getCurrentSort()[0];


      var numberOfDimensions = getNumberOfDimensions();
      var isMeasure = index > numberOfDimensions-1;
      var measureOffset = numberOfDimensions;

      var sortIndicator = null;

      if(isMeasure) {
        var u = index-measureOffset;
        sortIndicator = layout.qHyperCube.qMeasureInfo[u].qSortIndicator;
      }
      else {
        var u = index;
        sortIndicator = layout.qHyperCube.qDimensionInfo[u].qSortIndicator;
      }


      var r = new Object();
      r.index = index;
      r.down = sortIndicator === "D";
      return r;
    }

    var switchValues = function(dimIndex,rowIndex,span) {
    selectedValuesHandler.click(dimIndex,rowIndex,span);
    };


    var setSort = function(i) {

      backendApi.getProperties().then(function(reply) {


        var newInterColumnSortOrder = reply.qHyperCubeDef.qInterColumnSortOrder.slice(0);

        var index = newInterColumnSortOrder.indexOf(i);
        if(index>-1) newInterColumnSortOrder.splice(index,1);
        newInterColumnSortOrder.unshift(i);

        var compare1 = newInterColumnSortOrder;
        var compare2 = reply.qHyperCubeDef.qInterColumnSortOrder;
        var interColumnSortOrderChanged = !(compare1.length==compare2.length && compare1.every(function(a,b) { return a === compare2[b]}))
        var doReverseOrder = !interColumnSortOrderChanged; // if column order not been changed we can assume clicked on same header and then a reverse order on that column should happen

        reply.qHyperCubeDef.qInterColumnSortOrder = newInterColumnSortOrder;

        if(doReverseOrder) {
          var numberOfDimensions = getNumberOfDimensions();
          var isMeasure = i > numberOfDimensions-1;
          var measureOffset = numberOfDimensions;

          if(isMeasure) {
            var u = i-measureOffset;
            if(reply.qHyperCubeDef.qMeasures[u].qSortBy["qSortByAscii"]===-1) reply.qHyperCubeDef.qMeasures[u].qSortBy["qSortByAscii"] = 1;
            else if(reply.qHyperCubeDef.qMeasures[u].qSortBy["qSortByAscii"]===1) reply.qHyperCubeDef.qMeasures[u].qSortBy["qSortByAscii"] = -1;
            if(reply.qHyperCubeDef.qMeasures[u].qSortBy["qSortByNumeric"]===-1) reply.qHyperCubeDef.qMeasures[u].qSortBy["qSortByNumeric"] = 1;
            else if(reply.qHyperCubeDef.qMeasures[u].qSortBy["qSortByNumeric"]===1) reply.qHyperCubeDef.qMeasures[u].qSortBy["qSortByNumeric"] = -1;
            if(reply.qHyperCubeDef.qMeasures[u].qSortBy["qSortByLoadOrder"]===-1) reply.qHyperCubeDef.qMeasures[u].qSortBy["qSortByLoadOrder"] = 1;
            else if(reply.qHyperCubeDef.qMeasures[u].qSortBy["qSortByLoadOrder"]===1) reply.qHyperCubeDef.qMeasures[u].qSortBy["qSortByLoadOrder"] = -1;
          }
          else {
            var u = i;
            if(reply.qHyperCubeDef.qDimensions[u].qDef.qSortCriterias[0]["qSortByAscii"]===1) reply.qHyperCubeDef.qDimensions[u].qDef.qSortCriterias[0]["qSortByAscii"] = -1;
            else if(reply.qHyperCubeDef.qDimensions[u].qDef.qSortCriterias[0]["qSortByAscii"]===-1) reply.qHyperCubeDef.qDimensions[u].qDef.qSortCriterias[0]["qSortByAscii"] = 1;
            if(reply.qHyperCubeDef.qDimensions[u].qDef.qSortCriterias[0]["qSortByNumeric"]===1) reply.qHyperCubeDef.qDimensions[u].qDef.qSortCriterias[0]["qSortByNumeric"] = -1;
            else if(reply.qHyperCubeDef.qDimensions[u].qDef.qSortCriterias[0]["qSortByNumeric"]===-1) reply.qHyperCubeDef.qDimensions[u].qDef.qSortCriterias[0]["qSortByNumeric"] = 1;
            if(reply.qHyperCubeDef.qDimensions[u].qDef.qSortCriterias[0]["qSortByLoadOrder"]===1) reply.qHyperCubeDef.qDimensions[u].qDef.qSortCriterias[0]["qSortByLoadOrder"] = -1;
            else if(reply.qHyperCubeDef.qDimensions[u].qDef.qSortCriterias[0]["qSortByLoadOrder"]===-1) reply.qHyperCubeDef.qDimensions[u].qDef.qSortCriterias[0]["qSortByLoadOrder"] = 1;
          }
        }


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
          var td = this.tds[i][0];
          var td2 = this.tds[i][1]; // this is a "dummy" TD cell that is under the grab-resize-th in header. It also has to be colored.
          if(styleSetting.color) td.style.backgroundColor = styleSetting.color;
          if(styleSetting.color) td2.style.backgroundColor = styleSetting.color;
          if(styleSetting.bold) td.style.fontWeight = "bold";
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

      for(var i=0; i<tds.length; i++) {
        var td = tds[i];
        if(styleSetting.color) td.style.backgroundColor = styleSetting.color;
        if(styleSetting.bold) td.style.fontWeight = "bold";
        if(styleSetting.border === true && styleAbove!==null) {
        if(styleAbove.border!==true) {
//          aboveRowController.tds[i].style.borderBottom = "1px solid #00";
//          aboveRowController.tds[i].style.marginBottom = "4px";
          td.style.borderTop = "1px solid #000";
        }
      }

      if(styleSetting.border === true && styleBelow!==null) {
        if(styleBelow.border!==true) td.style.borderBottom = "1px solid #000";
        else td.style.borderBottom = "1px solid "+styleSetting.color;
      }
      if(styleSetting.color) td.style.borderRight = "0";

      if(!belowRowController) {
        if(styleSetting.border) td.style.borderBottom = "1px solid #000";
      }
      else {
        if(styleBelow && styleBelow.border) td.style.borderBottom = "0";
      }
    }

    if(styleSetting.border === true) {
    tds[0].style.borderLeft = "1px solid #000";
    tds[tds.length-1].style.borderRight = "1px solid #000";
    }

      if(this.afterUpdateStyleCallback) this.afterUpdateStyleCallback();
    };

    }

    // Data Row hold the html data for a row and what identify-hash the row has
    var DataRow = function(tr,identify,tds,qMatrixRow) {
      this.tr = tr;
      this.identify = identify;
      this.tds = tds;
      this.qMatrixRow = qMatrixRow;
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
        var tr = htmlDataRow(qMatrix[i],function(u,i,span,td,y,td2,isNullValue) {
          tds.push([td,td2]); // td2 is the cell under grab resize header
          var isDimension = u<getNumberOfDimensions();

          if(isEnableSelectOnValues) {
            if(isDimension && !isNullValue) {
              var v = selectedValuesHandler.addValueCell(u,i,[td,td2]);
              (function(v){td.onclick= function(){ v.switch(); }})(v);
            }
            else {
              selectedValuesHandler.addCell([td,td2]);
            }
          }

        });
        var dataRow = new DataRow(tr,calcIdentifyHash(rowData));
        trs.push(new DataRow(tr,calcIdentifyHash(rowData),tds,qMatrix[i]));
      }
      return trs;
    };

    var bindControllerSettingsControlPanel = function(row,styleSetting,controlPanel,identify) {
      if(!controlPanel) return;

      bindControlPanelToBackend(controlPanel,identify);
      row.afterUpdateStyleCallback = function() {
        controlPanel.boldButton.style.fontWeight = styleSetting.bold===true ? "bold" : "normal";
        if(controlPanel.borderButton) controlPanel.borderButton.style.fontWeight = styleSetting.border===true ? "bold" : "normal";
        controlPanel.colorInput.value = styleSetting.color ? styleSetting.color :"#000000";
      };
      row.updateStyle();
    }

    var requestAndDrawData = function(table,callbackWhenDone,styleSettingsMap,eachDataRowCallback,numOfRows) {

      // first, get data from datastack and build and append html rows based on data...
      _this.dataStack.pop( numOfRows,function(dataPages,isNoMoreData,top) {

        if( dataPages.length!==1 ) throw "can only draw one data page at a time "+dataPages.length;
        var dataPage = dataPages[0];

        var trs = getDataRows(dataPage); // build html row based on data
        for(var i=0; i<trs.length; i++) {
          var tr = trs[i].tr;
          table.appendChild(tr);
          for(var c=0; c<columns.length; c++) {
            var tdd = trs[i].tds[c];
            columns[c].tds.push(tdd);
          }
          if(eachDataRowCallback) eachDataRowCallback(trs[i]);
        }

        //...last, build RowControllers (and based on variable, build control panels)
        for(var i=0; i<trs.length; i++) {
          var globalRowIndex = top+i;
          var tr = trs[i].tr;
          var identify = trs[i].identify;
          var styleSetting = styleSettingsMap.get(identify);

          var row = new RowController(tr,identify,styleSetting,globalRowIndex);

          if(!hideControlls) { // TODO: force hide if in "done"-mode
            var tdController = htmlStyleControlPanel(function(controlPanel){
                bindControllerSettingsControlPanel(row,styleSetting,controlPanel,identify);
            });
            tr.appendChild( tdController )
          }
          else {
            var td = document.createElement("TD");
            selectedValuesHandler.addCell([td]);
            tr.appendChild(td);
          }
          rows[globalRowIndex] = row;  // save all row controllers at global
        }

        if(!isNoMoreData) callbackWhenDone();
      });
    }

    // (re)draw to canvas (root div and table(headers))
    // @return root div and table
    var redraw = function($element,layout,callback) {

      styleSettings.getStyleSettings(function(styleSettingsMap){
        $element.empty();
        var rootDivAndTable = htmlRootDivAndTable(function(td,th,column,columnText,m){

          // Add col-reize handler on headers
          var colResizeElement = colResizeManager.addColResizeDragElement(td,th,columnText);
          colResizeElement.expandDefaultWidth(getPixelWidthByTextLength(columnText.length));
          colResizeElements.push(colResizeElement);
          if(isEnableDragResizeColumn) {
            colResizeElement.enableDrag();
            $(td).addClass("resizeGrab");
          }

          // Add (column)ControlPanel handler to header
          var identify = "#"+columnText;
          var styleSetting = styleSettingsMap.get(identify);
          var columnController = new ColumnController(styleSetting);
          bindControllerSettingsControlPanel(columnController,styleSetting,m,identify);
          columns[column] = columnController;

        });
        $element.append(rootDivAndTable.rootDiv);
        callback(rootDivAndTable,styleSettingsMap);
      });
    };

    var drawAndAndFunctionality = function(elements,styleSettingsMap,callback,numOfRows){

      requestAndDrawData(elements.table,function() {

        for(var i=0; i<columns.length; i++) {
          columns[i].updateStyle();
        }

        // update style on the new rows. (TODO: now it is all rows. Fix so only required rows are update (all new and the last before them))
        for(var i=0; i<rows.length; i++) {
          rows[i].updateStyle();
        }

        selectedValuesHandler.refresh();
        if(callback!==undefined) callback();

      },styleSettingsMap,function(dataRow){

        for(var i=0; i<colResizeElements.length; i++) {
          var width = getPixelWidthByTextLength(dataRow.qMatrixRow[i].qText.length);
          colResizeElements[i].expandDefaultWidth(width);
        }

      },numOfRows);
    }

    this.oneFetch = function(numberOfRows) {
      //var numberOfRows = parseInt($element.innerHeight()/50);
      redraw($element,layout,function(elements,styleSettingsMap) {
        drawAndAndFunctionality(elements,styleSettingsMap,function(){},numberOfRows);
      });
    }

    // Sets Main to works as "Scroll mode" (load data while scroll down)
    this.scrollMode = function(rowsPerPage) {
      redraw($element,layout,function(elements,styleSettingsMap) {
        // Handle scrolldown
        var scrolldownHandler = new ScrolldownHandler(elements.rootDiv,function(callback) { // defines function to be called when scrollhander tells it is time to fetch more data to table. call callback when data have been fetched
          drawAndAndFunctionality(elements,styleSettingsMap,callback,rowsPerPage);
        });
      });
    }
  };

  return Main;
});
