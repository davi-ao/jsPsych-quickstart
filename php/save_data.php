<?php
require_once("PHPMailerAutoload.php");
// the $_POST[] array will contain the passed in filename and data
// the directory "data" is writable by the server (chmod 777)
$filename = "../data/".$_POST['filename'];
$data = $_POST['filedata'];
// write the file to disk
file_put_contents($filename, $data);

$path = substr($filename, 2);

$mail = new PHPMailer;
$mail->isSMTP();
$mail->Host = "localhost";

$mail->From = "contato@traduzindo.org";
$mail->FromName = "Readability Data Collection";
$mail->addAddress("davi.alvesoliveira@gmail.com");
$mail->isHTML(true);

$mail->Subject = "New Data";
$mail->Body = <<<EOT
		Donwload file: <a href="http://readability.traduzindo.org{$path}" target="_blank" title="Click to download">{$path}</a>
EOT;

$mail->setLanguage("br");
$mail->CharSet = "utf-8";

$send = $mail->send();

$mail->clearAllRecipients();
$mail->clearAttachments();
?>