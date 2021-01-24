// FILE : index.js
// PROGRAMMER : Hongsik Eom
// FIRST VERSION : December 11, 2020
// DESCRIPTION :
// This file contains all methods that interacts with HTML when user
// fires evenets. All event methods are written by JQuery and Ajax
// is used to update only centain parts of the web page



// It will hold text from textarea
var text = "";
// It will check if all progress starts from "New" button
var isItNew = false;
// It will check if the file will be overwritten
var isOverWrite = false;



// FUNCTION : fileNameCheck
//'DESCRIPTION :
//'This function checks if the file name contains any of the following characters
// (< > : \ / * ? |) - Restricted characters when creating file
//'PARAMETERS :
//        fileName: The file name
//'RETURNS :
//        check: true  - If the string has any of restricted characters
//               false - If the string does not have any of restricted characters
function fileNameCheck(fileName)
{
  var check = false;
  var restrictedChar = ['<', '>', ':', '"', '/', '\\', '|', '?', '*'];

  for (i = 0; i < restrictedChar.length; i++)
  {
    if (fileName.indexOf(restrictedChar[i]) != -1)
    {
      check = true;
    }
  }
  return check;
}



// FUNCTION : SaveFile
//'DESCRIPTION :
//'This function sends the Ajax request to the server to save file
//'PARAMETERS :
//        requestMode: Request mode that user wants
//                    (Save, saveFile, LoadFile, fileList)
//               text: Contents that user enters to the textaera
//'RETURNS : None
function SaveFile(requesetMode, text)
{
  // Get the file name that user enters to save
  var fileName = $("#newFileName").val();

  // Check if file name is empty or only contains white spaces
  var fineNameCheck = fileName.replace(/\s/g, '').length;
  if (fineNameCheck == 0)
  {
    $(".errorMessage").html("<br>Please enter a file name!");
    return;
  }

  // If any of the following characters are included in the file name [<>:"/\|?*]
  if (fileNameCheck(fileName))
  {
    $(".errorMessage").html("<br>A file name can't contain any of the following characters: < > : \" / \\ | ? *");
    return;
  }

  // Generate JSON string
  var request = JSON.stringify({"request":requesetMode, "text":text, "file": fileName});

  // Ajax request using JQuery
  $.ajax({
    url: "./server.php",
    type: "post",
    data: {"userRequest": request},
    dataType: "json",
  })
  // When Ajax request succeeds
  .done(function(data)
  {
    // If file is already exist, open overwriteModal to ask if user wants to
    // overwrite the file or create a new one
    if (data == "File already exists")
    {
      $("#saveModal").hide();
      $("#overwiteModal").show();
      return;
    }

    // If the file does not exist in the Myfiles folder
    if (data == "File does not exist!")
    {
      // Diplay confirmModal to the user
      $(".confirmMessage").text(data);
      $(".confirmMessage").css({"color": "red"});
      $("#confirmModal").show();
      return;
    }

    if (isItNew == true)
    {
      // Select Empty option and empty the textarea
      $('#fileList option[value=Empty]').prop('selected', 'selected').change();
      $("textarea").val('');

      // Reset the isItNew
      isItNew = false;
    }

    // Empty file name input and change confirmMessage
    $(".newFileName").val('');
    $(".confirmMessage").css({"color": "#34626c"});
    $(".confirmMessage").text(data);

    // Display confirmModal and hide saveModal
    $("#confirmModal").show();
    $("#saveModal").hide();

    // If the file is overwritten, the file will not be added to the file list
    if (isOverWrite == true)
    {
      // Reset the isOverWrite
      isOverWrite = false;
    }
    else
    {
      // Append the new file to the drop box
      $('#fileList').append($('<option>', {
        value: fileName,
        text: fileName
      }));
    }

    // Change the dropbox option to the file that the user just saved
    $('#fileList option[value="' + fileName + '"]').prop('selected', 'selected').change();
  })
  // If Ajax request fails
  .fail(function (jqXhr, status, error)
  {
    $(".confirmMessage").css({"color": "red"});
    $(".confirmMessage").text("Save Failed");
    $("#confirmModal").show();
  });
}



