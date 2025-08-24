import bcrypt
import jwt
from datetime import datetime, timedelta
from typing import Optional
import mysql.connector
from config.database import get_database_connection, close_connection

# JWT Configuration
from config.settings import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES

class AuthService:
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash a password using bcrypt"""
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash"""
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    
    @staticmethod
    def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
        """Create JWT access token"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
    
    @staticmethod
    def verify_token(token: str) -> Optional[dict]:
        """Verify JWT token and return payload"""
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            return payload
        except jwt.PyJWTError:
            return None
    
    @staticmethod
    def create_user(email: str, password: str, first_name: str = None, last_name: str = None, username: str = None):
        """Create a new user in the database"""
        connection = get_database_connection()
        if not connection:
            return None, "Database connection failed"
        
        try:
            cursor = connection.cursor()
            
            # Check if email already exists
            cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
            if cursor.fetchone():
                return None, "Email already exists"
            
            # Generate username from email if not provided
            if not username:
                username = email.split('@')[0]  # Use part before @ as username
            
            # Hash password and create user
            hashed_password = AuthService.hash_password(password)
            
            cursor.execute("""
                INSERT INTO users (username, email, password_hash, first_name, last_name)
                VALUES (%s, %s, %s, %s, %s)
            """, (username, email, hashed_password, first_name, last_name))
            
            connection.commit()
            user_id = cursor.lastrowid
            
            return user_id, "User created successfully"
            
        except mysql.connector.Error as e:
            return None, f"Database error: {str(e)}"
        finally:
            close_connection(connection)
    
    @staticmethod
    def authenticate_user(email: str, password: str):
        """Authenticate user with email and password"""
        connection = get_database_connection()
        if not connection:
            return None, "Database connection failed"
        
        try:
            cursor = connection.cursor(dictionary=True)
            cursor.execute("""
                SELECT id, username, email, password_hash, first_name, last_name, role, is_active, created_at, updated_at
                FROM users WHERE email = %s AND is_active = TRUE
            """, (email,))
            
            user = cursor.fetchone()
            if not user:
                return None, "Invalid credentials"
            
            if not AuthService.verify_password(password, user['password_hash']):
                return None, "Invalid credentials"
            
            return user, "Authentication successful"
            
        except mysql.connector.Error as e:
            return None, f"Database error: {str(e)}"
        finally:
            close_connection(connection)
    
    @staticmethod
    def get_user_by_id(user_id: int):
        """Get user by ID"""
        connection = get_database_connection()
        if not connection:
            return None
        
        try:
            cursor = connection.cursor(dictionary=True)
            cursor.execute("""
                SELECT id, username, email, first_name, last_name, role, is_active, created_at, updated_at
                FROM users WHERE id = %s
            """, (user_id,))
            
            return cursor.fetchone()
            
        except mysql.connector.Error as e:
            print(f"Database error: {str(e)}")
            return None
        finally:
            close_connection(connection)
    
    @staticmethod
    def get_user_by_email(email: str):
        """Get user by email"""
        connection = get_database_connection()
        if not connection:
            return None
        
        try:
            cursor = connection.cursor(dictionary=True)
            cursor.execute("""
                SELECT id, username, email, first_name, last_name, role, is_active, created_at, updated_at
                FROM users WHERE email = %s
            """, (email,))
            
            return cursor.fetchone()
            
        except mysql.connector.Error as e:
            print(f"Database error: {str(e)}")
            return None
        finally:
            close_connection(connection)
