#!/usr/bin/env python
import os
import sys
import django

# Add the project directory to the Python path
sys.path.append('/home/c_jalloh/Documents/School/Second Semester/ITCA Week/code/chelalBackend')

# Set the Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Backend.settings')

# Setup Django
django.setup()

from django.contrib.auth import get_user_model
from core.models import Role

User = get_user_model()

def create_admin_user():
    print("=== CREATING ADMIN USER ===")

    # Check if admin role exists, create if not
    admin_role, created = Role.objects.get_or_create(
        name='Admin',
        defaults={'description': 'System Administrator with full access'}
    )
    if created:
        print("Created Admin role")
    else:
        print("Admin role already exists")

    # Check if user already exists
    if User.objects.filter(username='cjalloh').exists():
        print("User 'cjalloh' already exists!")
        user = User.objects.get(username='cjalloh')
        print(f"User details: {user.username}, Email: {user.email}, Staff: {user.is_staff}, Super: {user.is_superuser}")
        return

    # Create the admin user
    user = User.objects.create_user(
        username='cjalloh',
        email='cjalloh@admin.com',  # You can change this
        password='cjalloh25',
        first_name='Admin',
        last_name='User',
        is_staff=True,
        is_superuser=True
    )

    # Assign admin role
    user.role = admin_role
    user.save()

    print("✅ Admin user created successfully!")
    print(f"Username: {user.username}")
    print(f"Email: {user.email}")
    print(f"Password: cjalloh25")
    print(f"Is Staff: {user.is_staff}")
    print(f"Is Superuser: {user.is_superuser}")
    print(f"Role: {user.role.name if user.role else 'None'}")

if __name__ == "__main__":
    try:
        create_admin_user()
    except Exception as e:
        print(f"❌ Error: {e}")
        print("Make sure the database is running and Django is properly configured.")
