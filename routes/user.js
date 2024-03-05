var express = require('express')
var api=express.Router();
var userControler = require('../controllers/user');
var multipart=require('connect-multiparty');
var md_upload=multipart({uploadDir:'uploads/users'})
var md_auth=require('../middlewares/authenticated');

api.get('/users',[md_auth.Auth],userControler.list);
api.get('/user_image',[md_auth.Auth],userControler.listuser);
api.get('/user/:id',[md_auth.Auth],userControler.list_User);

api.post('/users_save',userControler.save);


api.delete('/users/:id',[md_auth.Auth],userControler.delete);
api.put('/users/:id',[md_auth.Auth],userControler.update);
api.post('/login',userControler.login)

// 
api.post('/users/:id',[md_upload],userControler.uploadImage);
api.get('/users/image/:image',[md_upload],userControler.getImage);
api.delete('/users/image/:id',[md_upload],userControler.delImage)

module.exports = api;

// [md_auth.Auth]