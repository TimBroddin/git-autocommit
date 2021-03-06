"use strict";

// GIT auto save

var chokidar = require('chokidar');
var fs = require('fs');
var moment = require('moment');
const exec = require('child_process').exec;
let ignore = [];
let remote = false;

exec('git remote -v', (err, stdout) => {
   if(!err && stdout) {
       let lines = stdout.split("\n");
       lines.forEach((line) => {
           let fields = line.split("\t");
           console.log(fields.length, fields[1]);
           if(fields[1] && fields[1].indexOf("(push)") > -1) {
               remote = fields[0];
           }

       })
   }

    try {
        ignore = fs.readFileSync('.gitignore', { encoding: 'utf-8'}).split("\n");
    } catch(e) {
        console.log('No gitignore');
    }


// One-liner for current directory, ignores .dotfiles
    chokidar.watch('.', {ignored: /[\/\\]\./}).on('all', (event, path) => {
        let change = true;
        ignore.forEach((entry) => {
            if(path.toLowerCase().indexOf(entry.toLowerCase()) !== -1) {
                change = false;
            }
        });
        if(change) {
            console.log('Change detected > ' + path);
            // fork
            exec('git checkout -b autosave', (err, res) => {
                exec('git add ' + path);
            });
        }

    });

    setInterval(() => {
        exec(`git commit -am "Autosave ${ new moment().format('L HH:mm:ss')}"`, (err, res) => {
            if(!err) {
                exec(`git push -u ${remote} autosave`, (err, res) => {
                    console.log(`> Pushed to ${remote}`)
                });
            }
        });

    }, 1000);
});


