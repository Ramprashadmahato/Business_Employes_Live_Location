Business Marketing – Employee Management System (EMS)
A comprehensive Employee Management System designed for businesses to manage staff, monitor attendance, and track field activity with privacy and security.

📌 Features
1. Admin Dashboard (Super Admin Panel)

Full system control: companies, employees, packages, global tracking.
View total companies, staff, active staff, live check-ins.
Latest activity logs & optional global live map.
Modules:

Company Management (Add/Edit/Delete, assign packages)
Staff Management (View all staff, routes, activity)
Package Management (EMS toggle, payroll access, staff limits)
System Config (GPS interval, spoofing detection)
Admin User Management (RBAC roles & permissions)
Reports (Excel export: daily/weekly/monthly/yearly)
Settings (Theme, date/time format, holidays)




2. Company Dashboard (Business Panel)

Manage own staff and monitor field activity.
View total staff, active staff, on-leave staff.
Live map with staff location pins.
Modules:

Staff Management (Add/Edit/Delete, view logs/routes)
Leave Management (Approve/Reject requests)
Reports (Staff-wise/date-wise, Excel export)
Settings (Theme, workdays/weekends, company details)




3. Staff Dashboard (Employee Panel)

Check-In/Check-Out with GPS validation.
Live route tracking during working hours.
Modules:

Profile info & shift details
Check-In (GPS ON + no spoofing)
Live Tracking (Updates every X minutes)
Check-Out (Calculate working hours)
Settings (Edit profile, upload photo)




📌 Attendance Logic

Check-In: GPS ON + real location → save coordinates & timestamp.
Live Tracking: Updates every X minutes → stored as route points.
Check-Out: Save final coordinates & time → calculate working hours.
Auto Check-Out: Triggered on GPS OFF, spoofing, internet loss, inactivity.
Leave: Approved leave disables check-in → marked as “On Leave”.


🔒 Privacy & Security

Tracking only between Check-In → Check-Out.
No tracking outside working hours.
Auto check-out ensures privacy.
Location encrypted (HTTPS + JWT).
Employees can view their own route logs.
Privacy notice included.


🛠 Tech Stack

Frontend: React.js, Tailwind CSS / Bootstrap
Backend: Node.js / Express.js
Database: MongoDB / MySQL
Authentication: JWT
Maps & GPS: Google Maps API / OpenStreetMap
Reports: Excel Export (SheetJS)


🚀 Installation
Shell# Clone the repositorygit clone https://github.com/your-username/ems-project.git# Navigate to project foldercd ems-project# Install dependenciesnpm install# Start development servernpm startShow more lines

📖 Usage

Admin: Manage companies, staff, packages, system settings.
Company: Manage own staff, approve leaves, view reports.
Staff: Check-In/Out, view route logs, update profile.


📷 Screenshots
(Add screenshots of dashboards here)

📜 License
This project is licensed under the MIT License.

📧 Contact
Name: Ram Prashad Mahato
Phone: +977-9826872678
Email: rpxingh201@example.com
