/**
 * Created by Ben on 6/25/2016.
 */

var sshClient = require('ssh2').Client;
var async = require('async');
var mkdirParent = require('./mkdir-parent');

module.exports = SftpWrapper;

function SftpWrapper(config, cwd) {
  this.config = config;
  this.cwd = cwd;
  this.client = new sshClient();

  var wrapper = this;

  this.asyncRequest = function (paths, callback, done) {
    wrapper.client.on('ready', function () {
      wrapper.client.sftp(function (error, sftp) {
        if (error) {
          done(error);
          return;
        }

        async.each(paths, function (dir, thisCallback) {
          callback(dir, sftp, thisCallback);
        }, done);
      });
    });
  };

  this.createDirs = function (dirs, callback) {
    wrapper.asyncRequest(dirs, function (dir, sftp, callback) {
      mkdirParent(dir, wrapper.cwd, sftp, callback);
    }, callback);
  };

  this.deleteDirs = function (dirs, callback) {
    wrapper.asyncRequest(dirs, function (dir, sftp, callback) {
      dir = wrapper.cwd + '/' + dir;

      sftp.readdir(dir, function (error, list) {
        if (!error && !list) {
          sftp.rmdir(dir, callback);
        } else {
          callback(error);
        }
      });
    }, callback);
  };

  this.uploadFiles = function (files, callback) {
    wrapper.asyncRequest(files, function (file, sftp, callback) {
      sftp.fastPut(file, wrapper.cwd + '/' + file, callback);
    }, callback);
  };

  this.deleteFiles = function (files, callback) {
    wrapper.asyncRequest(files, function (file, sftp, callback) {
      sftp.unlink(wrapper.cwd + '/' + file, callback);
    }, callback);
  };

  this.process = function (files, callback) {
    async.series([
      function (callback) {
        wrapper.createDirs(files.dirs.needed, function (error) {
          if (error) {
            console.error('Could not create required directories on the FTP server');
          }

          callback(error);
        });
      },
      function (callback) {
        wrapper.uploadFiles(files.modified, function (error) {
          if (error) {
            console.error('Could not upload modified files to the FTP server');
          }

          callback(error);
        });
      },
      function (callback) {
        wrapper.deleteFiles(files.deleted, function (error) {
          if (error) {
            console.error('Could not delete files from the FTP server');
          }

          callback(error);
        });
      }, function (callback) {
        wrapper.deleteDirs(files.dirs.notNeeded, function (error) {
          if (error) {
            console.error('Could not delete unneeded directories from the FTP server');
          }

          callback(error);
        });
      }, function (callback) {
        wrapper.client.connect(wrapper.config);

        callback();
      }
    ], function (error, results) {
      wrapper.client.end();

      callback(error, results);
    });
  }
}
