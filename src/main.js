define( ["./styleSettings","./scrolldownTable"], function (styleSettings,ScrolldownTable) {
	'use strict';

	var main = function(backendApi,$element,layout,hideControlls) {
	
		var backendApi = backendApi;
		var $element = $element;
		var layout = layout;
		var _styleSettings = styleSettings.create(backendApi);
		var hideControlls = hideControlls;
		
		var Row = function(tr,button,colorPicker,borderButton,buttonUnsetColor,index) {

			var row = this;
								
			var tds = Array.prototype.slice.call( tr.getElementsByTagName("td") );
			console.log(tds);
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
		
		var buildController = function(tr,hash,style,skipPanel) {
		
			if(!skipPanel) {
				var inputStyle = "padding:1px;margin:0; height:20px; border:0;vertical-align:top;margin-left:3px";

				var tdController = document.createElement("TD");

				// "Set to bold"-button
				var button = document.createElement("BUTTON");
				var textBold = document.createTextNode("Bold")
				button.appendChild(textBold);
				tdController.appendChild(button);
				button.style = inputStyle;
                button.style.fontWeight = style.bold===true ? "bold" : "normal";

				// Background color picker
				var inputColor = document.createElement("INPUT");
				inputColor.type = "color";
				tdController.appendChild(inputColor);
				inputColor.style = inputStyle;
				inputColor.value = style.color;

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
                buttonBorder.style.fontWeight = style.border===true ? "bold" : "normal";

			}
			var row = new Row(tr,button,inputColor,buttonBorder,buttonUnsetColor,  hash  );
			row.style = style;
			//if(style!==undefined) row.updateStyle(style,null,null);
			row.tdController = tdController;
			return row;
		}	
		
		var getRawBodyRows = function(data) {
			var tdStyle = "padding: 4px; font-size:14px; text-align:left";

			console.log(data);
			var qMatrix = data.qMatrix;
			var trs = {}
			for(var i=0; i<qMatrix.length; i++) {
				var tr = document.createElement("TR");

				var hash = "";
				for(var u=0; u<1; u++) { //TODO: find a correct way to solve identify hash
					var us = ""+u; 
					hash +=  "|"+us+"|"+qMatrix[i][u].qText;
				}
				trs[hash] = tr;
				for(var u=0; u<qMatrix[i].length; u++) {
					var td = document.createElement("TD");
					var elementText = document.createTextNode(qMatrix[i][u].qText)
					tr.appendChild(td);
					td.appendChild(elementText);
					td.style = tdStyle;
				}
			}
			return trs;
		};
	
		var getRawTable = function(layout,callback) {
		
			var table = document.createElement("TABLE");

			var thStyle = "padding: 4px; font-size:16px; text-align:left; border-bottom: 1px solid #555";

			//var data = getData(layout.qHyperCube,dataPage);
			
			var headers = getHeadersFromLayout(layout);
			
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

		var load = function(top,height,table,callbackWhenDone) {
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
				var trs = getRawBodyRows(dataPage);
				
				_styleSettings.getStyleSettings(function(c){
				var rows = [];
				for(var i in trs) {
					var tr = trs[i];
					var row = buildController(tr,i,c[i], hideControlls );
					if(row.tdController)tr.appendChild( row.tdController )
					rows.push(row);
					table.appendChild(tr);
				}
				
				for(var i=0; i<rows.length; i++) {
					var styleAbove = i===rows.length-1 ? null : rows[i+1].style;
					var styleBelow = i===0 ? null : rows[i-1].style;
					rows[i].updateStyle(rows[i].style,styleBelow,styleAbove);
				}
				
				var qArea = dataPage.qArea;
				callbackWhenDone(qArea.qTop+qArea.qHeight,qArea.qTop-height,""+(qArea.qTop+1)+"-"+(qArea.qTop+qArea.qHeight),qArea.qHeight===0);
				});
			});	
		}

		this.paginatorMode = function(rowsPerPage) {

			var paginatorButtonStyle = "font-size:18px;";
			var paginatorInfoStyle =  "margin: 0 auto 0 auto; width:300px; text-align:center; font-size:18px";
			var _next = 0;
			var _back = 0;
			var elements = redraw($element,layout);
			
			var divPaginator = document.createElement("DIV");
			var divPaginatorInfo = document.createElement("DIV"); 
			var buttonPagiantor = document.createElement("BUTTON");
			buttonPagiantor.onclick = function() {
				var t = elements.table;
				while(t.childElementCount!==1) {
					t.removeChild(t.lastChild);
				}
				load(_next,rowsPerPage,elements.table,function(next,back,info){
					_next = next;
					_back = back;
					buttonPagiantor.style.display = _next===null ? "none" : "inline";
					divPaginatorInfo.innerHTML = info;
				});
			};					
			buttonPagiantor.appendChild(document.createTextNode("Next"));
			var buttonPagiantorBack = document.createElement("BUTTON");
			buttonPagiantorBack.appendChild(document.createTextNode("Back"));
			//	buttonPagiantorBack.disabled = true;
			buttonPagiantorBack.onclick = function() {
				var t = elements.table;
				while(t.childElementCount!==1) {
					t.removeChild(t.lastChild);
				}
				load(_back,rowsPerPage,elements.table,function(next,back,info){
					_next = next;
					_back = back;
					divPaginatorInfo.innerHTML = info;
				});
			};					
			divPaginator.appendChild(buttonPagiantorBack);
			divPaginator.appendChild(buttonPagiantor);
			divPaginator.appendChild(divPaginatorInfo);
			buttonPagiantorBack.style = paginatorButtonStyle;
			buttonPagiantor.style.float = "LEFT";
			buttonPagiantor.style = paginatorButtonStyle;
			buttonPagiantor.style.float = "RIGHT";
			divPaginatorInfo.style = paginatorInfoStyle;
			
			elements.rootDiv.appendChild(divPaginator);
		}
		
		this.scrollMode = function(rowsPerPage) {
            var elements = redraw($element,layout);
            var scrolldownTable = new ScrolldownTable(rowsPerPage, elements.rootDiv, function(top,rowsPerPage,callback){
                load(top,rowsPerPage,elements.table,function(next,x,y,end){
                    callback(next,end);
				});               
            });
		}
		
		var redraw = function($element,layout) {
			$element.empty();
			var rootDiv = document.createElement("DIV");
			$element.append(rootDiv);

			var canvasWidth = $element[0].clientWidth;
			var canvasHeight = $element[0].clientHeight;
			rootDiv.style.width = canvasWidth+"px";
			rootDiv.style.height = canvasHeight+"px";
			rootDiv.style.overflowY = "scroll";
            
			var table = getRawTable(layout);
			table.style.width = (canvasWidth-10)+"px";
			rootDiv.appendChild(table);			
			return { "rootDiv":rootDiv, "table":table};
		};

	};

	var mainFactory = function() {
		this.create = function(backendApi,$element,layout,hideControlls) {		
			return new main(backendApi,$element,layout,hideControlls);
		};
	};
	
	return new mainFactory();
});