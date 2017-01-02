define( [], function () {
	'use strict';
	
	var StyleSettings = function(backendApi) {
		
		var backendApi = backendApi;

        var defaultStyleSetting = {
            "bold": false,
            "border": false,
            "color": null		
        };
		
		var loadSettingsFromBackend = function(callbackWhenDone) {
			backendApi.getProperties().then(function(r){
				callbackWhenDone(r.meta);
			});
		};



		this.getStyleSettings = function(callbackWhenDone) {
			
			loadSettingsFromBackend(function(c){
				callbackWhenDone(c);
			});
		};

		this.switchBold = function(hash) {
			backendApi.getProperties().then(function(r){
				if(r.meta) {
					if(r.meta[hash]===undefined) r.meta[hash] = defaultStyleSetting;
					r.meta[hash].bold = !r.meta[hash].bold;
					backendApi.applyPatches([ {"qPath":"/meta","qOp":"replace","qValue":JSON.stringify(r.meta)} ],false);
				}
				else {
					backendApi.applyPatches([ {"qPath":"/meta","qOp":"add","qValue":JSON.stringify("{}")} ],false);		
				}
			});		
		}

		this.switchBorder = function(hash) {
			backendApi.getProperties().then(function(r){
				if(r.meta) {
					if(r.meta[hash]===undefined) r.meta[hash] = defaultStyleSetting;
					r.meta[hash].border = !r.meta[hash].border;
					backendApi.applyPatches([ {"qPath":"/meta","qOp":"replace","qValue":JSON.stringify(r.meta)} ],false);
				}
				else {
					backendApi.applyPatches([ {"qPath":"/meta","qOp":"add","qValue":JSON.stringify("{}")} ],false);		
				}
			});		
		}

		this.setColor = function(hash,color) {
			backendApi.getProperties().then(function(r){
				if(r.meta) {
					if(r.meta[hash]===undefined) r.meta[hash] = defaultStyleSetting;
					r.meta[hash].color = color;
					backendApi.applyPatches([ {"qPath":"/meta","qOp":"replace","qValue":JSON.stringify(r.meta)} ],false);
				}
				else {
					backendApi.applyPatches([ {"qPath":"/meta","qOp":"add","qValue":JSON.stringify("{}")} ],false);		
				}
			});		
		}

		this.unsetColor = function(hash) {
			backendApi.getProperties().then(function(r){
				if(r.meta) {
					if(r.meta[hash]===undefined) r.meta[hash] = defaultStyleSetting;
					r.meta[hash].color = null;
					backendApi.applyPatches([ {"qPath":"/meta","qOp":"replace","qValue":JSON.stringify(r.meta)} ],false);
				}
				else {
					backendApi.applyPatches([ {"qPath":"/meta","qOp":"add","qValue":JSON.stringify("{}")} ],false);		
				}
			});		
		}
	};
	
	return StyleSettings;
});