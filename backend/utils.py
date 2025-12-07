"""
Utility scripts and helpers for the application
"""
import os
import sys

def clear_database():
    """Clear all data from database"""
    db_path = 'app.db'
    if os.path.exists(db_path):
        os.remove(db_path)
        print("✓ Database cleared successfully")
    else:
        print("Database file not found")

def reset_to_default():
    """Reset database and reload sample data"""
    print("Resetting database...")
    clear_database()
    print("Seeding sample data...")
    os.system('python seed_data.py')
    print("✓ Database reset complete")

def show_help():
    """Show available commands"""
    print("""
    Available commands:
    
    python utils.py clear       - Clear all data from database
    python utils.py seed        - Load sample data
    python utils.py reset       - Clear and reload sample data
    python utils.py help        - Show this help message
    
    Examples:
    
    python utils.py clear       # Deletes app.db
    python utils.py seed        # Populates with sample users and tasks
    python utils.py reset       # Fresh start with sample data
    """)

if __name__ == '__main__':
    if len(sys.argv) < 2:
        show_help()
    else:
        command = sys.argv[1].lower()
        
        if command == 'clear':
            clear_database()
        elif command == 'seed':
            os.system('python seed_data.py')
        elif command == 'reset':
            reset_to_default()
        elif command == 'help':
            show_help()
        else:
            print(f"Unknown command: {command}")
            show_help()
