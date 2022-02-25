import {
  Platform,
  PermissionsAndroid,
  Alert,
  NativeModules,
} from 'react-native';

/**
 * 环境初始化路径
 */
export const SDCARD_PATH = '/storage/emulated/0/';
export const INITIALIZE_PATH = SDCARD_PATH + 'MapGISSample';

/**
 * 截屏\出图图片存放地址
 */
export const SCREEN_PATH = INITIALIZE_PATH + '/Screen/';

/**
 * 存放系统库的路径
 */
export const SYSTEM_LIB_PATH1 = INITIALIZE_PATH + '/';
export const SYSTEM_LIB_PATH2 = INITIALIZE_PATH + '/AnotherSystemlib/';

/**
 * 影像数据
 */
export const TIF_FILE_PATH = INITIALIZE_PATH + '/Scene/tif/world.tif';
export const TERRAIN_FILE_PATH = INITIALIZE_PATH + '/Scene/tif/mt_everest_90m.tif';

/**
 * 图片路径
 */
export const IMG_FILE_PATH = INITIALIZE_PATH + '/Scene/placemark32.png';
export const IMG_FILE_PATH2 = INITIALIZE_PATH + '/Scene/annotation.png';
export const IMG_FILE_PATH_GUOQI = INITIALIZE_PATH + '/Scene/guoqi.png';
export const IMG_FILE_PATH_USFLAG = INITIALIZE_PATH + '/Scene/USFLAG.TGA';
export const IMG_FILE_PATH_STARTPOINT = INITIALIZE_PATH + '/Scene/start.png';
export const IMG_FILE_PATH_ENDPOINT = INITIALIZE_PATH + '/Scene/end.png';

/**
 * 模型
 */
export const MODLE_FILE_PATH = INITIALIZE_PATH + '/Scene/models/ive/xcgj.ive';
export const MODLE_FILE_PATH_PARTICLE = INITIALIZE_PATH + '/Scene/models/osgb/cessnafire.osgb';
export const MODLE_FILE_PATH_ANIMATION = INITIALIZE_PATH + '/Scene/models/osgb/fengji.osgb';
export const MODLE_FILE_PATH_HHL = INITIALIZE_PATH + '/Scene/models/ive/huanghelou.ive';

/**
 * shp
 */
export const SHP_FILE_PATH = INITIALIZE_PATH + '/Scene/haiyang/haiyang.shp';
export const SHP_FILE_PATH1 = INITIALIZE_PATH + '/Scene/3dscheme/data/TestReg/TestReg.shp';
export const SHP_FILE_PATH2 = INITIALIZE_PATH + '/Scene/3dscheme/data/hongshansquera/BUILDING_ALL.shp';

/**
 * style.xml
 */
 export const STYLE_FILE_PATH = INITIALIZE_PATH + '/Scene/3dscheme/style.xml';
 export const STYLE_FILE_PATH1 = INITIALIZE_PATH + '/Scene/3dscheme/style_1.xml';

/**
 * 倾斜摄影
 */
export const OP_FILE_PATH1 = INITIALIZE_PATH + '/Scene/dayanta/dayanta.mcx';
export const PATH_FILE_PATH0 = INITIALIZE_PATH + '/Scene/path fly/dayanta2.pat';
export const OP_DIR = INITIALIZE_PATH + '/Scene/dayanta';

/**
 * earth文件
 */
export const EARTH_FILE = INITIALIZE_PATH + '/Scene/google_img_globe.earth';

/**
 * M3D模型缓存
 */
export const MCJ_FILE_JINGGUAN_PATH = INITIALIZE_PATH + '/Scene//models/m3d/jingguan/jingguan.mcj';
export const MCJ_FUTIANQU_FILE_PATH = INITIALIZE_PATH + '/Scene/models/m3d/FuTianQu/FuTianQu.mcj';
export const MCJ_DICENGMODEL_FILE_PATH = INITIALIZE_PATH + '/Scene/models/m3d/DiCengModel/B05841C-G01-1.mcj';


export function mapComponents(prefix, screens) {
  return Object.keys(screens).reduce((result, name) => {
    const screen = screens[name];
    const { title } = screen.navigationOptions;
    result[`${prefix}${name}`] = { screen, title };
    return result;
  }, {});
}

function checkGranted(granteds) {
  const values = Object.values(granteds);
  let isGranted = true;
  for (let i = 0; i < values.length - 1; i++) {
    if (values[i] != values[i + 1]) {
      isGranted = false;
      break;
    }
  }
  if (isGranted && values[0] === PermissionsAndroid.RESULTS.GRANTED) {
    return true;
  }
  return false;
}

export async function requestMultiplePermission() {
  if (Platform.OS === 'ios') {
    return;
  }

  try {
    const permissions = [
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
    ];
    //返回得是对象类型
    const granteds = await PermissionsAndroid.requestMultiple(permissions);
    if (!checkGranted(granteds)) {
      throw new Error('授权拒绝，无法正常使用本应用');
    }
  } catch (err) {
    throw new Error('授权失败，无法正常使用本应用');
  }
}

export default { mapComponents, requestMultiplePermission };
