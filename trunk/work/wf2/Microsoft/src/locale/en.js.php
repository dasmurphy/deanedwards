<?php
header('Content-Type: application/x-javascript');
header('Expires: ' . gmdate('D, d M Y H:i:s') . ' GMT');
header('Cache-Control: no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
?>
wf2.Date.months = "Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec".split("|");
wf2.Week.firstDay = 1;	// Monday
wf2.Week.days = "S|M|T|W|T|F|S".split("|"); // JS Dates start on Sunday
wf2.Email.hint = "Value must be a valid email address.";
wf2.Url.hint = "Value must be a web site address or other valid URL (Uniform Resource Locator).";
wf2.Number.hint = "Value must be a number.";
//wf2.DateTime.hint = "Value must be a date and time.\nFormat: yyyy-mm-dd hh:mm:ss";
wf2.Date.hint = "Value must be a date.\nFormat: yyyy-mm-dd";
wf2.Time.hint = "Value must be a time.\nFormat: hh-mm-ss";
wf2.Month.hint = "Value must be a month.\nFormat: yyyy-mm";
wf2.Week.hint = "Value must be a week.\nFormat: yyyy-Wnn";
wf2.ValidityState.messages = {
	valueMissing: "You must supply a value.",
//	typeMismatch: "Type mismatch.",
	patternMismatch: "Pattern mismatch.",
	tooLong: "The text is too long.",
	rangeUnderflow: "Value too small.",
	rangeOverflow: "Value too large."
};
