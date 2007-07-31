// ===========================================================================
// HintPopup
// ===========================================================================

wf2.HintPopup = wf2.Popup.extend({
	constructor: function() {
		this.base();
		this.body.runtimeStyle.fontFamily = "Sans-Serif";
		this.body.onclick = this.onclick;
	},
	
	// TODO: join string once done
	cssText: "body{background:InactiveCaption!important;color:InactiveCaptionText!important;padding:0.5ex;cursor:default}",
	
	bind: function(element) {
		this.base(element);
		this.body.innerHTML = element.validity.toString().replace(/\n/g, "<br>");
	},
	
	onclick: function() {
		System.hint.hide();
	}
});
