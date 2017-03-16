
define( ["./Main","text!./css/style.css","./definition","./DataFromBackend"],
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

          (function($element, layout,_this){


            var rowPerPage = layout.props.numberOfRowsPerPage===undefined ? defaultPageSize : layout.props.numberOfRowsPerPage;


//            try {

              var dataStack = new DataFromBackend(_this.backendApi,rowPerPage,layout);

                var main = new Main(_this.backendApi,$element, layout,!layout.props.showStyleSettings,_this);
                main.dataStack = dataStack;


                $element.empty();
                var d = document.createElement("div")
                var s = new Date().toLocaleString();

                /*
                dataStack.pop(function(a){



                    $element.empty();

                    for(var i=0; i<a.length; i++) {
                      d.appendChild(document.createTextNode("_1_testa_"+JSON.stringify(a[i])+", "+a.length+"."+sizee+"|")  );
                    }
                  $element.append( d );
                  setTimeout(function(){ resolve(); },1000);
                  return;
                });*/
                //return;
                var pageHandler = layout.props.pageHandler===undefined ? defaultPageHandler : layout.props.pageHandler;
                var enableSortWhenOnHeaderClick = layout.props.enableSortWhenOnHeaderClick===undefined ? defaultEnableSortWhenOnHeaderClick : layout.props.enableSortWhenOnHeaderClick;
                var enableSortArrow = layout.props.enableSortArrow===undefined ? defaultEnableSortArrow : layout.props.enableSortArrow;
                var enableColResize = layout.props.enableColResize===undefined ? defaultEnableColResize : layout.props.enableColResize;
                var enableSelectValues = layout.props.enableSelectValues===undefined ? defaultEnableSelectValues : layout.props.enableSelectValues;

                if(enableSelectValues) main.enableSelectOnValues();
                if(enableColResize) main.enableDragResizeColumn();
                if(enableSortWhenOnHeaderClick) main.enableSortWhenOnHeaderClick();
                if(enableSortArrow) main.enableSortArrow();

                try {
                  if(_this.backendApi.getProperties) {
                    main.scrollMode(rowPerPage);
                  }
                  else {
                    main.oneFetch(rowPerPage);
                  }
                }
                catch(e) {
                //  $element.empty();
                  d.appendChild(document.createTextNode("_4_testa_"+e));
                  $element.append( d );
                  setTimeout(function(){ resolve(); },1000);
                  return;
                }
                setTimeout(function(){ resolve(); },1000);

                /*
                $element.empty();
                d.appendChild(document.createTextNode("_4_testa_"));
                $element.append( d );
                setTimeout(function(){ resolve(); },1000);
                */
  //              setTimeout(function(){ resolve(); },100);



              return;
  //            throw "l";


            main.dataStack.push( function(){




              setTimeout(function(){ resolve(); },100);
            });


            /*
            }
            catch(e) {

              var d = document.createElement("div")
              var s = new Date().toLocaleString();
              d.appendChild(document.createTextNode(s+" , "+e));
              $element.append( d );

              setTimeout(function(){ resolve(); },100);
            }*/





          })($element, layout,_this);



        });

      }
    };
});
