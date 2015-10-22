var who_variable      = "none";
var who_manual_variable = "none";
var who_manual_variable_list = [];
var who_random_variable = 0;
var what_variable     = "none";
var extend_variable   = "none";
var extend_variable_num = 0;
var diameter_variable  = "none";
var diameter_variable_num = 0;
var total_uploaded_files = 0;


function generate_neuron(){  
  if(!validate_variables()){
    alert('Please set all variables');
  }else{
    extend_variable_num = $("#txtExtentNum").val();
    diameter_variable_num = $("#txtDiameterNum").val();

    
				$.ajax({
					type: "POST",
					url: 'generate_files.php', 
          data: {who_variable: who_variable,who_random_variable: who_random_variable,who_manual_variable: who_manual_variable, what_variable: what_variable, extend_variable: extend_variable, extend_variable_num: extend_variable_num,diameter_variable:diameter_variable,diameter_variable_num:diameter_variable_num},
					success: function(resp){
						   //alert(resp);
               $("#controlPanel").html("<div style=\"display: block;\"> <span class=\"actualText dialogNobody\">"+resp+"</span></div>");
               
						}
					});
  }
}

function select_who(id){
  who_variable = id;
  clear_who();
  $("#" + id).css('color', '#ffffff');
  $("#" + id).css('background-color','#2B2E34');
  $("#" + id).css('border-color',':#2B2E34');
  activate_what();
}

function select_what(id){
  what_variable = id;
  clear_what();
  $("#" + id).css('color', '#ffffff');
  $("#" + id).css('background-color','#2B2E34');
  $("#" + id).css('border-color',':#2B2E34');
  activate_extent();
  activate_diameter();
}

function select_extend(id){  
  extend_variable = id;
   clear_extend();
  $("#" + id).css('color', '#ffffff');
  $("#" + id).css('background-color','#2B2E34');
  $("#" + id).css('border-color',':#2B2E34');
  
  $("#btnAction").removeAttr('disabled');
}

function select_diameter(id){
  diameter_variable = id;
  clear_diameter();
  $("#"+id).css('color','#ffffff');
  $("#" + id).css('background-color','#2B2E34');
  $("#" + id).css('border-color',':#2B2E34');
}

function select_manual(id){    
  var found = false;
  
  if( $.inArray(id, who_manual_variable_list) >0 ){
      who_manual_variable_list = $.grep(who_manual_variable_list, function(value) {
      return value != id;
    });
    found = true;
  }else{
    who_manual_variable_list.push(id);
  }
  
  who_manual_variable = who_manual_variable_list.join("_");
  
  //$(".who_manual").css('color', '#ffffff');
  return found;
}

function saveRandomValue(){
  who_random_variable = $("#random_value").val();
}

function clear_who(){
  $("#who_all_terminal").css('color', '#ffffff');
  $("#who_all_terminal").css('background-color','#00AE8B');
  $("#who_all_terminal").css('border-color','#00AC47');
  $("#who_apical_terminal").css('color', '#ffffff');
  $("#who_apical_terminal").css('background-color','#00AE8B');
  $("#who_apical_terminal").css('border-color','#00AC47');
  $("#who_basal_terminal").css('color', '#ffffff');
  $("#who_basal_terminal").css('background-color','#00AE8B');
  $("#who_basal_terminal").css('border-color','#00AC47');
  $("#who_random_all").css('color', '#ffffff');
  $("#who_random_all").css('background-color','#00AE8B');
  $("#who_random_all").css('border-color','#00AC47');
  $("#who_random_apical").css('color', '#ffffff');
  $("#who_random_apical").css('background-color','#00AE8B');
  $("#who_random_apical").css('border-color','#00AC47');
  $("#who_random_basal").css('color', '#ffffff');
  $("#who_random_basal").css('background-color','#00AE8B');
  $("#who_random_basal").css('border-color','#00AC47');
  $("#who_manual").css('color', '#ffffff');
  $("#who_manual").css('background-color','#00AE8B');
  $("#who_manual").css('border-color','#00AC47');
}

function activate_who(){
  $("#who_all_terminal").removeAttr('disabled');
  $("#who_apical_terminal").removeAttr('disabled');
  $("#who_basal_terminal").removeAttr('disabled');
  $("#who_random_all").removeAttr('disabled');
  $("#who_random_apical").removeAttr('disabled');
  $("#who_random_basal").removeAttr('disabled');
  $("#who_manual").removeAttr('disabled');
}
function disactivate_manual(){
  $("#who_manual").attr('disabled','disabled');
}

function activate_what(){
  $("#shrink").removeAttr('disabled');
  $("#remove").removeAttr('disabled');
  $("#extend").removeAttr('disabled');
  $("#branch").removeAttr('disabled');
}

