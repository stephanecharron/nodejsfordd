var express = require('express');
var session = require('cookie-session'); // Charge le middleware de sessions
var bodyParser = require('body-parser'); // Charge le middleware de gestion des paramètres
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var os = require("os");

var expressLogging = require('express-logging'),
    logger = require('logops');
    
var http = require('http');
var options = {
    host: '169.254.169.254',
    port: 80,
    path: '/latest/dynamic/instance-identity/document'
  };
var req = http.get(options, function(response) {
  // handle the response
  var res_data = '';
  response.on('data', function(chunk) {
    res_data += chunk;
  });
  response.on('end', function() {
    logger.info('instance info',{'data':res_data});
  });
});
req.on('error', function(err) {
  logger.error(new TypeError("Request error: " + err.message));
});
    
    
    

var app = express();

app.use(expressLogging(logger));
/* On utilise les sessions */
app.use(session({secret: 'todotopsecret'}))


/* S'il n'y a pas de todolist dans la session,
on en crée une vide sous forme d'array avant la suite */
.use(function(req, res, next){
    if (typeof(req.session.todolist) == 'undefined') {
        req.session.todolist = [];
    }
    next();
})

/* On affiche la todolist et le formulaire */

.get('/', function(req, res) { 
    res.redirect('/todo');
})

.get('/todo', function(req, res) { 
    res.render('todo.ejs', {todolist: req.session.todolist});
})

.get('/error', function(req, res) { 
    res.status(404);
    res.render('error.ejs');

})

/* On ajoute un élément à la todolist */
.post('/todo/ajouter/', urlencodedParser, function(req, res) {
    if (req.body.newtodo != '') {
        req.session.todolist.push(req.body.newtodo);
    }
    res.redirect('/todo');
})

/* Supprime un élément de la todolist */
.get('/todo/supprimer/:id', function(req, res) {
    if (req.params.id != '') {
        req.session.todolist.splice(req.params.id, 1);
    }
    res.redirect('/todo');
})

/* On redirige vers la todolist si la page demandée n'est pas trouvée */
.use(function(req, res, next){
    logger.error(new TypeError('Ressource not found'));
    res.redirect('/error');
})

.listen(8000);   