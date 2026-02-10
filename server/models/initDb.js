import pool from "../config/db.js";

export async function initDb() {
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(60) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      address VARCHAR(400),
      password_hash VARCHAR(255) NOT NULL,
      role ENUM('ADMIN', 'USER', 'STORE_OWNER') NOT NULL DEFAULT 'USER',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `;

  const createStoresTable = `
    CREATE TABLE IF NOT EXISTS stores (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(60) NOT NULL,
      email VARCHAR(255),
      address VARCHAR(400),
      owner_id INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_stores_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB;
  `;

  const createRatingsTable = `
    CREATE TABLE IF NOT EXISTS ratings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      store_id INT NOT NULL,
      rating TINYINT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_ratings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT fk_ratings_store FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
      CONSTRAINT uc_user_store UNIQUE (user_id, store_id)
    ) ENGINE=InnoDB;
  `;

  const connection = await pool.getConnection();
  try {
    await connection.query(createUsersTable);
    await connection.query(createStoresTable);
    await connection.query(createRatingsTable);

    // Ensure legacy users table has password_hash column
    const [passwordHashCol] = await connection.query(
      "SHOW COLUMNS FROM users LIKE 'password_hash'"
    );
    if (!passwordHashCol.length) {
      await connection.query(
        "ALTER TABLE users ADD COLUMN password_hash VARCHAR(255) NULL AFTER address"
      );
      console.log("Added password_hash column to users table.");
    }

    // Relax legacy NOT NULL password column so INSERTs without it succeed
    const [passwordCol] = await connection.query(
      "SHOW COLUMNS FROM users LIKE 'password'"
    );
    if (passwordCol.length) {
      // Make sure it's nullable and has a default, since we no longer use this column
      await connection.query(
        "ALTER TABLE users MODIFY COLUMN password VARCHAR(255) NULL DEFAULT NULL"
      );
      console.log("Updated legacy password column on users table to be nullable.");
    }

    console.log("Database tables ensured.");
  } finally {
    connection.release();
  }
}

