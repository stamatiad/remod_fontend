<?php 
session_start();
// confirm that PYTHON executes OK:
 //exec("python ../application/first_run.py /users/mu8hu7gd7nrock8c26ue6p5dj3 0-2c.CNG.swc 30-3.CNG.swc 2>&1", $_SESSION["stdout"]);

// SSS test run:
exec("python ../application/first_run.py " . $ses_id . " DH052814X100.swc DH052914X100.swc 2>&1", $_SESSION["stdout"]);
 $_SESSION["stdout"] = print_r($_SESSION["stdout"]);

/*$command = escapeshellcmd("sh /home/remod/application/runScript.sh /users/mu8hu7gd7nrock8c26ue6p5dj3 0-2c.CNG.swc 30-3.CNG.swc");
$_SESSION["stdout"] .= $command; 
$_SESSION["stdout"] .= passthru($command);*/

 echo $_SESSION["stdout"];
?>