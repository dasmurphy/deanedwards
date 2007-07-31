<?php
header("Content-Type: application/x-javascript");
header('Expires: ' . gmdate('D, d M Y H:i:s') . ' GMT');
header('Cache-Control: no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
?>
new function() {
var wf2 = window.wf2;
var System = wf2.System;
var Element = wf2.Element;
// wf2 classes
<?php include("wf2-onload.php");?>
// boot
System.onload();
};
