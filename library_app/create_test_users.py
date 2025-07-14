#!/usr/bin/env python3
"""
Script to create test users with different roles for the library management system.
Run this script from the Frappe bench directory.
"""

import frappe
import sys
import os

def create_test_users():
    """Create test users with different roles."""
    
    # Test users data
    test_users = [
        {
            "email": "librarian@library.com",
            "first_name": "John",
            "last_name": "Librarian",
            "roles": ["Librarian"],
            "password": "librarian123"
        },
        {
            "email": "member@library.com", 
            "first_name": "Jane",
            "last_name": "Member",
            "roles": ["Library Member"],
            "password": "member123"
        },
        {
            "email": "manager@library.com",
            "first_name": "Bob",
            "last_name": "Manager", 
            "roles": ["Library Manager"],
            "password": "manager123"
        }
    ]
    
    print("Creating test users...")
    
    for user_data in test_users:
        email = user_data["email"]
        
        # Check if user already exists
        if frappe.db.exists("User", email):
            print(f"User {email} already exists, skipping...")
            continue
            
        try:
            # Create user
            user = frappe.get_doc({
                "doctype": "User",
                "email": email,
                "first_name": user_data["first_name"],
                "last_name": user_data["last_name"],
                "send_welcome_email": 0,
                "enabled": 1,
                "new_password": user_data["password"]
            })
            user.insert(ignore_permissions=True)
            
            # Add roles
            for role in user_data["roles"]:
                if not frappe.db.exists("Role", role):
                    # Create role if it doesn't exist
                    role_doc = frappe.get_doc({
                        "doctype": "Role",
                        "role_name": role,
                        "desk_access": 1 if role != "Library Member" else 0
                    })
                    role_doc.insert(ignore_permissions=True)
                
                # Add role to user
                user.add_roles(role)
            
            # Create corresponding Member record for library members
            if "Library Member" in user_data["roles"]:
                member = frappe.get_doc({
                    "doctype": "Member",
                    "member_name": f"{user_data['first_name']} {user_data['last_name']}",
                    "email": email,
                    "membership_id": f"MEM-{frappe.generate_hash(length=6)}",
                    "phone": "123-456-7890",
                    "frappe_user": user.name
                })
                member.insert(ignore_permissions=True)
            
            print(f"✅ Created user: {email} with roles: {', '.join(user_data['roles'])}")
            print(f"   Password: {user_data['password']}")
            
        except Exception as e:
            print(f"❌ Error creating user {email}: {str(e)}")
    
    print("\nTest users created successfully!")
    print("\nLogin credentials:")
    print("==================")
    for user_data in test_users:
        print(f"Email: {user_data['email']}")
        print(f"Password: {user_data['password']}")
        print(f"Roles: {', '.join(user_data['roles'])}")
        print("---")

if __name__ == "__main__":
    # This script should be run from the Frappe bench directory
    # bench --site your-site.com execute library_app.create_test_users.create_test_users
    create_test_users() 