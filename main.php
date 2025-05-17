<?php
// Execute the command and capture the output
$output = shell_exec('sudo -u ctfuser cat /home/ctfuser/flag.txt');

// Display the output in the browser
echo "<pre>$output</pre>";
?>
