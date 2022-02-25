import React, { Component } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  ToastAndroid,
  DeviceEventEmitter,
} from 'react-native';
import styles from '../styles';
import {
  AtmosphereEffectMode,
  AxisType,
  BombAnalysis,
  BombInfoAttribute,
  BombInfoAxis,
  BombType,
  Dot3D,
  DriverType,
  MGSceneView,
  ModelCacheLayer3D,
  Scene,
  ServerLayer3D,
  SRSType,
  SunLightingMode,
  Viewpoint,
  BombCustomFeatureAttributeCallBack,
  ObjectManager,
} from '@mapgis/uniform-core-react-native';
import { MCJ_DICENGMODEL_FILE_PATH } from '../utils';
import RadioView from '../common/radio';

export default class SceneBombAnalysis extends Component {
  static navigationOptions = { title: '爆炸分析' };

  constructor() {
    super();
    this.state = {
      showLoading: false,
      sidesViewVisible: true,
      isFirstTap: true,
      flag: 1,
      bombFrameNum: 100,
      bombDistance: 100,
      mapInfo: new Map(),
      bombAttributeDataMap: new Object(),
    };
  }

  onGetInstance = sceneView => {
    this.sceneView = sceneView;
    this.openMap();
  };

  openMap = async () => {
    this.bombTypeValue = BombType.BombTypeAxial;
    this.initBombAttributeDataMap();
    this.initScene();
  };

  componentWillUnmount = () => {
    this.disposeMap();

    this.sceneTapListener.remove();
  };

  componentDidMount() {
    this.sceneTapListener = DeviceEventEmitter.addListener(
      'com.mapgis.RN.SceneView.SingleTapEvent',
      res => {
        if (this.state.isFirstTap) {
          this.setState({ sidesViewVisible: false, isFirstTap: false });
        } else {
          this.setState({ sidesViewVisible: true, isFirstTap: true });
        }
      }
    );
  }

  disposeMap = async () => {
    await ObjectManager.disposeAll();
  };

  initBombAttributeDataMap = () => {
    let obj = {
      1: '粉质粘土',
      2: '粉细沙',
      3: '粉质粘土夹粉土',
      4: '粉质粘土夹粉土',
      5: '粉质粘土',
      6: '粉砂夹粉土',
      7: '淤泥',
      8: '中细沙',
      9: '粉质粘土夹粉土',
      10: '粉质粘土',
      11: '粉质粘土',
    }
    this.setState({ bombAttributeDataMap: obj });
  };

  initScene = async () => {
    this.setState({ showLoading: true });

    let serverLayer3D = await ServerLayer3D.createInstance();
    await serverLayer3D.setName('Google');
    await serverLayer3D.setDriverType(DriverType.Driver_Type_XYZ);
    await serverLayer3D.setSRSByString(SRSType.SRS_Type_Global_MERCATOR);

    await serverLayer3D.setURL('http://wprd0[1234].is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=6&x={x}&y={y}&z={z}&scl=1&ltype=11');
    this.diCengCacheLayer3D = await ModelCacheLayer3D.createInstance();
    await this.diCengCacheLayer3D.setDriverType(DriverType.Driver_Type_Model_MapGIS_M3D);
    await this.diCengCacheLayer3D.setURL(MCJ_DICENGMODEL_FILE_PATH);
    await this.diCengCacheLayer3D.setLightingEnabled(false);

    let scene = await Scene.createInstance();
    await scene.addLayer(serverLayer3D);
    await scene.addLayer(this.diCengCacheLayer3D);

    await this.sceneView.registerTapListener();
    await this.sceneView.setSunLightingMode(SunLightingMode.LIGHT);

    let success = await this.sceneView.setSceneAsync(scene);
    if (success) {
      let dot3d = await Dot3D.createInstance(114.382062, 22.835918, 5);
      let diCengViewpoint = await Viewpoint.createInstanceByParam(dot3d, 0.75804232150415196, -16.093499328460833, 3000);
      this.sceneView.jumptoViewPoint(diCengViewpoint, 2.0);
    }
    this.setState({ showLoading: false });
  };

  startBomb = async () => {
    if (this.bombAnalysis === null || this.bombAnalysis === undefined) {
      this.bombAnalysis = await BombAnalysis.createInstance();
      await this.bombAnalysis.setModelCacheLayer(this.diCengCacheLayer3D);
    }

    if (this.state.bombFrameNum <= 0) {
      ToastAndroid.show('请输入爆炸帧数！', ToastAndroid.SHORT);
      return;
    }

    if (this.state.bombDistance <= 0) {
      ToastAndroid.show('请输入爆炸距离！', ToastAndroid.SHORT);
      return;
    }

    // 开启地下模式
    await this.sceneView.setAtmosphereEffectMode(AtmosphereEffectMode.UNDERGROUND);

    // 隐藏左侧和右侧的滚动视图
    this.setState({ sidesViewVisible: false, isFirstTap: false });

    if (this.bombTypeValue == BombType.BombTypeAxial) {
      // 轴向爆炸
      let bombInfoAxis = await BombInfoAxis.createInstance();
      await bombInfoAxis.setAxisType(AxisType.AxisTypeY);
      await bombInfoAxis.setDistance(this.state.bombDistance);
      await bombInfoAxis.setFrameNum(this.state.bombFrameNum);
      await this.bombAnalysis.setBombInfo(bombInfoAxis);
      await this.bombAnalysis.start();
    }
    else {
      // 属性爆炸
      let bombInfoAttribute = await BombInfoAttribute.createInstance();
      await bombInfoAttribute.setFrameNum(this.state.bombFrameNum);
      await bombInfoAttribute.setDistance(this.state.bombDistance);
      let bAttributeCallBack = await BombCustomFeatureAttributeCallBack.createInstance();
      await bAttributeCallBack.setAttributeMap(this.state.bombAttributeDataMap);
      await bombInfoAttribute.setCustomFeatureAttributeCallBack(bAttributeCallBack);
      await this.bombAnalysis.setBombInfo(bombInfoAttribute);
      await this.bombAnalysis.start();
    }
  };

