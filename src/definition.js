define( [], function () {
  'use strict';

    var Definition = function(defaultPageSize,defaultPageHandler,defaultEnableSortWhenOnHeaderClick,defaultEnableSortArrow,defaultEnableColResize,defaultEnableSelectValues,disableGroupLabel) {

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

                aheader: {
                  items: {

                    showStyleSettings: {
                      ref: "props.showStyleSettings",
                      component: "checkbox",
                      type: "boolean",
                      label: "Show style settings",
                      defaultValue: false
                    },

                    enableColResize: {
                      ref: "props.enableColResize",
                      component: "checkbox",
                      type: "boolean",
                      label: "Enable column resizer",
                      defaultValue: defaultEnableColResize
                    },

                    enableSortWhenOnHeaderClick: {
                      ref: "props.enableSortWhenOnHeaderClick",
                      component: "checkbox",
                      label: "Enable sort on header click",
                      type: "boolean",
                      defaultValue: defaultEnableSortWhenOnHeaderClick
                    },
                    enableSortArrow: {
                      ref: "props.enableSortArrow",
                      label: "Enable sort arrow",
                      component: "checkbox",
                      type: "boolean",
                      defaultValue: defaultEnableSortArrow
                    },

                    enableSelectValues: {
                      ref: "props.enableSelectValues",
                      component: "checkbox",
                      type: "boolean",
                      label: "Enable Select values",
                      defaultValue: defaultEnableSelectValues
                    },
                    numberOfRowsPerPage: {
                      type: "integer",
                      label: "Number of Rows per Page",
                      ref: "props.numberOfRowsPerPage",
                      defaultValue: defaultPageSize
                    },

                  },
                  label: "StyleTable specific",
                  type: "items"
                },
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
