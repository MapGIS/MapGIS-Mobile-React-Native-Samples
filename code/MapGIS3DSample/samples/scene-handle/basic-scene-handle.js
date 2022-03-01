import React, { Component } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ToastAndroid,
  Image,
  Modal,
  Dimensions,
} from 'react-native';
import styles from '../styles';
import { SCREEN_PATH } from '../utils';
import {
  MGSceneView,
  ServerLayer3D,
  DriverType,
  SRSType,
  Scene,
  SunLightingMode,
  ObjectManager
} from '@mapgis/mobile-react-native';

export default class BasicSceneHandle extends Component {
  static navigationOptions = { title: '场景基本操作' };

  constructor() {
    super();
    this.state = {
      title: '截屏',
      modalVisible: false,
      imageUri: 'ic_action_screen_shots',
    };
  }

  onGetInstance = sceneView => {
    this.sceneView = sceneView;
    this.openMap();
  };

  openMap = async () => {
    let scene = await Scene.createInstance();
    let serverLayer = await ServerLayer3D.createInstance();
    await serverLayer.setName('Google');
    await serverLayer.setDriverType(DriverType.Driver_Type_XYZ);
    await serverLayer.setSRSByString(SRSType.SRS_Type_Global_MERCATOR);
    await serverLayer.setURL('http://wprd0[1234].is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=6&x={x}&y={y}&z={z}&scl=1&ltype=11');

    await scene.addLayer(serverLayer);

    await this.sceneView.setSunLightingMode(SunLightingMode.NONE);
    await this.sceneView.setSceneAsync(scene);
  };

  componentWillUnmount = () => {
    this.disposeMap();
  };

  disposeMap = async () => {
    await ObjectManager.disposeAll();
  };

  // 截屏
  screenShot = async () => {
    let bitmapPath = await this.sceneView.getScreenSnapshot(SCREEN_PATH);
    ToastAndroid.show('图片保存路径： ' + bitmapPath, ToastAndroid.SHORT);

    this.showBitmap(bitmapPath, '截屏');
  };

  showBitmap = (bitmapPath, title) => {
    if (bitmapPath !== '') {
      this.setState({ imageUri: bitmapPath, modalVisible: true, title: title });
    } else {
      ToastAndroid.show('没有生成可用的图片！');
    }
  };

  render() {
    return (
      <View style={styles.container}>
        <MGSceneView
          ref='sceneView'
          onGetInstance={this.onGetInstance}
          style={styles.sceneView}
        />

        <Modal
          animationType={'slide'}
          transparent={true}
          visible={this.state.modalVisible}
          onRequestClose={() => {
            this.setState({ modalVisible: false });
          }}
        >
          <View style={style.imageParentView}>
            <Text style={style.imageTitle}>{this.state.title}</Text>
            <Image
              style={style.image}
              source={{
                uri: this.state.imageUri,
              }}
            />
          </View>
        </Modal>

        <View style={styles.buttons}>
          <View style={styles.button}>
            <TouchableOpacity
              onPress={() => {
                this.screenShot();
              }}
            >
              <Text style={styles.text}>截屏</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
}

const style = StyleSheet.create({
  imageParentView: {
    width: Dimensions.get('window').width - 50,
    height: Dimensions.get('window').height - 80,
    backgroundColor: '#fff',
    borderColor: '#62b3ff',
    borderWidth: 2,
    marginTop: 50,
    marginLeft: 25,
    marginBottom: 30,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  imageTitle: {
    flex: 0,
    height: 50,
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
    backgroundColor: '#000',
    textAlignVertical: 'center',
  },
  image: {
    flex: 1,
    alignSelf: 'stretch',
  },
});