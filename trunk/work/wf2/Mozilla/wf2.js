
function NOT_SUPPORTED() {
	throw DOMException.NOT_SUPPORTED_ERR;
};

function Null()  { return null;  };
function True()  { return true;  };
function False() { return false; };

const SECRET = {};

const EMAIL = /^("[^"]*"|[^\s\.]\S*[^\s\.])@[^\s\.]+(\.[^\s\.]+)*$/;
const URL   = /^[a-zA-Z][a-zA-Z0-9+-.]*:[^\s]+$/;
const LIST  = /^(DATALIST|SELECT)$/;
const TYPE  = /^(button|checkbox|date|datetime|datetime-local|email|file|hidden|image|month|number|password|radio|range|reset|submit|time|url|week)$/;

var WF2NodeList = Array;

function WF2CustomError(text) {
	this.text = String(text);
};

var WF2Binding = {
	extend: function(definition) {
		var fn = new Function;
		fn.prototype = this;
		var binding = new fn;
		for (var i in definition) {
			binding[i] = definition[i];
		}
		binding.base = this;
		return binding;
	},
	
	/* private */
	
	_getBooleanPropertyValue: function(element, name) {
		return element.hasAttribute(name);
	},
	_setBooleanPropertyValue: function(element, name, val) {
		if (val) {
			element.setAttribute(name, "");
		} else {
			element.removeAttribute(name);
		}
		return !!val;
	},
	
	_getParentByTagName: function(element, tagName) {
		while (element) {
			element = element.parentNode;
			if (element && element.tagName == tagName) {
				return element;
			}
		}
		return null;
	}
};

var WF2Control = WF2Binding.extend({
	get_form: function(element) {
		return this.get_forms(element)[0] || null;
	},
	
	get_forms: function(element) {
		var forms = new WF2NodeList; // create a NodeList (how?)
		if (element.hasAttribute("form")) {
			var document = element.ownerDocument;
			var formIds = element.getAttribute("form").match(/[^\S]+/); 
			Array.forEach(formIds, function(id) {
				var element = document.getElementById(id);
				if (element && element.tagName == "FORM") {
					forms.push(element);
				}
			});
		} else {
			while (element) {
				element = this._getParentByTagName(element, "FORM");
				if (element) {
					forms.push(element);
				}
			}
		}
		return forms;
	},
	
	get_labels: Null,
	
	get_validity: function(element, error) {
		var binding = this;
		var customError = error || "";
		var validityState = {
			get typeMismatch() {
				return binding._get_validity_typeMismatch(element);
			},
			get stepMismatch() {
				return binding._get_validity_stepMismatch(element);
			},
			get rangeUnderflow() {
				return binding._get_validity_rangeUnderflow(element);
			},
			get rangeOverflow() {
				return binding._get_validity_rangeOverflow(element);
			},
			get tooLong() {
				return binding._get_validity_tooLong(element);
			},
			get patternMismatch() {
				return binding._get_validity_patternMismatch(element);
			},
			get valueMissing() {
				return binding._get_validity_valueMissing(element);
			},
			get customError() {
				return !!customError;
			},
			set customError(error) {
				if (error instanceof WF2CustomError) {
					customError = error.text;
				} else {
					throw new TypeError("setting a property that has only a getter");
				}
				return error;
			},
			get valid() {
				return !(
					this.typeMismatch || 
					this.stepMismatch || 
					this.rangeUnderflow || 
					this.rangeOverflow || 
					this.tooLong || 
					this.patternMismatch || 
					this.valueMissing || 
					this.customError
				);
			},
			toString: function() {
				if (arguments[0] == SECRET) {
					if (customError) {
						return customError;
					}
					if (this.valueMissing) {
						return "valueMissing";
					}
					if (this.typeMismatch) {
						return "typeMismatch";
					}
					if (this.patternMismatch) {
						return "patternMismatch";
					}
					if (this.tooLong) {
						return "tooLong";
					}
					if (this.rangeUnderflow) {
						return "rangeUnderflow";
					}
					if (this.rangeOverflow) {
						return "rangeOverflow";
					}
					return "";
				}
				return "[object ValidityState]";
			}
		};
		// prevent the validityState object from being recreated
		element.__defineGetter__("validity", function() {
			return validityState;
		});
		return validityState;
	},
	
	get_validationMessage: function(element) {
		return element.validity.toString(SECRET);
	},
	
	get_willValidate: function(element) {
		return !!(element.name && this.get_form(element) && !this._isDisabled(element));
	},
	
	checkValidity: False,
	
	setCustomValidity: function(element, error) {
		element.validity.customError = new WF2CustomError(error);
	},
	
	/* private */
	
	_get_fieldset: function(element) {
		return this._getParentByTagName(element, "FIELDSET");
	},
	
	_get_validity_typeMismatch: False,
	
	_get_validity_stepMismatch: False,
	
	_get_validity_typeMismatch: False,
	
	_get_validity_rangeUnderflow: False,
	
	_get_validity_rangeOverflow: False,
	
	_get_validity_tooLong: function(element) {
		return element.value.length > element.maxLength;
	},
	
	_get_validity_patternMismatch: False,
	
	_get_validity_valueMissing: False,
	
	_isDisabled: function(element) {
		if (element.disabled) return true;
		var fieldset = this._get_fieldset(element);
		return !!(fieldset && fieldset.disabled);
	},
	
	_isSuccessful: function(element) {
		return !!(element.name && !this._isDisabled(element));
	},
	
	_noValueSelected: function(element) {
		return !element.value;
	}
});

