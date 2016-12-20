define( ["jquery"],
    function ( $,async ) {
        'use strict';

		var backendApi = null;
		var currentPageCursor = 0;
		var _$element = null;
		var _layout = null;
		/*
		
			TODO: font color.
			Buttons and inputs should "save" their state. "Bold" -> "Unbold", Keep color in input field.
			Always hide controlls when in edit.
			me
		*/
		
		// -- Style Setting --
		// -- A StyleSetting is a is mutable Object that has border, color, bold, and being saved in "global" scope. --
		// -- A StyleSetting is saved on a index. Get StyleSetting by index to get and set props. 
		//    If try get by index that is not bind to any style, style is being created, bind to index and returned --
		var styleSettings = {}; //TODO: could be private

		var StyleSetting = function() {
			this.bold = false;
			this.border = false;
			this.color = null;		
		} //TODO: could be private
		
		
		function saveSettingsToBackend() {
			backendApi.getProperties().then(function(r){
				if(r.meta) {
					backendApi.applyPatches([ {"qPath":"/meta","qOp":"replace","qValue":JSON.stringify(styleSettings)} ],false);
				}
				else {
					backendApi.applyPatches([ {"qPath":"/meta","qOp":"add","qValue":JSON.stringify(styleSettings)} ],false);		
				}
			});
		}

		function _repaint($element,layout) {
				loadSettingsFromBackend(function(){
				
					var requestPage = [{
						qTop: currentPageCursor,
						qLeft: 0,
						qWidth: 10,
						qHeight: 9
					}];
					backendApi.getData( requestPage ).then( function ( dataPages ) {
						if( dataPages.length!==1 ) throw "can only draw one data page at a time";
						var dataPage = dataPages[0];
						drawTable($element,getData(layout.qHyperCube,dataPage),layout.props.showStyleSettings);
					});
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
					currentPageCursor+=9;
					_repaint(_$element,_layout);
				};					
				buttonPagiantor.appendChild(document.createTextNode("Next"));

				var buttonPagiantorBack = document.createElement("BUTTON");
				buttonPagiantorBack.appendChild(document.createTextNode("Back"));
				buttonPagiantorBack.onclick = function() {
					currentPageCursor-=9;
					_repaint(_$element,_layout);
				};					

				divPaginator.appendChild(buttonPagiantorBack);
				divPaginator.appendChild(buttonPagiantor);
				divPaginator.appendChild(divPaginatorInfo);

				buttonPagiantorBack.style = paginatorButtonStyle;
				buttonPagiantor.style.float = "LEFT";
				buttonPagiantor.style = paginatorButtonStyle;
				buttonPagiantor.style.float = "RIGHT";
				divPaginatorInfo.style = paginatorInfoStyle;
				divPaginatorInfo.appendChild(document.createTextNode(data.paginator));
				
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

				for(var i=0; i<rows.length; i++) {
					rows[i].refresh();
				}
				
				rootDiv.appendChild(table);
				$element.append(rootDiv);		
		}
		
		function loadSettingsFromBackend(callbackWhenDone) {
			backendApi.getProperties().then(function(r){
				if(r.meta) {
					styleSettings = r.meta;
				}
				callbackWhenDone();
			});
		}
		
		function getStyleSettingByHash(hash) {
				
			if(styleSettings[hash]===undefined) {
				styleSettings[hash] = new StyleSetting();
			}
			if(!styleSettings[hash]) throw "could not find and create a style on that hash: "+hash;
			return styleSettings[hash];
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
				"paginator": start + "-" + end
			};
		}
		// --

		// -- Row --
		// -- Binds HTML-logic to StyleSettings --
		var Row = function(tds,button,colorPicker,borderButton,buttonUnsetColor,index) {

			var row = this;
			this.styleSettings = getStyleSettingByHash(index);
								
			var tds = tds; // list of <TD>-tags found in this Row

			this.refresh = function() {
				for(var i=0; i<tds.length; i++) {
					var td = tds[i];					
					td.style.fontWeight = row.styleSettings.bold === true ? "bold" : "normal"
					td.style.borderTop = row.styleSettings.border === true && ( (row.previousRow && row.previousRow.styleSettings.border !== true) || row.previousRow === null ) ? "1px solid #000" : "0"
					td.style.borderBottom = row.styleSettings.border === true && row.nextRow && row.nextRow.styleSettings.border !== true ? "1px solid #000" : "0"
					if(row.styleSettings.color!==null) {
						td.style.backgroundColor = row.styleSettings.color;
					}
				}
				if(row.styleSettings.color!==null) {
					$(colorPicker).val(row.styleSettings.color)
				}
				tds[0].style.borderLeft = row.styleSettings.border === true ? "1px solid #000" : "0";
				tds[tds.length-1].style.borderRight = row.styleSettings.border === true ? "1px solid #000" : "0";
			}
			
			$(button).click(function(){
				row.styleSettings.bold = !row.styleSettings.bold;
				saveSettingsToBackend();
				row.refresh();
			});

			$(borderButton).click(function(){
				row.styleSettings.border = !row.styleSettings.border;
				saveSettingsToBackend();
				row.refresh();
				if(row.previousRow!==null) {
					row.previousRow.refresh();
				}
				if(row.nextRow!==null) {
					row.nextRow.refresh();
				}
			});
			
			$(colorPicker).change(function(){
				row.styleSettings.color = $(this).val();
				saveSettingsToBackend();
				row.refresh();
			});

			$(buttonUnsetColor).click(function(){
				row.styleSettings.color = null;
				saveSettingsToBackend();
				$(colorPicker).val("#000000");
				row.refresh();
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
							}
						}
					}
				}
			},		
			paint: function ( $element, layout ) {
				backendApi = this.backendApi;
				_$element = $element;
				_layout = layout;
				_repaint(_$element,_layout);
			}
        };
    } );