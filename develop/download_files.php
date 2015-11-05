<?php
//Script to download all files contained in input JSON:
session_start();
$ses_id = session_id(); 
include_once "config.php";
//Get JSON string:
$_SESSION["stdout"] .= "JSON string apperas to be:\n";
$inputJSON = json_decode(file_get_contents('php://input'));
$_SESSION["stdout"] .= file_get_contents('php://input') . "\n";
//$_SESSION["stdout"] .= "JSON names are ->: ".$inputJSON->names . "\n";

$zip = new ZipArchive();
$file_name = "download_files.zip";

// Delete previous file:
unlink(UPLOAD_PATH . $ses_id . "/downloads/".$file_name);

if ($zip->open(UPLOAD_PATH . $ses_id . "/downloads/$file_name", ZipArchive::CREATE)!==TRUE) {
       //echo " - not created <$file_name>\n";
    $_SESSION["stdout"] .= "cannot open <$file_name>\n";
    exit("cannot open <$file_name>\n");
}else{
       //echo " - created <$file_name>\n";
    $_SESSION["stdout"] .= "Created file <$file_name>\n";
}
//Add to zip all files checked for download:
$_SESSION["stdout"] .= "statistics length is: ".count($inputJSON->statistics)."\n";
$_SESSION["stdout"] .= "svg length is: ".count($inputJSON->svg)."\n";
$_SESSION["stdout"] .= "morphologies length is: ".count($inputJSON->morphologies)."\n";
$dir = UPLOAD_PATH . $ses_id . "/downloads/statistics";
for ($i = 0 ; $i < count($inputJSON->statistics) ; $i++){
    $_SESSION["stdout"] .= $dir."/".$inputJSON->statistics[$i]."\n";
    $zip->addFile($dir."/".$inputJSON->statistics[$i],"statistics/".$inputJSON->statistics[$i]);
}
for ($i = 0 ; $i < count($inputJSON->svg) ; $i++){
    $_SESSION["stdout"] .= $dir."/".$inputJSON->svg[$i]."\n";
    $zip->addFile($dir."/".$inputJSON->svg[$i],"svg/".$inputJSON->svg[$i]);
}
$dir = UPLOAD_PATH . $ses_id . "/downloads/files";
for ($i = 0 ; $i < count($inputJSON->morphologies) ; $i++){
    $_SESSION["stdout"] .= $dir."/".$inputJSON->morphologies[$i]."\n";
    $zip->addFile($dir."/".$inputJSON->morphologies[$i],"morphologies/".$inputJSON->morphologies[$i]);
}

$zip->close();
$zip_file = UPLOAD_PATH . $ses_id . "/downloads/".$file_name;
/*
header('Content-Description: File Transfer');
header('Content-Type: application/octet-stream');
header('Content-Disposition: attachment; filename="'.basename($file).'"');
header('Expires: 0');
header('Cache-Control: must-revalidate');
header('Pragma: public');
header('Content-Length: ' . filesize($file));
*/
$_SESSION["stdout"] .= "Zip file is in: ".$zip_file."\n";
//header('Content-Description: File Transfer');
//header('Content-Type: application/zip');
//header('Expires: 0');
//header('Content-Disposition: attachment; filename="'. basename($zip_file).'"');
//header('Content-Length: ' . filesize($zip_file));

//Giwrgos:
//header("Content-Type: application/zip");
//header("Content-Disposition: attachment; filename='$file_name'");
//header("Content-Length: " . filesize($zip_file));

// Force the download
//header('Content-Disposition: attachment; filename=" . basename($zip_file) . "');
//header("Content-Length: " . filesize($zip_file));
//header("Content-Type: application/octet-stream;");
// IE fix (for HTTPS only) header('Cache-Control: private');
//header('Pragma: private');

//readfile($zip_file);

exit;

?>
