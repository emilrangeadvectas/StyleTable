define( [], function () {
	'use strict';

	
	var defaultStyleSetting = {
		"bold": false,
		"border": false,
		"color": null		
	};
	
	var _styleSettings = function(backendApi) {
		
		var backendApi = backendApi;

		
		var loadSettingsFromBackend = function(callbackWhenDone) {
			backendApi.getProperties().then(function(r){
				callbackWhenDone(r.meta);
			});
		};

		this.getStyleSettingByHash = function(hash,callbackWhenDone) {
			
			loadSettingsFromBackend(function(c){
				console.log(c);
				if(c[hash]===undefined) {
					callbackWhenDone(defaultStyleSetting);
				}
				else {
					callbackWhenDone(c[hash]);
				}
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
		
		this.setStyleSettingByHash = function(hash,key,value,callbackWhenDone) {
			saveSettingsToBackend(key,value,hash);
		};


		var saveSettingsToBackend = function(key,value,hash){
			backendApi.getProperties().then(function(r){
				if(r.meta) {
					r.meta[hash][key] = value;
					backendApi.applyPatches([ {"qPath":"/meta","qOp":"replace","qValue":JSON.stringify(r.meta)} ],false);
				}
				else {
					backendApi.applyPatches([ {"qPath":"/meta","qOp":"add","qValue":JSON.stringify("{}")} ],false);		
				}
			});
		}
		
	};

	var styleSettingsFactory = function() {

		this.create = function(backendApi) {		
			return new _styleSettings(backendApi);
		};

	};
	
	return new styleSettingsFactory();
});