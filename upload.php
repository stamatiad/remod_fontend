<?php
echo "Starting Upload\n";
session_start();
$ses_id = session_id(); 

//$file = "/var/www/html/uploads/flow.txt";
// Open the file to get existing content
//$_SESSION["debugoutput"] = file_get_contents($$_SESSION["debugoutputfile"]);
// Append to the file
//$_SESSION["debugoutput"] .= "Upload file commencing\n";
//$_SESSION["debugoutput"] .= $ses_id . "\n";
// Write the contents back to the file
//file_put_contents($$_SESSION["debugoutputfile"], $_SESSION["debugoutput"]);

/*
// !empty( $_FILES ) is an extra safety precaution
// in case the form's enctype="multipart/form-data" attribute is missing
// or in case your form doesn't have any file field elements
if( strtolower( $_SERVER[ 'REQUEST_METHOD' ] ) == 'post' && !empty( $_FILES ) )
{
    foreach( $_FILES[ 'image' ][ 'tmp_name' ] as $index => $tmpName )
    {
        if( !empty( $_FILES[ 'image' ][ 'error' ][ $index ] ) )
        {
            // some error occured with the file in index $index
            // yield an error here
            return false; // return false also immediately perhaps??
        }

        // check whether it's not empty, and whether it indeed is an uploaded file
        if( !empty( $tmpName ) && is_uploaded_file( $tmpName ) )
        {
            // the path to the actual uploaded file is in $_FILES[ 'image' ][ 'tmp_name' ][ $index ]
            // do something with it:
            move_uploaded_file( $tmpName, $someDestinationPath ); // move to new location perhaps?
        }
    }
} else {
	$current .= "Files added, but no with POST!!\n";
	file_put_contents($file, $current);
}
*/

/*$current .= "Total files uploaded " . count($_FILES) . "\n";
file_put_contents($file, $current);
$tmpstr = print_r($_FILES, true);
$current .= "Test filename " . $tmpstr . "\n";
file_put_contents($file, $current);
*/
include_once "config.php";
include_once "filehandler.class.php";



// Step 1: Prepare first the structure of folders
$filehandler = new FileHandler($ses_id);
$folder_status = $filehandler->prepare_user_folder();
//$current .= $folder_status . "\n";
//file_put_contents($file, $current);


if($folder_status=="OK"){ 



$result = "";
$temp = explode(".", $_FILES["morphology"]["name"]);
$path_parts = pathinfo($_FILES["morphology"]["name"]);
$extension = end($temp);
/*
$current .= "Extension is " . $extension . "\n";
file_put_contents($file, $current);
$current .= "Path parts are " . $path_parts . "\n";
file_put_contents($file, $current);
$current .= "File error " . $_FILES["morphology"]["error"] . "\n";
file_put_contents($file, $current);
$current .= "Total files uploaded " . count($_FILES["morphology"]) . "\n";
file_put_contents($file, $current);
$current .= "Sample filename " . $_FILES["morphology"]["name"] . "\n";
file_put_contents($file, $current);
*/
// Simplified version SSS to be blamed
$folder_name = $ses_id ;
$user_home = UPLOAD_PATH . $folder_name . "/";

if ($_FILES["morphology"]["error"] > 0) {
	return "{'status':'error', 'msg': '" . $_FILES["morphology"]["error"] . "'}";
  } else {
	if (file_exists( $user_home . $_FILES["morphology"]["name"])) {
	  $result = "{'status':'error', 'msg': '"  . $_FILES["morphology"]["name"] . " already exists'}";
	} else {
	  //if morphology name is prefixed with groupname move to appropriate folder and remove prefix:
    //to check also if morphology name is greater than 5 chars!!!
    $groupname = substr($_FILES["morphology"]["name"],0,5);
    //Always use prefix! for user to distinguish files!
    $noprefixname = $_FILES["morphology"]["name"];
    if( strcmp ( $groupname , "group" ) == 0 ){
      $groupname = substr($_FILES["morphology"]["name"],0,6);
      
      //$_SESSION["debugoutput"] .= "file of group: " . $groupname . "\n";
      //file_put_contents($$_SESSION["debugoutputfile"], $_SESSION["debugoutput"]);
      
      if (!file_exists($user_home .'/'.$groupname)) {
        //$_SESSION["debugoutput"] .= "making directory: " . $user_home .'/'.$groupname . "\n";
        //file_put_contents($$_SESSION["debugoutputfile"], $_SESSION["debugoutput"]);
        mkdir($user_home .'/'.$groupname, 0777, true);
      }
      //$noprefixname = substr($_FILES["morphology"]["name"],6);
      //$_SESSION["debugoutput"] .= "nonprefixed name is : " . $noprefixname . "\n";
      //file_put_contents($$_SESSION["debugoutputfile"], $_SESSION["debugoutput"]);
      $re=move_uploaded_file($_FILES["morphology"]["tmp_name"],$user_home .'/'.$groupname.'/'. $noprefixname);
    } else {
      $re=move_uploaded_file($_FILES["morphology"]["tmp_name"],$user_home . $noprefixname);
    }
    
	  if($re===false){
      $le=error_get_last();
      throw(new Exception($le["message"] . " , failed to move $src to $dst' , at $_file line $_line"));
	  }
	  
	}
  }


/*
  // Step 2: Upload Files
  $upload_status = $filehandler->upload_files()  ;
  echo $upload_status;
  $current .= $upload_status;
file_put_contents($file, $current);
*/

  
}else{
  echo "Error creating folders";
}

?>