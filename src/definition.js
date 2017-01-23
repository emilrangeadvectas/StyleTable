define( [], function () {
  'use strict';

    var Definition = function(defaultPageSize,defaultPageHandler,defaultDisableSortWhenOnHeaderClick,defaultDisableSortArrow,defaultDisableColResize,defaultDisableSelectValues,disableGroupLabel) {

      var defGroupLabel = {
        type: "string",
        label: "Group label",
        ref: "qDef.propGroupLabel",
        expression: "never",
        defaultValue: null
      }

      var definitionObject = {
        type: "items",
        component: "accordion",
        items: {
          dimensions: {
            uses: "dimensions",
            },
            measures: {
              uses: "measures",
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
                disableColResize: {
                  ref: "props.disableColResize",
                  component: "switch",
                  type: "boolean",
                  label: "Disable Column resizer",
                  options: [{
                    value: true,
                    label: "Disable"
                  }, {
                    value: false,
                    label: "Enable"
                  }],
                  defaultValue: true
                },
                disableSelectValues: {
                  ref: "props.disableSelectValues",
                  component: "switch",
                  type: "boolean",
                  label: "Disable Select values",
                  options: [{
                    value: true,
                    label: "Disable"
                  }, {
                    value: false,
                    label: "Enable"
                  }],
                  defaultValue: defaultDisableSelectValues
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
        }

        if(!disableGroupLabel) {
          definitionObject.items.dimensions.items = {
            groupLabel: defGroupLabel
          };

          definitionObject.items.measures.items = {
            groupLabel: defGroupLabel
          };
        }

        return definitionObject;

    }

    return Definition;

});
