var express = require('express');
var router = express.Router();
var md5 = require('md5');

var fs = require('fs');
var Path = require('path');

var qrcode = require('qrcode');

var bcrypt = require('bcrypt');
const app = require('../app');
var saltRounds = 15;

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./db/delivery.db');

var checkRole = function(sessionID, userRole) {
  return new Promise(function(resolve, reject) {
    let sqlQuery = 'SELECT role FROM users WHERE session = ?';
    db.all(sqlQuery, [sessionID], (err, rows) => {
      if (rows.length > 0) {
        if (rows[0]["role"] === userRole) {
          resolve();
        } else {
          console.log('reject');
          reject();
        }
      } else {
        reject();
          console.log('reject');
      }
    });
  })
}

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(req.session.id);
  res.send('cookies added');
});

router.get('/getsessioninfo', function(req, res, next) {
  var promiseUserInfo = new Promise(function(resolve, reject) {
    db.all('SELECT login, role FROM users WHERE session = ?', [req.session.id], (err, rows) => {
      if (rows.length > 0) {
        resolve(rows);
      } else {
        reject();
      }
    });
  });

  promiseUserInfo.then((login)=>{
    res.json(login);
  }, () => {
    res.json([{login: 'guest', role: 'nobody'}])
  })
});

router.get('/checksession', function(req, res, next) {
  console.log(req.session.id);
  res.send('cookies added');
});

router.post('/register', (req, res, next) => {
  if (req.body["login"] && req.body["password"] && req.body["email"]) {
    bcrypt.hash(req.body["password"], saltRounds, (hashErr, hash) => {
      req.session.regenerate((sessionErr) => {
        db.run('INSERT INTO users VALUES (?, ?, ?, ?, ?)', 
        [
          req.body["login"],
          hash,
          req.body["email"],
          req.session.id,
          "operator"
        ], (err) => {
          if(err) {
            console.log(err);
            res.sendStatus(404);
          } else {
            res.sendStatus(200);
          }
          });
        });
    })
  } else {
    res.sendStatus(404);
  }
});

router.post('/login', (req, res, next) => {
  if (req.body["login"] && req.body["password"]) {
    db.all('SELECT password FROM users WHERE login = ?', [req.body["login"]], (err, rows) => {
      if (err) {
        send.sendStatus(404);
      } else {
        console.log(rows[0]["password"]);
        bcrypt.compare(req.body["password"], rows[0]["password"], (hashErr, result) => {
          if (result == true) {
            req.session.regenerate((sessionErr) => {
              console.log(req.session.id)
              db.run('UPDATE users SET session = ? WHERE login = ?', [req.session.id, req.body["login"]], (dbErr) => {
                if (dbErr) {
                  console.log(dbErr);
                } else {
                  res.sendStatus(200);
                }
              })
            })
          }
          if (hashErr) {
            console.log(hashErr);
          }
        });
      }
    });
  }
});

router.post('/resetpassword', (req, res, next) => {
  res.sendStatus(200);
});

router.get('/product/all', (req, res, next) => {
  db.all('SELECT * FROM products', [], (err, rows) => {
    res.send(JSON.stringify(rows));
  });
});

router.get('/product/:id', (req, res, next) => {
  let sqlQuery = "SELECT * FROM products WHERE id="+req.params.id; 
  db.all(sqlQuery, [], (err, rows) => {

    if (err) {
      console.log(err);
    }

    res.json(rows);
  });
});

router.get('/order/:id', (req, res, next) => {
  let sqlQuery = 'SELECT status, products FROM orders WHERE id="'+req.params.id+'"';
  db.all(sqlQuery, [], (err, rows) => {
    if (err) {
      console.log(err);
    }

    if(rows) {
      res.json(rows);
    } else {
      res.sendStatus(404);
    }
  })
});

router.post('/order/customer/create', (req, res, next) => {
  let id = md5(Date.now()+req.body["name"]+req.body["adress"]);
  db.run('INSERT INTO orders VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)', 
  [id, 
  req.body["name"], 
  'PENDING', 
  Date.now(), 
  req.body["adress"], 
  req.body["phonenumber"], 
  req.body["products"], 
  req.body["paymentmethod"], 
  req.body["deliverymethod"]], 
  (err) => {
    if(err){
      console.log(err)
      res.sendStatus(404);
    } else {
      res.sendStatus(200);
    }
  })
});

