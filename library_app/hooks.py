app_name = "library_app"
app_title = "Library"
app_publisher = "Tewodros"
app_description = "Library management made easy"
app_email = "tewodrosy21@gmail.com"
app_license = "mit"

# Apps
# ------------------

# required_apps = []

# Each item in the list will be shown as an app in the apps page
# add_to_apps_screen = [
# 	{
# 		"name": "library_app",
# 		"logo": "/assets/library_app/logo.png",
# 		"title": "Library",
# 		"route": "/library_app",
# 		"has_permission": "library_app.api.permission.has_app_permission"
# 	}
# ]

# Includes in <head>
# ------------------

# include js, css files in header of desk.html
# app_include_css = "/assets/library_app/css/library_app.css"
# app_include_js = "/assets/library_app/js/library_app.js"

# include js, css files in header of web template
# web_include_css = "/assets/library_app/css/library_app.css"
# web_include_js = "/assets/library_app/js/library_app.js"

# include custom scss in every website theme (without file extension ".scss")
# website_theme_scss = "library_app/public/scss/website"

# include js, css files in header of web form
# webform_include_js = {"doctype": "public/js/doctype.js"}
# webform_include_css = {"doctype": "public/css/doctype.css"}

# include js in page
# page_js = {"page" : "public/js/file.js"}

# include js in doctype views
# doctype_js = {"doctype" : "public/js/doctype.js"}
# doctype_list_js = {"doctype" : "public/js/doctype_list.js"}
# doctype_tree_js = {"doctype" : "public/js/doctype_tree.js"}
# doctype_calendar_js = {"doctype" : "public/js/doctype_calendar.js"}

# Svg Icons
# ------------------
# include app icons in desk
# app_include_icons = "library_app/public/icons.svg"

# Home Pages
# ----------

# application home page (will override Website Settings)
# home_page = "login"

# website user home page (by Role)
# role_home_page = {
# 	"Role": "home_page"
# }

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# automatically load and sync documents of this doctype from downstream apps
# importable_doctypes = [doctype_1]

# Jinja
# ----------

# add methods and filters to jinja environment
# jinja = {
# 	"methods": "library_app.utils.jinja_methods",
# 	"filters": "library_app.utils.jinja_filters"
# }

# Installation
# ------------

# before_install = "library_app.install.before_install"
# after_install = "library_app.install.after_install"

# Uninstallation
# ------------

# before_uninstall = "library_app.uninstall.before_uninstall"
# after_uninstall = "library_app.uninstall.after_uninstall"

# Integration Setup
# ------------------
# To set up dependencies/integrations with other apps
# Name of the app being installed is passed as an argument

# before_app_install = "library_app.utils.before_app_install"
# after_app_install = "library_app.utils.after_app_install"

# Integration Cleanup
# -------------------
# To clean up dependencies/integrations with other apps
# Name of the app being uninstalled is passed as an argument

# before_app_uninstall = "library_app.utils.before_app_uninstall"
# after_app_uninstall = "library_app.utils.after_app_uninstall"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "library_app.notifications.get_notification_config"

# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
# 	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
# 	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# Document Events
# ---------------
# Hook on document methods and events

# doc_events = {
# 	"*": {
# 		"on_update": "method",
# 		"on_cancel": "method",
# 		"on_trash": "method"
# 	}
# }

# Scheduled Tasks
# ---------------

# scheduler_events = {
# 	"all": [
# 		"library_app.tasks.all"
# 	],
# 	"daily": [
# 		"library_app.tasks.daily"
# 	],
# 	"hourly": [
# 		"library_app.tasks.hourly"
# 	],
# 	"weekly": [
# 		"library_app.tasks.weekly"
# 	],
# 	"monthly": [
# 		"library_app.tasks.monthly"
# 	],
# }

# Testing
# -------

# before_tests = "library_app.install.before_tests"