function activate_all(){
  $("#who_all_terminal").removeAttr('disabled');
  $("#who_apical_terminal").removeAttr('disabled');
  $("#who_basal_terminal").removeAttr('disabled');
  $("#who_random_all").removeAttr('disabled');
  $("#who_random_apical").removeAttr('disabled');
  $("#who_random_basal").removeAttr('disabled');
}

function clear_what(){
  $("#shrink").css('color', '#ffffff');
  $("#shrink").css('background-color','#00AE8B');
  $("#shrink").css('border-color','#00AC47');
  $("#remove").css('color', '#ffffff');
  $("#remove").css('background-color','#00AE8B');
  $("#remove").css('border-color','#00AC47');
  $("#extend").css('color', '#ffffff');
  $("#extend").css('background-color','#00AE8B');
  $("#extend").css('border-color','#00AC47');
  $("#branch").css('color', '#ffffff');
  $("#branch").css('background-color','#00AE8B');
  $("#branch").css('border-color','#00AC47');
}

function activate_extent(){
  $("#percent").removeAttr('disabled');
  $("#mm").removeAttr('disabled');
  $("#txtExtentNum").removeAttr('disabled');
}
function activate_diameter(){
  $("#percent1").removeAttr('disabled');
  $("#mm1").removeAttr('disabled');
  $("#txtDiameterNum").removeAttr('disabled');
}

function clear_extend(){
  $("#percent").css('color', '#ffffff');
  $("#percent").css('background-color','#00AE8B');
  $("#percent").css('border-color','#00AC47');
  $("#mm").css('color', '#ffffff');
  $("#mm").css('background-color','#00AE8B');
  $("#mm").css('border-color','#00AC47');
}
function clear_diameter(){
  $("#percent1").css('color', '#ffffff');
  $("#percent1").css('background-color','#00AE8B');
  $("#percent1").css('border-color','#00AC47');
  $("#mm1").css('color', '#ffffff');
  $("#mm1").css('background-color','#00AE8B');
  $("#mm1").css('border-color','#00AC47');
}

function validate_variables(){
  var result = false;
  // check if all variables has been set
  if(who_variable!=="" && what_variable!=="" && extend_variable!==""){
    result = true;
  }
  return result;
}

function file_has_added(file){
  //alert("file_has_file_has_added");
}

function file_has_uploaded(file){
  var filename = file.name;
  total_uploaded_files++;
  if(total_uploaded_files==1){
    activate_who();

    //$("#upload_files_panel").html
    $("#upload_files_panel").html("<li class=\"dd-item\" onclick=\"load_neuron('" + filename +"');return false;\"><div class=\"dd-handle\">" + filename + "</div></li>");
  }else if(total_uploaded_files>1){
    // disable the Manual button
    $("#who_manual").attr('disabled','disabled');
    $("#upload_files_panel").append(" <li class=\"dd-item\" onclick=\"load_neuron('" + filename +"');return false;\"><div class=\"dd-handle\">" + filename + "</div></li>");
  }
  
  // do automatic redraw
  load_neuron(filename);
}


function load_neuron(filename){
  
				$.ajax({
					type: "GET",
					url: 'load_neuron.php', 
          data: {filename: filename},
					success: function(resp){
              var tmp = resp.split("\n");

              var line1 = eval(tmp[0]);
              var line2 = eval(tmp[1]);
              var thick = eval(tmp[2]);
              var color = eval(tmp[3]);
            
            reDrawIt(line1,line2,thick,color);
						}
					});    
}


function download_files(){
				$.ajax({
					type: "POST",
					url: 'download_files.php', 
          data: $('#frmFiles').serialize(),
					success: function(resp){
						   if($('#which_method:checked').val()=="email"){
                 alert(resp);
               }
						}
					});  
}

function get_choices(){
				$.ajax({
					type: "GET",
					url: 'get_choices.php', 
          data: {},
					success: function(resp){
						   $("#manual_choices").html(resp);
						}
					});  
}

//SSS utility functions:
var xmlhttp, jsStatusPanel;
jsStatusPanel = "js status panel is empty :(";
function fetch_status_panel(){
  if (window.XMLHttpRequest)
  {// code for IE7+, Firefox, Chrome, Opera, Safari

     xmlhttp=new XMLHttpRequest();

  }
  else
  {// code for IE6, IE5
     xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
  }
xmlhttp.onreadystatechange=function(){
  if (xmlhttp.readyState==4 && xmlhttp.status==200)
    {
    console.log("Status Panel updated:");
    console.log(xmlhttp.responseText);
    jsStatusPanel = xmlhttp.responseText;
    $(".statuspanel").html(jsStatusPanel);
    }
}
  xmlhttp.open("GET","update_status_panel.php", true);
  xmlhttp.send(null);
  console.log(xmlhttp.responseText);
  //setTimeout(function(){},3000);
  //return xmlhttp.responseText;
}
function update_status_panel(){
  setInterval(fetch_status_panel(),1);
}
update_status_panel();
