# library_app/library_app/api.py
import frappe

# --- Book Management API (CRUD) ---

@frappe.whitelist(allow_guest=True) # allow_guest=True is primarily for development testing or public-facing read. For production, consider user roles.
def get_books():
    """Fetches all books with specified fields."""
    books = frappe.get_list("Book", fields=["name", "title", "author", "publish_date", "isbn", "status"])
    return books

@frappe.whitelist() # Requires authentication
def create_book(title, author, publish_date, isbn):
    """Creates a new book record."""
    try:
        # Validate ISBN uniqueness before creating (Frappe's unique constraint handles this too, but explicit check can give better error message)
        if frappe.db.exists("Book", {"isbn": isbn}):
            frappe.throw(f"A book with ISBN '{isbn}' already exists.")

        book = frappe.get_doc({
            "doctype": "Book",
            "title": title,
            "author": author,
            "publish_date": publish_date,
            "isbn": isbn,
            "status": "Available" # Default status for a new book
        })
        book.insert()
        frappe.db.commit() # Ensure the transaction is committed
        return {"message": "Book created successfully", "book_name": book.name}
    except frappe.exceptions.DuplicateEntryError: # Catch specific Frappe error for unique constraints
        frappe.throw(f"A book with ISBN '{isbn}' already exists.")
    except Exception as e:
        frappe.log_error(frappe.gettraceback(), "Error in create_book API")
        frappe.throw(f"Failed to create book: {e}")

@frappe.whitelist()
def get_book(name):
    """Fetches a single book by its name (Frappe's internal ID)."""
    try:
        book = frappe.get_doc("Book", name)
        return book.as_dict() # Convert Doc object to dictionary for easier consumption
    except frappe.DoesNotExistError:
        frappe.throw(f"Book with ID '{name}' not found.")
    except Exception as e:
        frappe.log_error(frappe.gettraceback(), "Error in get_book API")
        frappe.throw(f"Failed to retrieve book: {e}")

@frappe.whitelist()
def update_book(name, title=None, author=None, publish_date=None, isbn=None, status=None):
    """Updates an existing book record."""
    try:
        book = frappe.get_doc("Book", name)

        # Check for ISBN change and uniqueness if ISBN is updated
        if isbn and book.isbn != isbn:
            if frappe.db.exists("Book", {"isbn": isbn}) and frappe.db.get_value("Book", {"isbn": isbn}, "name") != name:
                frappe.throw(f"A book with ISBN '{isbn}' already exists.")

        if title is not None:
            book.title = title
        if author is not None:
            book.author = author
        if publish_date is not None:
            book.publish_date = publish_date
        if isbn is not None:
            book.isbn = isbn
        if status is not None:
            book.status = status

        book.save()
        frappe.db.commit()
        return {"message": "Book updated successfully", "book_name": book.name}
    except frappe.DoesNotExistError:
        frappe.throw(f"Book with ID '{name}' not found for update.")
    except frappe.exceptions.DuplicateEntryError:
        frappe.throw(f"A book with ISBN '{isbn}' already exists.")
    except Exception as e:
        frappe.log_error(frappe.gettraceback(), "Error in update_book API")
        frappe.throw(f"Failed to update book: {e}")

@frappe.whitelist()
def delete_book(name):
    """Deletes a book record."""
    try:
        if frappe.db.exists("Loan", {"book": name, "returned": 0}):
            frappe.throw("Cannot delete book: It is currently on loan.")

        frappe.delete_doc("Book", name)
        frappe.db.commit()
        return {"message": "Book deleted successfully", "book_name": name}
    except frappe.DoesNotExistError:
        frappe.throw(f"Book with ID '{name}' not found for deletion.")
    except Exception as e:
        frappe.log_error(frappe.gettraceback(), "Error in delete_book API")
        frappe.throw(f"Failed to delete book: {e}")

# --- Member Management API (CRUD) ---