  stopBomb = async () => {
    if (this.bombAnalysis !== null && this.bombAnalysis !== undefined) {
      await this.bombAnalysis.stop();
    }
    await this.sceneView.setAtmosphereEffectMode(AtmosphereEffectMode.NONE);
  };

  checkCallBack = (id) => {
    this.setState({ flag: id });
    if (id === 1) {
      this.bombTypeValue = BombType.BombTypeAxial;
      this.stopBomb();
    } else if (id === 2) {
      this.bombTypeValue = BombType.BombTypeAttribute;
      this.stopBomb();
    }
  };

  showLeft = () => (
    this.state.sidesViewVisible ?
      <View style={style.leftControls}>

        <Text style={style.itemTitle}>爆炸参数设置</Text>
        <View style={style.itemSingleView}>
          <Text style={style.itemKey}>爆炸帧数:</Text>
          <TextInput style={style.itemValue}
            value={this.state.bombFrameNum > 0 ? String(this.state.bombFrameNum) : ''}
            keyboardType='numeric'
            multiline={true}
            autoFocus={true}
            onChangeText={text => this.setState({ bombFrameNum: text.length > 0 ? parseInt(text) : 0 })}>
          </TextInput>
        </View>

        <View style={style.itemSingleView}>
          <Text style={style.itemKey}>爆炸距离:</Text>
          <TextInput style={style.itemValue}
            value={this.state.bombDistance > 0 ? String(this.state.bombDistance) : ''}
            keyboardType='numeric'
            multiline={true}
            autoFocus={true}
            onChangeText={text => this.setState({ bombDistance: text.length > 0 ? parseFloat(text) : 0 })}>
          </TextInput>
        </View>

        <Text style={style.itemTitle}>爆炸方式设置</Text>
        <View style={style.itemSingleView}>
          <Text style={style.itemKey}>轴向爆炸</Text>
          <RadioView
            id={1}
            onCheck={this.checkCallBack}
            radius={12}
            bgc={'#ff0000'}
            checked={this.state.flag === 1} />
        </View>

        <View style={style.itemSingleView}>
          <Text style={style.itemKey}>属性爆炸</Text>
          <RadioView
            id={2}
            onCheck={this.checkCallBack}
            radius={12}
            bgc={'#ff0000'}
            checked={this.state.flag === 2} />
        </View>

        <View style={styles.button}>
          <TouchableOpacity
            onPress={() => {
              this.startBomb();
            }}
          >
            <Text style={styles.text}>开始爆炸</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.button}>
          <TouchableOpacity
            onPress={() => {
              this.stopBomb();
            }}
          >
            <Text style={styles.text}>结束爆炸</Text>
          </TouchableOpacity>
        </View>
      </View> :
      null
  );

  showRight = () => (
    this.state.sidesViewVisible ?
      <View style={style.rightControls}>
        <Text style={style.itemValue}>
          操作步骤：
          {'\n'}
          1、设置爆炸帧数和距离
          {'\n'}
          2、设置爆炸方式
          {'\n'}
          3、点击开始爆炸便可看到效果,控制面板自动隐藏，点击屏幕可再次显示面板
          {'\n'}
          4、若结束爆炸，模型恢复原状
        </Text>
      </View> :
      null
  );

  render() {
    return (
      <View style={styles.container}>
        <MGSceneView
          ref='sceneView'
          onGetInstance={this.onGetInstance}
          style={styles.sceneView}
        />

        {this.showLeft()}

        {this.showRight()}

        <ActivityIndicator
          animating={this.state.showLoading}
          style={[styles.centering, { height: 80 }]}
          size='large' />
      </View>
    );
  }
}

const style = StyleSheet.create({
  leftControls: {
    flex: 1,
    width: 200,
    elevation: 4,
    position: 'absolute',
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: '#292c36cc',
  },
  rightControls: {
    width: 180,
    position: 'absolute',
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
    backgroundColor: '#292c36cc',
    paddingLeft: 10,
    paddingRight: 10,
    bottom: 30,
  },
  itemSingleView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  itemTitle: {
    fontSize: 14,
    marginBottom: 6,
    color: '#rgba(245,83,61,0.8)',
  },
  itemKey: {
    paddingLeft: 10,
    alignItems: 'center',
    fontSize: 14,
    color: '#rgba(245,83,61,0.8)',
  },
  itemValue: {
    fontSize: 14,
    padding: 0,
    alignItems: 'center',
    color: '#fff',
  }
});
