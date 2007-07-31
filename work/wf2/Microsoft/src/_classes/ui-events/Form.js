// ===========================================================================
// Form (submission interface)
// ===========================================================================

wf2.Form.SYNTAX_ERR = 12;

wf2.Form.prototype.extend({
	submit: function() {
		if (!this._isValid()) {
			// [[FIX]] how should DOM exceptions be handled?
			throw new Error(wf2.Form.SYNTAX_ERR, "Form is not valid");
		}
		this._submit();
	},
	
	_triggerSubmission: function() {
		// triggered by pressing enter when a textinput has focus.
		// locates the default submit button and clicks it.
		var button = this._getDefaultSubmitButton();
		if (!button) return; // no submit button
		button._focus();
		this._onsubmit();
	},
	
	_onsubmit: function() {
		if (!this._fireEvent("onsubmit")) return; // was cancelled
		this._validate();
		if (this._isValid()) this._submit();
	},
	
	_validate: function() {
		if (System.hint) System.hint.hide();
		var focus = false;
		this._forEachElement(function(control) {
			if (control.get_willValidate()) {
				focus |= !control.checkValidity(!focus);
			}
		});
	},
	
	_isValid: function() {
		var elements = this.get_elements(), element;
		for (var i = 0; (element = elements[i]); i++) {
			if (!element.validity.valid) return false;
		}
		return true;
	},
	
	_submit: function() {
		// all submission is performed through a cloned form
		//  containing cloned elements.
		// this is due to the complexity of having elements
		//  bound to multiple forms, orphans and other WF2
		//  witchcraft
	
		// create the clones
		var form = this._cloneElement();
		form.style.display = "none";
		this._forEachElement(function(control) {
			if (control._isSuccessful()) {
				form.appendChild(control._cloneElement());
			}
		});
		// submit the form
		document.body.appendChild(form);
		form.submit();
		document.body.removeChild(form);
		// tidy up (this is for File controls)
		this._forEachElement(function(control) {
			control._afterSubmit();
		});
	},
	
	_getDefaultSubmitButton: function() {
		var elements = this.get_elements(), element;
		for (var i = 0; (element = elements[i]); i++) {
			if (wf2.Submit.TYPE.test(element.type)) {
				return Element.getImplementation(element);
			}
		}
	}
});