@frappe.whitelist()
def get_members():
    """Fetches all library members."""
    try:
        members = frappe.get_list("Member", fields=["name", "member_name", "membership_id", "email", "phone", "frappe_user"])
        return members or []  # Return empty array if no members
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "API Error: get_members")
        return []  # Return empty array on error

@frappe.whitelist()
def create_member(member_name, membership_id, email, phone, frappe_user=None):
    """Creates a new library member record."""
    try:
        if frappe.db.exists("Member", {"membership_id": membership_id}):
            frappe.throw(f"Member with ID '{membership_id}' already exists.")
        if frappe.db.exists("Member", {"email": email}):
            frappe.throw(f"Member with email '{email}' already exists.")

        member = frappe.get_doc({
            "doctype": "Member",
            "member_name": member_name,
            "membership_id": membership_id,
            "email": email,
            "phone": phone,
            "frappe_user": frappe_user
        })
        member.insert()
        frappe.db.commit()
        return {"message": "Member created successfully", "member_name": member.name}
    except frappe.exceptions.DuplicateEntryError:
        frappe.throw("Duplicate entry for Membership ID or Email.")
    except Exception as e:
        frappe.log_error(frappe.gettraceback(), "Error in create_member API")
        frappe.throw(f"Failed to create member: {e}")

@frappe.whitelist()
def get_member(name):
    """Fetches a single member by its name (Frappe's internal ID)."""
    try:
        member = frappe.get_doc("Member", name)
        return member.as_dict()
    except frappe.DoesNotExistError:
        frappe.throw(f"Member with ID '{name}' not found.")
    except Exception as e:
        frappe.log_error(frappe.gettraceback(), "Error in get_member API")
        frappe.throw(f"Failed to retrieve member: {e}")

@frappe.whitelist()
def update_member(name, member_name=None, membership_id=None, email=None, phone=None, frappe_user=None):
    """Updates an existing library member record."""
    try:
        member = frappe.get_doc("Member", name)

        if membership_id and member.membership_id != membership_id:
            if frappe.db.exists("Member", {"membership_id": membership_id}) and frappe.db.get_value("Member", {"membership_id": membership_id}, "name") != name:
                frappe.throw(f"Member with ID '{membership_id}' already exists.")
        if email and member.email != email:
            if frappe.db.exists("Member", {"email": email}) and frappe.db.get_value("Member", {"email": email}, "name") != name:
                frappe.throw(f"Member with email '{email}' already exists.")

        if member_name is not None:
            member.member_name = member_name
        if membership_id is not None:
            member.membership_id = membership_id
        if email is not None:
            member.email = email
        if phone is not None:
            member.phone = phone
        if frappe_user is not None:
            member.frappe_user = frappe_user

        member.save()
        frappe.db.commit()
        return {"message": "Member updated successfully", "member_name": member.name}
    except frappe.DoesNotExistError:
        frappe.throw(f"Member with ID '{name}' not found for update.")
    except frappe.exceptions.DuplicateEntryError:
        frappe.throw("Duplicate entry for Membership ID or Email.")
    except Exception as e:
        frappe.log_error(frappe.gettraceback(), "Error in update_member API")
        frappe.throw(f"Failed to update member: {e}")

@frappe.whitelist()
def delete_member(name):
    """Deletes a library member record."""
    try:
        # Optional: Add a check here if the member has outstanding loans
        # if frappe.db.exists("Loan", {"member": name, "returned": 0}):
        #     frappe.throw("Cannot delete member: They have outstanding loans.")

        frappe.delete_doc("Member", name)
        frappe.db.commit()
        return {"message": "Member deleted successfully", "member_name": name}
    except frappe.DoesNotExistError:
        frappe.throw(f"Member with ID '{name}' not found for deletion.")
    except Exception as e:
        frappe.log_error(frappe.gettraceback(), "Error in delete_member API")
        frappe.throw(f"Failed to delete member: {e}")

