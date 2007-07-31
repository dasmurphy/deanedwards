// ===========================================================================
// Scalar
// ===========================================================================

// a standard text box

var Scalar = this.Scalar = Data.extend({
	constructor: function(component) {
		this.base(component);
		// IE "remembers" previously entered values
		this.raw.nodeValue = this.element.defaultValue;
		this._setChrome();
	},
	
	chrome: null,
	list: null,
	//- value: "",
	
	dispose: function() {
		this._removeChrome();
		this.base();
	},
	
	_setChrome: function(klass) {
		this._removeChrome();
		if (this.get_list()) klass = ComboBox;
		if (klass) this.chrome = new klass(this);
	},
	
	_removeChrome: function() {
		if (this.chrome) {
			this.chrome.dispose();
			this.chrome = null;
		}
	},
	
	_createPopup: function() {
		if (wf2.DataListPopup) {
			var list = this.get_list();
			if (list) list = Element.getImplementation(list);
			if (list) return list._createPopup();
		}
	},
	
	get_list: function() {
		if (this.list) {
			var list = document.getElementById(this.list);
			if (list && (list.tagName == "DATALIST" || list.tagName == "SELECT")) {
				return list;
			}
		}
		return null;
	},
	
	set_list: function(list) {
		if (this.ready) {
			throw System.NOT_SUPPORTED_ERR;
		} else {
			this.list = String(list);
			this._setChrome();
		}
	},
	
	// This is allows sub classes to override to select parts of text
	// maybe it should use a range internally to allow overriding element.select()
	select: function() {
		this.element.select();
	},
	
	set_disabled: function(disabled) {
		this.base(disabled);
		if (this.chrome) this.chrome.layout();
	},
	
	oncontentready: function() {
		this.base();
		if (this.chrome) this.chrome.oncontentready();
	},
	
	ondocumentready: function() {
		this.base();
		if (this.chrome) this.chrome.ondocumentready();
	},
	
	onpropertychange: function() {
		if (this.ready) {
			this.base();
			if (this.chrome) this.chrome.onpropertychange();
		}
	}
});
