const { Pool } = require('pg');

const PG_URI = 'postgres://kbumntlo:XJuq7DKeb1KhGHAM44FONZzIanNWL6qw@rajje.db.elephantsql.com:5432/kbumntlo';

const pool = new Pool({
  connectionString: PG_URI
});

module.exports = {
  query: (text, params, callback) => {
    // console.log('executed query', text);
    return pool.query(text, params, callback);
  }
};

