const sqlite3 = require('sqlite3');
const fsp = require("fs-promise");

fsp.unlink('test.db')
    .catch(err => {
        if(err.code === 'ENOENT') {
            return Promise.resolve();
        } else {
            return Promise.reject(err);
        }
    })
    .then(() => {
        let db = new sqlite3.Database('test.db');
        db.serialize(() => {
            db.run('CREATE TABLE test (info TEXT);');
            db.run("INSERT INTO test (info) VALUES ('info1')");
        });
        db.close();
    })
    .catch(err => {
        console.error(err);
    });
