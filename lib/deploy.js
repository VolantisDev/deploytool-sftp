/**
 * Created by Ben on 6/25/2016.
 */

var deploytool = require('deploytool');
var gitDiff = require('deploytool-git-diff');
var SftpWrapper = require('./sftp-wrapper');
var ssh_key = require('deploytool-ssh').sshKey;

module.exports = function (environment, commit, callback) {
  environment = deploytool.environment.initialize(environment, {
    type: 'sftp',
    ssh: {
      privateKey: ssh_key(environment)
    }
  });

  var config = environment.config;

  gitDiff.deployFiles(environment, commit, function (error, files) {
    var sftp = new SftpWrapper(config.ftp, config.remotePath);

    sftp.process(files, function (error, stdout) {
      if (error) {
        console.error('Error deploying to environment ' + config.name);
      } else {
        console.log('Successfully deployed to environment ' + config.name);
      }

      callback(error, stdout);
    });
  });
};
