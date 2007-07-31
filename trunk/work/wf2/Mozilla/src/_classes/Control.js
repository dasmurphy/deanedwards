
WF2.Implementation = Base.extend({
	register: function(element) {
	},
	
	unregister: function(element) {
	}
});

WF2.Control = Base.extend({
	constructor: function() {
		this.uniqueID = assignID(element);
		this.forms = new WF2.Forms(element);
		
	},
	
	destructor: function() {
	},
	
	forms: null,
	uniqueID: "",
	
	get_fieldset: function(element) {
		while (element) {
			element = element.parentNode;
			if (element && element.tagName == "FIELDSET") {
				return element;
			}
		}
		return null;
	},
	
	get_form: function(element) {
		return this.get_forms(element)[0] || null;
	},
	
	get_forms: function(element) {
		if (element.hasAttribute("form")) {
			var formIds = element.getAttribute("form").split(/\s+/);
			var forms = formIds.map(document.getElementById, document); // create a node list (how?)
		} else {
			var forms = [];
			while (element) {
				element = element.parentNode;
				if (element && element.tagName == "FORM") {
					forms.push(element);
				}
			}
		}
		return forms;
	},
	
	get_labels: function(element) {
	},
	
	get_validity: function(element) {
	},
	
	get_validationMessage: function(element) {
	},
	
	get_willValidate: function(element) {
		return element.name && this.get_form(element) && !this.isDisabled(element);
	},
	
	noValueSelected: function(element) {
		return !element.value;
	},
	
	isDisabled: function(element) {
		if (element.disabled) return true;
		var fieldset = this.get_fieldset(element);
		return fieldset && fieldset.disabled;
	},
	
	isSuccessful: function(element) {
		return element.name && !this.isDisabled(element);
	},
	
	register: function(element) {
	},
	
	validate: function(element) {
	},
	
	checkValidity: function(element) {
	},
	
	setCustomValidity: function(element, error) {
	}
});
