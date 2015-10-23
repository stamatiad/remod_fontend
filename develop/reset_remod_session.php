<?php
//Script to reset variables used in remod session (NOT PHP!)

session_start();
$ses_id = session_id(); 

//funky way. SSS
//Delete all files in user folder:
$files = glob("/var/www/html/uploads/".$ses_id."/*"); // get all file names
foreach($files as $file){ // iterate files
  if(is_file($file))
    //$_SESSION["stdout"] .= $file ."\n";
    unlink($file); // delete file
}
//delete downloads dir:
system('/bin/rm -rf ' . escapeshellarg("/var/www/html/uploads/".$ses_id."/downloads"));
//delete comparison dir:
system('/bin/rm -rf ' . escapeshellarg("/var/www/html/uploads/".$ses_id."/groupa"));
system('/bin/rm -rf ' . escapeshellarg("/var/www/html/uploads/".$ses_id."/groupb"));

$_SESSION["uploaded_files_no"] = 0;
$_SESSION["DEBUG"] = 1;
$_SESSION["debug_style"] = ""; // for debug value is 'yes'
$_SESSION["stdout"] = "";
$_SESSION["return_status"] = "";
$_SESSION["debugoutputfile"] = "/var/www/html/uploads/flow.txt";
//the output string that contains var dumps and echoes:
unlink ( $_SESSION["debugoutputfile"] );
$_SESSION["debugoutput"] = "";
$_SESSION["UPLOAD_PATH"] = "/var/www/html/uploads/";


$errorMsg = "";
//Return as JSON:
$output = array(
	"output" => [
		"errorMsg" => $errorMsg,
		"sessionId" => $ses_id
	]
);
echo json_encode($output);

return;
?>