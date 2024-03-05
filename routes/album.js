const express = require('express');
const api = express.Router();
const albumsController = require('../controllers/album');
const multipart = require('connect-multiparty');
const md_upload = multipart({ uploadDir: 'uploads/albums' });
const path = require('path'); 
var md_auth=require('../middlewares/authenticated');

// Importa el módulo 'path' para trabajar con rutas de archivo
api.get('/albums',[md_auth.Auth], albumsController.list);
api.get('/albums/:artist_id', [md_auth.Auth], albumsController.Albums_Artist);
api.get('/albums/:id',[md_auth.Auth],albumsController.list_album);

api.post('/albums',[md_auth.Auth], albumsController.save);
api.delete('/albums/:id',[md_auth.Auth], albumsController.delete);
api.put('/albums/:id',[md_auth.Auth], albumsController.update);

// Rutas para imagen de álbumes
api.post('/albums/image/:id', [md_upload], albumsController.uploadImageAlbum);
api.get('/albums/getImageAlbum/:image', albumsController.getImageAlbum);
api.delete('/albums/image/:id', albumsController.delImageAlbum);

module.exports = api;