# --- Loan Management API ---

@frappe.whitelist()
def create_loan(book_name, member_name, loan_date, return_date):
    """
    Creates a new library loan.
    Includes availability check to prevent loaning an already loaned book.
    """
    try:
        book = frappe.get_doc("Book", book_name)

        # --- Availability Check (MUST-HAVE) ---
        if book.status == "On Loan":
            frappe.throw(f"Book '{book.title}' (ISBN: {book.isbn}) is already on loan.")

        # Additional check: Does this member already have this specific book on loan?
        # This handles cases where a book might be returned and re-loaned, but prevents
        # a single member from having the same book multiple times (if that's a rule).
        if frappe.db.exists("Loan", {"book": book_name, "member": member_name, "returned": 0}):
            frappe.throw(f"Member '{member_name}' already has '{book.title}' on loan.")

        # Create the Loan document
        loan = frappe.get_doc({
            "doctype": "Loan",
            "book": book_name,
            "member": member_name,
            "loan_date": loan_date,
            "return_date": return_date,
            "returned": 0, # Not returned yet
            "overdue": 0  # Not overdue initially
        })
        loan.insert()

        # Update book status to "On Loan"
        book.status = "On Loan"
        book.save() # Saves the changes to the Book DocType

        frappe.db.commit()
        return {"message": "Loan created successfully", "loan_name": loan.name}
    except frappe.DoesNotExistError:
        frappe.throw("Invalid Book ID or Member ID provided for loan.")
    except Exception as e:
        frappe.log_error(frappe.gettraceback(), "Error in create_loan API")
        frappe.throw(f"Failed to create loan: {e}")

@frappe.whitelist()
def return_book(loan_name):
    """
    Marks a specific loan as returned and updates the book status to 'Available'.
    Also checks for pending reservations and notifies the next person in queue.
    """
    try:
        loan = frappe.get_doc("Loan", loan_name)

        if loan.returned:
            frappe.throw(f"Loan '{loan_name}' has already been marked as returned.")

        # Mark loan as returned
        loan.returned = 1
        loan.save()

        # Update associated Book's status
        book = frappe.get_doc("Book", loan.book)
        
        # Check if there are pending reservations for this book
        pending_reservations = frappe.get_list(
            "Reservation", 
            filters={"book": loan.book, "status": "Pending"},
            order_by="reservation_date asc",
            limit=1
        )
        
        if pending_reservations:
            # Update book status to "Reserved" and mark the reservation as completed
            book.status = "Reserved"
            reservation = frappe.get_doc("Reservation", pending_reservations[0].name)
            reservation.status = "Completed"
            reservation.save()
            
            # Send notification to the member who reserved the book
            send_reservation_notification(reservation.member, book.title)
        else:
            # No reservations, make book available
            book.status = "Available"
        
        book.save()
        frappe.db.commit()
        return {"message": "Book returned successfully", "loan_name": loan.name}
    except frappe.DoesNotExistError:
        frappe.throw(f"Loan with ID '{loan_name}' not found for return.")
    except Exception as e:
        frappe.log_error(frappe.gettraceback(), "Error in return_book API")
        frappe.throw(f"Failed to return book: {e}")

@frappe.whitelist()
def get_loans():
    """Fetches all library loans with book title and member name."""
    try:
        loans = frappe.get_list(
            "Loan",
            fields=["name", "book", "member", "loan_date", "return_date", "returned", "overdue"]
        )
        # Add book_title and member_name for display
        for loan in loans:
            # Get book title
            book_doc = frappe.get_doc("Book", loan.book)
            loan["book_title"] = book_doc.title
            # Get member name
            member_doc = frappe.get_doc("Member", loan.member)
            loan["member_name"] = member_doc.member_name
        return loans or []  # Return as dict for consistency
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "API Error: get_loans")
        return []

