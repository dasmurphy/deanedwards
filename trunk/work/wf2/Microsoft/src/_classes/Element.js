// ===========================================================================
// Element
// ===========================================================================

var Element = this.Element = Base.extend({
	constructor: function(component) {
		this.component = component;
		this.element = component.element;
		this.uniqueID = this.element.uniqueID;
		Element.all[this.uniqueID] = this;
	},
	
	dispose: function () {
		this.base();
		this.component = null;
		this.element = null;
		if (Element.all) {
			delete Element.all[this.uniqueID];
		}
	},
	
	behaviorUrn: "",
	component: null,
	element: null,
	ready: false,
	silent: true,
	tagName: null,
	uniqueID: "",
	
	_isActive: function() {
		try {
			return document.activeElement == this.element;
		} catch (ignore) {
			// the document has not fully loaded
		}
	},
	
	_register: function() {
	},
	
	_unregister: function() {
	},
	
	_getAttribute: function(name) {
		var attribute = this.element.attributes[name];
		return attribute ? attribute.nodeValue : null;
	},
	
	_setAttribute: function(name, value) {
		var attribute = this.element.attributes[name];
		if (!attribute) attribute = this._createAttribute(name);
		attribute.nodeValue = value;
	},
	
	_createAttribute: function(name) {
		if (document.createAttribute) {
			var attribute = document.createAttribute(name);
			this.element.setAttributeNode(attribute);
		} else attribute = {nodeValue: null};
		return attribute;
	},
	
	_setCustomAttribute: function(name, value) {
		this[name] = value;
		if (this.ready) {
			this.component[name].fireChange();
		}
	},
	
	_cloneElement: function() {
		var clone = this.element.cloneNode();
		clone.style.behavior = "none";
		return clone;
	},
	
	_getParentByTagName: function(tagName) {
		var element = this.element;
		while (element && (element = element.parentElement) && element.tagName != tagName) continue;
		return element;
	},
	
	_fireEvent: function(name, args) {
		if (!this.silent) {
			var event = document.createEventObject();
			for (var i in args) event[i] = args[i];
			return this.element.fireEvent(name, event);
		}
	},
	
	_fireCustomEvent: function(name, args) {
		if (!this.silent && this.component[name]) {
			var event = document.createEventObject();
			for (var i in args) event[i] = args[i];
			return this.component[name].fire(event);
		}
	},
	
	_focus: function() {
		try {
			//window.scrollTo(0);
			this.element.scrollIntoView(false);
			this.element.focus();
		} catch (ignore) {
			// hidden fields can't get focus
		}
	},
	
	oncontentready: function() {
		this.ready = true;
		this.silent = false;
		this._register();
	},
	
	ondetach: function() {
		if (!System.unload) this._unregister();
		this.dispose();
	},
	
	onactivate: function() {
	},
	onblur: function() {
	},
	onclick: function() {
	},
	ondblclick: function() {
	},
	ondeactivate: function() {
	},
	onfocus: function() {
	},
	onkeydown: function() {
	},
	onkeypress: function() {
	},
	onkeyup: function() {
	},
	onlosecapture: function() {
	},
	onmousedown: function() {
	},
	onmousemove: function() {
	},
	onmouseout: function() {
	},
	onmouseover: function() {
	},
	onmouseup: function() {
	},
	onmousewheel: function() {
	},
	onpaste: function() {
	},
	onpropertychange: function() {
	},
	onresize: function() {
	},
	onscroll: function() {
	},
	ondocumentready: function() {
	}
}, {
	all: {},
	getImplementation: function(element) {
		return element && this.all[element.uniqueID];
	}
});
