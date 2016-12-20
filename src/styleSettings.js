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