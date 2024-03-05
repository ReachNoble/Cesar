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
    // Operaciones CRUD para la entidad artist
save(req, res) {
    console.log(req.body);
    var data = req.body;
    var name = data.name;
    var description = data.description;
    conexion.query(
        'INSERT INTO artist (name, description) VALUES (?, ?)',
        [name, description],
        function (err, results, fields) {
            if (err) {
                console.log(err);
                res.status(500).send({ message: 'Error, inténtalo más tarde' });
            } else {
                res.status(200).send({ message: 'Datos del artista guardados' });
            }
        }
    );
},


    














    list(req, res) {
        conexion.query(
            'SELECT * FROM artist',function (err, results, fields) {
                if (results) {
                    res.status(200).send({ results });
                } else {
                    res.status(500).send({ message: 'Error: inténtalo más tarde' });
                }
            }
        );
    },

    list_artist(req , res){
        var id = req.params.id;
        conexion.query('SELECT * FROM artist WHERE id=' + id, function(err, results, fields) {
            if (err) {
                res.status(500).send({ message: 'Error en la consulta SQL' });
            } else {
                if (results && results.length > 0) {
                    res.status(200).send({ data: results });
                } else {
                    res.status(404).send({ message: 'No se encontraron datos para el ID proporcionado' });
                }
            }
        });
    },
    












    delete(req, res) {
        const artistId = req.params.id;
        // Eliminar canciones asociadas a los álbumes del artista
        conexion.query('DELETE FROM song WHERE albums_id IN (SELECT id FROM albums WHERE artist_id = ?)', [artistId], function (err, results, fields) {
            if (err) {
                console.log(err);
                return res.status(500).send({ message: "Error al eliminar las canciones asociadas a los álbumes del artista" });
            }
            // Eliminar albums del artista
            conexion.query('DELETE FROM albums WHERE artist_id = ?', [artistId], function (err, results, fields) {
                if (err) {
                    console.log(err);
                    return res.status(500).send({ message: "Error al eliminar los álbumes del artista" });
                }
                // Eliminar al artista
                conexion.query('DELETE FROM artist WHERE id = ?', [artistId], function (err, results, fields) {
                    if (err) {
                        console.log(err);
                        return res.status(500).send({ message: "Error al eliminar el artista" });
                    }
                    if (results.affectedRows !== 0) {
                        return res.status(200).send({ message: "Datos del artista, álbumes y canciones asociadas eliminados" });
                    } else {
                        return res.status(200).send({ message: "No se eliminó nada" });
                    }
                });
            });
        });
    },













    update(req, res) {
        var id = req.params.id;
        var data = req.body;
        var sql = 'UPDATE artist SET ? WHERE id=?';

        conexion.query(sql, [data, id], function (err, results, fields) {
            if (!err) {
                console.log(results);
                res.status(200).send({ message: "Datos del artista actualizados" });
            } else {
                console.log(err);
                res.status(500).send({ message: "Inténtelo más tarde" });
            }
        });
    },

    uploadImage(req, res) {
        var id = req.params.id;
        if (req.files && req.files.image) { // Verificar si hay archivos y si se envió la imagen
            var file_path = req.files.image.path;
            var file_split = file_path.split('\\'); 
            var file_name = file_split[2]; 
            var ext = file_name.split('\.');
            var file_ext = ext[1];
            if (file_ext == 'jpg' || file_ext == 'gif' || file_ext == 'jpeg'||file_ext=='png') { 
                conexion.query('UPDATE artist SET image="' + file_name + '" WHERE id=' + id, 
                function (err, results, fields) {
                    if (!err) {
                        if (results.affectedRows !== 0) {
                            res.status(200).send({ message: 'Imagen de artista actualizada' });
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
        } else {
            res.status(400).send({ message: 'No se envió ninguna imagen' }); // Manejar caso donde no se envió imagen
        }
    },
    


    getImage(req,res){
        var image = req.params.image;
        var path_file='./uploads/artists/'+image;
        console.log(path_file);
        if(fs.existsSync(path_file)){
            res.sendFile(path.resolve(path_file))
        }else{
            res.status(404).send({message:'No existe Imagen de artista'})
        }
    },

    delImage(req, res) {
        const id = req.params.id;
        const sql = "SELECT image FROM artist WHERE id=" + id;
        
        conexion.query(sql, function (err, results, fields) {
            if (!err) {
                if (results.length !== 0) {
                    if (results[0].image !== null) { // Corregir la referencia a la columna "image"
                        const path_file = './uploads/artists/' + results[0].image; // Corregir la referencia a la columna "image"
                        try {
                            fs.unlinkSync(path_file);
                            // Actualizar la tabla estableciendo la columna "image" a null
                            const updateSql = "UPDATE artist SET image = null WHERE id=" + id;
                            conexion.query(updateSql, function (updateErr, updateResults, updateFields) {
                                if (!updateErr) {
                                    res.status(200).send({ message: 'Imagen de artista eliminada y tabla actualizada' });
                                } else {
                                    console.error(updateErr);
                                    res.status(500).send({ message: 'Error al actualizar la tabla de artista' });
                                }
                            });
                        } catch (error) {
                            console.error(error);
                            res.status(500).send({ message: 'Imagen de artista NO eliminada' });
                        }
                    } else {
                        res.status(404).send({ message: 'Imagen de artista No encontrada' });
                    }
                } else {
                    res.status(404).send({ message: 'Imagen de artista No encontrada' });
                }
            } else {
                console.log(err);
                res.status(500).send({ message: 'No se pudo eliminar. Intenta más tarde' });
            }
        });
    },




    
};
