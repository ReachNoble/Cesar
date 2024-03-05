var bcrypt = require('bcrypt-nodejs');
var jwt = require('../services/jwt'); // Importar el servicio
var fs = require('fs');//manejo de archivos FileSystem
var path = require('path');//Rutas o Ubicaciones

const conn = require('mysql2');

const conexion = conn.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'mysql',
    database: 'mydb'
});

module.exports = {
    // Operaciones CRUD para la entidad album
    save(req, res) {
        if (req.user.role !== 'admin' && req.user.role !== 'creator') {
            return res.status(403).send({ message: 'No tienes permiso para guardar canciones' });
        }
        console.log(req.body);
        var data = req.body;
        var title = data.title;
        var description = data.description;
        var year = data.year;
        var artist_id = data.artist_id;  // Asumiendo que artist_id se envía en el cuerpo de la solicitud.
        conexion.query(
            'INSERT INTO albums (title, description, year, artist_id) VALUES (?, ?, ?, ?)',
            [title, description, year, artist_id],
            function (err, results, fields) {
                if (err) {
                    console.log(err);
                    res.status(500).send({ message: 'Error al guardar los datos del álbum' });
                } else {
                    res.status(200).send({ message: 'Datos del álbum guardados exitosamente' });
                }
            }
        );
    },
    
    list(req, res) {
        conexion.query(
            'SELECT * FROM albums',
            function (err, results, fields) {
                if (results) {
                    res.status(200).send({ results });
                } else {
                    res.status(500).send({ message: 'Error: inténtalo más tarde' });
                }
            }
        );
    },
    Albums_Artist(req, res) {
        const artist_id = req.params.artist_id; 
        conexion.query(
            'SELECT * FROM albums WHERE artist_id = ?',
            [artist_id],
            function (err, results, fields) {
                if (results) {
                    res.status(200).send({ results });
                } else {
                    res.status(500).send({ message: 'Error: inténtalo más tarde' });
                }
            }
        );
    },
    

    list_album(req , res){
        var id = req.params.id; 
        conexion.query('SELECT * FROM albums WHERE id='+id,function(err,results,fields){
            if (results) {
                res.status(200).send({results });
            } else {
                res.status(500).send({ message: 'Error: intentalo mas tarde' });
            }
        });
    },
    
    
    
    delete(req, res) {
        var id = req.params.id;
    
        // Verificar si hay canciones asociadas al álbum
        conexion.query('SELECT COUNT(*) AS songCount FROM song WHERE albums_id = ?', [id], function (err, results, fields) {
            if (err) {
                console.log(err);
                res.status(500).send({ message: "Error al verificar canciones asociadas al álbum" });
            } else {
                const songCount = results[0].songCount;
    
                if (songCount > 0) {
                    // Si hay canciones, eliminarlas primero
                    conexion.query('DELETE FROM song WHERE albums_id = ?', [id], function (err, results, fields) {
                        if (err) {
                            console.log(err);
                            res.status(500).send({ message: "Error al eliminar las canciones asociadas al álbum" });
                        } else {
                            // Luego de eliminar las canciones, eliminar el álbum
                            conexion.query('DELETE FROM albums WHERE id = ?', [id], function (err, results, fields) {
                                if (!err) {
                                    if (results.affectedRows !== 0) {
                                        res.status(200).send({ message: "Datos del álbum y canciones asociadas eliminados" });
                                    } else {
                                        res.status(200).send({ message: "No se eliminó nada" });
                                    }
                                } else {
                                    console.log(err);
                                    res.status(500).send({ message: "Error al eliminar el álbum" });
                                }
                            });
                        }
                    });
                } else {
                    // Si no hay canciones, eliminar directamente el álbum
                    conexion.query('DELETE FROM albums WHERE id = ?', [id], function (err, results, fields) {
                        if (!err) {
                            if (results.affectedRows !== 0) {
                                res.status(200).send({ message: "Datos del álbum eliminados" });
                            } else {
                                res.status(200).send({ message: "No se eliminó nada" });
                            }
                        } else {
                            console.log(err);
                            res.status(500).send({ message: "Error al eliminar el álbum" });
                        }
                    });
                }
            }
        });
    },
    











    
    update(req, res) {
        var id = req.params.id;
        var data = req.body;
        var sql = 'UPDATE albums SET ? WHERE id=?';

        conexion.query(sql, [data, id], function (err, results, fields) {
            if (!err) {
                console.log(results);
                res.status(200).send({ message: "Datos del álbum actualizados" });
            } else {
                console.log(err);
                res.status(500).send({ message: "Inténtelo más tarde" });
            }
        });
    },




    uploadImageAlbum(req, res){
        var id = req.params.id;
        var file = 'Sin imagen...';
        if (req.files) {
            var file_path = req.files.image.path;
            var file_split = file_path.split('\\'); 
            var file_name = file_split[2]; 
            var ext = file_name.split('\.');
            var file_ext = ext[1];
            if (file_ext == 'jpg' || file_ext == 'gif' || file_ext == 'jpeg'||file_ext=='png') { 
                conexion.query('UPDATE albums SET image="' + file_name + '" WHERE id=' + id, 
                function (err, results, fields) {
                    if (!err) {
                        if (results.affectedRows !== 0) {
                            res.status(200).send({ message: 'Imagen actualizada' });
                        } else {
                            res.status(200).send({ message: 'Imagen NO actualizada' });
                        }
                    } else {
                        console.log(err);
                        res.status(500).send({ message: 'Inténtalo más tarde' }); 
                    }
                }); 
            } else {
                res.status(400).send({ message: 'Error de extensión' }); 
            }
        }
    },
    getImageAlbum(req,res){
        var image = req.params.image;
        var path_file='./uploads/albums/'+image;
        console.log(path_file);
        if(fs.existsSync(path_file)){
            res.sendFile(path.resolve(path_file))
        }else{
            res.status(404).send({message:'No existe Imagen de album'})
        }
    },

    delImageAlbum(req, res) {
        const id = req.params.id;
        const sql = "SELECT image FROM albums WHERE id=" + id;
        
        conexion.query(sql, function (err, results, fields) {
            if (!err) {
                if (results.length !== 0) {
                    if (results[0].image !== null) { // Corregir la referencia a la columna "image"
                        const path_file = './uploads/albums/' + results[0].image; // Corregir la referencia a la columna "image"
                        try {
                            fs.unlinkSync(path_file);
                            // Actualizar la tabla estableciendo la columna "image" a null
                            const updateSql = "UPDATE albums SET image = null WHERE id=" + id;
                            conexion.query(updateSql, function (updateErr, updateResults, updateFields) {
                                if (!updateErr) {
                                    res.status(200).send({ message: 'Imagen de Album Eliminada' });
                                } else {
                                    console.error(updateErr);
                                    res.status(500).send({ message: 'Error al actualizar album' });
                                }
                            });
                        } catch (error) {
                            console.error(error);
                            res.status(500).send({ message: 'Imagen de album NO eliminada' });
                        }
                    } else {
                        res.status(404).send({ message: 'Imagen de album No encontrada' });
                    }
                } else {
                    res.status(404).send({ message: 'Imagen de album No encontrada' });
                }
            } else {
                console.log(err);
                res.status(500).send({ message: 'No se pudo eliminar. Intenta más tarde' });
            }
        });
    },






};
