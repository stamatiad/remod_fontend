<?php
//Script to fetch from backend the statistics' files:

session_start();
$ses_id = session_id();

$errorMsg = '';
$name = '';

if( isset($_GET['name']) ){
	$name = escapeshellcmd($_GET['name']);
} else {
	$errorMsg .= "Failed to pass statistics name!\n";
} 

$_SESSION["stdout"] .= "Getting statistics for morphology: ".$name."\n";

$statFileNames = array();
$files = glob("/var/www/html/uploads/".$ses_id."/downloads/statistics/*"); // get all file names
foreach($files as $file){ // iterate files
  if( is_file($file) ){
	  if( ( strcmp(substr($file,-4,4),'.txt') == 0) or ( strcmp(substr($file,-4,4),'.svg') == 0) ){
		  //fetch for a specific file:
		  $onlyfilename = explode('/',$file);
		  $onlyfilename = end($onlyfilename);
		  /*if( (strcmp(substr($onlyfilename,0,strlen($name)),$name) == 0) ){
			  $_SESSION["stdout"] .= "PASS: ".$onlyfilename."\n";
		  } else {
			  $_SESSION["stdout"] .= "NO PASS: ".$onlyfilename."\n";
		  }*/
		  if( (strcmp(substr($onlyfilename,0,strlen($name)),$name) == 0) ){
			  array_push($statFileNames, $onlyfilename);
		  }
	  }
  }
}


$errorMsg = "";
//Return as JSON:
$output = array(
	"output" => [
		"errorMsg" => $errorMsg,
		"statFileNames" => $statFileNames
	]
);
echo json_encode($output);
return;
?>