@frappe.whitelist()
def get_loan(name):
    """Fetches a single loan by its name (Frappe's internal ID)."""
    try:
        loan = frappe.get_doc("Loan", name)
        return loan.as_dict()
    except frappe.DoesNotExistError:
        frappe.throw(f"Loan with ID '{name}' not found.")
    except Exception as e:
        frappe.log_error(frappe.gettraceback(), "Error in get_loan API")
        frappe.throw(f"Failed to retrieve loan: {e}")

# --- Reports (Initial) ---

@frappe.whitelist()
def get_books_on_loan_report():
    """Returns a list of books currently on loan."""
    books_on_loan = frappe.get_list(
        "Loan",
        filters={"returned": 0}, # Not yet returned
        fields=["name", "book", "member", "loan_date", "return_date"],
        order_by="loan_date desc"
    )

    # To make the report more user-friendly, fetch book titles and member names
    detailed_report = []
    for loan in books_on_loan:
        book_title = frappe.db.get_value("Book", loan.book, "title")
        member_name = frappe.db.get_value("Member", loan.member, "member_name")
        detailed_report.append({
            "loan_id": loan.name,
            "book_title": book_title,
            "book_id": loan.book,
            "member_name": member_name,
            "member_id": loan.member,
            "loan_date": loan.loan_date,
            "return_date": loan.return_date
        })
    return detailed_report

@frappe.whitelist()
def get_overdue_books_report():
    """Returns a list of books that are currently overdue."""
    import datetime
    today = frappe.utils.nowdate() # Get today's date in Frappe's format

    overdue_loans = frappe.get_list(
        "Loan",
        filters={"returned": 0, "return_date": ["<", today]}, # Not returned AND return_date is in the past
        fields=["name", "book", "member", "loan_date", "return_date"],
        order_by="return_date asc"
    )

    detailed_report = []
    for loan in overdue_loans:
        book_title = frappe.db.get_value("Book", loan.book, "title")
        member_name = frappe.db.get_value("Member", loan.member, "member_name")
        member_email = frappe.db.get_value("Member", loan.member, "email")
        detailed_report.append({
            "loan_id": loan.name,
            "book_title": book_title,
            "book_id": loan.book,
            "member_name": member_name,
            "member_id": loan.member,
            "member_email": member_email, # Include email for notifications later
            "loan_date": loan.loan_date,
            "return_date": loan.return_date
        })
    return detailed_report

@frappe.whitelist(allow_guest=True)
def register_user(full_name, email, password, phone=None):
    """
    Registers a new user and assigns 'Library Member' role.
    Also creates a linked Library Member record.
    """
    try:
        # Check if user already exists
        if frappe.db.exists("User", email):
            frappe.throw("User already exists with this email.")

        # Create Frappe User
        user = frappe.get_doc({
            "doctype": "User",
            "email": email,
            "first_name": full_name,
            "send_welcome_email": 0,
            "enabled": 1,
            "new_password": password,
            "role_profile_name": "Library Member",  # Optional: if using role profiles
            "roles": [{"role": "Library Member"}]
        })
        user.insert(ignore_permissions=True)

        # Create Library Member record
        library_member = frappe.get_doc({
            "doctype": "Member",
            "member_name": full_name,
            "email": email,
            "membership_id": f"MEM-{frappe.generate_hash(length=6)}",  # Auto-ID
            "phone": phone or "",
            "frappe_user": user.name
        })
        library_member.insert()

        frappe.db.commit()
        return {"message": "User registered successfully. Please log in."}

    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "User Registration Failed")
        frappe.throw(f"Registration failed: {e}")