# Overriding Methods
# ------------------------------
#
# override_whitelisted_methods = {
# 	"frappe.desk.doctype.event.event.get_events": "library_app.event.get_events"
# }
#
# each overriding function accepts a `data` argument;
# generated from the base implementation of the doctype dashboard,
# along with any modifications made in other Frappe apps
# override_doctype_dashboards = {
# 	"Task": "library_app.task.get_dashboard_data"
# }

# exempt linked doctypes from being automatically cancelled
#
# auto_cancel_exempted_doctypes = ["Auto Repeat"]

# Ignore links to specified DocTypes when deleting documents
# -----------------------------------------------------------

# ignore_links_on_delete = ["Communication", "ToDo"]

# Request Events
# ----------------
# before_request = ["library_app.utils.before_request"]
# after_request = ["library_app.utils.after_request"]

# Job Events
# ----------
# before_job = ["library_app.utils.before_job"]
# after_job = ["library_app.utils.after_job"]

# User Data Protection
# --------------------

# user_data_fields = [
# 	{
# 		"doctype": "{doctype_1}",
# 		"filter_by": "{filter_by}",
# 		"redact_fields": ["{field_1}", "{field_2}"],
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_2}",
# 		"filter_by": "{filter_by}",
# 		"partial": 1,
# 	},
# 	{
# 		"doctype": "{doctype_3}",
# 		"strict": False,
# 	},
# 	{
# 		"doctype": "{doctype_4}"
# 	}
# ]

# Authentication and authorization
# --------------------------------

# auth_hooks = [
# 	"library_app.auth.validate"
# ]

# Automatically update python controller files with type annotations for this app.
# export_python_type_annotations = True

# default_log_clearing_doctypes = {
# 	"Logging DocType Name": 30  # days to retain logs
# }



import frappe


# --- Library Management System Roles and Permissions ---

