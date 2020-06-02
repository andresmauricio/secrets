CREATE TABLE IF NOT EXISTS users (
  user TEXT PRIMARY KEY,
  pass TEXT NOT NULL 
); 

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

INSERT INTO users VALUES (?, ?);

SELECT * FROM users;

INSERT INTO secrets VALUES(?, ?, ?);

SELECT name FROM secrets WHERE user = ?;
SELECT name, value FROM secrets WHERE user = ? AND name = ?;

UPDATE secrets  SET value = ? WHERE user = ? AND name = ?;

DELETE FROM secrets WHERE user = ? AND name = ?;