<?php
// this script is called after all the necessary files are uploaded:

session_start();
$ses_id = session_id(); 

// Simplified version SSS to be blamed
//$folder_name = $ses_id ;
//$user_home = $_SESSION["UPLOAD_PATH"] . $folder_name . "/";

//$_SESSION["debugoutput"] = file_get_contents($_SESSION["debugoutputfile"]);
//Start with a Clear console:
//unlink ( $_SESSION["debugoutputfile"] );
//file_put_contents($_SESSION["debugoutputfile"], "");
//$_SESSION["debugoutput"] = "";
// Write the contents back to the file
//file_put_contents($_SESSION["debugoutputfile"], $_SESSION["debugoutput"]);


$command = "sh /var/www/cgi-bin/runScript.sh /var/www/html/uploads/" . $ses_id . "/ " . escapeshellcmd($_GET['runParams']) . " 2>&1";
//$command = "python /var/application/first_run.py /var/www/html/uploads/" . $ses_id . "/ " . escapeshellcmd($_GET['runParams']) . " 2>&1 | tee -a log.txt";

//send command to remod console:
$_SESSION["stdout"] .= $command . "\n"; //SSS
$_SESSION["stdout"] .= "Executing remodelling:\n"; //SSS
//$processUser = posix_getpwuid(posix_geteuid());
//$_SESSION["debugoutput"] .= print_r($processUser['name'],true);
//file_put_contents($_SESSION["debugoutputfile"], $_SESSION["debugoutput"]);

//$_SESSION["stdout"] .= passthru($command); //SSS
$tmpstr = "";
exec( $command, $tmpstr ); //SSS
$_SESSION["stdout"] .= print_r($tmpstr, true); //SSS
//send command to remod debug file:
//$_SESSION["debugoutput"] .= $_SESSION["stdout"] . "\n";
// Write the contents back to the file
//file_put_contents($_SESSION["debugoutputfile"], $_SESSION["debugoutput"]);


/*

$_SESSION["stdout"] .= $this->run_cell_generator($_FILES["file"]["name"]); //SSS replaced $output with $_SESSION["stdout"]
echo $_FILES["file"]["name"];
$result = "{'status':'ok', 'msg': 'Stored in: " .  $user_home . $_FILES["file"]["name"]. "','output': '".$output."'}";

*/

?>