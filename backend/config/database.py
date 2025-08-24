import mysql.connector
from mysql.connector import Error
from .settings import DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT

# Database configuration
DB_CONFIG = {
    'host': DB_HOST,
    'user': DB_USER,
    'password': DB_PASSWORD,
    'database': DB_NAME,
    'port': DB_PORT
}

def get_database_connection():
    """Create and return a database connection"""
    try:
        connection = mysql.connector.connect(**DB_CONFIG)
        if connection.is_connected():
            return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None

def close_connection(connection):
    """Close database connection"""
    if connection and connection.is_connected():
        connection.close()

def test_connection():
    """Test database connection"""
    connection = get_database_connection()
    if connection:
        print("Successfully connected to MySQL database")
        close_connection(connection)
        return True
    return False
