// import sqlite3 = require('sqlite3');
// let db = new sqlite3.Database('/home/searene/Downloads/test.db');

// db.serialize(() => {
// 	db.run(`CREATE TABLE IF NOT EXISTS index_table (id INTEGER)`, (err) => {
//         if(err != null) {
//             console.log(err);
//         } else {
//             console.log("create table!");
//         }
//     });
//     db.run(`INSERT INTO index_table (id) VALUES (2)`, () => {
//         console.log('db2 insert 2');
//         process.exit(1);
//     });
//     db.each(`SELECT id FROM index_table`, (err, rows) => {
//         if(err != null) {
//             console.log(err);
//         } else {
//             console.log(rows.id);
//         }
//     }, (err) => {
//         if(err != null) {
//             console.log(err);
//         } else {
//             console.log('select is done');
//         }
//     });
// });
// db.close();
// db.serialize(() => {
// 	db.run(`CREATE TABLE IF NOT EXISTS index_table (id INTEGER)`, (err) => {
//         if(err != null) {
//             console.log('here');
//             console.log(err.message);
//             process.exit(1);
//         }
//         console.log("create table!");
//     });
//     // db.run(`INSERT INTO index_table (id) VALUES (2)`, () => {
//     //     console.log('db2 insert 2');
//     // });
//     // db.run(`INSERT INTO index_table (id) VALUES (3)`, () => {
//     //     console.log('db2 insert 3');
//     // });
//     db.all('SELECT * FROM INDEX_TABLE', (err, rows) => {
//         if(rows.length > 0) {
//             console.log(rows[0].id);
//         } else {
//             console.log("no records");
//         }
//     });
//     db.run('DROP TABLE INDEX_TABLE', (err) => {
//         if(err != null) {
//             console.log(err);
//         }
//     });
// });
// db.close((err) => {
//     console.log("db closed");
// });

// import {IndexBuilder} from './indexBuilder';
// import {DSLIndexBuilder} from './dsl/dslIndexBuilder';

// let indexBuilder: IndexBuilder = new DSLIndexBuilder(
//     "/home/searene/Documents/dictionaries/longman5/En-En-Longman_DOCE5.dsl"
// );
// indexBuilder.init()

// console.log('start in file');
// let a = new Promise((resolve1, reject1) => {
//     console.log('start in a');
//     new Promise((resolve2, reject2) => {
//         console.log('start of second promise');
//         process.nextTick(() => {
//             console.log('tick1');
//             resolve2();
//         });
//     })
//     .then(() => {
//         console.log('tick2');
//         return new Promise((resolve3, reject3) => {
//             console.log('tick3');
//             reject3(new Error('reject!'));
//         })
//         .then(() => {
//             console.log('tick4');
//         })
//         .catch(err => {
//             console.log('reject again')
//             reject1(err.message);
//         })
//     })
//     .catch((err) => {
//         reject1(err);
//     })
// });

// console.log('start before running a')
// a.then(() => {
//     console.log("resolve");
// })
// .catch((err) => {
//     console.log(err);
// })

/**
 * (code containing resolve) => 
 * (Process then or catch related to the resolve) =>
 */

// new Promise((resolve, reject) => {
//     new Promise((resolve, reject) => {
//         resolve("inner resolved");
//     })
//     resolve('resolved');
// })
// .then((msg) => {
//     console.log('2');
//     console.log(msg);
// })
// .catch((err) => {
//     console.log('3');
//     console.log(err.message);
// });

let a = 1;
new Promise<void>((resolve, reject) => {
    resolve();
})
.then(() => {
    if(a == 1) {
        return Promise.resolve('1');
    } else {
        return Promise.resolve('2');
    }
})
.then((str) => {
    console.log(str);
})
.catch((err) => {
    console.log(err.message);
})