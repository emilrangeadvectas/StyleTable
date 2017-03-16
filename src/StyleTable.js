
define( ["./Main","text!./css/_style.css","./definition"],
  function ( Main, cssContent, Definition,DataFromBackend ) {
    'use strict';

    $( '<style>' ).html(cssContent).appendTo( 'head' );

    // Settings
    var defaultPageSize = 10;
    var defaultPageHandler = 1;
    var defaultEnableSortWhenOnHeaderClick = false;
    var defaultEnableSortArrow = false;
    var defaultEnableColResize = false;
    var defaultEnableSelectValues = false;
    var disableGroupLabel = false;

    return {
      initialProperties : {
        selectionMode : "CONFIRM"
      },
      "definition": Definition(defaultPageSize,defaultPageHandler,defaultEnableSortWhenOnHeaderClick,defaultEnableSortArrow,defaultEnableColResize,defaultEnableSelectValues,disableGroupLabel),
      support: {
        export: true,
        exportData: true
      },
      paint: function ( $element, layout ) {

        var _this = this;
        return new Promise(function(resolve,reject){

          var rowPerPage = layout.props.numberOfRowsPerPage===undefined ? defaultPageSize : layout.props.numberOfRowsPerPage;
          var main = new Main(_this.backendApi,$element, layout,!layout.props.showStyleSettings,_this,rowPerPage);

          var pageHandler = layout.props.pageHandler===undefined ? defaultPageHandler : layout.props.pageHandler;
          var enableSortWhenOnHeaderClick = layout.props.enableSortWhenOnHeaderClick===undefined ? defaultEnableSortWhenOnHeaderClick : layout.props.enableSortWhenOnHeaderClick;
          var enableSortArrow = layout.props.enableSortArrow===undefined ? defaultEnableSortArrow : layout.props.enableSortArrow;
          var enableColResize = layout.props.enableColResize===undefined ? defaultEnableColResize : layout.props.enableColResize;
          var enableSelectValues = layout.props.enableSelectValues===undefined ? defaultEnableSelectValues : layout.props.enableSelectValues;

          if(enableSelectValues) main.enableSelectOnValues();
          if(enableColResize) main.enableDragResizeColumn();
          if(enableSortWhenOnHeaderClick) main.enableSortWhenOnHeaderClick();
          if(enableSortArrow) main.enableSortArrow();

          if(_this.backendApi.getProperties) {
            main.scrollMode(rowPerPage);
          }
          else {
            main.oneFetch(rowPerPage);
          }
          setTimeout(function(){ resolve(); },1000);
        });
      }
    };
});
