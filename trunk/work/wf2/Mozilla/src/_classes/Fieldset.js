// ===========================================================================
// Fieldset
// ===========================================================================

var Fieldset = this.Fieldset = FormItem.extend({
	behaviorUrn: "fieldset.htc",
	tagName: "FIELDSET",
	
	get_elements: function() {
		// build the elements collection on demand
		//  it won't be used very often
	}
}, {
	className: "Fieldset"
});
