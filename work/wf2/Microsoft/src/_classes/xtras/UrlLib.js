/*
	UrlLib
	a library for loading data from a url and sending data by HTTP

*/

UrlLib = {

	// loads xml from a url, supports #(data island), http:, data:
	getXmlSync: function(uri) {
		if (uri.indexOf("#")==0)  {// data island
			var id = _data.substr(1);
			var dataDoc = window.document.getElementById(id).XMLDocument;
			return dataDoc;
		} else {
			var scheme;
			var schemeMatch = uri.match(/^(\w+):/i);			
			if (schemeMatch) scheme = schemeMatch[1].toLowerCase();
			if (scheme=="data") {	
				var match = uri.match(/^data:([^,]*),(.*)/i);			
				if (!match) { this.err("Invalid data: uri: " + uri); return; }
				var contentType = match[1];
				var xml = match[2];
				if (contentType!="text/xml" && contentType!="application/xml") { this.err("not xml: " + contentType); return; }
				return this.parseXML(xml);
			} else if (!schemeMatch||scheme=="http"||scheme=="shttp") {
				return this.getXmlByHttpSync(uri);
			} else {
				alert("unsupported scheme:" + scheme);
			}
		}
	},
	
	parseXML: function(xml) {
		if (true) { 
			var dom = new ActiveXObject("MSXML2.DomDocument"); 
			dom.loadXML(xml);
			if (dom.parseError.errorCode!=0) { 
				this.err("XML parse error: " + dom.parseError.reason + "\nline" +  dom.parseError.line+ "\n" + dom.parseError.srcText ); 
				return; 
			}
			return dom;
		} else {
			var parser = new DOMParser();
			return parser.parseFromString(xml,  "text/xml");
		}
	},
	
	getXMLHttpRequest: function() {
		if (true) { return new ActiveXObject("Microsoft.XMLHTTP"); }
		return new XMLHttpRequest(); // Moz
	},
	
	err: function(msg) {
		alert(msg);
	},
	
	getXmlByHttpSync: function(url) {
		var xmlhttp = this.getXMLHttpRequest();
		xmlhttp.open("GET", url, false); //sync
		xmlhttp.send(null);
		if (xmlhttp.status!=200) { alert(xmlhttp.status); return null; }
		var doc = xmlhttp.responseXML;
		if (doc.parseError && doc.parseError.errorCode != 0) { alert(doc.parseError); return null; }
		return doc;
	},
	
	// returns { status , document }
	sendHttpSync: function(url, method, contentType, content) {
		if (!contentType) contentType = "application/x-www-form-urlencoded";
		if (method.toUpperCase()=="GET" && content) { url += "?" + content; content = null; }
		var xmlhttp = this.getXMLHttpRequest();
		xmlhttp.open(method, url, false); //sync
		if (content) {
			xmlhttp.setRequestHeader("Content-Type", contentType);
			xmlhttp.send(content);
		} else {
			xmlhttp.send(null);
		}
		if (xmlhttp.status!=200) { alert(xmlhttp.status); return null; }
		var doc = xmlhttp.responseXML;
		if (doc.parseError && doc.parseError.errorCode != 0) { alert(doc.parseError); return null; }
		return {status: xmlhttp.status, document: doc};
	},	
	
	getXmlHttpAsync: function(url, loadHandler, errorHandler) {
		var xmlhttp = this.getXMLHttpRequest();
		xmlhttp.open("GET", url, true); //asynch
		if (loadHandler) xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState == 4) {
				if (xmlhttp.status!=200) { alert("error: "  + xmlhttp.status); }				
				var responseDocument = xmlhttp.responseXML;				
				if (responseDocument.parseError && responseDocument.parseError.errorCode != 0) { if (errorHandler) errorHandler(); }				
				else { if (loadHandler) loadHandler(responseDocument); }
				xmlhttp.onreadystatechange = function(){};
			}
		};
		xmlhttp.Send();
	}
	
};