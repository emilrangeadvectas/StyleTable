define( ["./StyleSettings","./ScrolldownHandler"], function (StyleSettings,ScrolldownHandler) {
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
        
			var inputStyle = "padding:1px;margin:0; height:20px; border:0;vertical-align:top;margin-left:3px";

			var tdController = document.createElement("TD");

			// "Set to bold"-button
			var boldButton = document.createElement("BUTTON");
			var textBold = document.createTextNode("Bold")
			boldButton.appendChild(textBold);
			tdController.appendChild(boldButton);
			boldButton.style = inputStyle;

            // Background color picker
			var colorInput = document.createElement("INPUT");
			colorInput.type = "color";
			tdController.appendChild(colorInput);
			colorInput.style = inputStyle;

			// "Unset color"-button
			var unsetColorButton = document.createElement("BUTTON");
			var textUnsetColor = document.createTextNode("Unset color");
			unsetColorButton.appendChild(textUnsetColor);
			tdController.appendChild(unsetColorButton);
			unsetColorButton.style = inputStyle;

            // "Border"-button
			var borderButton = document.createElement("BUTTON");
			var textBorder = document.createTextNode("Border")
			borderButton.appendChild(textBorder);
			tdController.appendChild(borderButton);
            borderButton.style = inputStyle;

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
			var thStyle = "padding: 4px; font-size:16px; text-align:left; border-bottom: 1px solid #555";			
			
			//Draw header
			var tr = document.createElement("TR");
			for(var i=0; i<headers.length; i++) {
				var th = document.createElement("TH");
				var textHeader = document.createTextNode(headers[i])
				table.appendChild(tr);
				tr.appendChild(th);
				th.appendChild(textHeader);
				th.style = thStyle;
			}			
	
			return table;
		};
        
        var htmlDataRow = function(rowData) {

            var tdStyle = "padding: 4px; font-size:14px; text-align:left";
            var tr = document.createElement("TR");
			for(var u=0; u<rowData.length; u++) {
				var td = document.createElement("TD");
				var elementText = document.createTextNode(rowData[u].qText)
				tr.appendChild(td);
				td.appendChild(elementText);
				td.style = tdStyle;
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
            
			var table = htmlDataTableHeader(getHeadersFromLayout(layout));
			table.style.width = (canvasWidth-10)+"px";
			rootDiv.appendChild(table);	
            return { "rootDiv":rootDiv, "table":table};
        }            
        
        /*  -- */
		
        // RowController handles control panel logic form style settings and updating style on html rows
		var RowController = function(tr,identify,styleSetting,index) {

			var row = this;
			this.styleSetting = styleSetting;
            var controlPanel = null;
            
			var tds = Array.prototype.slice.call( tr.getElementsByTagName("td") );

            var getAboveRowController = function() {
                return rows[index-1] !== undefined ? rows[index-1] : null;
            }

            var getBelowRowController = function() {
                return rows[index+1] !== undefined ? rows[index+1] : null;
            }
            
			this.updateStyle = function() {
                        
                styleSetting;
                
                var aboveRowController = getAboveRowController();
                var belowRowController = getBelowRowController();
               
                var styleAbove = aboveRowController ? aboveRowController.styleSetting : null;
                var styleBelow = belowRowController ? belowRowController.styleSetting : null;;
                
				for(var i=0; i<tds.length; i++) {
					var td = tds[i];					
					td.style.backgroundColor = styleSetting.color;
					td.style.fontWeight = styleSetting.bold === true ? "bold" : "normal"
					if(styleSetting.border === true && styleAbove!==null) {
						td.style.borderTop = styleAbove.border!==true ? "1px solid #000" : "";
					}

					if(styleSetting.border === true && styleBelow!==null) {
						td.style.borderBottom = styleBelow.border!==true ? "1px solid #000" : "";
					}
					
				}
				tds[tds.length-1].style.borderRight = styleSetting.border === true ? "1px solid #000" : "0";
				tds[0].style.borderLeft = styleSetting.border === true ? "1px solid #000" : "0";
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
 		
		var getHeadersFromLayout = function(layout) {
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
            for(var u=0; u<getHeadersFromLayout.length; u++) {
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
				qWidth: 10, //TODO: figure out what these are and what issue they can bring
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
				styleSettings.getStyleSettings(function(styleSettings){

                    //...last, build RowControllers (and based on variable, build control panels)
                    for(var i=0; i<trs.length; i++) {
                    
                        var globalRowIndex = top+i;
                    
                        var tr = trs[i].tr;
                        var identify = trs[i].identify;
                        var styleSetting = styleSettings[identify];

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