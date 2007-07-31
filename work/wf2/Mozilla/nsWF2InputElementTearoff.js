/* -*- Mode: C++; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4 -*- */

function nsWF2InputElementTearoff() {
  return this;
}

/* decorate prototype to provide ``class'' methods and property accessors */
nsWF2InputElementTearoff.prototype = {

  //get type()         { return "text"; }, // THIS CAN'T BE OVERRIDDEN HERE
  //get value()        { return ""; },     // THIS CAN'T BE OVERRIDDEN HERE
    
    get forms()        { return null; },
    
    get min()          { return ""; },
    set min(val)       { return ""; },
    
    get max()          { return ""; },
    set max(val)       { return ""; },
    
    get step()         { return ""; },
    set step(val)      { return ""; },
    
    get pattern()      { return ""; },
    set pattern(val)   { return ""; },
    
    get required()     { return false; },
    set required(val)  { return false; },
    
  //get autocomplete() { return false; },
  //set autocomplete() { return false; },
    
    get autofocus()    { return false; },
    set autofocus(val) { return false; },
    
    get inputmode()    { return ""; },
    set inputmode(val) { return ""; },
    
    get action()       { return ""; },
    set action(val)    { return ""; },
    
    get enctype()      { return ""; },
    set enctype(val)   { return ""; },
    
    get method()       { return ""; },
    set method(val)    { return ""; },
    
    get target()       { return ""; },
    set target(val)    { return ""; },
    
    get replace()      { return ""; },
    set replace(val)   { return ""; },
    
    get list()         { return null; },
    
    get selectedOption() { return null; },
    
  //get htmlTemplate()   { return null; }, // repetition model
    
    get labels()         { return null; },
    
    get valueAsDate()      { return NaN; },
    set valueAsDate(val)   { return NaN; },
    
    get valueAsNumber()    { return 0; },
    set valueAsNumber(val) { return 0; },
    
    setup: function stepUp(n) {
    },    
    stepDown: function stepDown(n) {
    },
    
    get willValidate()  { return false; },
    
    get validity()      { return null; },
    
    get validationMessage()  { return ""; },
    
    checkValidity: function checkValidity() {
    	return false;
    },
    
    setCustomValidity: function setCustomValidity(error) {
    },
    
    dispatchChange: function dispatchChange() {
    },
    
    dispatchFormChange: function dispatchFormChange() {
    },

    QueryInterface: function (iid) {
        if (iid.equals(Components.interfaces.nsIDOMWF2InputElementTearoff) ||
        		iid.equals(Components.interfaces.nsIDOMWF2Inner))
            return this;

        throw Components.results.NS_ERROR_NO_INTERFACE;
    },
    
    init: function (outer) {
      this.outerElem = outer;
    }
}

var myModule = {
    /*
     * RegisterSelf is called at registration time (component installation
     * or the only-until-release startup autoregistration) and is responsible
     * for notifying the component manager of all components implemented in
     * this module.  The fileSpec, location and type parameters are mostly
     * opaque, and should be passed on to the registerComponent call
     * unmolested.
     */
    registerSelf: function (compMgr, fileSpec, location, type) {
        compMgr = compMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
        compMgr.registerFactoryLocation(this.CID,
                                        "WF2 Input Element Tearoff",
                                        this.contractID,
                                        fileSpec,
                                        location,
                                        type);
    },

    /*
     * The GetClassObject method is responsible for producing Factory objects
     */
    getClassObject: function (compMgr, cid, iid) {
        if (!cid.equals(this.CID))
            throw Components.results.NS_ERROR_NOT_IMPLEMENTED;

        if (!iid.equals(Components.interfaces.nsIFactory))
            throw Components.results.NS_ERROR_NO_INTERFACE;

        return this.factory;
    },

    CID: Components.ID("{692657e4-a8c0-41ce-bd87-75deed9d91bd}"),
    contractID: "@mozilla.org/wf2/input-element-tearoff;1",

    /* factory object */
    factory: {
        createInstance: function (outer, iid) {
            if (outer != null) {
                throw Components.results.NS_ERROR_NO_AGGREGATION;
            }

            return (new nsWF2InputElementTearoff()).QueryInterface(iid);
        }
    },

    canUnload: function(compMgr) {
        return true;
    }
};

function NSGetModule(compMgr, fileSpec) {
    return myModule;
}


