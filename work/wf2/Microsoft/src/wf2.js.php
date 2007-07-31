<?php
header("Content-Type: application/x-javascript");
header('Expires: ' . gmdate('D, d M Y H:i:s') . ' GMT');
header('Cache-Control: no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
?>
var wf2 = new function() {
var wf2 = this;
// wf2 classes
<?php include("wf2.php");?>
// boot
System.boot();
};
