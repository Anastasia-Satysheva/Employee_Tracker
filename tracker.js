const mysql = require("mysql");
const inquirer = require("inquirer");
const table = require("console.table");

const connection = mysql.createConnection({
    host: "localhost",

    port: 8889,
    user: "root",
    password: "root",
    database: "employeeTracker"
});

connection.connect((err) => {
    if (err) throw err;
    track();
});

function track() {
    inquirer.prompt({
        name: "action",
        type: "list",
        message: "What would you like to do?",
        choices: ["View employees", "View departments", "View roles", "Add employee", "Add department", "Add role",  "Update employee role", "Exit the Tracker"]
    }).then(function (answer) {
        switch (answer.action) {
            case "View employees":
                viewEmployees();
                break;
            case "View departments":
                viewDepartments();
                break;
            case "View roles":
                viewRoles();
                break;
            case "Add employee":
                    addEmployee();
                    break;
            case "Add department":
                addDepartment();
                break;
            case "Add role":
                addRole();
                break;
            case "Update employee role":
                updateEmployeeRole();
                break;
            case "Exit the Tracker":
                connection.end();
                break;
        }
    });
}

function viewEmployees() {
    const query = `SELECT employee.id, employee.first_name, employee.last_name, role.title, department.department, role.salary, 
        concat(manager.first_name, ' ', manager.last_name) AS manager FROM employee AS employee
    LEFT JOIN role ON (role.id = employee.role_id)
    LEFT JOIN department ON (department.id = role.department_id)
    LEFT JOIN employee AS manager ON (employee.manager_id = manager.id)
    ORDER BY id`;

    connection.query(query, function (err, res) {
        if (err) throw err;
        console.log("\n");
        console.table(res);
        track();
    });
}

function viewDepartments() {
    const query = "SELECT * FROM department ORDER BY id";
    connection.query(query, function (err, res) {
        if (err) throw err;
        console.log("\n")
        console.table(res);
        track();
    });
}

function viewRoles() {
    const query = `SELECT role.id, role.title, role.salary, department.department FROM role 
    LEFT JOIN department ON (role.department_id = department.id)
    ORDER BY id`;

    connection.query(query, function (err, res) {
        if (err) throw err;
        console.log("\n");
        console.table(res);
        track();
    });

}

function addEmployee() {
    connection.query("SELECT * FROM role", function (err, roleRes) {
        if (err) throw err;

        connection.query("SELECT concat(first_name, ' ', last_name) AS full_name FROM employee", function (err, empRes) {
            if (err) throw err;

            inquirer.prompt([
                {
                    name: "firstName",
                    type: "input",
                    message: "What is the first name?"
                },
                {
                    name: "lastName",
                    type: "input",
                    message: "What is the last name? "
                },
                {
                    name: "role",
                    type: "list",
                    message: "What is the employee's role?",
                    choices: function () {
                        let roleArray = []
                        for (let i = 0; i < roleRes.length; i++)
                            roleArray.push(roleRes[i].title)
                        return roleArray;
                    }
                },
                {
                    name: "manager",
                    type: "list",
                    message: "Who is the employee's manager?",
                    choices: function () {
                        let manArray = ['None'];
                        for (let i = 0; i < empRes.length; i++)
                            manArray.push(empRes[i].full_name)
                        return manArray;
                    }
                }
            ]).then(function (answer) {
                connection.query("SELECT id FROM role WHERE title = ?", answer.role, function (err, roleIdRes) {
                    if (err) throw err;

                    connection.query("SELECT id FROM employee WHERE concat(first_name, ' ', last_name) = ?", answer.manager, function (err, manIdRes) {
                        if (err) throw err;

                        let managerId;
                        if (answer.manager === "None")
                            managerId = null;
                        else
                            managerId = manIdRes[0].id;

                        connection.query("INSERT INTO employee SET ?",
                            {
                                first_name: answer.firstName,
                                last_name: answer.lastName,
                                role_id: roleIdRes[0].id,
                                manager_id: managerId
                            },
                            function (err) {
                                if (err) throw err;

                                console.log(`${answer.firstName} ${answer.lastName} has been added!`)

                                track();
                            }
                        );
                    });
                });
            });
        });
    });
}

function addDepartment() {
    inquirer.prompt({
        name: "depName",
        type: "input",
        message: "What is the department? "
    }).then(function (answer) {
        const query = `INSERT INTO department SET ?`;
        connection.query(query, { department: answer.depName }, function (err) {
            if (err) throw err;

            console.log(`${answer.depName} added!`)

            track();
        });
    });
}

function addRole() {
    connection.query("SELECT * FROM department", function (err, res) {
        if (err) throw err;

        inquirer.prompt([
            {
                name: "title",
                type: "input",
                message: "What is the role title? "
            },
            {
                name: "salary",
                type: "input",
                message: "What is the salary? "
            },
            {
                name: "department",
                type: "list",
                message: "Choose a department: ",
                choices: function () {
                    let depArray = [];
                    for (let i = 0; i < res.length; i++)
                        depArray.push(res[i].department);

                    return depArray;
                }
            }
        ]).then(function (answer) {
            connection.query("SELECT id FROM department WHERE department = ?", answer.department, function (err, res) {
                if (err) throw err;

                connection.query("INSERT INTO role SET ?",
                    {
                        title: answer.title,
                        salary: answer.salary,
                        department_id: res[0].id
                    },
                    function (err) {
                        if (err) throw err;

                        console.log(`${answer.title} added!`)

                        track();
                    }
                );
            });
        });
    });
}

function updateEmployeeRole() {
    connection.query("SELECT concat(first_name, ' ', last_name) AS full_name FROM employee", function (err, empRes) {
        if (err) throw err;

        connection.query("SELECT title FROM role", function (err, roleRes) {
            if (err) throw err;

            inquirer.prompt([
                {
                    name: "employee",
                    type: "list",
                    message: "Which employee do you want to update?",
                    choices: function () {
                        let empArray = [];
                        for (let i = 0; i < empRes.length; i++)
                            empArray.push(empRes[i].full_name);
                        return empArray;
                    }
                },
                {
                    name: "role",
                    type: "list",
                    message: "What is the employee's new role?",
                    choices: function () {
                        let roleArray = [];
                        for (let i = 0; i < roleRes.length; i++)
                            roleArray.push(roleRes[i].title);
                        return roleArray;
                    }
                }
            ]).then(function (answer) {
                connection.query("SELECT id FROM role WHERE title = ?", answer.role, function (err, roleIdRes) {
                    if (err) throw err;

                    connection.query("UPDATE employee SET role_id = ? WHERE concat(first_name, ' ', last_name) = ?",
                        [roleIdRes[0].id, answer.employee],
                        function (err) {
                            if (err) throw err;

                            console.log(`${answer.employee}'s role has been updated to ${answer.role}.`)

                            track();
                        }
                    );
                });
            });
        });
    });
}