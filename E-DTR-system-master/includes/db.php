<?php
/**
 * Database Connection Module
 * ------------------------
 * Provides database connection functionality for the DTR system
 */

/**
 * Establishes a connection to the database
 * 
 * @return mysqli Database connection object
 */
function connectDB() {
    $servername = "localhost";
    $username = "root";
    $password = "";
    $dbname = "qcpledtr"; // Replace with your database name

    // Create connection
    $conn = new mysqli($servername, $username, $password, $dbname);

    // Check connection
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    return $conn;
}
?>