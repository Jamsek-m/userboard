var express = require('express');
var router = express.Router();
var formidable = require('formidable');
var db = require('./database.js');
var crypto = require('crypto');

/* GET home page. */
router.get('/', function (req, res, next) {
	res.render('login', { successMessage: "", abortMessage: "" });
});

router.post('/', function (req, res) {
	var form = formidable.IncomingForm();
	form.parse(req, function (err, polja) {
		var prijava = {
			upime : polja.log_usr,
			geslo : crypto.createHash('sha256').update(polja.log_pass).digest("hex")
		}
		var sql = "SELECT RAC_ID, IME, TIP, UPIME, GESLO FROM racun";
		db.query(sql, function (err, rows) {
			if (err) throw err;
			var jeUspelo = false;
			for (var i = 0; i < rows.length; i++) {
				if (rows[i].UPIME === prijava.upime && rows[i].GESLO === prijava.geslo) {
					req.session.user = {
						id: rows[i].RAC_ID,
						ime: rows[i].IME,
						tip: rows[i].TIP,
						upime: rows[i].UPIME
					}
					jeUspelo = true;
					res.redirect('/');
				}
			}
			if (!jeUspelo) {
				res.render('login', { successMessage: "", abortMessage: "Napačno uporabniško ime ali geslo." });
			}
		});
	});
});

router.post('/register', function (req, res) {
	var form = formidable.IncomingForm();
	form.parse(req, function (err, polja) {
		if (err) throw err;
		
		var upime = polja.usr;
		var geslo = crypto.createHash('sha256').update(polja.pass).digest("hex");
		var display = polja.dis;
		var sql = "INSERT INTO racun(UPIME, GESLO, IME) VALUES ('" + upime + "','" + geslo + "', '" + display + "')";
		db.query(sql, function (err, rows) {
			if (err) throw err;
			res.render('login', { successMessage: "Registracija je uspela!", abortMessage: "" });
		})
	});
});

router.get('/logout', function (req, res) {
	req.session.user = null;
	res.redirect('/');
});


module.exports = router;
