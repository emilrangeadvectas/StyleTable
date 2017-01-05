define( [], function () {
	'use strict';
	
	var StyleSettings = function(backendApi) {
		
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
			backendApi.getProperties().then(function(r){
                if(r.meta===undefined) {
                    callbackWhenDone({});
                }
                else callbackWhenDone(r.meta);
			});
		};        

        var updateValue = function(hash,f) {
			backendApi.getProperties().then(function(r){
				if(r.meta) {
                    if (typeof r.meta === 'string' || r.meta instanceof String) {
                        r.meta = JSON.parse(r.meta);
                    }                
                    if(r.meta[hash]===undefined) r.meta[hash] = defaultStyleSetting;
					r.meta[hash] = f(r.meta[hash]);
					backendApi.applyPatches([ {"qPath":"/meta","qOp":"replace","qValue":JSON.stringify(r.meta)} ],false);
				}
				else {
                    var o = new Object();
                    o[hash] = defaultStyleSetting;
					o[hash] = f(o[hash]);
					backendApi.applyPatches([ {"qPath":"/meta","qOp":"add","qValue":JSON.stringify(o)} ],false);		
				}
			});		        
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