<?php 
session_start();
$ses_id = session_id(); 
// SSS additions:
$_SESSION["uploaded_files_no"] = 0;
$_SESSION["DEBUG"] = 1;
$_SESSION["debug_style"] = ""; // for debug value is 'yes'
$_SESSION["stdout"] = "";
$_SESSION["return_status"] = "";

//where the above string will be saved: 
$_SESSION["debugoutputfile"] = "/var/www/html/uploads/flow.txt";
//the output string that contains var dumps and echoes
unlink ( $_SESSION["debugoutputfile"] );
$_SESSION["debugoutput"] = "";

$_SESSION["UPLOAD_PATH"] = "/var/www/html/uploads/";

// Include all necessary files
?>

<!DOCTYPE html>
<html ng-app="remod">

<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, minimum-scale=1.0">
	<title>Remod</title>
	<meta name="description" content="Remod">
	<meta name="author" content="team12">
	<!-- Latest compiled and minified CSS <--></-->
	<link rel="stylesheet" href="../assets/css/bootstrap.min.css">
	<link rel="stylesheet" href="style.css">
	<link rel="stylesheet" href="toolkit.css">
	<link rel="stylesheet" href="application.css">
	<link rel="font" href="glyphicons-halflings-regular.woff">
	
	<!-- Optional theme -->
	<!--<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap-theme.min.css">-->
	<!-- Latest compiled and minified JavaScript -->
	<script src="jquery-2.1.4.min.js"></script>
	<script src="bootstrap.min.js"></script>
	<!--<script src="assets/js/angular.min.js"></script>-->
	<script src="//ajax.googleapis.com/ajax/libs/angularjs/1.4.7/angular.js"></script>
    <script src="//ajax.googleapis.com/ajax/libs/angularjs/1.4.7/angular-animate.js"></script>
	<script src="remod.js"></script>
	<script src="three.min.js"></script>
	<!--<script src="assets/js/TrackballControls.js"></script>-->
	<!--<script src="assets/js/ajax.js"></script>-->
	<!-- TMP TEST SCRIPTS -->
	<script src="Projector.js"></script>
	<script src="CanvasRenderer.js"></script>
	<!--<script src="assets/js/stats.min.js"></script>-->
	<!--<script src="nCell.js"></script>-->
	<script src="ui-bootstrap-tpls-0.13.4.min.js"></script>
	<script src="angular-file-upload.min.js"></script>
	<script src="angular-ui-router.min.js"></script>
</head>

<body ng-controller='globalController'>
	
	<header class="navbar navbar-inverse navbar-static-top" id="navigator">
		<div class="container">
			<div class="navbar-header">
				<!--<span class="navbar-brand">Remod</span>-->
        <!--<li class="navbar-brand"><a href="#">Remod</a></li>-->
				<a class="navbar-brand" ui-sref="remod" href="#">Remod</a>
			</div>
			<nav class="collapse navbar-collapse">
				<ul class="nav navbar-nav">
					<!--<li class="active"><a href="#">Dashboard <span class="sr-only">(current)</span></a></li>-->
					<li><a href="#/statistics">Statistics</a></li>
					<li><a href="downloads.php">Downloads</a></li>
					<li><a href="http://dendrites.gr">Lab</a></li>
					<li><a href="3D_email_compose.php">Contant</a></li>
				</ul>
				<ul class="nav navbar-nav navbar-right">
					
				</ul>
			</nav>
		</div>
	</header>

	<!--<div class="container" id="noview">
		<div> This is no view div </div>
	</div>-->

	<div ui-view>
	</div> 
	
</body>

</html>