// FUNCTION : Document ready event method
//'DESCRIPTION :
//'When document is ready, all methods below can be run
//'PARAMETERS : None
//'RETURNS : None
$(document).ready(function()
{
  // When the page is ready (opened), it will get a file list from MYfiles folder
  // Generate JSON string
  var request = JSON.stringify({"request":"fileList"});

  // Ajax request to the server to get the file list in the MyFiles folder
  $.ajax({
    url: "./server.php",
    type: "post",
    data: {"userRequest":request},
    dataType: "json",
  })
  // When Ajax request succeeds
  .done (function(data){
    // Append the empty option first
    $('#fileList').append($('<option>', {
      value: "Empty",
      text: ""
    }));

    // Get all the file names in the file list received from server
    // and add them to the drop box
    for (var i = 0; i < data.length; i++)
    {
      $('#fileList').append($('<option>', {
        value: data[i],
        text: data[i]
      }));
    }
  })
  // When Ajax request fails
  .fail(function (jqXhr, status, error)
  {
    $(".confirmMessage").css({"color": "red"});
    $(".confirmMessage").text("Getting File List Failed");
    $("#confirmModal").show();
  });
});


// FUNCTION : Filelist(dropbox) change event method
//'DESCRIPTION :
//'When user clicks one of the files in the drop box to load texts in it
//'PARAMETERS : None
//'RETURNS : None
$('#fileList').on('change', function ()
{
  // Get the file name from the selected option in the drop box
  var selectedFile = $("#fileList option:selected").val();

  // If the user selects "Empty", do nothing
  if (selectedFile == "Empty")
  {
    $("textarea").val('');
    return;
  }

  // Generate JSON string
  var request = JSON.stringify({"request":"loadFile", "file":selectedFile});

  // Ajax request to the server to load texts in the file
  $.ajax({
    url: "./server.php",
    type: "post",
    data: {"userRequest":request},
    dataType: "json",
  })
  // When Ajax request succeeds
  .done (function(data)
  {
    // If the file does not exist in the Myfiles folder
    if (data == "File does not exist!")
    {
      // Diplay confirmModal to the user
      $(".confirmMessage").text(data);
      $(".confirmMessage").css({"color": "red"});
      $("#confirmModal").show();
      return;
    }

    // If data is "" (empty);
    if (data == '""')
    {
      data = '';
    }

    // Write texts in the file to the textarea
    $("textarea").val(data);
  })
  // When Ajax request fails
  .fail(function (jqXhr, status, error)
  {
    $(".confirmMessage").css({"color": "red"});
    $(".confirmMessage").text("Loading file failed");
    $("#confirmModal").show();
  });
});



// FUNCTION : "New" button click event method
//'DESCRIPTION :
//'When user clicks "New" button to clear textarea. If there are texts
// in the textarea, the checkModal will be displayed to ask if user wants to
// save them
//'PARAMETERS : None
//'RETURNS : None
$('#New').on("click", function()
{
  // Set isItNew to true
  isItNew = true;

  // Store texts in the text area to the text variable
  text = $("textarea").val();

  // If there are texts in the text area
  if (text != "")
  {
    // Display the checkModal to ask if user wants to save them
    $("#checkModal").show();
  }
  else
  {
    // Select the empty option
    $('#fileList option[value=Empty]').prop('selected', 'selected').change();
  }
});



// FUNCTION : "Save" button click event method
//'DESCRIPTION :
//'When user clicks "Save" button to save texts. If there are texts
// in the textarea, the checkModal will be displayed to ask if user wants to
// save them
//'PARAMETERS : None
//'RETURNS : None
$('#Save').on("click", function()
{
  // Empty an error message
  $(".errorMessage").text('');

  // Store texts in the text area to the text variable
  text = $("textarea").val();

  // Get the current file name of selected optoin from the drop box
  var fileName = $("#fileList option:selected").val();

  // Check if the file name is empty
  if (fileName.length == 0)
  {
    $(".errorMessage").html("<br>Please enter a file name!");
    return;
  }

  // If any of the following characters are included in the file name [<>:"/\|?*]
  if (fileNameCheck(fileName))
  {
    $(".errorMessage").html("<br>A file name can't contain any of the following characters: < > : \" / \\ | ? *");
    return;
  }

  // If user chose the empty option
  if (fileName == "Empty")
  {
    // Display saveModal to the user
    $("#saveModal").show();
    return;
  }

  // Generate JSON string
  var request = JSON.stringify({"request":"Save", "text": text, "file": fileName});

  // Ajax request to the server to save texts in the text area to the file that user chose
  $.ajax({
    url: "./server.php",
    type: "post",
    data: {"userRequest": request},
    dataType: "json",
  })
  // When Ajax request succeeds
  .done (function(data)
  {
    // If file does not exist
    if (data == "File does not exist!")
    {
      // Change color
      $(".confirmMessage").css({"color": "red"});
    }
    else
    {
      // Change color
      $(".confirmMessage").css({"color": "#34626c"});
    }

    // Diplay confirmModal to the user
    $(".confirmMessage").text(data);
    $("#confirmModal").show();
  })
  // When Ajax request fails
  .fail(function (jqXhr, status, error)
  {
    $(".confirmMessage").css({"color": "red"});
    $(".confirmMessage").text("Save Failed");
    $("#confirmModal").show();
  });
});



