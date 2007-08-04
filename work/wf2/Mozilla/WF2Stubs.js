
// Support for all the other stuff.
// Tearoffs not created yet for these elements


// ==========================================================================
// WF2ButtonElement
// ==========================================================================

function WF2ButtonElement() {
  //
};

WF2ButtonElement.prototype = new WF2InputElement()._extend({
  tearoff:               Components.interfaces.nsIDOMWF2ButtonElementTearoff,
  classID: Components.ID("{8c5ee0ff-f791-4efb-a2b5-45b332b6c634}"),
  contractID:            "@mozilla.org/wf2/button-element-tearoff;1",
  classDescription:      "WF2 Button Element Tearoff"
};


// ==========================================================================
// WF2DataListElement
// ==========================================================================

function WF2DataListElement() {
  //
};

WF2DataListElement.prototype = new _WF2Tearoff()._extend({
  tearoff:               Components.interfaces.nsIDOMWF2DataListElementTearoff,
  classID: Components.ID("{37c57e89-f9ce-4102-aa0c-1f20896aba43}"),
  contractID:            "@mozilla.org/wf2/datalist-element-tearoff;1",
  classDescription:      "WF2 DataList Element Tearoff",
  
  /* public properties */
    
  get data() {
    if (this.outerElement.hasAttribute("data")) {
      return this.outerElement.hasAttribute("data")
    }
    return "";
  },
  set data(val) {
    this.outerElement.setAttribute("data", val);
    return val;
  },  
  
  get options() {
    return null;
  }
};


// ==========================================================================
// WF2FieldsetElement
// ==========================================================================

function WF2FieldsetElement() {
  //
};

WF2FieldsetElement.prototype = new _WF2FormControl()._extend({
  tearoff:               Components.interfaces.nsIDOMWF2FieldsetElementTearoff,
  classID: Components.ID("{2513c2cf-b962-41cd-be6e-7afa144d28de}"),
  contractID:            "@mozilla.org/wf2/fieldset-element-tearoff;1",
  classDescription:      "WF2 Fieldset Element Tearoff",
  
  /* public properties */
  
  get disabled() {
    return this.outerElement.hasAttribute("disabled");
  },
  set disabled(val) {
    if (val) {
      this.outerElement.setAttribute("disabled", "");
    } else {
      this.outerElement.removeAttribute("disabled");
    }
    return val;
  },
  
  get elements() {
    return null;
  }
});


// ==========================================================================
// WF2FormElement
// ==========================================================================

function WF2FormElement() {
  //
};

WF2FormElement.prototype = new _WF2Tearoff()._extend({
  tearoff:               Components.interfaces.nsIDOMWF2FormElementTearoff,
  classID: Components.ID("{32c1b92f-7412-45cc-bf8d-551a9186904f}"),
  contractID:            "@mozilla.org/wf2/form-element-tearoff;1",
  classDescription:      "WF2 Form Element Tearoff",
  
  /* public properties */

//get templateElements()  { return null; }, // repetition model (phase 2)
  
  get accept()            { return ""; },
  set accept(val)         { return ""; },
  get data()              { return ""; },
  set data(val)           { return ""; },
  get replace()           { return ""; },
  set replace(val)        { return ""; },
  
  /* public methods */

  checkValidity: function() {
    return true;
  },

  dispatchFormChange: function() {
    this._dispatchEvent("formchange");
  },

  dispatchFormInput: function() {
    this._dispatchEvent("forminput");
  },

  resetFromData: function(data) {
    assertArity(arguments);
  }
});


// ==========================================================================
// WF2LabelElement
// ==========================================================================

function WF2LabelElement() {
  //
};

WF2LabelElement.prototype = new _WF2FormItem()._extend({
  tearoff:               Components.interfaces.nsIDOMWF2LabelElementTearoff,
  classID: Components.ID("{42caedf6-27a7-4242-8925-2a8790e11489}"),
  contractID:            "@mozilla.org/wf2/label-element-tearoff;1",
  classDescription:      "WF2 Label Element Tearoff",
  
  /* public properties */
  
  get control() {
    if (this.outerElement.hasAttribute("for")) {
      var controlId = this.outerElement.htmlFor;
      var control = this.outerElement.getElementById(controlId);
    } 
    return control || null;
  }
});


// ==========================================================================
// WF2LegendElement
// ==========================================================================

function WF2LegendElement() {
  //
};

WF2LegendElement.prototype = new _WF2FormItem()._extend({
  tearoff:               Components.interfaces.nsIDOMWF2LegendElementTearoff,
  classID: Components.ID("{6db8dc08-3b22-4cb3-b2fe-b4f783260461}"),
  contractID:            "@mozilla.org/wf2/legend-element-tearoff;1",
  classDescription:      "WF2 Legend Element Tearoff"
});


// ==========================================================================
// WF2OptionElement
// ==========================================================================

function WF2OptionElement() {
  //
};

WF2OptionElement.prototype = new _WF2FormItem()._extend({
  tearoff:               Components.interfaces.nsIDOMWF2OptionElementTearoff,
  classID: Components.ID("{bd611113-ee51-4a0d-8026-84a0a8b1e92d}"),
  contractID:            "@mozilla.org/wf2/option-element-tearoff;1",
  classDescription:      "WF2 Option Element Tearoff"
});


// ==========================================================================
// WF2OutputElement
// ==========================================================================


function WF2OutputElement() {
  //
};

WF2OutputElement.prototype = new _WF2FormControl()._extend({
  tearoff:               Components.interfaces.nsIDOMWF2OutputElementTearoff,
  classID: Components.ID("{d43f5db5-5aeb-4d95-8a49-c55623427587}"),
  contractID:            "@mozilla.org/wf2/output-element-tearoff;1",
  classDescription:      "WF2 Output Element Tearoff",

  /* public properties */

  get defaultValue() {
    if (this.hasAttribute("defaultValue")) {
      return this.outerElement.getAttribute("defaultValue");
    }
    return "";
  },
  set defaultValue(val) {
    this.outerElement.setAttribute("defaultValue", val);
    return val;
  },

  get validationMessage() {
    return "";
  },

  get value() {
    return this.outerElement.textContent || this.defaultValue;
  },
  set value(val) {
    this.outerElement.textContent = val;
    return val;
  },

  /* public methods */

  setCustomValidity: function() {
    throw new WF2DOMException.NOT_SUPPORTED_ERR;
  },

  /* private properties */

  get _isValid() {
    return true;
  }
});


// ==========================================================================
// WF2SelectElement
// ==========================================================================

function WF2SelectElement() {
  //
};

WF2SelectElement.prototype = new _WF2FormControl()._extend({
  tearoff:               Components.interfaces.nsIDOMWF2SelectElementTearoff,
  classID: Components.ID("{84a3eaeb-a6dd-43ac-93cf-40f23ff26aaf}"),
  contractID:            "@mozilla.org/wf2/select-element-tearoff;1",
  classDescription:      "WF2 Select Element Tearoff",
  
  /* public properties */
  
  get selectedOptions() {
    return null;
  },
  
  /* public methods */

  // http://www.whatwg.org/specs/web-forms/current-work/#dispatchchange
  dispatchChange: function() {
    this._dispatchEvent("change");
  },

  // http://www.whatwg.org/specs/web-forms/current-work/#dispatchformchange
  dispatchFormChange: function() {
    this._dispatchEvent("formchange");
  }
});


// ==========================================================================
// WF2TextAreaElement
// ==========================================================================

function WF2TextAreaElement() {
  //
};

WF2TextAreaElement.prototype = new WF2InputElement()._extend({
  tearoff:               Components.interfaces.nsIDOMWF2TextAreaElementTearoff,
  classID: Components.ID("{bf573705-9b17-4e75-a957-b0ad45678e7b}"),
  contractID:            "@mozilla.org/wf2/textarea-element-tearoff;1",
  classDescription:      "WF2 TextArea Element Tearoff"
});
