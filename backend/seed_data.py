"""
Sample data seeder for quick testing
Run: python seed_data.py
"""
from app import create_app, db
from app.models import User, Task
from datetime import datetime, timedelta

def seed_database():
    """Seed the database with sample data"""
    app = create_app()
    
    with app.app_context():
        # Clear existing data
        print("Clearing existing data...")
        db.session.query(Task).delete()
        db.session.query(User).delete()
        db.session.commit()
        
        # Create sample users
        print("Creating sample users...")
        users = [
            User(
                username='alice',
                email='alice@example.com',
                full_name='Alice Johnson'
            ),
            User(
                username='bob',
                email='bob@example.com',
                full_name='Bob Smith'
            ),
            User(
                username='charlie',
                email='charlie@example.com',
                full_name='Charlie Brown'
            ),
        ]
        
        for user in users:
            db.session.add(user)
        
        db.session.commit()
        print(f"✓ Created {len(users)} users")
        
        # Create sample tasks
        print("Creating sample tasks...")
        now = datetime.utcnow()
        tasks = [
            # Alice's tasks
            Task(
                user_id=users[0].id,
                title='Complete Python project',
                description='Finish the full-stack application',
                priority='high',
                completed=False,
                due_date=now + timedelta(days=3)
            ),
            Task(
                user_id=users[0].id,
                title='Review code',
                description='Code review for team members',
                priority='medium',
                completed=True,
                due_date=now + timedelta(days=1)
            ),
            
            # Bob's tasks
            Task(
                user_id=users[1].id,
                title='Write documentation',
                description='Complete API documentation',
                priority='medium',
                completed=False,
                due_date=now + timedelta(days=5)
            ),
            Task(
                user_id=users[1].id,
                title='Deploy to production',
                description='Deploy latest version to live server',
                priority='high',
                completed=False,
                due_date=now + timedelta(days=2)
            ),
            
            # Charlie's tasks
            Task(
                user_id=users[2].id,
                title='Learn Flask basics',
                description='Complete Flask tutorial',
                priority='low',
                completed=False,
                due_date=now + timedelta(days=7)
            ),
            Task(
                user_id=users[2].id,
                title='Set up development environment',
                description='Install and configure dev tools',
                priority='high',
                completed=True,
                due_date=now + timedelta(days=1)
            ),
        ]
        
        for task in tasks:
            db.session.add(task)
        
        db.session.commit()
        print(f"✓ Created {len(tasks)} tasks")
        
        print("\n✅ Database seeded successfully!")
        print("\nSample Users:")
        for user in users:
            print(f"  - {user.username} ({user.email})")
        
        print("\nSample Tasks:")
        for task in tasks:
            status = "✓ Done" if task.completed else "○ Pending"
            print(f"  - {status} | {task.title} (Priority: {task.priority})")

if __name__ == '__main__':
    seed_database()
