/**
 * Created by Ben on 6/25/2016.
 */

var async = require("async");

module.exports = function (dir, cwd, sftp, callback) {
  var dirs = [];

  while (dir.length > 1) {
    dirs.push(dir);

    dir = dir.substring(0, url.lastIndexOf('/'));
  }

  if (dir.length == 1 && dir !== '/') {
    dirs.push(dir);
  }

  async.whilst(function () {
    return dirs.length;
  }, function (callback) {
    var dir = cwd + '/' + dirs.pop();

    sftp.stat(dir, function (error) {
      if (error) {
        sftp.mkdir(dir, callback);
      }

      callback();
    });
  }, function (error) {
    callback(error);
  });
};
