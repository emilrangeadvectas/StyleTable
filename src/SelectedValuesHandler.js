define( [], function () {

  var SelectedValuesHandler = function(self) {

    var ValueColumn = function(rowIndex,dimIndex,td,td2) {
      this.rowIndex = rowIndex;
      this.dimIndex = dimIndex;

      this.refresh = function() {
        if(dimIndex==currentSelectDim) {
          td.style.fontWeight = "normal";
          td2.style.fontWeight = "normal";
          td.style.border = "0";
          td2.style.border = "0";
          td2.style.borderRight = "1px solid #999";
          //td.style.borderLeft = "1px solid #999";
          td2.style.borderBottom = "1px solid #ccc";
          td.style.borderBottom = "1px solid #ccc";

          if(getValue(dimIndex,rowIndex)) {
            td.style.backgroundColor = "#5f5";
            td2.style.backgroundColor = "#5f5";
          }
          else {
            td.style.backgroundColor = "";
            td2.style.backgroundColor = "";

          }
        }
        else if(currentSelectDim!==null) {
          td.style.backgroundImage = "url('/extensions/StyleTable/img/dash.png')";
          td2.style.backgroundImage = "url('/extensions/StyleTable/img/dash.png')";
        }

      }

    }

    var Column = function(td,td2) {
      this.refresh = function() {
        if(currentSelectDim!==null) {
          td.style.backgroundImage = "url('/extensions/StyleTable/img/dash.png')";
          if(td2!==null)td2.style.backgroundImage = "url('/extensions/StyleTable/img/dash.png')";
        }

      }

    };

    var selected = new Array();
    var columns = new Array();
    var currentSelectDim = null;

    var switchValue = function(x,y) {
      if(selected[x]===undefined) {
        selected[x] = new Array();
        selected[x][y] = true;
        return selected[x][y];
      }
      selected[x][y] = selected[x][y] ? false : true;
      return selected[x][y];
    }

    var getValue = function(x,y) {
      if(selected[x]===undefined) {
        return false;
      }
      return selected[x][y] ? true : false;
    }

    var selectValues = function(d,r) {
      self.selectValues(d,r,true);
    }

    var _click = function(dimIndex,rowIndex,span) {

      if(currentSelectDim===null || dimIndex===currentSelectDim) {
        switchValue(dimIndex,rowIndex);
        currentSelectDim = dimIndex;
        selectValues(dimIndex, [rowIndex]);
        for(var i =0; i<columns.length; i++) {
          columns[i].refresh();
        }
      }

    }

    this.addValueColumn = function(dimIndex,rowIndex,td,td2) {
      var o = new ValueColumn(rowIndex,dimIndex,td,td2);
      o.click = function() {
        _click(dimIndex,rowIndex,td,td2);
      }
      columns.push(o);
      return o;
    }

    this.addColumn = function(td,td2) {
      var o = new Column(td,td2);
      columns.push(o);
      return o;
    }

  };

  return SelectedValuesHandler;

});
