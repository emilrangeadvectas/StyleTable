define( [], function () {

  // TODO: when click on other dimension, switch to that dimension if not any selected cells (even if that dimension is currenly selected)
  // TODO: use Cell objects instead of dimIndex and rowIndex more
  // TODO: some values can be selected that make an error. "see the '-' value in matris". Make these values none clickable (see if there is any flag on those)
  var SelectedValuesHandler = function(qlik) {

    var _this = this;

    // This controls the styling and select logic of a ValueCell (a cell that can be selected)
    // @param rowIndex, row of value
    // @param dimIndex, dimension(index) of value
    // @param tds (what TD-elements that should be visual affected by any select logic on extension)
    var ValueCell = function(rowIndex,dimIndex,tds) {

      var _super = new Cell(tds);

      var td1 = _super.td1;
      var td2 = _super.td2;
      //the order of the td-elements matter since they both are being styled diffently (td1 is "real" td-element, td2 is the element under the grab-col-resize-td-cell)

      this.refresh = function() {
        if(dimIndex==currentSelectDimension) {
          td1.style.fontWeight = "normal";
          td2.style.fontWeight = "normal";
          td1.style.border = "0";
          td2.style.border = "0";
          td2.style.borderRight = "1px solid #999";
          td2.style.borderBottom = "1px solid #ccc";
          td1.style.borderBottom = "1px solid #ccc";

          if(getValue(dimIndex,rowIndex)) {
            td1.style.backgroundColor = "#5f5";
            td2.style.backgroundColor = "#5f5";
          }
          else {
            td1.style.backgroundColor = "";
            td2.style.backgroundColor = "";
          }
        }
        else {
          _super.refresh();
        }
      }

      this.switch = function() {
        onTrySwitch(dimIndex,rowIndex);
      }

    }

    // This controls the styling of a Cell (a standard cell do not handle select style but can be blurred during a select state on extension)
    // @param tds (what TD-elements that should be visual affected by any select logic on extension)
    var Cell = function(tds) {

      var td1 = tds[0];
      var td2 = tds.length>1 ? tds[1] : null;

      this.td1 = td1;
      this.td2 = td2;

      this.refresh = function() {
        if(currentSelectDimension!==null) {
          td1.style.backgroundImage = "url('/extensions/StyleTable/img/dash.png')";
          if(td2!==null)td2.style.backgroundImage = "url('/extensions/StyleTable/img/dash.png')";
        }
      }
    };

    var selected = new Array(); // All selected values (form om rowIndex and dimensionIndex matris)
    var cells = new Array(); // All added Cells (and ValueCells)
    var currentSelectDimension = null; // What dimension (by index) are currently being selected values from (if null, not select state)

    // ----------------------------------------------------
    // switchValue and getValue is simple way to put an get data from a matris without getting errors. It also handle a default value that not is set to false
    // (this is being used to keep a track on what values are being selected based on their rowIndex and dimensionIndex)
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
    // ----------------------------------------------------

    // this calls qlik to select value based on dimension och row index
    var selectValues = function(dimensionIndex,rowIndex) {
      qlik.selectValues(dimensionIndex,rowIndex,true);
    }

    // This methods makes sure select value call do not pass through if not right condition
    // (right condition is a value can only be selected if not any current select state or the value is in the current selected dimension group)
    var onTrySwitch = function(dimIndex,rowIndex) {

      if(currentSelectDimension===null || dimIndex===currentSelectDimension) {
        switchValue(dimIndex,rowIndex);
        currentSelectDimension = dimIndex;
        selectValues(dimIndex, [rowIndex]);
        _this.refresh();
      }

    }

    // This adds a ValueCell and returns it
    // @see ValueCell
    // @param dimIndex this cells dimension
    // @param rowIndex this cells row
    // @param tds what td-element that should be affected, by style, on select or any select on other value cell
    this.addValueCell = function(dimIndex,rowIndex,tds) {
      var valueCell = new ValueCell(rowIndex,dimIndex,tds);
      cells.push(valueCell);
      return valueCell;
    }

    // This adds a Cell and returns it
    // @see Cell
    // @param tds what td-element that should be affected, by style, on any select
    this.addCell = function(tds) {
      var cell = new Cell(tds);
      cells.push(cell);
      return cell;
    }

    //This refersh, style, of all Cells that been added
    // @see addCell
    // @see addValueCell
    this.refresh = function() {
      for(var i =0; i<cells.length; i++) {
        cells[i].refresh();
      }
    }

  };

  return SelectedValuesHandler;

});
