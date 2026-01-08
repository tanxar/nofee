const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);

// Restrict watchFolders to only the merchant directory
config.watchFolders = [projectRoot];

module.exports = config;

