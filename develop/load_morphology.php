<?php
//Script to fetch from backend the requested morphology by name.
//Reads ONLY remod processed morphologies and NOT RAW .swc files!

session_start();
$ses_id = session_id(); 
//$_SESSION["debugoutput"] = file_get_contents($_SESSION["debugoutputfile"]);

$filenameDemo = "/var/www/html/uploads/demo_neuron.txt";
$command = "";
$errorMsg = "";
$name = "";
$output = "";
$group = "";


if( isset($_GET['name']) ){
	$name = escapeshellcmd($_GET['name']);
} else {
	$errorMsg .= "Failed to pass morphology name!\n";
}
if( isset($_GET['historyState']) ){
	$historyState = escapeshellcmd($_GET['historyState']);
} else {
	$errorMsg .= "Failed to pass morphology state flag!\n";
}
//What if NO $name exists??? SSS

//If demo morphology requested:
if ($name == "demo"){
	$filename = $filenameDemo;
} else {
	//Search through backend folders to get the morphology:
	//pio mpakalia pe8aineis..
	if(file_exists("/var/www/html/uploads/" . $ses_id . "/" . $name ."_".$historyState.".txt")){
		$filename = "/var/www/html/uploads/" . $ses_id . "/" . $name ."_".$historyState.".txt" ;
	}
	if(file_exists("/var/www/html/uploads/" . $ses_id . "/groupa/" . $name ."_".$historyState.".txt")){
		$filename = "/var/www/html/uploads/" . $ses_id . "/groupa/" . $name ."_".$historyState.".txt" ;
		$group = "groupa";
	}
	if(file_exists("/var/www/html/uploads/" . $ses_id . "/groupb/" . $name ."_".$historyState.".txt")){
		$filename = "/var/www/html/uploads/" . $ses_id . "/groupb/" . $name ."_".$historyState.".txt" ;
		$group = "groupb";
	}
}

//wait for file to be generated for a few seconds (10 seconds):
$filenameexists = FALSE;
$attempts = 0;
$_SESSION["stdout"] .= "Loading morphology " . $name . " ...";
while ( (!$filenameexists) and ($attempts<10) ):
	sleep("0.5");
	$filenameexists = file_exists($filename);
	$attempts++;
//	$_SESSION["stdout"] .= "attempt is : " . $attempts . " to get morpoh with name ".$filename."\n";
endwhile;
//file_put_contents($_SESSION["debugoutputfile"], $_SESSION["debugoutput"]);

if( $filenameexists ){
	//parse file (if not found, demo file).
	$txt_file    = file_get_contents($filename);
	$rows        = explode("\n", $txt_file);
	$command .= "[";
	foreach ($rows as $row => $data){
			//tokenize each row:
			$row_data = explode(', ', $data);
			if($row_data[0] !== ''){
				$command .= "[";
				//As id we will get each BRANCH; in swc case (before computnig 
				// branches we get the whole parts ie soma, axon etc):
				$command .= $row_data[7].",";
				$command .= $row_data[0].",";
				$command .= $row_data[1].",";
				$command .= $row_data[2].",";
				$command .= $row_data[3].",";
				$command .= $row_data[4].",";
				$command .= $row_data[5].",";
				$command .= $row_data[6].",";
				$command .= '"'.$row_data[8].'"';
				$command .= "],";
			}
	}
	$command = substr($command,0,-1);
	$command .= "]";

} else {
	//$name = "demo";
	//$filename = $filenameDemo;
	$errorMsg .= "Morphology file (".$name.") not found on server!\n";
}



//Return the morphology variable as JSON:
//$output = '{ "output" : {"errorMsg" : "'.$errorMsg.'", "name" : "'.$name.'", "command" : "'.$command.'" }}';
//$errorMsg .= "Loop filename is (".$filename.").\n";//appears to be right
$output = array(
	"output" => [
		"errorMsg" => $errorMsg,
		"name" => $name,
		"command" => $command,
		"group" => $group
	]
);
echo json_encode($output);
$_SESSION["stdout"] .= " Done!\n";
//file_put_contents($_SESSION["debugoutputfile"], $_SESSION["debugoutput"]);
return;

//JSON.parse('{ "return" : {"error" : "file not found", "output" : "blah de blah" }}')

?>