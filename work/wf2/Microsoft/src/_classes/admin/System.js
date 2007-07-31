if (!System.sysin) {
	System.sysin = "//-\r\n//   \"Run\" script.\r\n//-\r\n\r\nnew Admin;";
}
if (!System.sysout) {
	System.sysout = "This text will be replace by any system output.\r\nTo output to this console use System.print(\"text\").",
}

System.cls = function() {
	// clear the system console
	this.sysout = "";
};

System.print = function(line) {
	// write to the system console
	this.sysout += line + "\n";
};
