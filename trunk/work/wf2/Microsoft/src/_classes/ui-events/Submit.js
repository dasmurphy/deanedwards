// ===========================================================================
// Submit
// ===========================================================================

wf2.Submit.prototype.extend({
	onclick: function() {
		event.returnValue = false;
		var form = Element.getImplementation(this.get_form());
		if (form) form._onsubmit();
	}
});

wf2.Submit.TYPE = /^(submit|image)$/;
