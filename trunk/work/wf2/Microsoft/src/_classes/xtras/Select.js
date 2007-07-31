// ===========================================================================
// Select
// ===========================================================================

wf2.Select.prototype.extend({
set_data: function(data) {
	this.data = String(data);
	if (data) this._prefillFromUrl(data);
},
_prefillFromUrl: function(url) {
	var dataDoc = UrlLib.getXmlSync(url);
	if (dataDoc) this._fillFromXmlDocument(dataDoc);
},
_fillFromXmlDocument: function(doc) {
	var root = doc.documentElement;
	if (!(root.getAttribute("type") == "incremental")) {
		this._clearOptions();
	}
	for (var i =0; i < root.childNodes.length; i++) {
		var node = root.childNodes[ix];
		// [[FIX]] everyting should be copied incl namespaces!
		if (node.tagName=="option") {
			var option = document.createElement("option")
			if (node.getAttribute("value") != null) {
				opt.value = node.getAttribute("value");
			}
			opt.innerText = node.text;
			this.element.appendChild(opt);
		}
	}
},
_clearOptions: function() {
	while (this.element.options.length > 0) this.element.remove(0);
}
});
