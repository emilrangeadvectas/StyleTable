define( ["./StyleSettings","./ScrolldownHandler", "jquery"], function (StyleSettings,ScrolldownHandler,$) {
	'use strict';

	var Main = function(backendApi,$element,layout,hideControlls) {
	
		var backendApi = backendApi;
		var $element = $element;
		var layout = layout;
		var styleSettings = new StyleSettings(backendApi);
		var hideControlls = hideControlls;
        var rows = new Array();
        
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

		var htmlDataTableHeader = function(headers) {

			var table = document.createElement("TABLE");

			//Draw header
			var tr = document.createElement("TR");
			for(var i=0; i<headers.length; i++) {
				var th = document.createElement("TH");
				var textHeader = document.createTextNode(headers[i]);
                
                if(getCurrentSort()[0]===i) {
                    var img = document.createElement("IMG");
                    img.src = "/extensions/StyleTable/img/arrow.png";
                    th.appendChild(img);
                }
                
                (function(i){  th.onclick= function(){  setSort(i); };  })(i); //TODO: move this logic to other function. html-method should only handle build html
                
                
				table.appendChild(tr);
				tr.appendChild(th);
				th.appendChild(textHeader);
                $(th).addClass(i<getNumberOfDimensions() ? "dim" : "mes");
			}
            
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
        
        var htmlDataRow = function(rowData) {

            var tr = document.createElement("TR");
			for(var u=0; u<rowData.length; u++) {
				var td = document.createElement("TD");
				var elementText = document.createTextNode(rowData[u].qText)
				tr.appendChild(td);
				td.appendChild(elementText);

                (function(u,elemNumber){  td.onclick= function(){  swicthValues(u,elemNumber); };  })(u,rowData[u].qElemNumber); //TODO: move this logic to other function. html-method should only handle build html

                $(td).addClass(u<getNumberOfDimensions() ? "dim" : "mes");
            }
            return tr;
        }
                
        var htmlRootDivAndTable = function() {
			var rootDiv = document.createElement("DIV");
			var canvasWidth = $element[0].clientWidth;
			var canvasHeight = $element[0].clientHeight;
			rootDiv.style.width = canvasWidth+"px";
			rootDiv.style.height = canvasHeight+"px";
			rootDiv.style.overflowY = "scroll";
            
			var table = htmlDataTableHeader(getHeaders());
			table.style.width = (canvasWidth-10)+"px";
			rootDiv.appendChild(table);	
            return { "rootDiv":rootDiv, "table":table};
        }            
        
        /*  -- */

        var getCurrentSort = function() {        
            return layout.qHyperCube.qEffectiveInterColumnSortOrder;
        };

        var swicthValues = function(dimIndex,rowIndex) {
            backendApi.selectValues(dimIndex, [rowIndex], true);        
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
					td.style.backgroundColor = styleSetting.color;
					td.style.fontWeight = styleSetting.bold === true ? "bold" : "normal"
					if(styleSetting.border === true && styleAbove!==null) {
						if(styleAbove.border!==true) aboveRowController.tds[i].style.borderBottom = "1px solid #000";
					}

					if(styleSetting.border === true && styleBelow!==null) {
						if(styleBelow.border!==true) td.style.borderBottom = "1px solid #000";
					}
					
				}

				if(styleSetting.border === true) {
                    tds[0].style.borderLeft = "1px solid #000";
                    tds[tds.length-1].style.borderRight = "1px solid #000";
                }

                if(controlPanel!==null) {
                    controlPanel.boldButton.style.fontWeight = styleSetting.bold===true ? "bold" : "normal";
                    controlPanel.borderButton.style.fontWeight = styleSetting.border===true ? "bold" : "normal";
                    controlPanel.colorInput.value = styleSetting.color ? styleSetting.color :"#000000";
                }
            };
			
            this.addControlPanel = function(_controlPanel) {

                controlPanel = _controlPanel;
                $(controlPanel.boldButton).click(function(){
                    styleSettings.switchBold(identify);
                });

                $(controlPanel.borderButton).click(function(){
                    styleSettings.switchBorder(identify);
                });
                
                $(controlPanel.colorInput).change(function(){
                    styleSettings.setColor(identify,$(this).val());
                });

                $(controlPanel.unsetColorButton).click(function(){
                    styleSettings.unsetColor(identify);
                    $(controlPanel.colorInput).val("#000000");
                });            
            }
			
		}

        // Data Row hold the html data for a row and what identify-hash the row has
		var DataRow = function(tr,identify) {
            this.tr = tr;        
            this.identify = identify;
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
				var tr = htmlDataRow(qMatrix[i]);
                var dataRow = new DataRow(tr,calcIdentifyHash(rowData));
				trs.push(new DataRow(tr,calcIdentifyHash(rowData)));
			}
            return trs;
        };
	
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
                                row.addControlPanel(controlPanel);
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
		var redraw = function($element,layout) {
                
			$element.empty();
            var rootDivAndTable = htmlRootDivAndTable();
			$element.append(rootDivAndTable.rootDiv);            
			return rootDivAndTable;
		};

        // Sets Main to works as "Scroll mode" (load data while scroll down)
		this.scrollMode = function(rowsPerPage) {
        
            var elements = redraw($element,layout); // draw canvas
            var top = 0; // from what index to fetch data next
            
            // Handle scrolldown
            var scrolldownHandler = new ScrolldownHandler(elements.rootDiv,

                function(callback) { // defines function to be called when scrollhander tells it is time to fetch more data to table. call callback when data have been fetched

                    requestAndDrawData(top,rowsPerPage,elements.table, // fetch and draw data
                        function(next,end) {
                            top = next;  // keep track of what "index"(top) to get data from next
                            callback(end); // tell scrollhandler that data have been fetch and drawn. (it is now secure(thread safe) for scrollhandler to call fetch adn draw more data)
                                           // param end. Tells if there are no more data to be fecth

                            // update style on the new rows. (TODO: now it is all rows. Fix so only required rows are update (all new and the last before them))
                            for(var i=0; i<rows.length; i++) {
                                rows[i].updateStyle();
                            }
                        }
                    );
                }
            );
		}
    };
	
	return Main;
});