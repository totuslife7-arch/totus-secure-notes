const { withAndroidManifest } = require('expo/config-plugins');

const STRIP = new Set([
  'android.permission.READ_MEDIA_IMAGES',
  'android.permission.READ_MEDIA_VIDEO',
  'android.permission.READ_MEDIA_VISUAL_USER_SELECTED',
  'android.permission.READ_MEDIA_AUDIO',
  'android.permission.READ_EXTERNAL_STORAGE',
  'android.permission.WRITE_EXTERNAL_STORAGE',
]);

const PHOTO_PICKER_SERVICE = 'com.google.android.gms.metadata.ModuleDependencies';

/**
 * Google Play photo policy + Android Photo Picker GMS backport manifest snippet.
 *
 * Gallery picking uses expo-image-picker, which already invokes ActivityX
 * PickVisualMedia (no custom Kotlin in this app). This plugin:
 * 1. Strips READ_MEDIA_* and legacy storage permissions from the merged manifest
 * 2. Ensures the GMS ModuleDependencies backport service is present (also declared
 *    by expo-image-picker; we dedupe if already added)
 *
 * @see https://android-developers.googleblog.com/2023/04/photo-picker-everywhere.html
 */
function withAndroidPhotoPicker(config) {
  config = withStripMediaPermissions(config);
  config = withPhotoPickerBackportManifest(config);
  return config;
}

function withStripMediaPermissions(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults;
    const permissions = manifest.manifest['uses-permission'];
    if (Array.isArray(permissions)) {
      manifest.manifest['uses-permission'] = permissions.filter((entry) => {
        const name = entry?.$?.['android:name'];
        return !name || !STRIP.has(name);
      });
    }
    return config;
  });
}

function withPhotoPickerBackportManifest(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults;
    const application = manifest.manifest.application?.[0];
    if (!application) {
      return config;
    }

    if (!application.service) {
      application.service = [];
    }
    if (!Array.isArray(application.service)) {
      application.service = [application.service];
    }

    const alreadyAdded = application.service.some(
      (entry) => entry?.$?.['android:name'] === PHOTO_PICKER_SERVICE,
    );
    if (!alreadyAdded) {
      application.service.push({
        $: {
          'android:name': PHOTO_PICKER_SERVICE,
          'android:enabled': 'false',
          'android:exported': 'false',
        },
        'intent-filter': [
          {
            action: [
              {
                $: {
                  'android:name': 'com.google.android.gms.metadata.MODULE_DEPENDENCIES',
                },
              },
            ],
          },
        ],
        'meta-data': [
          {
            $: {
              'android:name': 'photopicker_activity:0:required',
              'android:value': '',
            },
          },
        ],
      });
    }

    return config;
  });
}

module.exports = withAndroidPhotoPicker;
