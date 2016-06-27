/**
 * @author bmcclure
 */

module.exports = {
  name: 'sftp',
  tag: 'deployment',
  init: function () {},
  deploy: require('./lib/deploy'),
  ftpWrapper: require('./lib/sftp-wrapper'),
  mkdirParent: require('./lib/mkdir-parent')
};
