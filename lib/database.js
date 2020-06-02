"use strict";
const path = require("path");
const bcrypt = require("bcrypt");
const { Database } = require("sqlite3").verbose();

const saltRounds = 5;
const client = new Database(path.join(__dirname, "..", "secrets.db"));

const queries = {
  tableUsers: `
    CREATE TABLE IF NOT EXISTS users (
        user TEXT PRIMARY KEY,
        pass TEXT NOT NULL 
      );
    `,
  tableSecrets: `
    CREATE TABLE IF NOT EXISTS secrets (
        user TEXT,
        name TEXT NOT NULL,
        value TEXT NOT NULL,
        PRIMARY KEY (user, name),
        FOREIGN KEY (user)
          REFERENCES users (user)
            ON DELETE CASCADE
            ON UPDATE NO ACTION
      );
    `,
};

async function createDb() {
  return new Promise((resolve, reject) => {
    client.serialize(() => {
      client.run(queries.tableUsers);
      client.run(queries.tableSecrets, (error) => {
        if (error) return reject(error);
        resolve({ client, createUser, listUsers, createSecret, listSecrets, getSecret, updateSecret, deleteSecret });
      });
    });
  });
}

async function createUser(user, pass) {
  const securePassword = await bcrypt.hash(pass, saltRounds);
  return new Promise((resolve, reject) => {
    const stmt = client.prepare("INSERT INTO users VALUES (?, ?)");
    stmt.run(user, securePassword);
    stmt.finalize((error) => {
      if (error) return reject(error);
      resolve();
    });
  });
}

async function listUsers() {
  return new Promise((resolve, reject) => {
    const users = [];
    client.each(
      "SELECT * FROM users",
      (error, row) => {
        if (error) return reject(error);
        users.push(row);
      },
      (error, count) => {
        if (error) return reject(error);
        resolve({ count, users });
      }
    );
  });
}

async function createSecret(user, name, value) {
  return new Promise((resolve, reject) => {
    const stmt = client.prepare("INSERT INTO secrets VALUES(?, ?, ?)");
    stmt.run(user, name, value, (error) => {
      if (error) return reject(error);
      resolve();
    });
  });
}

async function listSecrets(user) {
  return new Promise((resolve, reject) => {
    const stmt = client.prepare("SELECT name FROM secrets WHERE user = ?");
    stmt.all(user, (error, rows) => {
      if (error) return reject(error);
      resolve(rows);
    });
  });
}

async function getSecret(user, name) {
  return new Promise((resolve, reject) => {
    const stmt = client.prepare("SELECT name, value FROM secrets WHERE user = ? AND name = ?");
    stmt.get(user, name, (error, row) => {
      if (error) return reject(error);
      resolve(row);
    });
  });
}

async function updateSecret(user, name, value) {
  return new Promise((resolve, reject) => {
    const stmt = client.prepare("UPDATE secrets SET value = ? WHERE user = ? AND name = ?");
    stmt.run(value, user, name, (error) => {
      if (error) return reject(error);
      resolve();
    });
  });
}

async function deleteSecret(user, name) {
  return new Promise((resolve, reject) => {
    const stmt = client.prepare("DELETE FROM secrets WHERE user = ? AND name = ?;");
    stmt.run(user, name, (error) => {
      if (error) return reject(error);
      resolve();
    });
  });
}

module.exports = {
  createDb,
};
