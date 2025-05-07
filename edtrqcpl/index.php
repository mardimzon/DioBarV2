<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Welcome to QC Public Library</title>
    <link rel="stylesheet" href="styles.css">
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 80vh;
            background-color: #f4f4f4;
        }
        .container {
            text-align: center;
            padding: 20px;
            background-color: #fff;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            border-radius: 10px;
        }
        .logo {
            max-width: 100%;
            height: auto;
        }
        h1 {
            font-size: 2em;
            margin: 20px 0;
        }
        .btn {
            display: inline-block;
            padding: 30px 60px; /* Increased padding */
            font-size: 2em; /* Increased font size */
            color: #fff;
            background-color: #007bff;
            border: none;
            border-radius: 5px;
            text-decoration: none;
            transition: background-color 0.3s;
        }
        .btn:hover {
            background-color: #0056b3;
        }
        @media (max-width: 1920px) {
            h1 {
                font-size: 1.5em;
            }
            .btn {
                font-size: 1.5em; /* Adjusted font size for smaller screens */
                padding: 20px 40px; /* Adjusted padding for smaller screens */
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <img src="logo.png" alt="Logo" class="logo">
        <h1>Welcome to QC Public Library - Daily Time Record</h1>
        <?php
            $domainName = $_SERVER['HTTP_HOST'];
            $url = "https://" . $domainName . "/dtr.php";
        ?>
        <a href="<?php echo $url; ?>" class="btn">Access Daily Time Record</a>
    </div>
</body>
</html>