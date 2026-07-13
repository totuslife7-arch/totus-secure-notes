const { withProjectBuildGradle } = require('expo/config-plugins');

const MARKER = 'totus-play-services-ads-pin';
const RESOLUTION_BLOCK = `
  // ${MARKER}: Expo SDK 56 uses Kotlin 2.1; play-services-ads 25.x needs Kotlin 2.3 metadata.
  configurations.all {
    resolutionStrategy {
      force 'com.google.android.gms:play-services-ads:24.6.0'
    }
  }
`;

/** Pin Google Mobile Ads SDK to a Kotlin 2.1-compatible release for EAS Android builds. */
function withPlayServicesAdsPin(config) {
  return withProjectBuildGradle(config, (config) => {
    let contents = config.modResults.contents;
    if (contents.includes(MARKER)) {
      return config;
    }

    if (contents.includes('allprojects {')) {
      contents = contents.replace(/allprojects\s*\{/, `allprojects {${RESOLUTION_BLOCK}`);
    } else {
      contents += `\n\nallprojects {${RESOLUTION_BLOCK}}\n`;
    }

    config.modResults.contents = contents;
    return config;
  });
}

module.exports = withPlayServicesAdsPin;
