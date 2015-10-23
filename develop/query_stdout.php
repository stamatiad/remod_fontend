<?php
//Script to fetch from backend the python output:

session_start();
$ses_id = session_id(); 

$stdout = $_SESSION["stdout"];
$_SESSION["stdout"] = "";
//$stdout = str_replace("\n", "\\\\n", $stdout);

$errorMsg = "";
//Return as JSON:
$output = array(
	"output" => [
		"errorMsg" => $errorMsg,
		"stdout" => $stdout
	]
);
echo json_encode($output);
return;
?>