<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;


require 'vendor/autoload.php';
header('Content-Type: application/json');
if ($_SERVER["REQUEST_METHOD"] == "POST") {

    // SANITIZE INPUTS
    $first_name = htmlspecialchars(trim($_POST['first-name']));
    $last_name = htmlspecialchars(trim($_POST['last-name']));
    $email = htmlspecialchars(trim($_POST['business-email']));
    $company = htmlspecialchars(trim($_POST['company']));
    $title = htmlspecialchars(trim($_POST['title']));
    $contact_type = htmlspecialchars(trim($_POST['contact-type']));
    $message = htmlspecialchars(trim($_POST['message']));

    // VALIDATE EMAIL

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Invalid email address'
        ]);
        exit;
    }

    $mail = new PHPMailer(true);

    try {

        // ======================
        // SMTP CONFIGURATION
        // ======================

        $mail->isSMTP();

        $mail->Host = 'smtp.gmail.com';
        // $mail->Host = 'sandbox.smtp.mailtrap.io';

        $mail->SMTPAuth = true;

        $mail->Username = 'info@triggerware.ai';
        // $mail->Username = '7bcf94f4579ed1';

        $mail->Password = 'Nmg&Dnc^^@1185';
        // $mail->Password = 'c0aaa235fd564f';

        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;

        $mail->Port = 465;

        // ======================
        // EMAIL SETTINGS
        // ======================

        $mail->setFrom(
            'info@triggerware.ai',
            // 'dev@yopmail.com',
            'Website Contact Form'
        );

        $mail->addAddress(
            'info@triggerware.ai'
        );

        $mail->addReplyTo(
            $email,
            $first_name . ' ' . $last_name
        );

        // ======================
        // EMAIL CONTENT
        // ======================

        $mail->isHTML(true);

        $mail->Subject = 'New Contact Form Submission';

        $mail->Body = "

        <h2>New Contact Form Submission</h2>

        <table border='1' cellpadding='10' cellspacing='0' width='100%'>

            <tr>
                <td><strong>First Name</strong></td>
                <td>{$first_name}</td>
            </tr>

            <tr>
                <td><strong>Last Name</strong></td>
                <td>{$last_name}</td>
            </tr>

            <tr>
                <td><strong>Email</strong></td>
                <td>{$email}</td>
            </tr>

            <tr>
                <td><strong>Company</strong></td>
                <td>{$company}</td>
            </tr>

            <tr>
                <td><strong>Title</strong></td>
                <td>{$title}</td>
            </tr>

            <tr>
                <td><strong>Contact Type</strong></td>
                <td>{$contact_type}</td>
            </tr>

            <tr>
                <td><strong>Message</strong></td>
                <td>{$message}</td>
            </tr>

        </table>

        ";

        // OPTIONAL TEXT VERSION

        $mail->AltBody = "
            First Name: $first_name
            Last Name: $last_name
            Email: $email
            Company: $company
            Title: $title
            Contact Type: $contact_type
            Message: $message
        ";

        // SEND EMAIL

        $mail->send();

        echo json_encode([
            'status' => 'success',
            'message' => 'Message sent successfully!'
        ]);
        exit;
    } catch (Exception $e) {

        echo json_encode([
            'status' => 'error',
            'message' => 'Mailer Error: ' . $mail->ErrorInfo
        ]);
        exit;
    }
}