@frappe.whitelist(allow_guest=True)
def create_librarian_user(full_name, email, password, phone=None):
    """
    Creates a new user with Librarian role.
    This should only be used by administrators.
    """
    try:
        # Check if user already exists
        if frappe.db.exists("User", email):
            frappe.throw("User already exists with this email.")

        # Create Frappe User
        user = frappe.get_doc({
            "doctype": "User",
            "email": email,
            "first_name": full_name,
            "send_welcome_email": 0,
            "enabled": 1,
            "new_password": password,
            "roles": [{"role": "Librarian"}]
        })
        user.insert(ignore_permissions=True)

        # Create Library Member record (librarians are also members)
        library_member = frappe.get_doc({
            "doctype": "Member",
            "member_name": full_name,
            "email": email,
            "membership_id": f"LIB-{frappe.generate_hash(length=6)}",  # LIB prefix for librarians
            "phone": phone or "",
            "frappe_user": user.name
        })
        library_member.insert()

        frappe.db.commit()
        return {"message": "Librarian user created successfully. Please log in."}

    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "Librarian User Creation Failed")
        frappe.throw(f"Librarian creation failed: {e}")

@frappe.whitelist(allow_guest=True)
def create_manager_user(full_name, email, password, phone=None):
    """
    Creates a new user with Library Manager role.
    This should only be used by administrators.
    """
    try:
        # Check if user already exists
        if frappe.db.exists("User", email):
            frappe.throw("User already exists with this email.")

        # Create Frappe User
        user = frappe.get_doc({
            "doctype": "User",
            "email": email,
            "first_name": full_name,
            "send_welcome_email": 0,
            "enabled": 1,
            "new_password": password,
            "roles": [{"role": "Library Manager"}]
        })
        user.insert(ignore_permissions=True)

        # Create Library Member record (managers are also members)
        library_member = frappe.get_doc({
            "doctype": "Member",
            "member_name": full_name,
            "email": email,
            "membership_id": f"MGR-{frappe.generate_hash(length=6)}",  # MGR prefix for managers
            "phone": phone or "",
            "frappe_user": user.name
        })
        library_member.insert()

        frappe.db.commit()
        return {"message": "Manager user created successfully. Please log in."}

    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "Manager User Creation Failed")
        frappe.throw(f"Manager creation failed: {e}")

# --- Reservation Management API ---

@frappe.whitelist()
def create_reservation(book_name, member_name):
    """Creates a new book reservation."""
    try:
        book = frappe.get_doc("Book", book_name)
        
        # Check if book is available for reservation
        if book.status == "Available":
            frappe.throw(f"Book '{book.title}' is available. You can loan it directly instead of reserving.")
        
        # Check if member already has a pending reservation for this book
        if frappe.db.exists("Reservation", {"book": book_name, "member": member_name, "status": "Pending"}):
            frappe.throw(f"You already have a pending reservation for '{book.title}'.")
        
        # Check if member already has this book on loan
        if frappe.db.exists("Loan", {"book": book_name, "member": member_name, "returned": 0}):
            frappe.throw(f"You already have '{book.title}' on loan.")
        
        reservation = frappe.get_doc({
            "doctype": "Reservation",
            "book": book_name,
            "member": member_name,
            "reservation_date": frappe.utils.nowdate(),
            "status": "Pending"
        })
        reservation.insert()
        
        # Update book status to "Reserved" if it's not already
        if book.status != "Reserved":
            book.status = "Reserved"
            book.save()
        
        frappe.db.commit()
        return {"message": "Reservation created successfully", "reservation_name": reservation.name}
    except frappe.DoesNotExistError:
        frappe.throw("Invalid Book ID or Member ID provided for reservation.")
    except Exception as e:
        frappe.log_error(frappe.gettraceback(), "Error in create_reservation API")
        frappe.throw(f"Failed to create reservation: {e}")

@frappe.whitelist()
def get_reservations():
    """Fetches all reservations."""
    try:
        reservations = frappe.get_list(
            "Reservation", 
            fields=["name", "book", "member", "reservation_date", "status"],
            order_by="reservation_date asc"
        )
        return reservations or []
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "API Error: get_reservations")
        return []

