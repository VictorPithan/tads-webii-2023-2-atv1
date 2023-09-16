const { db } = require('../database/db-connection');

class User {
  constructor(type, name, email, phone, cpf) {
    this.type = type;
    this.name = name;
    this.email = email;
    this.phone = phone;
    this.cpf = cpf;
  }
}

class UserDao {

  constructor() {}

  addUser(user) {
    // return new Promise((resolve, reject) => {
    //   const sql = 
    //     `INSERT INTO users (user_type, name, email, phone_number, cpf)
    //      FROM users INNER JOIN email
    //       ON (users.id = email.user_id)
    //      INNER JOIN phones
    //       ON (users.id = phones.user_id)
    //      WHERE email.leading = 1 AND phones.leading = 1
    //     `;
    //   db.(sql, [], (err, rows) => {
    //     if (err) {
    //       console.log({ err });
    //     }
    //     console.log({ rows });
    //     resolve(rows);
    //   });
    // });
  }

  getUsers() {
    return new Promise((resolve, reject) => {
      const sql = 
        `SELECT users.id, users.user_type, users.name, email.email, phones.phone_number, users.cpf
         FROM users INNER JOIN email
          ON (users.id = email.user_id)
         INNER JOIN phones
          ON (users.id = phones.user_id)
         WHERE email.leading = 1 AND phones.leading = 1
        `;
      db.all(sql, [], (err, rows) => {
        if (err) {
          console.log({ err });
        }
        console.log({ rows });
        resolve(rows);
      });
    });
  }
}

module.exports = {
  User,
  UserDao
};