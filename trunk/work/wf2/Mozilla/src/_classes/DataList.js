// ===========================================================================
// DataList
// ===========================================================================

var DataList = this.DataList = Element.extend({
	behaviorUrn: "datalist.htc",
	tagName: "DATALIST",
	data: "",
	popup: null,
	
	dispose: function() {
		this.base();
		if (this.popup) {
			this.popup.dispose();
			this.popup = null;
		}
	},
	
	_createPopup: function() {
		if (!this.popup && wf2.DataListPopup) {
			this.popup = new wf2.DataListPopup(this);
		}
		return this.popup;
	},
	
	get_options: function() {
		return this.element.getElementsByTagName("option");
	},
	
	get_data: function() {
		return this.data;
	},
	set_data: function(data) {
		this.data = String(data);
	}
}, {
	className: "DataList"
});
