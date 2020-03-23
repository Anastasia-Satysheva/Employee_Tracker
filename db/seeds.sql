USE employeeTracker;

INSERT INTO 
    department (department) 
VALUES 
    ("Administration"), 
    ("Marketing"), 
    ("Shipping"), 
    ("IT"), 
    ("Public Relations"), 
    ("Sales"), 
    ("Human Resources");

INSERT INTO 
    role (title, salary, department_id) 
VALUES 
    ("President", 135464, 1), 
    ("Manager", 658272, 1), 
    ("Analyst", 178372, 2),
    ("Clerk", 128265, 2),
    ("Accountant", 172342, 3),
    ("Representative", 182252, 3),
    ("Legal Team Lead", 162822, 4),
    ("Lawyer", 172624, 4);

INSERT INTO 
    employee (first_name, last_name, role_id, manager_id)
VALUES
    ("Steven", "King", 1, null),
    ("Neena", "Kochhar", 2, 1),
    ("Lex", "De Haan", 3, null),
    ("Bruce", "Ernst", 1, 3),
    ("Valli", "Pataballa", 2, 4),
    ("Alexander", "Hunold", 5, null);