@frappe.whitelist()
def cancel_reservation(reservation_name):
    """Cancels a reservation."""
    try:
        reservation = frappe.get_doc("Reservation", reservation_name)
        
        if reservation.status != "Pending":
            frappe.throw(f"Reservation '{reservation_name}' cannot be cancelled. Status: {reservation.status}")
        
        reservation.status = "Cancelled"
        reservation.save()
        
        # Check if there are other pending reservations for this book
        pending_reservations = frappe.get_list(
            "Reservation", 
            filters={"book": reservation.book, "status": "Pending"},
            order_by="reservation_date asc"
        )
        
        if not pending_reservations:
            # No more pending reservations, make book available if not on loan
            book = frappe.get_doc("Book", reservation.book)
            if not frappe.db.exists("Loan", {"book": reservation.book, "returned": 0}):
                book.status = "Available"
                book.save()
        
        frappe.db.commit()
        return {"message": "Reservation cancelled successfully", "reservation_name": reservation.name}
    except frappe.DoesNotExistError:
        frappe.throw(f"Reservation with ID '{reservation_name}' not found.")
    except Exception as e:
        frappe.log_error(frappe.gettraceback(), "Error in cancel_reservation API")
        frappe.throw(f"Failed to cancel reservation: {e}")

# --- Email Notification Functions ---

def send_overdue_notification(member_email, member_name, book_title, return_date):
    """Sends overdue notification email to member."""
    try:
        subject = f"Book Overdue: {book_title}"
        message = f"""
        Dear {member_name},
        
        The book "{book_title}" was due for return on {return_date} and is now overdue.
        Please return the book as soon as possible to avoid any penalties.
        
        Thank you,
        Library Management System
        """
        
        frappe.sendmail(
            recipients=[member_email],
            subject=subject,
            message=message,
            now=True
        )
        return True
    except Exception as e:
        frappe.log_error(f"Failed to send overdue notification: {e}")
        return False

def send_reservation_notification(member_name, book_title):
    """Sends notification when a reserved book becomes available."""
    try:
        member = frappe.get_doc("Member", member_name)
        subject = f"Book Available: {book_title}"
        message = f"""
        Dear {member.member_name},
        
        The book "{book_title}" that you reserved is now available for loan.
        Please visit the library to collect your book within 48 hours.
        
        Thank you,
        Library Management System
        """
        
        frappe.sendmail(
            recipients=[member.email],
            subject=subject,
            message=message,
            now=True
        )
        return True
    except Exception as e:
        frappe.log_error(f"Failed to send reservation notification: {e}")
        return False

# --- Overdue Check and Notification System ---

@frappe.whitelist()
def check_and_notify_overdue_books():
    """Checks for overdue books and sends notifications. Should be run as a scheduled task."""
    import datetime
    today = frappe.utils.nowdate()
    
    overdue_loans = frappe.get_list(
        "Loan",
        filters={"returned": 0, "return_date": ["<", today], "overdue": 0},  # Not returned, overdue, not yet marked as overdue
        fields=["name", "book", "member", "return_date"]
    )
    
    notifications_sent = 0
    for loan in overdue_loans:
        # Mark loan as overdue
        loan_doc = frappe.get_doc("Loan", loan.name)
        loan_doc.overdue = 1
        loan_doc.save()
        
        # Send notification
        book_title = frappe.db.get_value("Book", loan.book, "title")
        member_name = frappe.db.get_value("Member", loan.member, "member_name")
        member_email = frappe.db.get_value("Member", loan.member, "email")
        
        if send_overdue_notification(member_email, member_name, book_title, loan.return_date):
            notifications_sent += 1
    
    frappe.db.commit()
    return {"message": f"Processed {len(overdue_loans)} overdue loans, sent {notifications_sent} notifications"}

# --- Export Functionality ---

