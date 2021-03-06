const pg = require("pg");
const client = new pg.Client(
  process.env.DATABASE_URL || "postgres://localhost/user_things"
);

client.connect();

const sync = async () => {
  //create tables and seed some data
  const SQL = `
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  DROP TABLE IF EXISTS user_things;
  DROP TABLE IF EXISTS users;
  DROP TABLE IF EXISTS things;

  CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    CHECK (char_length(name) > 0)
  );
  CREATE TABLE things (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    CHECK (char_length(name) > 0)
  );
  CREATE TABLE user_things (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "thingId" UUID REFERENCES things(id),
    "userId" UUID REFERENCES users(id),
    "isFavorite" BOOLEAN DEFAULT FALSE
  );
  CREATE UNIQUE INDEX ON user_things("thingId", "userId");
`;
  await client.query(SQL);
  await createUser({ name: "Rachel" });
  await createUser({ name: "Ross" });
  await createUser({ name: "Joey" });
  await createUser({ name: "Chandler" });
  await createThing({ name: "purse" });
  await createThing({ name: "dinosaur" });
  await createThing({ name: "joke" });
  await createThing({ name: "sandwich" });
};

const readUsers = async () => {
  const SQL = `SELECT * FROM users;`;
  const response = await client.query(SQL);
  return response.rows;
};
const readThings = async () => {
  const SQL = `SELECT * FROM things;`;
  const response = await client.query(SQL);
  return response.rows;
};
const readUserThings = async () => {
  const SQL = `SELECT * FROM user_things;`;
  const response = await client.query(SQL);
  return response.rows;
};

const createUser = async ({ name }) => {
  const SQL = `INSERT INTO users (name) VALUES ($1) returning *;`;
  const response = await client.query(SQL, [name]);
  return response.rows[0];
};
const createThing = async ({ name }) => {
  const SQL = `INSERT INTO things (name) VALUES ($1) returning *;`;
  const response = await client.query(SQL, [name]);
  return response.rows[0];
};
const createUserThing = async ({ userId, thingId }) => {
  return (
    await client.query(
      `INSERT INTO user_things ("userId", "thingId") VALUES ($1, $2) returning *`,
      [userId, thingId]
    )
  ).rows[0];
};

const updateUserThing = async ({ isFavorite, id }) => {
  const SQL = `UPDATE user_things SET (isFavorite) = ($1) WHERE (id) = ($2) returning *`;
  const response = await client.query(SQL, [isFavorite, id]);
  return response.rows[0];
};

const deleteUser = async id => {
  const SQL = `DELETE FROM users WHERE (id) = ($1);`;
  await client.query(SQL, [id]);
};
const deleteThing = async id => {
  const SQL = `DELETE FROM things WHERE (id) = ($1);`;
  await client.query(SQL, [id]);
};
const deleteUserThing = async id => {
  const SQL = `DELETE FROM user_things WHERE (id) = ($1);`;
  await client.query(SQL, [id]);
};

module.exports = {
  sync,
  readUsers,
  readThings,
  readUserThings,
  createUser,
  createThing,
  createUserThing,
  deleteUser,
  deleteThing,
  deleteUserThing,
  updateUserThing
};
