#!/usr/bin/env python3
"""
Script to manually set up roles and test users for the library management system.
Run this script from the Frappe bench directory.
"""

import frappe
import sys
import os

def setup_roles_and_users():
    """Set up roles and create test users."""
    
    print("Setting up library roles and test users...")
    
    # Step 1: Create roles
    roles = [
        {
            "role_name": "Librarian",
            "desk_access": 1,
            "restrict_to_domain": None,
            "disabled": 0
        },
        {
            "role_name": "Library Member",
            "desk_access": 0,
            "restrict_to_domain": None,
            "disabled": 0
        },
        {
            "role_name": "Library Manager",
            "desk_access": 1,
            "restrict_to_domain": None,
            "disabled": 0
        }
    ]
    
    print("Creating roles...")
    for role_data in roles:
        if not frappe.db.exists("Role", role_data["role_name"]):
            role = frappe.get_doc({
                "doctype": "Role",
                **role_data
            })
            role.insert(ignore_permissions=True)
            print(f"✅ Created role: {role_data['role_name']}")
        else:
            print(f"⏭️  Role already exists: {role_data['role_name']}")
    
    # Step 2: Create test users
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
    
    print("\nCreating test users...")
    for user_data in test_users:
        email = user_data["email"]
        
        # Check if user already exists
        if frappe.db.exists("User", email):
            print(f"⏭️  User {email} already exists, skipping...")
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
                if frappe.db.exists("Role", role):
                    user.add_roles(role)
                else:
                    print(f"⚠️  Role {role} not found for user {email}")
            
            # Create corresponding Member record for library members
            if "Library Member" in user_data["roles"] or "Librarian" in user_data["roles"] or "Library Manager" in user_data["roles"]:
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
    
    # Step 3: Test the get_current_user_roles API
    print("\nTesting get_current_user_roles API...")
    try:
        # Test with a specific user
        frappe.set_user("librarian@library.com")
        roles_response = frappe.call("library_app.api.get_current_user_roles")
        print(f"✅ API test successful for librarian: {roles_response}")
        
        frappe.set_user("member@library.com")
        roles_response = frappe.call("library_app.api.get_current_user_roles")
        print(f"✅ API test successful for member: {roles_response}")
        
    except Exception as e:
        print(f"❌ API test failed: {str(e)}")
    
    frappe.db.commit()
    
    print("\n" + "="*50)
    print("SETUP COMPLETE!")
    print("="*50)
    print("\nTest User Credentials:")
    print("=======================")
    for user_data in test_users:
        print(f"Email: {user_data['email']}")
        print(f"Password: {user_data['password']}")
        print(f"Roles: {', '.join(user_data['roles'])}")
        print("---")
    
    print("\nNext steps:")
    print("1. Start your frontend: cd library && yarn dev")
    print("2. Log in with the test credentials above")
    print("3. Check the debug info in the header to verify roles are loaded")
    print("4. Test different features based on user roles")

if __name__ == "__main__":
    # This script should be run from the Frappe bench directory
    # bench --site your-site.com execute library_app.setup_roles_and_users.setup_roles_and_users
    setup_roles_and_users() 