var WF2InputElement = WF2Control.extend({
	defaultMax:  "",
	defaultMin:  "",
	defaultStep: "",
	
	get_autofocus: function(element) {
		return this._getBooleanPropertyValue(element, "autofocus");
	},
	set_autofocus: function(element, val) {
		return this._setBooleanPropertyValue(element, "autofocus", val);
	},
	
	get_list: function(element) {
		if (element.hasAttribute("list")) {
			var listId = element.getAttribute("list");
			var list = document.getElementById(listId);
			if (list && LIST.test(list.tagName)) {
				return list;
			}
		}
		return null;
	},
	
	get_max: function(element) {
		if (element.hasAttribute("max")) {
			return element.getAttribute("max"); 
		} else {
			return this.defaultMax;
		}
	},
	
	get_min: function(element) {
		if (element.hasAttribute("min")) {
			return element.getAttribute("min"); 
		} else {
			return this.defaultMin;
		}
	},
	
	get_required: function(element) {
		return this._getBooleanPropertyValue(element, "required");
	},
	set_required: function(element, val) {
		return this._setBooleanPropertyValue(element, "required", val);
	},
	
	get_step: function(element) {
		if (element.hasAttribute("step")) {
			return element.getAttribute("step"); 
		} else {
			return this.defaultStep;
		}
	},
	
	get_type: function(element) {
		if (element.hasAttribute("type")) {
			var type = element.getAttribute("type");
			if (TYPE.test(type)) {
				return type;
			}
		}
		return "text";
	},
	
	get_valueAsDate: function(element) {
		return Date(element.value);
	},
	set_valueAsDate: function(element, val) {
		return element.value = val;
	},
	
	get_valueAsNumber: function(element) {
		return Number(element.value);
	},
	set_valueAsNumber: function(element, val) {
		return element.value = val;
	}
});

WF2InputElement["button"] = WF2InputElement.extend({	
	get_validationMessage: String,
	get_willValidate:      False,
	checkValidity:         True,
	setCustomValidity:     NOT_SUPPORTED,
	_isSuccessful:         False
});

WF2InputElement["reset"] = WF2InputElement["button"].extend();

WF2InputElement["submit"] = WF2InputElement["button"].extend({
	_isSuccessful: function(element) {
		return !!element.name; //&& this._isActive(element);
	}
});

