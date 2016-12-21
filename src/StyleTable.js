
define( ["jquery","./styleSettings"],
    function ( $, styleSettings ) {
        'use strict';
		
		var backendApi = null;
		var _$element = null;
		var _layout = null;
		var defaultPageSize = 10;
		var _numberOfRowsPerPage = defaultPageSize;
		var _styleSettings;
		

		function _repaint($element,layout,paginator) {
				
					var requestPage = [{
						qTop: paginator.top,
						qLeft: 0,
						qWidth: 10,
						qHeight: paginator.height
					}];
					backendApi.getData( requestPage ).then( function ( dataPages ) {
						if( dataPages.length!==1 ) throw "can only draw one data page at a time";
						var dataPage = dataPages[0];
						drawTable($element,getData(layout.qHyperCube,dataPage),layout.props.showStyleSettings);
					});
		}
		
		function drawTable($element,data,showControlls) {
				var thStyle = "padding: 4px; font-size:16px; text-align:left; border-bottom: 1px solid #555";
				var tdStyle = "padding: 4px; font-size:14px; text-align:left";
				var inputStyle = "padding:1px;margin:0; height:20px; border:0;vertical-align:top;margin-left:3px";
				var paginatorButtonStyle = "font-size:18px;";
				var paginatorButtonStyle = "font-size:18px;";
				var paginatorInfoStyle =  "margin: 0 auto 0 auto; width:300px; text-align:center; font-size:18px";
				
				var canvasWidth = $element[0].clientWidth;
				var canvasHeight = $element[0].clientHeight;
				
				$element.empty();
				
				var rootDiv = document.createElement("DIV");
				rootDiv.style.width = canvasWidth+"px";
				rootDiv.style.height = canvasHeight+"px";
				rootDiv.style.overflowY = "scroll";
				var table = document.createElement("TABLE");
				table.style.width = ($element[0].clientWidth-10)+"px";
				
				

				// Draw paginator controller
				
				var divPaginator = document.createElement("DIV");
				var divPaginatorInfo = document.createElement("DIV"); 
				rootDiv.appendChild(divPaginator);
				var buttonPagiantor = document.createElement("BUTTON");
				buttonPagiantor.onclick = function() {
					_repaint(_$element,_layout,data.paginator.next);
				};					
				buttonPagiantor.appendChild(document.createTextNode("Next"));

				var buttonPagiantorBack = document.createElement("BUTTON");
				buttonPagiantorBack.appendChild(document.createTextNode("Back"));
			//	buttonPagiantorBack.disabled = true;
				buttonPagiantorBack.onclick = function() {
					_repaint(_$element,_layout,data.paginator.back);
				};					

				divPaginator.appendChild(buttonPagiantorBack);
				divPaginator.appendChild(buttonPagiantor);
				divPaginator.appendChild(divPaginatorInfo);

				buttonPagiantorBack.style = paginatorButtonStyle;
				buttonPagiantor.style.float = "LEFT";
				buttonPagiantor.style = paginatorButtonStyle;
				buttonPagiantor.style.float = "RIGHT";
				divPaginatorInfo.style = paginatorInfoStyle;
				divPaginatorInfo.appendChild(document.createTextNode(data.paginator.desc));

				//buttonPagiantorBack.style.display = "none";

				//Draw header
				var tr = document.createElement("TR");

				for(var i=0; i<data.numberOfColumns; i++) {
					var th = document.createElement("TH");
					var textHeader = document.createTextNode(data.header[i])
					table.appendChild(tr);
					tr.appendChild(th);
					th.appendChild(textHeader);
					th.style = thStyle;
				}
				
				var rows = [];
				
				var buttons = []; // Controller button for bold
				var inputColors = []; // Controller color picker
				var buttonBorders = []; // Controller button for border
				
				//Draw body and make Row objects
				for(var i=0; i<data.numberOfRows; i++) {
					var tr = document.createElement("TR");

					var tds = []
					for(var u=0; u<data.numberOfColumns; u++) {
						var td = document.createElement("TD");
						var elementText = document.createTextNode(data.body[i][u].qText)
						tr.appendChild(td);
						td.appendChild(elementText);
						td.style = tdStyle;
						tds.push(td);
					}

					if(showControlls) {
						var tdController = document.createElement("TD");

						// "Set to bold"-button
						var button = document.createElement("BUTTON");
						var textBold = document.createTextNode("Bold")
						button.appendChild(textBold);
						tdController.appendChild(button);
						button.style = inputStyle;

						// Background color picker
						var inputColor = document.createElement("INPUT");
						inputColor.type = "color";
						tdController.appendChild(inputColor);
						inputColor.style = inputStyle;

						// "Unset color"-button
						var buttonUnsetColor = document.createElement("BUTTON");
						var textUnsetColor = document.createTextNode("Unset color");
						buttonUnsetColor.appendChild(textUnsetColor);
						tdController.appendChild(buttonUnsetColor);
						buttonUnsetColor.style = inputStyle;

						// "Border"-button
						var buttonBorder = document.createElement("BUTTON");
						var textBorder = document.createTextNode("Border")
						buttonBorder.appendChild(textBorder);
						tdController.appendChild(buttonBorder);
						buttonBorder.style = inputStyle;

						buttons[i] = button;
						buttonBorders[i] = buttonBorder;
						inputColors[i] = inputColor;
						
						tr.appendChild(tdController);

					}
					table.appendChild(tr);
					
					var hash = "";
					for(var u=0; u<data.numberOfColumns; u++) {
						var us = ""+u; 
						hash +=  "|"+us+"|"+data.body[i][u].qText; // TODO: Only dimensions? changing format on measure breaks this way
					}

					var row = new Row(tds,button,inputColor,buttonBorder,buttonUnsetColor,  data.rowIdentifier[i]  );
					rows.push(row);
				}
				
				for(var i=0; i<rows.length; i++) {
					rows[i].nextRow = i==rows.length-1 ? null : rows[i+1];
					rows[i].previousRow = i==0 ? null : rows[i-1];
				}

				_styleSettings.getStyleSettings(function(styleSettings){
					for(var i=0; i<rows.length; i++) {
						var aboveStyle = i===0 ? null : styleSettings[rows[i-1].hash];
						var belowStyle = i===rows.length-1 ? null : styleSettings[rows[i+1].hash];
						rows[i].updateStyle(styleSettings[rows[i].hash],aboveStyle,belowStyle);

							buttons[i].style.fontWeight = styleSettings[rows[i].hash].bold === true ? "bold" : "normal";
							buttonBorders[i].style.fontWeight = styleSettings[rows[i].hash].border === true ? "bold" : "normal";
							inputColors[i].value = styleSettings[rows[i].hash].color === null ? "#000000" : styleSettings[rows[i].hash].color;
						}
				
				});
				
				rootDiv.appendChild(table);
				$element.append(rootDiv);		
		}
		
		// ---
		
		// -- getData --
		// -- Simplify hybercube with simple interface --
		// -- TODO: validation, NOTE: have a function like this makes debug easier. Can return "hardcoded" data here.
		// -- NOTE: good to have a "wrapper" method like this if want to fetch data from other sources
		function getData(hc,page) {
		
			var rows = page.qMatrix.length;
			var rowIdentifier = new Array();
			var headers = new Array();
			for (var i = 0; i < hc.qDimensionInfo.length; i++) {
				headers.push(hc.qDimensionInfo[i].qFallbackTitle);
			}
			for (var i = 0; i < hc.qMeasureInfo.length; i++) {
				headers.push(hc.qMeasureInfo[i].qFallbackTitle);
			}

			for(var i=0; i<page.qMatrix.length; i++) {
				rowIdentifier[i] = "";
				for (var u = 0; u < hc.qDimensionInfo.length; u++) {
					rowIdentifier[i] += "|"+u+"|"+page.qMatrix[i][u].qText; //TODO: make a JSON object and stringify. This solution has a VERY small chance of not working. JSON should work better
				}
			}
			
			var start = page.qArea.qTop+1;
			var end = page.qArea.qHeight+page.qArea.qTop;
			
			return {
				"header": headers,
				"body": page.qMatrix,
				"numberOfColumns": headers.length,
				"numberOfRows": rows,
				"rowIdentifier": rowIdentifier,
				"paginator": {
								"desc": start + "-" + end,
								"next": {"top":page.qArea.qTop+_numberOfRowsPerPage,"height":_numberOfRowsPerPage},
								"back": {"top":page.qArea.qTop-_numberOfRowsPerPage,"height":_numberOfRowsPerPage},
						     }
			};
		}
		// --

				
		// -- Row --
		// -- Binds HTML-logic to StyleSettings --
		var Row = function(tds,button,colorPicker,borderButton,buttonUnsetColor,index) {

			var row = this;
								
			var tds = tds; // list of <TD>-tags found in this Row
			this.hash = index;
			this.updateStyle = function(s,styleAbove,styleBelow) {
						
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
			};
			
			$(button).click(function(){
				_styleSettings.switchBold(index);
			});

			$(borderButton).click(function(){
				_styleSettings.switchBorder(index);
			});
			
			$(colorPicker).change(function(){
				_styleSettings.setColor(index,$(this).val());
			});

			$(buttonUnsetColor).click(function(){
				_styleSettings.unsetColor(index);
				$(colorPicker).val("#000000");
			});
			
		}	
		// --
		
        return {

            definition: {
				type: "items",
				component: "accordion",
				items: {
					data: {
						uses: "data"
					},
					sorting: {
						uses: "sorting"
					},
					appearance: {
						uses: "settings",
						items: {
							showStyleSettings: {
								ref: "props.showStyleSettings",
								component: "switch",
								type: "boolean",
								label: "Show Style Settings",
								options: [{
									value: true,
									label: "Show"
								}, {
									value: false,
									label: "Hide"
								}],
								defaultValue: true	
							},
							numberOfRowsPerPage: {
								type: "integer",
								label: "Number of Rows per Page",
								ref: "props.numberOfRowsPerPage",
								defaultValue: defaultPageSize
							}
						}
					}
				}
			},		
			paint: function ( $element, layout ) {
				backendApi = this.backendApi;
				_styleSettings = styleSettings.create(backendApi);
				
				if(layout.props.numberOfRowsPerPage !== undefined) _numberOfRowsPerPage = layout.props.numberOfRowsPerPage;
				_$element = $element;
				_layout = layout;
				_repaint(_$element,_layout,{"top":0,"height":_numberOfRowsPerPage});
			}
        };
    } );