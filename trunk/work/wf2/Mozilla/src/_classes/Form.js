// ===========================================================================
// Form (DOM interface)
// ===========================================================================

var Form = this.Form = Element.extend({
	constructor: function(component) {
		this.base(component);
		// hash map of FormItem objects
		this.elementsMap = {};
	},
	
	dispose: function() {
		this.base();
		this.elementsMap = null;
		this.elements = null;
	},
	
	accept: "",
	behaviorUrn: "form.htc",
	data: "",
	elements: null,
	elementsMap: null,
	replace: "",
	tagName: "FORM",
	
	_forEachElement: function(perform) {
		var elements = this.get_elements(), element;
		for (var i = 0; (element = elements[i]); i++) {
			perform(Element.getImplementation(element));
		}
	},
	
	_register: function() {
		this.base();
		var map = Form.map[this.get_id()];
		for (var uniqueID in map) {
			map[uniqueID]._registerForm(this);
		}
		map = Form.map[this.uniqueID];
		for (uniqueID in map) {
			map[uniqueID]._registerForm(this);
		}
	},
	
	_unregister: function() {
		var map = Form.map[this.get_id()];
		for (var uniqueID in map) {
			map[uniqueID]._unregisterForm(this);
		}
		map = Form.map[this.uniqueID];
		for (uniqueID in map) {
			map[uniqueID]._unregisterForm(this);
		}
		this.base();
	},
	
	_registerFormItem: function(formitem) {
		var uniqueID = formitem.uniqueID;
		if (!this.elementsMap[uniqueID]) {
			this.elementsMap[uniqueID] = formitem;
			this.elements = null;
		}
	},
	
	_unregisterFormItem: function(formitem) {
		var uniqueID = formitem.uniqueID;
		if (this.elementsMap[uniqueID]) {
			delete this.elementsMap[uniqueID];
			this.elements = null;
		}
	},
	
	_dispatchCustomEvent: function(name) {
		this._forEachElement(function(element) {
			element._fireCustomEvent(name);
		});
		this._fireCustomEvent(name);
	},
	
	checkValidity: function() {
		var valid = true;
		this._forEachElement(function(control) {
			if (control.get_willValidate()) {
				valid |= control.checkValidity();
			}
		});
		return valid;
	},
	
	dispatchFormChange: function() {
		this._dispatchCustomEvent("onformchange");
	},
	
	dispatchFormInput: function() {
		this._dispatchCustomEvent("onforminput");
	},
	
	reset: function() {
		this.element.reset();
	},
	
	resetFromData: function(data) {
	},
	
	submit: function() {
	},
	
	get_accept: function() {
		return this.accept;
	},
	set_accept: function(accept) {
		this.accept = String(accept);
	},
	
	get_data: function() {
		return this.data;
	},
	set_data: function(data) {
		this.data = String(data);
	},
	
	get_elements: function() {
		if (!this.elements) {
			this.elements = new HTMLCollection(this.elementsMap);
		}
		return this.elements;
	},
	
	get_id: function() {
		this._getAttribute("id");
	},
	set_id: function(id) {
		if (this.ready) this._unregister();
		this._setAttribute("id", id);
		if (this.ready) this._register();
	},
	
	get_length: function() {
		return this.get_elements().length;
	},
	
	get_replace: function() {
		return this.replace;
	},
	set_replace: function(replace) {
		this.replace = String(replace);
	}
}, {
	className: "Form",
	
	map: {}
});
