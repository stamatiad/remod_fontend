<?php
session_start();
$ses_id = session_id(); 

include_once "config.php";
$from  =  $_POST["from"];
$to = CONTACT_EMAIL;//$_POST["to"]; 
$subject = $_POST["subject"];
$message = $_POST["message"];

$headers = "From: " . $from . "\r\n";
$headers .= 'Content-type: text/html; charset=utf-8' . "\r\n";
  
$response =  mail(CONTACT_EMAIL,$subject,$message,$headers);

if ($response){
  echo "Mail sent successfully, thank you!";
}else{
  echo "Could not send email";
}
?>