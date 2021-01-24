<?php
// FILE : server.php
// PROGRAMMER : Hongsik Eom
// FIRST VERSION : December 11, 2020
// DESCRIPTION :
// This file is used to receive all the rquests from client, proceess them,
// generate JSON strings with contents, and respond back to the client



//Get userRequest value sent from the client
$userRequest = $_POST["userRequest"];

// Deserialize the JSON string
$request = json_decode($userRequest, true);

// If request is "fileList", it will find all the files from the MyFiles Directory,
// serialize them to JSON string, and return to the client
if($request["request"] == "fileList")
{
  // Set the path
  $dir = "./MyFiles";

  // Find all the files in the MyFiles folder and exclude "."" and ".." from the array
  $folders = array('..', '.', 'folder');
  $fileList = array_diff(scandir($dir), $folders);
  $fileList = array_values($fileList);

  // Serialize them to the JSON string and return to the client
  echo json_encode($fileList);
}
// If request is "saveFile", it will retreive the file name and texts from client and
// save texts to the file
else if ($request["request"] == "saveFile")
{
  // Get texts and the file name and set the path
  $text = $request["text"];
  $filename = $request["file"];
  $path = "./MyFiles/{$filename}";

  // If the file already exists
  if (file_exists($path))
  {
    // return message
    $result = "File already exists";
  }
  // If the file does not exist
  else
  {
    // Open the file, write texts to the file, close the file
    $fopen = fopen($path, "w");
    fwrite($fopen, $text);
    fclose($fopen);

    // return message
    $result = "Save Success";
  }

  // Serialize the message to the JSON and return to the client
  echo json_encode($result);
}
// If request is "Save", it will retreive the file name and texts from client and
// save texts to the file
else if ($request["request"] == "Save")
{
  // Get texts and the file name and set the path
  $text = $request["text"];
  $filename = $request["file"];
  $path = "./MyFiles/{$filename}";

  // If the file already exists
  if (file_exists($path))
  {
    // Open the file, write texts to the file, close the file
    $fopen = fopen($path, "w");
    fwrite($fopen, $text);
    fclose($fopen);

    // return message
    $result = "Save Success";
  }
  // If the file does not exist
  else
  {
    // return message
    $result = "File does not exist!";
  }

  // Serialize the message to the JSON and return to the client
  echo json_encode($result);
}
// If request is "loadFile", it will get the file name from the string and
// open the file to get all texts. After which, it will serialize texts
// to the JSON string and return to the client
else if ($request["request"] == "loadFile")
{
  // Get the file name
  $filename = $request["file"];

  // Get the file name
  $path = "./MyFiles/{$filename}";

  // If file exists
  if (file_exists($path))
  {
    // If text is empty
    if (filesize($path) == 0)
    {
      $contents = '""';
    }
    else
    {
      // Open the file, read texts, and close the file
      $fopen = fopen($path, "r");
      $contents = fread($fopen, filesize($path));
      fclose($fopen);
    }
  }
  // If file does not exist
  else
  {
    // return message
    $contents = "File does not exist!";
  }
  // Serialize the message to the JSON string and return to the client
  echo json_encode($contents);
}
?>
