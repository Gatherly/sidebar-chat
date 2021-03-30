const dotenv = require("dotenv");
var shell = require("shelljs");

function resetDb() {
  dotenv.config();

  const username = process.env.POSTGRES_USER;
  const database = process.env.POSTGRES_DB;
  try {
    shell.exec(`dropdb ${database}`);
    console.log(`Dropped existing database ${database}.`);
  } catch (error) {
    console.warn(error);
  }

  shell.exec(`createdb -U ${username} ${database}`);
  console.log(
    `Created new database ${database} as user ${username}. Generating initial schema...`
  );
  shell.exec(`psql -d ${database} -U ${username} -f setup_db.sql`);
  console.log("Success.");
}

resetDb();

module.exports = resetDb;
