define( [], function () {
  'use strict';

  var DataFromBackend = function(backendApi,rowPerPage,layout) {

    this.pages = [];
    var _this = this;
    var top = 0;

    /*
    this.push = function(callbackWhenDone) {
      callbackWhenDone();
      return;

      var requestPages = [{
        qTop: top,
        qLeft: 0,
        qWidth: 2,//getHeaders().length, //TODO: figure oout if this is the correct way to view all columns
        qHeight: rowPerPage
      }];



      // first, get data from backend api and build and append html rows based on data...
      backendApi.getData( requestPages ).then( function ( dataPages ) {
        console.log(dataPages);
        var dataPage = dataPages[0];
        _this.pages = _this.pages.concat([dataPage]);
        console.log(_this.pages);

        var qArea = dataPage.qArea;
        var nextTop = qArea.qTop+qArea.qHeight;
        var isNoMoreData = qArea.qHeight===0;

        top = top + rowPerPage;

        callbackWhenDone(dataPages.length);
      });
    }
    */
    this.pop = function(callback) {
      /*
      var r = _this.pages;
      _this.pages = [];*/

      var hc = layout.qHyperCube;

      var requestPages = [{
        qTop: top,
        qLeft: 0,
        qWidth: (hc.qDimensionInfo ? hc.qDimensionInfo.length : 0) + (hc.qMeasureInfo ? hc.qMeasureInfo.length : 0),//getHeaders().length, //TODO: figure oout if this is the correct way to view all columns
        qHeight: rowPerPage
      }];



      // first, get data from backend api and build and append html rows based on data...
      backendApi.getData( requestPages ).then( function ( dataPages ) {

        var dataPage = dataPages[0];
      //  _this.pages = _this.pages.concat([dataPage]);


        var qArea = dataPage.qArea;
        var nextTop = qArea.qTop+qArea.qHeight;
        var isNoMoreData = qArea.qHeight===0;

        top = top + rowPerPage;
        callback([dataPage],isNoMoreData);
//        callbackWhenDone(dataPages.length);
      });


    }

    this.hasPages = function() {
      return _this.pages.length > 0;
    }

  }
  return DataFromBackend;
});
