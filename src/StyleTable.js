
define( ["./Main","text!./css/style.css"],
  function ( Main, cssContent, imgArrow ) {
    'use strict';

    $( '<style>' ).html(cssContent).appendTo( 'head' );
    var defaultPageSize = 10;
    var defaultPageHandler = 1;
		var painted = false;
    var defaultDisableSortWhenOnHeaderClick = true;
    var defaultDisableSortArrow = true;

        return {
            initialProperties : {
                selectionMode : "CONFIRM"
            },
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
								defaultValue: defaultPageHandler,
								options: [{
									value: 2,
									label: "Paginator"
								}, {
									value: 1,
									label: "Scroll down"
								}],
							},
              disableSortWhenOnHeaderClick: {
                ref: "props.disableSortWhenOnHeaderClick",
								component: "switch",
                label: "Disable sort on header click",
                type: "boolean",
                options: [{
									value: true,
									label: "Disable"
								}, {
									value: false,
									label: "Enable"
								}],
								defaultValue: defaultDisableSortWhenOnHeaderClick
              },
              disableSortArrow: {
                ref: "props.disableSortArrow",
                label: "Hide sort arrow",
								component: "switch",
                type: "boolean",
                options: [{
									value: true,
									label: "Hide"
								}, {
									value: false,
									label: "Show"
								}],
								defaultValue: defaultDisableSortArrow
              }
						}
					}
				}
			},
            support: {
                export: true,
                exportData: false
            },
    paint: function ( $element, layout ) {

      var main = new Main(this.backendApi,$element, layout,!layout.props.showStyleSettings,this);

      var rowPerPage = layout.props.numberOfRowsPerPage===undefined ? defaultPageSize : layout.props.numberOfRowsPerPage;
      var pageHandler = layout.props.pageHandler===undefined ? defaultPageHandler : layout.props.pageHandler;
      var disableSortWhenOnHeaderClick = layout.props.disableSortWhenOnHeaderClick===undefined ? defaultDisableSortWhenOnHeaderClick : layout.props.disableSortWhenOnHeaderClick;
      var disableSortArrow = layout.props.disableSortArrow===undefined ? defaultDisableSortArrow : layout.props.disableSortArrow;

      if(false) main.enableSelectOnValues();
      if(!disableSortWhenOnHeaderClick) main.enableSortWhenOnHeaderClick();
      if(!disableSortArrow) main.enableSortArrow();

      if(pageHandler===1) {
        main.scrollMode(rowPerPage);
      }
      else {
        throw "Invalid page handler: "+layout.props.pageHandler;
      }
		}
  };
});