@frappe.whitelist()
def export_member_loan_history(member_name, format="csv"):
    """Exports a member's loan history as CSV."""
    try:
        # Get all loans for the member
        loans = frappe.get_list(
            "Loan",
            filters={"member": member_name},
            fields=["name", "book", "loan_date", "return_date", "returned", "overdue"],
            order_by="loan_date desc"
        )
        
        if format.lower() == "csv":
            import csv
            import io
            
            output = io.StringIO()
            writer = csv.writer(output)
            
            # Write header
            writer.writerow(["Loan ID", "Book Title", "ISBN", "Loan Date", "Return Date", "Status", "Overdue"])
            
            # Write data
            for loan in loans:
                book_title = frappe.db.get_value("Book", loan.book, "title")
                book_isbn = frappe.db.get_value("Book", loan.book, "isbn")
                
                status = "Returned" if loan.returned else "On Loan"
                overdue = "Yes" if loan.overdue else "No"
                
                writer.writerow([
                    loan.name,
                    book_title,
                    book_isbn,
                    loan.loan_date,
                    loan.return_date,
                    status,
                    overdue
                ])
            
            csv_content = output.getvalue()
            output.close()
            
            return {
                "content": csv_content,
                "filename": f"loan_history_{member_name}_{frappe.utils.nowdate()}.csv",
                "content_type": "text/csv"
            }
        else:
            frappe.throw("Only CSV format is supported for export.")
            
    except Exception as e:
        frappe.log_error(frappe.gettraceback(), "Error in export_member_loan_history API")
        frappe.throw(f"Failed to export loan history: {e}")

# --- Role-based Permission Checks ---

def check_librarian_permission():
    """Checks if the current user has librarian permissions."""
    if not frappe.session.user or frappe.session.user == "Guest":
        frappe.throw("Authentication required.")
    
    user_roles = frappe.get_roles(frappe.session.user)
    allowed_roles = ["System Manager", "Librarian", "Library Manager"]
    
    if not any(role in user_roles for role in allowed_roles):
        frappe.throw("Insufficient permissions. Librarian role required.")

def check_member_permission():
    """Checks if the current user has member permissions."""
    if not frappe.session.user or frappe.session.user == "Guest":
        frappe.throw("Authentication required.")
    
    user_roles = frappe.get_roles(frappe.session.user)
    allowed_roles = ["System Manager", "Librarian", "Library Manager", "Library Member"]
    
    if not any(role in user_roles for role in allowed_roles):
        frappe.throw("Insufficient permissions. Member role required.")

# --- Enhanced API endpoints with role-based permissions ---

@frappe.whitelist()
def create_book_with_permission(title, author, publish_date, isbn):
    """Creates a new book record with librarian permission check."""
    check_librarian_permission()
    return create_book(title, author, publish_date, isbn)

@frappe.whitelist()
def update_book_with_permission(name, title=None, author=None, publish_date=None, isbn=None, status=None):
    """Updates an existing book record with librarian permission check."""
    check_librarian_permission()
    return update_book(name, title, author, publish_date, isbn, status)

@frappe.whitelist()
def delete_book_with_permission(name):
    """Deletes a book record with librarian permission check."""
    check_librarian_permission()
    return delete_book(name)

@frappe.whitelist()
def create_loan_with_permission(book_name, member_name, loan_date, return_date):
    """Creates a new loan with librarian permission check."""
    check_librarian_permission()
    return create_loan(book_name, member_name, loan_date, return_date)

@frappe.whitelist()
def return_book_with_permission(loan_name):
    """Returns a book with librarian permission check."""
    check_librarian_permission()
    return return_book(loan_name)

@frappe.whitelist()
def get_my_loans():
    """Gets loans for the current user (member)."""
    check_member_permission()
    
    # Get the member record for the current user
    member = frappe.get_value("Member", {"frappe_user": frappe.session.user})
    if not member:
        frappe.throw("Member record not found for current user.")
    
    # Get loans for this member
    loans = frappe.get_list(
        "Loan",
        filters={"member": member},
        fields=["name", "book", "loan_date", "return_date", "returned", "overdue"],
        order_by="loan_date desc"
    )
    
    # Add book details
    detailed_loans = []
    for loan in loans:
        book_title = frappe.db.get_value("Book", loan.book, "title")
        book_author = frappe.db.get_value("Book", loan.book, "author")
        detailed_loans.append({
            **loan,
            "book_title": book_title,
            "book_author": book_author
        })
    
    return detailed_loans

