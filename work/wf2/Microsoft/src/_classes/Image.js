// ===========================================================================
// Image
// ===========================================================================

this.Image = Submit.extend({
	type: "image",
	
	_isSuccessful: function() {
		return document.activeElement == this.element;
	}
});
