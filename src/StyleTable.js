
define( ["./Main","text!./css/style.css","./definition"],
  function ( Main, cssContent, Definition ) {
    'use strict';

    $( '<style>' ).html(cssContent).appendTo( 'head' );

    // Settings
    var defaultPageSize = 10;
    var defaultPageHandler = 1;
    var defaultDisableSortWhenOnHeaderClick = true;
    var defaultDisableSortArrow = true;
    var defaultDisableColResize = true;
    var defaultDisableSelectValues = true;
    var disableGroupLabel = false;

        return {
            initialProperties : {
                selectionMode : "CONFIRM"
            },
            "definition": Definition(defaultPageSize,defaultPageHandler,defaultDisableSortWhenOnHeaderClick,defaultDisableSortArrow,defaultDisableColResize,defaultDisableSelectValues,disableGroupLabel),
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
      var disableColResize = layout.props.disableColResize===undefined ? defaultDisableColResize : layout.props.disableColResize;
      var disableSelectValues = layout.props.disableSelectValues===undefined ? defaultDisableSelectValues : layout.props.disableSelectValues;

      if(!disableSelectValues) main.enableSelectOnValues();
      if(!disableColResize) main.enableDragResizeColumn();
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