// FUNCTION : "SaveFile" button click event method
//'DESCRIPTION :
//'When the user clicks "Save File" button on the save modal
//'PARAMETERS : None
//'RETURNS : None
$('#saveFile').on("click", function()
{
  // Call SaveFile method to save texts in the text area to the file that user chose
  SaveFile("saveFile", text);
});



// FUNCTION : "SaveAs" button click event method
//'DESCRIPTION :
//'When user clicks "SaveAs" button to save texts. If there are texts
// in the textarea, the checkModal will be displayed to ask if user wants to
// save them
//'PARAMETERS : None
//'RETURNS : None
$('#SaveAs').on("click", function()
{
  // Store currenet texts to the text variable
  text = $("textarea").val();

  // Empty an error message
  $(".errorMessage").text('');

  // Display saveModal to the user
  $("#saveModal").show();
});



// FUNCTION : "Yes" button on the save modal click event method
//'DESCRIPTION :
//'When the user clicks "Yes" button on the save modal
//'PARAMETERS : None
//'RETURNS : None
$('.saveYes').on("click", function()
{
  // Empty an error message
  $(".errorMessage").text('');

  // Hide check modal and display save modal to get a file name that
  // user wants to save texts to
  $("#checkModal").hide();
  $("#saveModal").show();
});



// FUNCTION : "No" button on the save modal click event method
//'DESCRIPTION :
//'When the user clicks "No" button on the save modal
//'PARAMETERS : None
//'RETURNS : None
$('.saveNo').on("click", function()
{
  // Select Empty option
  $('#fileList option[value=Empty]').prop('selected', 'selected').change();
  // Clear the textaera and hide checkModal
  $("textarea").val('');
  $("#checkModal").hide();
});



// FUNCTION : "Cancel" button on the save modal click event method
//'DESCRIPTION :
//'When the user clicks "cancle" button on the save modal
//'PARAMETERS : None
//'RETURNS : None
$('.saveCancel').on("click", function()
{
  // Rewrite texts user wrote to the text area and hide check modal
  $("textarea").val(text);
  $("#checkModal").hide();
});



// FUNCTION : "Yes" button on the overwrite modal click event method
//'DESCRIPTION :
//'When the user clicks "Yes" button on the overwrite modal
//'PARAMETERS : None
//'RETURNS : None
$('.overWriteYes').on("click", function()
{
  // Set isOverWrite to true
  isOverWrite = true;

  // Hide overwrite modal and call saveFile method to overwrite the file
  $("#overwiteModal").hide();

  SaveFile("Save", text);
});



// FUNCTION : "No" button on the overwrite modal click event method
//'DESCRIPTION :
//'When the user clicks "No" button on the overwrite modal
//'PARAMETERS : None
//'RETURNS : None
$('.overWirteNo').on("click", function()
{
  // Hide overwrite modal and display save modal to get a file name that
  // user wants to save texts to
  $("#overwiteModal").hide();
  $("#saveModal").show();
});



// FUNCTION : "Cancel" button on the overwrite modal click event method
//'DESCRIPTION :
//'When the user clicks "No" button on the overwrite modal
//'PARAMETERS : None
//'RETURNS : None
$('.overWriteCancel').on("click", function()
{
  // Hide overwrite modal
  $("#overwiteModal").hide();
});



// FUNCTION : "Close" button on the modals click event method
//'DESCRIPTION :
//'When the user clicks "No" button on the overwrite modal
//'PARAMETERS : None
//'RETURNS : None
$('.close').on("click", function()
{
  // Clear the newFileName input box and hide modals
  $("#newFileName").val('');
  $("#saveModal").hide();
  $("#checkModal").hide();
  $("#overwiteModal").hide();
  $("#confirmModal").hide();
});
