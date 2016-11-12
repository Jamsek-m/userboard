var express = require('express');
var router = express.Router();
var db = require('./database.js');
var formidable = require('formidable');

function avtentikacija(req, res, next){
	if (!req.session.user) {
		res.redirect('/login');
	} else if(req.session.user.tip === 'N'){
		res.render('wait');
	} else {
		next();
	}
}

/* GET home page. */
router.get('/', avtentikacija, function(req, res, next) {
	var sql = "SELECT ID_NOVICE, NOVICA, IME FROM novice n JOIN racun r ON n.AVTOR_ID=r.RAC_ID ORDER BY ID_NOVICE DESC";
	db.query(sql, function (err, rows) {
		if (err) throw err;
		if(req.session.user.tip === 'A'){
			var sql2 = "SELECT COUNT(RAC_ID) as UNCONFIRMED FROM racun WHERE TIP='N'";
			db.query(sql2, function(err2, stevilo){
				if(err2) throw err2;
				var cifra = parseInt(stevilo[0].UNCONFIRMED);
				console.log("cifra: ",cifra);
				res.render('index', {items: rows, user: req.session.user, nepotrjenih: cifra});
			})
		} else {
			res.render('index', { items: rows, user: req.session.user, nepotrjenih: 0 });
		}
	});
});

router.post('/objavi', function (req, res) {
	var form = formidable.IncomingForm();
	form.parse(req, function (err, polja) {
		if (err) throw err;
		var novica = polja.news;
		var sql = "INSERT INTO novice(NOVICA, AVTOR_ID) VALUES ('" + novica + "', " + req.session.user.id + ")";
		db.query(sql, function (err, rows){
			if (err) throw err;
			res.redirect('/');
		})
	});
});

module.exports = router;
