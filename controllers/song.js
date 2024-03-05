var fs = require('fs');//manejo de archivos
var path = require('path');//rutas o ubicaciones
var fs = require('fs');//manejo de archivos FileSystem
var path = require('path');//Rutas o Ubicaciones

const conn = require('mysql2');

const conexion = conn.createConnection({
    host: "localhost",
    user: "root",
    password: "mysql",
    database: "mydb",
});

module.exports = {          
    save(req, res) {
        const data = req.body;
        const number = data.number;
        const name = data.name;
        const albums_id = data.albums_id; // tener el campo albums_id en tu solicitud

        // Insertar canción en la base de datos
        const query = 'INSERT INTO song (number, name, albums_id) VALUES (?, ?, ?)';
        const values = [number, name, albums_id];

        conexion.query(query, values, function (err, results, fields) {
            if (err) {
                console.error(err);
                return res.status(500).send({ message: 'Error al guardar la canción.' });
            } else {
                res.status(200).send({ message: 'Canción guardada correctamente.' });
            }
        });
    },









    list(req, res) {
        conexion.query(
            'SELECT * FROM song',function (err, results, fields) {
                if (results) {
                    res.status(200).send({ data: results });
                } else {
                    res.status(500).send({ message: 'Error: intentalo mas tarde' });
                }
            }
        );
    },
        list_song(req , res){
        var user = req.user
        conexion.query('SELECT * FROM albums WHERE id='+user.sub,function(err,results,fields){
            if (results) {
                res.status(200).send({ data: results });
            } else {
                res.status(500).send({ message: 'Error: intentalo mas tarde' });
            }
        })
    },

    Songs_Album(req, res) {
        const albums_id = req.params.albums_id; 
        conexion.query(
            'SELECT * FROM song WHERE albums_id = ?',
            [albums_id],
            function (err, results, fields) {
                if (results && results.length > 0) {
                    res.status(200).send({ results });
                } else {
                    res.status(500).send({ message: 'Error: inténtalo más tarde' });
                }
            }
            
        );
    },







    delete(req, res) {
        var id = req.params.id;
        conexion.query('DELETE FROM song WHERE id=?', [id], function (err, results, fields) {
            if (!err) {
                if (results.affectedRows != 0) {
                    res.status(200).send({ message: "Cancion eliminada" });
                } else {
                    res.status(200).send({ message: "No se eliminó nada" });
                }
            } else {
                console.log(err);
                res.status(500).send({ message: "Inténtelo más tarde" });
            }
        });
    },









    update(req, res) {
        var id = req.params.id;
        var data = req.body;
        var sql = 'UPDATE song SET ? WHERE number=?';

        conexion.query(sql, [data, id], function (err, results, fields) {
            if (!err) {
                console.log(results);
                res.status(200).send({ message: "Datos actualizados" });
            } else {
                console.log(err);
                res.status(500).send({ message: "Inténtelo más tarde" });
            }
        });
    },





    uploadSong(req, res) {
        var id = req.params.id;
        var file = 'Sin video..';
        
        if (req.files) {
            var file_path = req.files.file.path;
            var file_split = file_path.split('\\');
            var file_name = file_split[2];
            var ext = file_name.split('.');
            var file_ext = ext[1].toLowerCase();  
            if (['mov', 'mp4', 'mp3'].includes(file_ext)) {
                conexion.query('UPDATE song SET file="'+file_name+'" WHERE id = '+id,
                function(err, results, fields){
                    if (!err) {
                        console.log(err);
                        if (results.affectedRows != 0) {
                            res.status(200).send({message: 'Canción actualizada'});
                        } else {
                            console.log()
                            res.status(200).send({message: 'Error al actualizar'});
                        }
                    } else {
                        console.log(err);
                        res.status(200).send({message: 'Inténtelo más tarde'});
                    }
                });
            } else {
                res.status(400).send({message: 'Formato de canción no válido'});
            }
        } else {
            res.status(400).send({message: 'No se proporcionó ningún archivo'});
        }
    },
    getSongs(req, res) {
        var file = req.params.file;
        var path_file = './uploads/songs/' + file;
        console.log(path_file)
        if (fs.existsSync(path_file)) {
            res.sendFile(path.resolve(path_file))
        } else {
            res.status(404).send({ message: 'No existe el archivo' })
        }
    },


    delSong(req, res) {
        id = req.params.id;
        var sql = "SELECT file FROM song WHERE id = " + id
        conexion.query(sql, function (err, results, fields) {
            if (!err) {
                if (results.length != 0) {
                    if (results[0].file != null) {
                        console.log(results);
                        var path_file = './uploads/songs/' + results[0].file;
                        try {
                            // Una vez que la cancion es borrada, actualizar y poner el campo null
                            fs.unlinkSync(path_file);  
                            const updateSql = "UPDATE song SET file = NULL WHERE id = " + id;
                            conexion.query(updateSql, function (updateErr, updateResults) {
                                if (!updateErr) {
                                    console.log("Base de datosha sido actualizada con éxito");
                                    res.status(200).send({ message: "Cancion Eliminada" });
                                } else {
                                    console.log(updateErr);
                                    res.status(500).send({ message: "Error al actualizar la base de datos" });
                                }
                            });
                            
                        } catch (error) {
                            console.log(error);
                            res.status(200).send({ message: "No se pudo eliminar cancion, intenta más tarde" });
                        }
                    } else {
                        res.status(404).send({ message: "Canción no encontrada" });
                    }
                } else {
                    res.status(404).send({ message: "Canción no encontrada" });
                }
            } else {
                console.log(err);
                res.status(500).send({ message: "Intenta más tarde" });
            }
        });
    },



    
};
