define( ["./styleSettings","./scrolldownTable"], function (StyleSettings,ScrolldownTable) {
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
        
        var htmlDataRow = function(qMatrix,i) {

            var tdStyle = "padding: 4px; font-size:14px; text-align:left";
            var tr = document.createElement("TR");
			for(var u=0; u<qMatrix[i].length; u++) {
				var td = document.createElement("TD");
				var elementText = document.createTextNode(qMatrix[i][u].qText)
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
                        
                var s = styleSetting;
                
                var aboveRowController = getAboveRowController();
                var belowRowController = getBelowRowController();
               
                var styleAbove = aboveRowController ? aboveRowController.styleSetting : null;
                var styleBelow = belowRowController ? belowRowController.styleSetting : null;;
                
				for(var i=0; i<tds.length; i++) {
					var td = tds[i];					
					td.style.backgroundColor = s.color;
					td.style.fontWeight = s.bold === true ? "bold" : "normal"
					if(s.border === true && styleAbove!==null) {
						td.style.borderTop = styleAbove.border!==true ? "1px solid #000" : "";
					}

					if(s.border === true && styleBelow!==null) {
						td.style.borderBottom = styleBelow.border!==true ? "1px solid #000" : "";
					}
					
				}
				tds[tds.length-1].style.borderRight = s.border === true ? "1px solid #000" : "0";
				tds[0].style.borderLeft = s.border === true ? "1px solid #000" : "0";
                console.log(controlPanel);
                controlPanel.boldButton.style.fontWeight = styleSetting.bold===true ? "bold" : "normal";
                controlPanel.borderButton.style.fontWeight = styleSetting.border===true ? "bold" : "normal";
                controlPanel.colorInput.value = styleSetting.color ? styleSetting.color :"#000000";
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
		
        var calcIdentifyHash = function(t) {
            var hash = "";
            for(var u=0; u<getHeadersFromLayout.length; u++) {
                var us = ""+u; 
                hash +=  "|"+us+"|"+t[u].qText;
            }
            return hash;
        }
        
		
		var getDataRows = function(data) {
			var qMatrix = data.qMatrix;
			var trs = new Array();
			for(var i=0; i<qMatrix.length; i++) {
                var t = qMatrix[i];
				var tr = htmlDataRow(qMatrix,i);
                var o = new Object();
                o.identify = calcIdentifyHash(t);
                o.tr = tr;
				trs.push(o);
			}
            return trs;
        };
	
		var requestAndDrawData = function(top,height,table,callbackWhenDone) {
			var requestPages = null;
			requestPages = [{
				qTop: top,
				qLeft: 0,
				qWidth: 10,
				qHeight: height
			}];
			backendApi.getData( requestPages ).then( function ( dataPages ) {
				if( dataPages.length!==1 ) throw "can only draw one data page at a time";
				var dataPage = dataPages[0];
				var trs = getDataRows(dataPage);
				
				styleSettings.getStyleSettings(function(styleSettings){
                    var lastTr = undefined;
                    for(var i=0; i<trs.length; i++) {
                    
                        var globalRowIndex = top+i;
                    
                        var tr = trs[i].tr;
                        var identify = trs[i].identify;
                        var styleSetting = styleSettings[identify];

                        var row = new RowController(tr,identify,styleSetting,globalRowIndex);

                        var tdController = htmlStyleControlPanel(function(controlPanel){
                            row.addControlPanel(controlPanel);
                        });
                        tr.appendChild( tdController )
                        rows[globalRowIndex] = row;                           

                        table.appendChild(tr);
                        lastTr = tr;
                    }
                                        
                    var qArea = dataPage.qArea;
                    var nextTop = qArea.qTop+qArea.qHeight;
                    var isNoMoreData = qArea.qHeight===0;
                    callbackWhenDone(nextTop,isNoMoreData);
				});
			});	
		}

		
		var redraw = function($element,layout) {
			$element.empty();
            var r = htmlRootDivAndTable();
			$element.append(r.rootDiv);            
			return r;

		};

        // Sets Main to works as "Scroll mode" (load data while scroll down)
		this.scrollMode = function(rowsPerPage) {

            var lastRow = null;
            var elements = redraw($element,layout); // draw canvas
            
            // Handle scrolldown
            var scrolldownTable = new ScrolldownTable(rowsPerPage, elements.rootDiv,
                function(top,rowsPerPage,callback) {
                    requestAndDrawData(top,rowsPerPage,elements.table,
                        function(next,end) {
                            callback(next,end);
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