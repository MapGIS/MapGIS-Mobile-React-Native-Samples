import React, { Component } from 'react';
import {
  FlatList,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import styles from '../styles';
import {
  DriverType,
  MGSceneView,
  ModelCacheLayer3D,
  ObjectManager,
  Scene,
  ServerLayer3D,
  SRSType,
  SunLightingMode,
} from '@mapgis/mobile-react-native';
import {
  OP_FILE_PATH1,
  PATH_FILE_PATH0
} from '../utils';

export default class SceneFlyControl extends Component {
  static navigationOptions = { title: '场景飞行控制' };

  constructor() {
    super();
    this.state = {
      data: [
        {
          id: '开始漫游',
        },
        {
          id: '暂停漫游',
        },
        {
          id: '继续漫游',
        },
        {
          id: '停止漫游',
        },
        {
          id: '重新开始漫游',
        },
        {
          id: '高速漫游',
        },
        {
          id: '低速漫游',
        }
      ],
      selectedId: '',
    };
  }

  onGetInstance = sceneView => {
    this.sceneView = sceneView;
    this.openMap();
  };

  openMap = async () => {
    let serverLayer3D = await ServerLayer3D.createInstance();
    await serverLayer3D.setName('Google');
    await serverLayer3D.setDriverType(DriverType.Driver_Type_XYZ);
    await serverLayer3D.setSRSByString(SRSType.SRS_Type_Global_MERCATOR);

    await serverLayer3D.setURL('http://wprd0[1234].is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=6&x={x}&y={y}&z={z}&scl=1&ltype=11');

    let scene = await Scene.createInstance();
    await scene.addLayer(serverLayer3D);

    let modelCacheLayer3D = await ModelCacheLayer3D.createInstance();
    await modelCacheLayer3D.setDriverType(DriverType.Driver_Type_Model_MapGIS_OP);
    await modelCacheLayer3D.setURL(OP_FILE_PATH1);
    await scene.addLayer(modelCacheLayer3D);

    await this.sceneView.setSunLightingMode(SunLightingMode.NONE);
    await this.sceneView.setSceneAsync(scene);
  };

  componentWillUnmount = () => {
    this.disposeMap();
  };

  disposeMap = async () => {
    await ObjectManager.disposeAll();
  };

  setSelect = async (item) => {
    this.setState({ selectedId: item.id })

    let flyManager = await this.sceneView.getFlyManager();
    if (item.id == '开始漫游') {
      await flyManager.loadAnimationsFromPat(PATH_FILE_PATH0);
      await flyManager.start();
    } else if (item.id == '暂停漫游') {
      await flyManager.pause();
    } else if (item.id == '继续漫游') {
      await flyManager.resume();
    } else if (item.id == '停止漫游') {
      await flyManager.stop();
    } else if (item.id == '重新开始漫游') {
      await flyManager.reStart();
    } else if (item.id == '高速漫游') {
      await flyManager.speedUp();
    } else if (item.id == '低速漫游') {
      await flyManager.slowDown();
    }
  }

  renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        this.setSelect(item)
      }}
    >
      <View style={styles.listItem}>
        <Text style={{
          fontSize: 16,
          color: item.id == this.state.selectedId ? ('#ffff00') : ('#fff'),
        }}>{item.id}</Text>
      </View>
    </TouchableOpacity>
  );

  render() {
    return (
      <View style={styles.container}>
        <MGSceneView
          ref='sceneView'
          onGetInstance={this.onGetInstance}
          style={styles.sceneView}
        />
        <FlatList
          style={styles.list}
          keyExtractor={(item) => item.id}
          data={this.state.data}
          extraData={this.state.selectedId}
          renderItem={this.renderItem}
        />
      </View>
    );
  }
}

