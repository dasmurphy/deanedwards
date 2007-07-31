// ===========================================================================
// Form
// ===========================================================================

wf2.Form.prototype.extend({
// submits the form (assumed valid)
_submitValid: function(btn) {
	var replace =  (btn && btn.replace)? replace = btn.replace : this.element.replace;
	var scheme = this._getScheme(this.element.action);
	if (btn && btn.action) scheme = this._getScheme(btn.action);
	var method = (btn && btn.method)? btn.method : this.element.method;
	var encoding = (btn && btn.encoding)? btn.encoding : this.element.encoding;
	var action = (btn && btn.action)? btn.action : this.element.action;
	if (!this._shouldUseCustomSubmit(replace, scheme)) {
		NativeSubmitter.submit(this, btn, action, replace, scheme, method, encoding);
	} else {
		var submitter = new CustomSubmitter();
		submitter.submit(this, btn, action, replace, scheme, method, encoding);
	}

},
_getScheme: function(url) {
	var ptn = /^[a-zA-Z][\w-]+\:/;
	var match = url.match(ptn)
	if (!match) return window.location.protocol;
	return String(match);
},
_shouldUseCustomSubmit: function(replace, scheme, method, encoding) {
	return (replace=="values" || (method=="PUT" || method=="DELETE") || (encoding==FormEncodings.XML || encoding==FormEncodings.PLAIN) || (scheme=="data:" || scheme=="javascript:"));
},
/*
	loading data
*/
// public method
_fillFromUrl: function(dataUrl) {
		var dataDoc = UrlLib.getXmlSync(dataUrl);
		if (dataDoc) this.resetFromData(dataDoc);
},
resetFromData: function(dataDoc) { // data as Document
	if (dataDoc) {
		 this._fillFromXmlDocument(dataDoc);
		 this.dispatchFormChange();
	}
},
_fillFromXmlDocument: function(doc) {
	var root = doc.documentElement;
	if (!(root.getAttribute("type")=="incremental")) {
		this.reset();
	}
	for (var ix=0; ix < root.childNodes.length; ix++) {
		var node = root.childNodes[ix];
		if (node.tagName=="field") {
			var name = node.getAttribute("name");
			var index = node.getAttribute("index");
			var value = node.textContent || node.text;
			var elem = this.element[name];
			if (elem.tagName==undefined && elem.length) { elem = elem[index]; } // select has also length
			if (elem.tagName=="SELECT") {
				for (var optIx=0; optIx<elem.options.length; optIx++) {
					var opt = elem.options[optIx];
					if (opt.value==value || (opt.value=="" && opt.text==value)) { opt.selected=true; }
				}
			} else if (elem.type=="checkbox" || elem.type=="radio") {
				if (elem.value==value) { elem.checked = true; }
			} else {
				elem.value = value;
			}
		}
		if (node.tagName=="repeat") {
			var templateId =  node.getAttribute("template");
			var index =  parseInt(node.getAttribute("index"));
			var template = window.document.getElementById(templateId);
			if (!template || isNaN(index)) continue;
			var block = template.previousSibling;
			// check that block with index dont already exist
			var found = false;
			while (block && block.repetitionType==template.REPETITION_BLOCK) {
				if (block.repeat==index) { found=true; break; } //ignore;
				block = block.previousSibling;
			}
			if (!found) template.addRepetitionBlockByIndex(null, index);
		}
	}
},
// for debugging
_getEncodedDataSet: function(enc) {
	return (new CustomSubmitter()).getEncodedDataSet(this, enc);
}
});
Form.Encodings = {
	URL: "application/x-www-form-urlencoded",
	MULTI: "multipart/form-data",
	XML: "application/x-www-form+xml",
	PLAIN: "text/plain"
};