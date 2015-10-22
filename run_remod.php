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

//Command to execute remod differs in 'comparison' case:
//Get JSON string:
$_SESSION["stdout"] .= "JSON string apperas to be:\n";
$inputJSON = json_decode(file_get_contents('php://input'));
$_SESSION["stdout"] .= file_get_contents('php://input') . "\n";
//$_SESSION["stdout"] .= "JSON names are ->: ".$inputJSON->names . "\n";


if ( ($inputJSON->Compare) and (!$inputJSON->Action) ){
	$_SESSION["stdout"] .= "Comparing morphologies:\n";
	//run compare scenario:
	$command = "sh /var/www/cgi-bin/runScript.sh /var/www/html/uploads/" . $ses_id . "/".$inputJSON->groupaDir. "/ " . $inputJSON->groupa;// . " 2>&1";
	$_SESSION["stdout"] .= "Executing remodelling for group A:\n"; //SSS
	$_SESSION["stdout"] .= $command . "\n"; //SSS
	$tmpstr = "";
	exec( escapeshellcmd($command), $tmpstr ); //SSS
	$tmpstr = implode("\n",$tmpstr);
	$_SESSION["stdout"] .= $tmpstr."\n";;
	//$_SESSION["stdout"] .= print_r($tmpstr, true);
	
	$command = "sh /var/www/cgi-bin/runScript.sh /var/www/html/uploads/" . $ses_id . "/".$inputJSON->groupbDir. "/ " . $inputJSON->groupb;// . " 2>&1";
	//$_SESSION["stdout"] .= "Executing remodelling for group B:\n"; //SSS
	$_SESSION["stdout"] .= $command . "\n"; //SSS
	$tmpstr = "";
	exec( escapeshellcmd($command), $tmpstr ); //SSS
	$tmpstr = implode("\n",$tmpstr);
	$_SESSION["stdout"] .= $tmpstr."\n";;
	//$_SESSION["stdout"] .= print_r($tmpstr, true);
	
	$command = "/opt/anaconda/bin/python /var/www/cgi-bin/smart_merge.py ".$ses_id."/".$inputJSON->groupaDir."/ ".$ses_id ."/".$inputJSON->groupbDir."/ ".$ses_id."/comparison/";// . " 2>&1";
	//$_SESSION["stdout"] .= "Executing remodelling for group B:\n"; //SSS
	$_SESSION["stdout"] .= $command . "\n"; //SSS
	$tmpstr = "";
	exec( escapeshellcmd($command), $tmpstr ); //SSS
	$tmpstr = implode("\n",$tmpstr);
	$_SESSION["stdout"] .= $tmpstr."\n";;
	//$_SESSION["stdout"] .= print_r($tmpstr, true);
	
} 
if ( (!$inputJSON->Compare) and (!$inputJSON->Action) ){
	$_SESSION["stdout"] .= "Analyzing morphologies:\n";
	//Run non-compare scenario: //do we need names or filenames???SSS
	$command = "sh /var/www/cgi-bin/runScript.sh /var/www/html/uploads/" . $ses_id . "/ " . $inputJSON->names;// . " 2>&1"; //<- this term is problematic; not escaped correctly?
	//$command = "python /var/application/first_run.py /var/www/html/uploads/" . $ses_id . "/ " . escapeshellcmd($_GET['runParams']) . " 2>&1 | tee -a log.txt";
	//$command = escapeshellcmd($command);
	//send command to remod console:
	//$_SESSION["stdout"] .= "Executing remodelling:\n"; //SSS
	$_SESSION["stdout"] .= $command . "\n"; //SSS
	//$processUser = posix_getpwuid(posix_geteuid());
	//$_SESSION["debugoutput"] .= print_r($processUser['name'],true);
	$tmpstr = "";
	exec( escapeshellcmd($command), $tmpstr ); //SSS
	$tmpstr = implode("\n",$tmpstr);
	$_SESSION["stdout"] .= $tmpstr."\n";
	//$_SESSION["stdout"] .= print_r($tmpstr, true); //SSS
}

//This script also can perform remod actions after user input:
//Unify the functionality to pass a single json instead of chaos. SSS
if ( (!$inputJSON->Compare) and ($inputJSON->Action) ){
	$_SESSION["stdout"] .= "Performing remodeling action:\n";
	//run remodAction scenario:
	
	// Grab all the variables (George's code)
	$who_variable = $inputJSON->who_variable;
	$who_random_variable = $inputJSON->who_random_variable;
	$who_manual_variable = $inputJSON->who_manual_variable;
	$what_variable = $inputJSON->what_variable;
	$extend_variable = $inputJSON->extend_variable;
	$extend_variable_num = $inputJSON->extend_variable_num;
	$diameter_variable = $inputJSON->diameter_variable;
	$diameter_variable_num = $inputJSON->diameter_variable_num;
	
	//Giorgos stuff: not sure what is going on
	if ($who_manual_variable == null || strpos($inputJSON->names,',') !== false) {
		$who_manual_variable ="none";
	}
	if ($diameter_variable=="mm1") {
		$diameter_variable="mm";
	}else if($diameter_variable=="percent1"){
		$diameter_variable="percent";
	}
	if ($diameter_variable==null) {
		$diameter_variable="none";
	}
	if ($diameter_variable_num==null) {
		$diameter_variable_num="none";
	}
	$names = explode(',',$inputJSON->names);
	for ($i = 0 ; $i < count($names) ; $i++){
		//call second_run.py once for each morphology in names array
		$command = "/opt/anaconda/bin/python /var/www/cgi-bin/second_run.py  /var/www/html/uploads/" . $ses_id . "/ ". $names[$i] . ".swc " . $who_variable . " " . $who_random_variable . " " . $who_manual_variable . " " . $what_variable . " " . $extend_variable . " " . $extend_variable_num . " " . $diameter_variable . " " . $diameter_variable_num ;
		//$command = $command = "/opt/anaconda/bin/python /var/www/cgi-bin/second_run.py";
		$command = escapeshellcmd($command);
		//$command = "sh /var/www/cgi-bin/runScript.sh /var/www/html/uploads/" . $ses_id . "/".$inputJSON->groupaDir. "/ " . $inputJSON->groupa;// . " 2>&1";
		//$_SESSION["stdout"] .= "Executing remodeling action for all neurons in session:\n"; //SSS
		$_SESSION["stdout"] .= $command . "\n"; //SSS
		
		$tmpstr = "";
		exec( $command, $tmpstr ); //SSS
		$tmpstr = implode("\n",$tmpstr);
		$_SESSION["stdout"] .= $tmpstr."\n";;
		//$_SESSION["stdout"] .= print_r($tmpstr, true);
	}
	
	
}



/*

$_SESSION["stdout"] .= $this->run_cell_generator($_FILES["file"]["name"]); //SSS replaced $output with $_SESSION["stdout"]
echo $_FILES["file"]["name"];
$result = "{'status':'ok', 'msg': 'Stored in: " .  $user_home . $_FILES["file"]["name"]. "','output': '".$output."'}";

*/

?>