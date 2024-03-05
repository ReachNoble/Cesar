const express = require('express');
const app = express();
const logger = require('morgan');
const port = 3000;
const conn = require('mysql2');
const bodyParser= require('body-parser');
const cors=require('cors');
require('dotenv').config();

const conexion = conn.createConnection({
    host: process.env.BD_HOST || "localhost",
    user: process.env.BD_USER,
    password: process.env.BD_PASSWORD,
    database: process.env.BD_NAME,
    port: process.env.BD_PORT,
});

app.use(cors());
app.use(logger('dev'))
app.use(express.urlencoded({extended:true}));
app.use(bodyParser.json());


//rutas de user
var user_routes=require('./routes/user')
app.use(user_routes) 

//rutas de album
var album_routes=require('./routes/album')
app.use(album_routes)

//rutas de song
var song_routes=require('./routes/song')
app.use(song_routes)

//rutas de artist
var artist_routes=require('./routes/artist')
app.use(artist_routes)

app.get('*', (req, res) => {
    res.send({message: 'Ruta no valida'})
})

//Conexion A Base De Datos si se conecta se iniciara el servidor
conexion.connect((error) => {
    if (error) {
        console.log('No conexión a la BASE DE DATOS');
    } else {
        console.log('ACCEDISTE A LA BASE DE DATOS CESAR');
        app.listen(port, () => {
    console.log(`BIENVENIDO A EL SERVIDOR DE CESAR ${port}`);
});
    }
});

