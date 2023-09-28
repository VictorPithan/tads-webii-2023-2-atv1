const path = require("node:path");
const { db } = require("../database/db-connection");
const fs = require("node:fs");

class User {
  constructor(role, name, email, phone, cpf) {
    this.role = role;
    this.name = name;
    this.email = email;
    this.phone = phone;
    this.cpf = cpf;
  }
}

class UserDao {
  constructor() {}

  addUser({ role, name, email, phone, cpf }) {
    const user = new User(role, name, email, phone, cpf);

    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run("BEGIN TRANSACTION", (beginErr) => {
          if (beginErr) {
            console.error({ beginErr });
            return reject(beginErr);
          }
          const userSql = `INSERT INTO users (user_type, name, cpf) VALUES (?, ?, ?)`;
          const userValues = [user.role, user.name, user.cpf];

          db.run(userSql, userValues, function (err) {
            if (err) {
              console.error({ err });
              db.run("ROLLBACK", () => {
                return reject(err);
              });
            }

            const userId = this.lastID;

            const emailSql = `INSERT INTO email (user_id, email, leading) VALUES (?, ?, 1)`;
            const email = user.email[0].length > 1 ? user.email[0] : user.email;
            const emailValues = [userId, email];

            db.run(emailSql, emailValues, function (err) {
              if (err) {
                console.error({ err });
                db.run("ROLLBACK", () => {
                  return reject(err);
                });
              }

              // Adiciona os outros e-mails
              if (user.email[0].length > 1) {
                for (let i = 1; i < user.email.length; i++) {
                  const emailSql = `INSERT INTO email (user_id, email, leading) VALUES (?, ?, 0)`;
                  const emailValues = [userId, user.email[i]];
                  db.run(emailSql, emailValues, function (err) {
                    if (err) {
                      console.error({ err });
                      db.run("ROLLBACK", () => {
                        return reject(err);
                      });
                    }
                  });
                }
              }

              const phone =
                user.phone[0].length > 1 ? user.phone[0] : user.phone;
              const phoneValues = [userId, phone];
              const phoneSql = `INSERT INTO phones (user_id, phone_number, leading) VALUES (?, ?, 1)`;

              db.run(phoneSql, phoneValues, function (err) {
                if (err) {
                  console.error({ err });
                  db.run("ROLLBACK", () => {
                    return reject(err);
                  });
                }

                if (user.phone[0].length > 1) {
                  for (let i = 1; i < user.phone.length; i++) {
                    const phoneSql = `INSERT INTO phones (user_id, phone_number, leading) VALUES (?, ?, 0)`;
                    const phoneValues = [userId, user.phone[i]];
                    db.run(phoneSql, phoneValues, function (err) {
                      if (err) {
                        console.error({ err });
                        db.run("ROLLBACK", () => {
                          return reject(err);
                        });
                      }
                    });
                  }
                }

                db.run("COMMIT", (commitErr) => {
                  if (commitErr) {
                    console.error({ commitErr });
                    return reject(commitErr);
                  }

                  resolve(userId);
                });
              });
            });
          });
        });
      });
    });
  }

  getUsers() {
    return new Promise((resolve, reject) => {
      const sql = `SELECT users.id, users.user_type, users.name, email.email, phones.phone_number, users.cpf
         FROM users INNER JOIN email
          ON (users.id = email.user_id)
         INNER JOIN phones
          ON (users.id = phones.user_id)
         WHERE email.leading = 1 AND phones.leading = 1
        `;
      db.all(sql, [], (err, rows) => {
        if (err) {
          console.error({ err });
        }
        resolve(rows);
      });
    });
  }

  getAmountUsers() {
    return new Promise((resolve, reject) => {
      const sql = `SELECT count(users.id) as amount
         FROM users INNER JOIN email
          ON (users.id = email.user_id)
         INNER JOIN phones
          ON (users.id = phones.user_id)
         WHERE email.leading = 1 AND phones.leading = 1
        `;
      db.all(sql, [], (err, rows) => {
        if (err) {
          console.error({ err });
        }
        resolve(rows);
      });
    });
  }

  getUsersWithPagination(page) {
    return new Promise((resolve, reject) => {
      const pageSize = 5;
      const sql = `SELECT users.id, users.user_type, users.name, email.email, phones.phone_number, users.cpf
         FROM users INNER JOIN email
          ON (users.id = email.user_id)
         INNER JOIN phones
          ON (users.id = phones.user_id)
         WHERE email.leading = 1 AND phones.leading = 1
         LIMIT ? OFFSET ?
        `;
      db.all(sql, [pageSize, (page - 1) * pageSize], (err, rows) => {
        if (err) {
          console.error({ err });
        }
        resolve(rows);
      });
    });
  }

  editUser({ userId, email, phone }) {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run("BEGIN TRANSACTION", (beginErr) => {
          if (beginErr) {
            console.error({ beginErr });
            return reject(beginErr);
          }

          const sqlUpdateLeadingPhones = `UPDATE phones 
                       SET "leading" = 0 
                       WHERE user_id = ?`;

          db.run(sqlUpdateLeadingPhones, [userId], function (err) {
            if (err) {
              console.error({ err });
              db.run("ROLLBACK", () => {
                return reject(err);
              });
            } else {
              const sqlUpdateNewLeadingPhone = `UPDATE phones 
                       SET "leading" = 1 
                       WHERE user_id = ? AND phone_number = ?`;

              db.run(sqlUpdateNewLeadingPhone, [userId, phone], function (err) {
                if (err) {
                  console.error({ err });
                  db.run("ROLLBACK", () => {
                    return reject(err);
                  });
                } else {
                  const sqlUpdateLeadingEmails = `UPDATE email 
                       SET "leading" = 0 
                       WHERE user_id = ?`;

                  db.run(sqlUpdateLeadingEmails, [userId], function (err) {
                    if (err) {
                      console.error({ err });
                      db.run("ROLLBACK", () => {
                        return reject(err);
                      });
                    } else {
                      const sqlUpdateNewLeadingEmail = `UPDATE email 
                          SET "leading" = 1 
                          WHERE user_id = ? and email = ? `;

                      db.run(
                        sqlUpdateNewLeadingEmail,
                        [userId, email],
                        function (err) {
                          if (err) {
                            console.error({ err });
                            db.run("ROLLBACK", () => {
                              return reject(err);
                            });
                          } else {
                            // Finaliza a transação com COMMIT
                            db.run("COMMIT", (commitErr) => {
                              if (commitErr) {
                                console.error({ commitErr });
                                return reject(commitErr);
                              }

                              resolve(userId);
                            });
                          }
                        }
                      );
                    }
                  });
                }
              });
            }
          });
        });
      });
    });
  }

  getDetailsUsers(id) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT *
         FROM users INNER JOIN email
          ON (email.user_id = ${id})
         INNER JOIN phones
          ON (phones.user_id = ${id})
        WHERE users.id = ${id}
        `;

      db.all(sql, [], (err, rows) => {
        if (err) {
          console.error({ err });
        }
        const phones = rows
          .filter((user, index, self) => {
            return (
              self.findIndex((u) => u.phone_number === user.phone_number) ===
              index
            );
          })
          .map((user) => user.phone_number);

        const emails = rows
          .filter((user, index, self) => {
            return self.findIndex((u) => u.email === user.email) === index;
          })
          .map((user) => user.email);

        resolve({ phones, emails });
      });
    });
  }

  deleteUser(id) {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run("BEGIN TRANSACTION", (beginErr) => {
          if (beginErr) {
            console.error({ beginErr });
            return reject(beginErr);
          }

          const sqlDeletePhones = `DELETE FROM phones 
                                    WHERE user_id = ?`;

          db.run(sqlDeletePhones, [id], function (err) {
            if (err) {
              console.error({ err });
              db.run("ROLLBACK", () => {
                return reject(err);
              });
            } else {
              const sqlDeleteEmails = `DELETE FROM email 
                                       WHERE user_id = ?`;
              db.run(sqlDeleteEmails, [id], function (err) {
                if (err) {
                  console.error({ err });
                  db.run("ROLLBACK", () => {
                    return reject(err);
                  });
                } else {
                  const sqlDeleteUser = `DELETE FROM users 
                                         WHERE id = ?`;
                  db.run(sqlDeleteUser, [id], function (err) {
                    if (err) {
                      console.error({ err });
                      db.run("ROLLBACK", () => {
                        return reject(err);
                      });
                    } else {
                      // Finaliza a transação com COMMIT
                      db.run("COMMIT", (commitErr) => {
                        if (commitErr) {
                          console.error({ commitErr });
                          return reject(commitErr);
                        }

                        resolve(id);
                      });
                    }
                  });
                }
              });
            }
          });
        });
      });
    });
  }

  async exportUser() {
    const csvFilePath = path.join(__dirname, "..", "dados.csv");

    const jsonData = await this.getUsers();

    try {
      if (!Array.isArray(jsonData) || jsonData.length === 0) {
        throw new Error(
          "Os dados JSON devem ser um array de objetos não vazio."
        );
      }

      const headers = Object.keys(jsonData[0]);

      const csvContent =
        headers.join(";") +
        "\n" +
        jsonData
          .map((obj) => headers.map((key) => obj[key]).join(";"))
          .join("\n");

      fs.writeFileSync(csvFilePath, csvContent, "utf-8");
    } catch (error) {
      console.error("Erro ao converter JSON para CSV:", error.message);
    }
  }
}

module.exports = {
  User,
  UserDao,
};