def create_library_roles():
    """Creates the necessary roles for the library management system."""
    roles = [
        {
            "role_name": "Librarian",
            "desk_access": 1,
            "restrict_to_domain": None,
            "disabled": 0
        },
        {
            "role_name": "Library Member",
            "desk_access": 0,  # Members don't need desk access
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
    
    for role_data in roles:
        if not frappe.db.exists("Role", role_data["role_name"]):
            role = frappe.get_doc({
                "doctype": "Role",
                **role_data
            })
            role.insert(ignore_permissions=True)

def setup_library_permissions():
    """Sets up permissions for library DocTypes."""
    # Permissions for Librarian role
    librarian_permissions = [
        {
            "doctype": "Book",
            "role": "Librarian",
            "create": 1,
            "read": 1,
            "write": 1,
            "delete": 1,
            "submit": 0,
            "cancel": 0,
            "amend": 0,
            "report": 1,
            "export": 1,
            "share": 1,
            "print": 1,
            "email": 1
        },
        {
            "doctype": "Member",
            "role": "Librarian",
            "create": 1,
            "read": 1,
            "write": 1,
            "delete": 1,
            "submit": 0,
            "cancel": 0,
            "amend": 0,
            "report": 1,
            "export": 1,
            "share": 1,
            "print": 1,
            "email": 1
        },
        {
            "doctype": "Loan",
            "role": "Librarian",
            "create": 1,
            "read": 1,
            "write": 1,
            "delete": 1,
            "submit": 0,
            "cancel": 0,
            "amend": 0,
            "report": 1,
            "export": 1,
            "share": 1,
            "print": 1,
            "email": 1
        },
        {
            "doctype": "Reservation",
            "role": "Librarian",
            "create": 1,
            "read": 1,
            "write": 1,
            "delete": 1,
            "submit": 0,
            "cancel": 0,
            "amend": 0,
            "report": 1,
            "export": 1,
            "share": 1,
            "print": 1,
            "email": 1
        }
    ]
    
    # Permissions for Library Member role
    member_permissions = [
        {
            "doctype": "Book",
            "role": "Library Member",
            "create": 0,
            "read": 1,
            "write": 0,
            "delete": 0,
            "submit": 0,
            "cancel": 0,
            "amend": 0,
            "report": 0,
            "export": 0,
            "share": 0,
            "print": 0,
            "email": 0
        },
        {
            "doctype": "Member",
            "role": "Library Member",
            "create": 0,
            "read": 1,
            "write": 1,  # Can update their own member record
            "delete": 0,
            "submit": 0,
            "cancel": 0,
            "amend": 0,
            "report": 0,
            "export": 0,
            "share": 0,
            "print": 0,
            "email": 0
        },
        {
            "doctype": "Loan",
            "role": "Library Member",
            "create": 0,
            "read": 1,
            "write": 0,
            "delete": 0,
            "submit": 0,
            "cancel": 0,
            "amend": 0,
            "report": 0,
            "export": 0,
            "share": 0,
            "print": 0,
            "email": 0
        },
        {
            "doctype": "Reservation",
            "role": "Library Member",
            "create": 1,
            "read": 1,
            "write": 1,  # Can create and cancel their own reservations
            "delete": 0,
            "submit": 0,
            "cancel": 0,
            "amend": 0,
            "report": 0,
            "export": 0,
            "share": 0,
            "print": 0,
            "email": 0
        }
    ]
    
    all_permissions = librarian_permissions + member_permissions
    
    for perm_data in all_permissions:
        # Check if permission already exists
        existing_perm = frappe.db.exists(
            "Custom DocPerm",
            {
                "parent": perm_data["doctype"],
                "role": perm_data["role"]
            }
        )
        
        if not existing_perm:
            perm = frappe.get_doc({
                "doctype": "Custom DocPerm",
                "parent": perm_data["doctype"],
                **perm_data
            })
            perm.insert(ignore_permissions=True)

# --- Scheduled Tasks for Library Management ---

def setup_library_scheduled_tasks():
    """Sets up scheduled tasks for the library management system."""
    # Task to check for overdue books and send notifications
    if not frappe.db.exists("Scheduled Job Type", "library.check_and_notify_overdue_books"):
        frappe.get_doc({
            "doctype": "Scheduled Job Type",
            "method": "library_management_system.api.check_and_notify_overdue_books",
            "frequency": "Daily",
            "cron_format": "0 9 * * *",  # Run at 9 AM daily
            "create_log": 1,
            "last_execution": None,
            "stopped": 0
        }).insert(ignore_permissions=True)

# --- App Installation Hook ---

def after_install():
    """Runs after the app is installed."""
    create_library_roles()
    setup_library_permissions()
    setup_library_scheduled_tasks()

# --- App Migration Hook ---

def after_migrate():
    """Runs after the app is migrated."""
    create_library_roles()
    setup_library_permissions()
    setup_library_scheduled_tasks()

# API Methods
# -----------
api_methods = {
    # Book Management
    "library_app.api.get_books": "GET",
    "library_app.api.create_book": "POST",
    "library_app.api.get_book": "GET",
    "library_app.api.update_book": "PUT", # Or use POST if you prefer simpler client-side calls
    "library_app.api.delete_book": "DELETE", # Or use POST

    # Member Management
    "library_app.api.get_members": "GET",
    "library_app.api.create_member": "POST",
    "library_app.api.get_member": "GET",
    "library_app.api.update_member": "PUT",
    "library_app.api.delete_member": "DELETE",

    # Loan Management
    "library_app.api.create_loan": "POST",
    "library_app.api.return_book": "POST", # A custom action, so POST is appropriate
    "library_app.api.get_loans": "GET",
    "library_app.api.get_loan": "GET",

    # Reports
    "library_app.api.get_books_on_loan_report": "GET",
    "library_app.api.get_overdue_books_report": "GET",
    
    "library_app.api.register_user": "POST",

}




website_route_rules = [{'from_route': '/library/<path:app_path>', 'to_route': 'library'},]