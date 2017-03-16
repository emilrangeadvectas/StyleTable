define( [], function () {
  'use strict';

  var StyleSettings = function(backendApi,layout) {

  var backendApi = backendApi;

        var StyleSettingsMap = function(map) {

            this.get = function(key) {

                if(map[key]===undefined) return defaultStyleSetting;

                return map[key];
            };

        };

        var defaultStyleSetting = {
            "bold": false,
            "border": false,
            "color": null
        };

  var loadSettingsFromBackend = function(callbackWhenDone) {

  callbackWhenDone(JSON.parse(layout.props.styleSettings));

  };

        var updateValue = function(hash,f) {

  var g = JSON.parse(layout.props.styleSettings);
  console.log(g);

  if(g[hash] === undefined) g[hash] = defaultStyleSetting;
  g[hash] = f(g[hash]);
  var s = JSON.stringify(g);

  backendApi.applyPatches([ {"qPath":"/props/styleSettings","qOp":"add","qValue":JSON.stringify(s)} ],false);

  console.log(layout);





        };

  this.getStyleSettings = function(callbackWhenDone) {

  loadSettingsFromBackend(function(c){
  callbackWhenDone(new StyleSettingsMap(c));
  });
  };

  this.switchBold = function(hash) {
            updateValue(hash,function(x){ x.bold = !x.bold; return x;});
  }

  this.switchBorder = function(hash) {
            updateValue(hash,function(x){ x.border = !x.border; return x;});
  }

  this.setColor = function(hash,color) {
            updateValue(hash,function(x){ x.color = color; return x;});
  }

  this.unsetColor = function(hash) {
            updateValue(hash,function(x){ x.color = null; return x;});
  }
  };

  return StyleSettings;
});
