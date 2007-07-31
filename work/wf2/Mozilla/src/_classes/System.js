// ===========================================================================
// System
// ===========================================================================

this.System = new Base({
	NOT_SUPPORTED_ERR: "Object doesn't support this action",
	popup: null,
	path: "",
	scripts: {},
	implementation: null,
	
	dispose: function() {
		window.detachEvent("onunload", this.onunload);
		if (this.implementation) {
			this.implementation.dispose();
			delete this.implementation;
		}
		if (wf2.Date.popup) {
			wf2.Date.popup.dispose();
			delete wf2.Date.popup;
		}
		// delete all object properties
		delete this.popup;
		delete this.hint;
		delete Element.all;
		delete Form.map;
		//- delete this.overflow;
	},
	
	
	onload: function() {
		this.ready = true;
		this.getLocaleStrings();
		this.implementation.onload();
		window.attachEvent("onunload", this.onunload);
	},
	
	onunload: function() {
		System.unload = true;
		System.dispose();
	},
	
	boot: function(path) {
		//window.offscreenBuffering = true;
		this.path = path || this.getPath();
		this.load("wf2-onload.js");
		//- this.createOverflow();
	
		// check for XP and set theme
		Chrome.detect();
	
		// create internal isNaN function
		wf2.isNaN = function(value) {
			return isNaN(value) || value === "" || value == null;
		};
	
		// load interfaces
		this.implementation = new Implementation;
	},
	
	getPath: function() {
		var scripts = document.scripts;
		this.src = scripts[scripts.length - 1].src;
		return this.src.slice(0, this.src.lastIndexOf("/") + 1);
	},
	
	load: function(src) {
		if (!this.scripts[src]) {
			this.scripts[src] = true;
			src = this.src.replace(/wf2\.js/, src);
			if (this.implementation) {
				var head = document.getElementsByTagName("head")[0];
				var script = document.createElement("script");
				script.src = src;
				head.appendChild(script);
			} else {
				document.write("<script src='" + src + "' defer><" + "/script>");
			}
		}
	},
	
	getLocaleStrings: function() {
		System.load("locale/en.js");
	}
});

var System = this.System;
