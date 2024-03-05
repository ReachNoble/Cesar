const express = require('express');
const api = express.Router();
const songController = require('../controllers/song');
const multipart = require('connect-multiparty');    
var md_auth=require('../middlewares/authenticated');
const md_upload = multipart({ uploadDir: 'uploads/songs' });


api.get('/songs', [md_auth.Auth],songController.list);
api.get('/songs/:id',[md_auth.Auth],songController.list_song);
api.get('/songss/:albums_id',[md_auth.Auth], songController.Songs_Album);

api.post('/songs', [md_auth.Auth],songController.save);
api.delete('/songs/:id',[md_auth.Auth],songController.delete);
api.put('/songs/:id',[md_auth.Auth],songController.update);



api.post('/songs/uploadSong/:id',[md_upload], songController.uploadSong); 
api.get('/songs/getSong/:file',[md_upload],songController.getSongs);
api.delete('/songs/delSong/:id', songController.delSong);


module.exports = api;
                