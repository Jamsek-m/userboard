var express = require('express');
var router = express.Router();
var db = require('./database.js');
var formidable = require('formidable');
var crypto = require('crypto');

/*function avtentikacija(req, res, next) {
	if (!req.session.user) {
		res.redirect('/login');
	} else {
		next();
	}
}*/

function avtentikacijaAdmin(req, res, next){
	if(!req.session.user){
		res.redirect('/login');
	} else if (req.session.user.tip !== 'A'){
		res.redirect('/');
	} else {
		next();
	}
}

router.get('/', avtentikacijaAdmin, function (req, res) {
	var sql = "SELECT IME, TIP, UPIME, GESLO, RAC_ID FROM racun ORDER BY TIP";
	db.query(sql, function (err1, rows) {
		if(err1) throw err1;
		var sql2 = "select RAC_ID, IME, TIP, UPIME from racun where TIP='N'";
		db.query(sql2, function(err2, rows2){
			if (err2) throw err2;
			res.render('admin', {users: rows, admin: req.session.user, nepotrjeni: rows2});
		});
	});
});

router.get('/spremeniSelf', avtentikacijaAdmin, function (req, res) {
	res.render('edit_profile', { user: req.session.user, self: true });
});

router.get('/spremeni/:id', avtentikacijaAdmin, function (req, res) {
	var id = req.params.id;
	var sql = "SELECT * FROM racun WHERE RAC_ID=" + id;
	db.query(sql, function (err, rows) {
		if (err) throw err;
		res.render('edit_profile', { user: rows[0], self: false });
	});
});

router.get('/potrdi/:id', function(req, res){
	var id = req.params.id;
	var sql = "UPDATE racun SET TIP='U' WHERE RAC_ID="+id;
	db.query(sql, function(err, rows){
		if(err) throw err;
		res.redirect('/admin/');
	})
});

router.post('/edit/:id', function (req, res) {
	var form = formidable.IncomingForm();
	form.parse(req, function (err, polja) {
		var id = req.params.id;
		var ime = polja.Name;
		var upime = polja.Upime;
		var tip = polja.Tip;
		tip = tip.toUpperCase();
		var novoGeslo = polja.novoGeslo1;
		var sql = "";
		if (!novoGeslo) {
			sql = "UPDATE racun SET " +
			"IME='" + ime +
			"', UPIME='" + upime +
			"', TIP='" + tip + "' WHERE RAC_ID=" + id;
			db.query(sql, function (err, rows) {
				res.redirect('/admin');
			});
		} else {
			novoGeslo = crypto.createHash('sha256').update(novoGeslo).digest("hex");
			sql = "UPDATE racun SET " +
			"IME='" + ime +
			"', UPIME='" + upime +
			"', TIP='" + tip + 
			"', GESLO='" + novoGeslo + "' WHERE RAC_ID=" + id;
			db.query(sql, function (err, rows) {
				res.redirect('/admin');
			});
		}
	});
});

router.post('/editSelf/:id', function (req, res) {
	var form = formidable.IncomingForm();
	form.parse(req, function (err, polja) {
		var id = req.params.id;
		var ime = polja.Name;
		var upime = polja.Upime;
		var tip = req.session.user.tip;
		tip = tip.toUpperCase();
		var novoGeslo = polja.novoGeslo1;
		var sql = "";
		if (!novoGeslo) {
			sql = "UPDATE racun SET " +
			"IME='" + ime +
			"', UPIME='" + upime +
			"', TIP='" + tip + "' WHERE RAC_ID=" + id;
			db.query(sql, function (err, rows) {
				req.session.user = null;
				res.redirect('/');
			});
		} else {
			novoGeslo = crypto.createHash('sha256').update(novoGeslo).digest("hex");
			sql = "UPDATE racun SET " +
			"IME='" + ime +
			"', UPIME='" + upime +
			"', TIP='" + tip + 
			"', GESLO='" + novoGeslo + "' WHERE RAC_ID" + id;
			db.query(sql, function (err, rows) {
				req.session.user = null;
				res.redirect('/');
			});
		}
	});
});

module.exports = router;