WF2InputElement["image"] = WF2InputElement["submit"].extend();

WF2DataControl = WF2InputElement.extend({
	_get_validity_valueMissing: function(element) {
		return element.required && this._noValueSelected(element);
	}
});

WF2BooleanControl = WF2DataControl.extend({
	_isSuccessful: function(element) {
		return element.checked && this.base._isSuccessful(element);
	}
});

WF2InputElement["checkbox"] = WF2BooleanControl.extend({	
	_noValueSelected: function(element) {
		return !element.checked;
	}
});

WF2InputElement["radio"] = WF2BooleanControl.extend({	
	_noValueSelected: function(element) {
		var checked = true;
		if (element.name) {			
			var form = this.get_form(element);
			if (form) {
				var radios = form.elements[element.name], radio;
				if (radios.length > 1) {
					checked = false;
					for (var i = 0; radio = radios[i]; i++) {
						if (radio.checked) {
							checked = true;
							break;
						}
					}
				} else {
					checked = element.checked;
				}
			}
		}
		return !checked;
	}
});

WF2InputElement["file"] = WF2DataControl.extend({
	defaultMax:  "1",
	defaultMin:  "0"
});

WF2InputElement["hidden"] = WF2DataControl.extend();

WF2InputElement["number"] = WF2DataControl.extend({
	defaultStep: "1",
	
	_get_validity_rangeUnderflow: function(element) {
		if (!this._noValueSelected(element) && element.hasAttribute("min")) {
			var min = element.getAttribute("min");
			return !isNaN(element.min) && Number(element.value) < Number(element.min);
		}
		return false;
	},
	_get_validity_rangeOverflow: function(element) {
		if (!this._noValueSelected(element) && element.hasAttribute("max")) {
			var max = element.getAttribute("max");
			return !isNaN(element.max) && Number(element.value) < Number(element.max);
		}
		return false;
	},
	_get_validity_stepMismatch: function(element) {
		if (!this._noValueSelected(element) && element.hasAttribute("step")) {
			var step = element.getAttribute("step");
			if (step != "any") {
				return true; // TO DO
			}
		}
		return false;
	},
	_get_validity_typeMismatch: function(element) {
		return isNaN(element.value);
	}
});

WF2InputElement["datetime"] = WF2InputElement["number"].extend({
	defaultStep: "60"
});

WF2InputElement["date"] = WF2InputElement["datetime"].extend({
	defaultStep: "1"
});

WF2InputElement["month"] = WF2InputElement["date"].extend();

WF2InputElement["week"] = WF2InputElement["date"].extend();

WF2InputElement["datetime-local"] = WF2InputElement["datetime"].extend();

WF2InputElement["time"] = WF2InputElement["datetime"].extend();

WF2InputElement["range"] = WF2InputElement["number"].extend({
	defaultMax:  "100",
	defaultMin:  "0",
	defaultStep: "1"
});

WF2InputElement["text"] = WF2DataControl.extend({
	_get_validity_patternMismatch: function(element) {
		if (element.hasAttribute("pattern")) {
			var pattern = element.getAttribute("pattern");
			var patternRegExp = new RegExp("^(" + pattern.replace(/\//g, "\\/") + ")$");
			return !patternRegExp.test(element.value);
		}
		return false;
	}
});

WF2InputElement["email"] = WF2InputElement["text"].extend({
	_get_validity_patternMismatch: function(element) {
		return EMAIL.test(element.value) && this.base._get_validity_patternMismatch(element);
	}
});

WF2InputElement["password"] = WF2InputElement["text"].extend();

WF2InputElement["url"] = WF2InputElement["text"].extend();

WF2TextAreaElement = WF2InputElement["text"].extend();

WF2OutputElement = WF2Control.extend({
	get_validationMessage: String,
	get_willValidate: False,
	checkValidity: False,
	setCustomValidity: NOT_SUPPORTED
});