@frappe.whitelist()
def get_my_reservations():
    """Gets reservations for the current user (member)."""
    check_member_permission()
    
    # Get the member record for the current user
    member = frappe.get_value("Member", {"frappe_user": frappe.session.user})
    if not member:
        frappe.throw("Member record not found for current user.")
    
    # Get reservations for this member
    reservations = frappe.get_list(
        "Reservation",
        filters={"member": member},
        fields=["name", "book", "reservation_date", "status"],
        order_by="reservation_date desc"
    )
    
    # Add book details
    detailed_reservations = []
    for reservation in reservations:
        book_title = frappe.db.get_value("Book", reservation.book, "title")
        book_author = frappe.db.get_value("Book", reservation.book, "author")
        detailed_reservations.append({
            **reservation,
            "book_title": book_title,
            "book_author": book_author
        })
    
    return detailed_reservations

@frappe.whitelist()
def get_current_user_roles():
    """Gets the roles of the currently logged-in user."""
    try:
        if not frappe.session.user or frappe.session.user == "Guest":
            return {"roles": [], "user": None}
        
        user_roles = frappe.get_roles(frappe.session.user)
        
        return {
            "roles": user_roles,
            "user": frappe.session.user
        }
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "Error getting user roles")
        return {"roles": [], "user": None, "error": str(e)}


@frappe.whitelist()
def list_all_users():
    """List all Frappe users with their roles and status."""
    users = frappe.get_all(
        "User",
        filters={"enabled": 1, "user_type": ["!=", "Website User"]},  # Exclude system/website users if needed
        fields=["name", "email", "first_name", "last_name", "enabled", "last_login"]
    )
    for user in users:
        user["roles"] = [r.role for r in frappe.get_all("Has Role", filters={"parent": user["name"]}, fields=["role"])]
    return users

@frappe.whitelist()
def set_user_roles(user_email, roles):
    """Set roles for a user. Only admin can call this."""
    if not frappe.session.user or "System Manager" not in frappe.get_roles():
        frappe.throw("Only System Manager can change user roles.")
    user = frappe.get_doc("User", user_email)
    user.set("roles", [{"role": r} for r in roles])
    user.save()
    frappe.db.commit()
    return {"message": f"Roles updated for {user_email}"}


@frappe.whitelist()
def reset_user_password(user_email, new_password):
    """Reset a user's password. Only admin can call this."""
    if not frappe.session.user or "System Manager" not in frappe.get_roles():
        frappe.throw("Only System Manager can reset passwords.")
    user = frappe.get_doc("User", user_email)
    user.new_password = new_password
    user.save()
    frappe.db.commit()
    return {"message": f"Password reset for {user_email}"}

@frappe.whitelist()
def get_loan_details(loan_name):
    """Get full details for a specific loan, including book and member info."""
    loan = frappe.get_doc("Loan", loan_name)
    book = frappe.get_doc("Book", loan.book)
    member = frappe.get_doc("Member", loan.member)
    return {
        "loan": loan.as_dict(),
        "book": book.as_dict(),
        "member": member.as_dict()
    }


@frappe.whitelist()
def get_reservation_details(reservation_name):
    """Get full details for a specific reservation, including book and member info."""
    reservation = frappe.get_doc("Reservation", reservation_name)
    book = frappe.get_doc("Book", reservation.book)
    member = frappe.get_doc("Member", reservation.member)
    return {
        "reservation": reservation.as_dict(),
        "book": book.as_dict(),
        "member": member.as_dict()
    }


