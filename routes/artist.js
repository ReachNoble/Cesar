const express = require('express');
const api = express.Router();
const artistController = require('../controllers/artist');
const multipart = require('connect-multiparty');
const md_upload = multipart({ uploadDir: 'uploads/artists' });
var md_auth=require('../middlewares/authenticated');


api.get('/artist',[md_auth.Auth],artistController.list);
api.get('/artist/:id',[md_auth.Auth],artistController.list_artist);

api.post('/artist',[md_auth.Auth],artistController.save);
api.delete('/artists/:id',[md_auth.Auth],artistController.delete);
api.put('/artist/:id',[md_auth.Auth],artistController.update);


// Rutas para imagen de artista
api.post('/artist/:id', [md_auth.Auth,md_upload], artistController.uploadImage);
api.get('/artists/image/:image', artistController.getImage);
api.delete('/artists/image/:id', artistController.delImage);


module.exports = api;