router.post('/order/operator/create', (req, res, next) => {
    checkRole(req.session.id, 'operator').then(()=>{
      if(req.body["id"]) {
        db.run('DELETE FROM orders WHERE id=?', [req.body["id"]], (err) => {
          if(err){
            console.log(err);
          }
        });
        db.run('INSERT INTO orders VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)', 
        [req.body["id"], 
        req.body["name"], 
        'CONFIRMED', 
        Date.now(), 
        req.body["adress"], 
        req.body["phonenumber"], 
        req.body["products"], 
        req.body["paymentmethod"], 
        req.body["deliverymethod"]], 
        (err) => {
          if(err){
            console.log(err)
            res.sendStatus(404);
          } else {
            res.sendStatus(200);
          }
        });

      } else {
        let id = md5(Date.now()+req.body["name"]+req.body["adress"]);
        db.run('INSERT INTO orders VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)', 
        [id, 
        req.body["name"], 
        'CONFIRMED', 
        Date.now(), 
        req.body["adress"], 
        req.body["phonenumber"], 
        req.body["products"], 
        req.body["paymentmethod"], 
        req.body["deliverymethod"]], 
        (err) => {
          if(err){
            console.log(err)
            res.sendStatus(404);
          } else {
            res.sendStatus(200);
          }
        });
      };
    })
});

router.get('/orders/pending', (req, res, next) => {
  checkRole(req.session.id, 'operator').then(() => {
    let sqlQuery = 'SELECT * FROM orders WHERE status="PENDING"';
      db.all(sqlQuery, [], (err, rows) => {
        if(err) {
          console.log(err);
        }
        if(rows) {
          res.json(rows);
        } else {
          res.sendStatus(404);
        }
      });
  }, () => {
    res.sendStatus(401);
  })
});

router.post('/callme', (req, res, next) => {
	db.run('INSERT INTO callme VALUES(?)', [req.body["phonenumber"]], (err) => {
		if (err) {
			console.log(err);
		}
	});
  res.sendStatus(200);
});

router.get('/callme/all', (req, res, next) => {
  let sqlQuery = 'SELECT * FROM callme';
  db.all(sqlQuery, [], (err, rows) => {
    if(err) {
      console.log(err);
    }

    if(rows) {
      res.json(rows);
    } else {
      res.sendStatus(404);
    }
  });
});

router.post('/callme/:number/delete', (req, res, next) =>{
  db.run('DELETE FROM callme WHERE phonenumber=?', [req.params.number], (err) => {
    if(err) {
      console.log(err);
    } else {
      res.sendStatus(200);
    }
  });
});

router.get('orders/kitchen/waiting', (req, res, next) => {
  checkRole(req.session.id, 'operator').then(() => {
    let sqlQuery = 'SELECT * FROM orders WHERE status="CONFIRMED"';
      db.all(sqlQuery, [], (err, rows) => {
        if(err) {
          console.log(err);
        }
        if(rows) {
          res.json(rows);
        } else {
          res.sendStatus(404);
        }
      });
  }, () => {
    res.sendStatus(401);
  })
})

router.get('orders/kitchen/cooking', (req, res, next) => {
  checkRole(req.session.id, 'operator').then(() => {
    let sqlQuery = 'SELECT * FROM orders WHERE status="COOKING"';
      db.all(sqlQuery, [], (err, rows) => {
        if(err) {
          console.log(err);
        }
        if(rows) {
          res.json(rows);
        } else {
          res.sendStatus(404);
        }
      });
  }, () => {
    res.sendStatus(401);
  })
})

router.post('/order/:id/kitchen', (req, res, next) => {
  db.run('UPDATE orders SET status = ? WHERE id = ?', ["COOKING", req.params.id], (err) => {
    if(err){
      console.log(err);
      res.sendStatus(404); 
    } else {
      res.sendStatus(200);
    }
  })
});

router.get('/order/:id/printables', (req, res, next) => {
  let qrcodePath = './qrcodes/'+req.params.id+'.png'; 
  let qrcodeAbsPath = Path.join(__dirname, '../', qrcodePath);
  if (!fs.existsSync(qrcodePath)) {
    qrcode.toFile(qrcodePath, 'https://domain.com/api/order/'+req.params.id+'delivery');
  }
  res.sendFile(qrcodeAbsPath);
});

router.get('/order/:id/delivery', (req, res, next) => {
  db.run('UPDATE orders SET status = ? WHERE id = ?', ["delivery", req.params.id], (err) => {
    if(err){
      console.log(err);
      res.sendStatus(404); 
    } else {
      res.sendStatus(200);
    }
  });
});

router.get('/orders/delivery', (req, res, next) => {
  let sqlQuery = 'SELECT * FROM orders WHERE status="DELIVERY"';
  db.all(sqlQuery, [], (err, rows) => {
    if(err) {
      console.log(err);
    }

    if(rows) {
      res.json(rows);
    } else {
      res.sendStatus(404);
    }
  });
});

router.get('/order/:id/end', (req, res, next) => {
  db.run('UPDATE orders SET status = ? WHERE id = ?', ["END", req.params.id], (err) => {
    if(err){
      console.log(err);
      res.sendStatus(404); 
    } else {
      res.sendStatus(200);
    }
  });

  // Delete qrcode of the order
  let qrcodePath = './qrcodes/'+req.params.id+'.png'; 
  if (!fs.existsSync(qrcodePath)) {
    qrcode.toFile(qrcodePath, 'https://domain.com/api/order/'+req.params.id+'delivery');
  }
});

module.exports = router;
