
define( ["jquery","./styleSettings","./main"],
    function ( $, styleSettings, mainFactory ) {
        'use strict';

		var defaultPageSize = 10;
		var painted = false;
		
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
							},
							pageHandler: {
								type: "integer",
								component: "switch",
								label: "Page handler",
								ref: "props.pageHandler",
								defaultValue: defaultPageSize,
								options: [{
									value: 2,
									label: "Paginator"
								}, {
									value: 1,
									label: "Scroll down"
								}],
							}
						}
					}
				}
			},		
			paint: function ( $element, layout ) {
                console.log("repaint!");
				var main = mainFactory.create(this.backendApi,$element, layout,!layout.props.showStyleSettings);
                var rowPerPage = layout.props.numberOfRowsPerPage===undefined ? defaultPageSize : layout.props.numberOfRowsPerPage;
                if(layout.props.pageHandler===1) {
                    main.scrollMode(rowPerPage);
                }
                else if(layout.props.pageHandler===2){
                    main.paginatorMode(rowPerPage);
                }
                else {
                    throw "Invalid page handler: "+layout.props.pageHandler;
                }
			}
        };
    } );