const appJson = require('./app.json');

/** @type {import('expo/config').ExpoConfig} */
module.exports = {
  ...appJson.expo,
  android: {
    ...appJson.expo.android,
    googleServicesFile:
      process.env.GOOGLE_SERVICES_JSON ?? appJson.expo.android.googleServicesFile,
  },
  ios: {
    ...appJson.expo.ios,
    googleServicesFile:
      process.env.GOOGLE_SERVICE_INFO_PLIST ?? appJson.expo.ios.googleServicesFile,
  },
};
