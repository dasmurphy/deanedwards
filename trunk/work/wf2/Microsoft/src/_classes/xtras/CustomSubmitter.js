/*
	CustomSubmit
	-------------
	This submission method generates the payload purely by script
	and submits it using XMLHTTP

*/
function CustomSubmitter()  {

	this.submit = function(formImpl, btn, action, replace, scheme, method, encoding) {
		this.formImpl = formImpl;
		this.element = formImpl.element;

		if (!method) method="GET";
		var content = this.getEncodedDataSet(formImpl, encoding);scheme
		var response = this.submitToURL(content, action, scheme, method, encoding);
		var dataDoc = response.document;
		this.formImpl._fireCustomEvent("onrecieved");
		if (response.noContent) {
			// do nothing
		} else if (response.reset) {
			formImpl.reset();
		} else {
			formImpl._fillFromXmlDocument(dataDoc);
		}
	};

	this.getEncodedDataSet = function(formImpl, enctype) {
		if (enctype) enctype = enctype.toLowerCase();
		var dataSet = this.getDataSet(formImpl);
		return Encoder.encodeDataSet(dataSet, enctype);
	}

	this.submitToURL = function(content, action, scheme, method, enctype) {
		if (scheme=="http:") {
			return HttpProtocolHandler.submit(content, action, method, enctype);
		} else {
			alert("unsupported scheme: " + scheme);
		}
	}

	function getSelectValues(elem, dataSet) {
		var name = elem.name;
		if (!elem.multiple) {
			var optionIndex = elem.selectedIndex;
			var option = elem.options[optionIndex];
			value = (option.value)?option.value:option.text;
			dataSet.addToSet(name, value);
		} else {
			for (var optionIndex=0;optionIndex<elem.options.length;optionIndex++) {
				var option = elem.options[optionIndex];
				if (option.selected) {
					value = (option.value)?option.value:option.text;
					dataSet.addToSet(name, value);
				}
			}
		}
	};

	this.getDataSet = function(formImpl) {
		var dataSet = new FormDataSet();
		var elems = formImpl.get_elements();
		for (var ix = 0; ix<elems.length; ix++) {
			var elem = elems[ix];
			var name = elem.name;
			if (name==null) continue;
			dataSet.countName(name); // even if not considered, index should still count
			if (elem.willValidate) {
				if (elem.tagName=="SELECT") {
					getSelectValues(elem, dataSet);
				} else {
					var value = elem.value;
					if (elem.type=="checkbox" && value=="") value = "on";
					if (name=="_charset_") value = getDocumentCharset();
					dataSet.addToSet(name, value);
				}
			}
			// search for repetition blocks
			var item = elem;
			while (!item.getAttribute("repeat") && item.tagName!="FORM" && item.tagName!="BODY") item = item.parentNode;
			if (item.getAttribute("repeat")) {
				dataSet.addRepetitionBlock(item);
			}
		}
		return dataSet;
	};

	function getDocumentCharset() {
		return window.document.characterSet || window.document.charset; // moz||ie
	};
}


var HttpProtocolHandler = {
	submit: function(content, url, method, enctype) {
		var response = UrlLib.sendHttpSync(url, method, enctype, content);
		if (response.status==204) { response.noContent = true; } // 204 : no content
		else if (response.status==205) { response.reset; } // 205 : reset content
		return response;
	}
}


/*

	FormDataSet


*/

function FormDataSet() {
	this.fields = [];
	this.nameIndexMap = {};
	this.repetitionBlocks = {};
	this.addToSet = function(name, value) {
		var index = this.nameIndexMap[name];
		this.fields[this.fields.length] = { name: name, index: index, value: value };
	};
	this.addRepetitionBlock = function(node) {
		var index = parseInt(node.getAttribute("repeat"));
		if (isNaN(index)) return;
		var templateId = node.repetitionTemplate.id;
		this.repetitionBlocks[templateId + ": " + index] = { templateId: templateId, index: index };
	};
	this.countName = function(name) {
		if (this.nameIndexMap[name]==undefined) this.nameIndexMap[name]=0;
		else this.nameIndexMap[name]++;
	}
};



/*

	Encoding

*/

var Encoder = {

	encodeDataSet: function(dataSet, enctype) {
		if (enctype) enctype = enctype.toLowerCase();
		var encMethod;
		if (enctype==FormEncodings.MULTI) encMethod = urlEncode;
		else if (enctype==FormEncodings.XML) encMethod = xmlEncode;
		else if (enctype==FormEncodings.PLAIN) encMethod = plaintextEncode;
		else {
			enctype==FormEncodings.URL; // default is not specified or unrecognized
			encMethod = urlEncode;
		}
		var encodedDate = encMethod(dataSet);
		return encodedDate;

		/* encodings */

		function xmlEncode(dataSet) {
			var doc = getDomDocument();
			var eSubmission = doc.createElement("submission");
			eSubmission.setAttribute("xmlns", "http://n.whatwg.org/formdata");
			doc.appendChild(eSubmission);
			// repetition blocks
			for (var ix in dataSet.repetitionBlocks) {
				var item = dataSet.repetitionBlocks[ix];
				var eField = doc.createElement("repeat");
				eField.setAttribute("template", item.templateId);
				eField.setAttribute("index", item.index);
				//eField.text =  item.value;
				eSubmission.appendChild(eField);
			}
			// fields
			for (var ix in dataSet.fields) {
				var item = dataSet.fields[ix];
				var eField = doc.createElement("field");
				var name = item.name;
				eField.setAttribute("name", name);
				eField.setAttribute("index", item.index);
				eField.appendChild(doc.createTextNode(item.value));
				eSubmission.appendChild(eField);
			}
			return serializeDomDocument(doc);

			// xml helpers
			function getDomDocument() {
				if (window.document.implementation && window.document.implementation.createDocument) {
					return window.document.implementation.createDocument("", "", null);
				}
				return  new ActiveXObject("Microsoft.XMLDOM");
			};
			function serializeDomDocument(domDoc) {
				if (domDoc.xml) return domDoc.xml;
				var serializer = new XMLSerializer();
				return serializer.serializeToString(domDoc);
			}
		};
		function plaintextEncode(dataSet) {
			var str = "";
			for (var ix in dataSet.fields) {
				var pair = dataSet.fields[ix];
				str += pair.name + "=" + pair.value + "\n";
			}
			return str;
		};
		function urlEncode(dataSet) {
			var str = "";
			for (var ix in dataSet.fields) {
				var pair = dataSet.fields[ix];
				var pairStr = escape(pair.name) + "=" + escape(pair.value.replace(/ /g, "+"));
				if (str!="") str+= "&";
				str += pairStr;
			}
			return str;
	};

	}

}