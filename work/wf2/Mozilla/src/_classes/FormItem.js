// ===========================================================================
// FormItem
// ===========================================================================

// concerned with being an item in a form

var FormItem = Element.extend({
	constructor: function(component) {
		this.base(component);
		// hash map of Form objects
		this.formsMap = {};
	},
	
	form: null,
	forms: null,
	formsMap: null,
	
	afterSubmit: function() {
	},
	
	isSuccessful: function() {
		return false;
	},
	
	forEachForm: function(perform) {
		// make sure the forms map has been sorted
		//  by sourceIndex (do it in get_forms);
		var forms = this.get_forms(), form;
		for (var i = 0; (form = forms[i]); i++) {
			perform(Element.getImplementation(form));
		}
	},
	
	register: function() {
		this.base();
		// if the form attribute is present it
		//  represents a space delimited list of IDs
		if (typeof this.form == "string") {
			var ids = this.form.split(/\s+/), id;
			for (var i = 0; (id = ids[i]); i++) {
				if (!Form.map[id]) Form.map[id] = {};
				Form.map[id][this.uniqueID] = this;
				var form = document.getElementById(id);
				if (form && form.tagName == "FORM") {
					this._registerForm(form);
				}
	
			}
		// otherwise, just use the parent form
		} else {
			var form = this._getParentByTagName("FORM");
			if (form) {
				var uniqueID = form.uniqueID;
				if (!Form.map[uniqueID]) Form.map[uniqueID] = {};
				Form.map[uniqueID][this.uniqueID] = this;
				this._registerForm(form);
			}
		}
	},
	
	unregister: function() {
		if (typeof this.form == "string") {
			var ids = this.form.split(/\s+/), id;
			for (var i = 0; (id = ids[i]); i++) {
				delete Form.map[id][this.uniqueID];
			}
		}
		for (var uniqueID in this.formsMap) {
			var form = Element.all[uniqueID];
			delete Form.map[uniqueID][this.uniqueID];
			if (form) form._unregisterFormItem(this);
		}
		this.base();
	},
	
	registerForm: function(form) {
		if (form = Element.getImplementation(form)) {
			var uniqueID = form.uniqueID;
			if (!this.formsMap[uniqueID]) {
				this.formsMap[uniqueID] = form;
				form._registerFormItem(this);
				this.forms = null;
			}
		}
	},
	
	unregisterForm: function(form) {
		var uniqueID = form.uniqueID;
		if (this.formsMap[uniqueID]) {
			form._unregisterFormItem(this);
			delete this.formsMap[uniqueID];
			this.forms = null;
		}
	},
	
	set_form: function(form) {
		if (this.ready) {
			throw System.NOT_SUPPORTED_ERR;
		} else {
			this.form = String(form);
		}
	},
	
	get_form: function() {
		return this.get_forms()[0] || null;
	},
	get_forms: function() {
		if (!this.forms) {
			this.forms = new NodeList(this.formsMap);
		}
		return this.forms;
	}
});
