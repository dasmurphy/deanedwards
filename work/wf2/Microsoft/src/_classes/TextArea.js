// ===========================================================================
// TextArea
// ===========================================================================

var TextArea = this.TextArea = Text.extend({
	tagName: "TEXTAREA",
	type: "textarea",
	behaviorUrn: "textarea.htc",
	maxLength: Math.pow(2, 31) -1, // what is the correct default for this?
	
	get_maxLength: function() {
		return this.maxLength;
	},
	set_maxLength: function(maxLength) {
		this._setCustomAttribute("maxLength", Number(maxLength) || TextArea.MAX_LENGTH);
	}
}, {
	MAX_LENGTH: Math.pow(2, 31) - 1
});
