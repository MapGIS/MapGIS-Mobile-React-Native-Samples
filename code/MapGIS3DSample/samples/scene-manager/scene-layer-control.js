import React, { Component } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  FlatList,
  ToastAndroid,
} from 'react-native';
import styles from '../styles';
import {
  Dot3D,
  DriverType,
  GroupLayer3D,
  Layer3DType,
  LayerState,
  MGSceneView,
  ModelCacheLayer3D,
  ObjectManager,
  Scene,
  ServerLayer3D,
  SRSType,
  VectorLayer3D,
  Viewpoint
} from '@mapgis/uniform-core-react-native';
import { OP_FILE_PATH1, SHP_FILE_PATH } from '../utils';
import Slider from '@react-native-community/slider';

export default class SceneLayerControl extends Component {
  static navigationOptions = { title: '场景图层控制功能' };

  constructor(props) {
    super(props);
    this.state = {
      loadSceneDisabled: false,
      showLoading: false,

      modalVisible: false,
      layerArray: [],
      selected: '可见',
    };
  }

  onGetInstance = sceneView => {
    this.sceneView = sceneView;
    this.openMap();
  };

  openMap = async () => {
    this.serverLayer3D = await ServerLayer3D.createInstance();
  };

  componentWillUnmount = () => {
    this.disposeMap();
  };

  disposeMap = async () => {
    await ObjectManager.disposeAll();
  };

  loadScene = async () => {
    this.setState({ showLoading: true });

    this.scene = await Scene.createInstance();
    let groupLayer3D = await GroupLayer3D.createInstance();
    await groupLayer3D.setName('组图层');

    await this.serverLayer3D.setName('Google');
    await this.serverLayer3D.setDriverType(DriverType.Driver_Type_XYZ);
    await this.serverLayer3D.setSRSByString(SRSType.SRS_Type_Global_MERCATOR);
    await this.serverLayer3D.setTransparency(20);

    await this.serverLayer3D.setURL('http://wprd0[1234].is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=6&x={x}&y={y}&z={z}&scl=1&ltype=11');

    let cacheLayer3D = await ModelCacheLayer3D.createInstance();
    await cacheLayer3D.setName('大雁塔');
    await cacheLayer3D.setDriverType(DriverType.Driver_Type_Model_MapGIS_OP);
    await cacheLayer3D.setURL(OP_FILE_PATH1);
    await cacheLayer3D.setLightingEnabled(false);

    let vectorLayer3D = await VectorLayer3D.createInstance();
    await vectorLayer3D.setName('shp');
    await vectorLayer3D.setDriverType(DriverType.Driver_Type_OGR);
    await vectorLayer3D.setURL(SHP_FILE_PATH);

    await groupLayer3D.addLayer(this.serverLayer3D);
    await groupLayer3D.addLayer(vectorLayer3D);
    await groupLayer3D.addLayer(cacheLayer3D);
    await this.scene.addLayer(groupLayer3D);

    await this.sceneView.setSceneAsync(this.scene);

    this.setState({ showLoading: false, loadSceneDisabled: true });
  };

  // 获取地图图层数据并显示
  setModalVisible = async isModalVisible => {
    let layers = [];
    if (this.scene !== null && this.scene !== undefined) {
      let count = await this.scene.getLayerCount();
      for (let i = 0; i < count; i++) {
        let rootLayer3D = await this.scene.getLayer(i);
        let layerType = await rootLayer3D.getType();
        // 子图层
        if (layerType == Layer3DType.Group) {
          let groupLayer3D = new GroupLayer3D();
          groupLayer3D.ObjId = rootLayer3D.ObjId;

          let groupLayerCount = await groupLayer3D.getLayerCount();
          for (let b = 0; b < groupLayerCount; b++) {
            let groupLayer = await groupLayer3D.getLayer(b)

            let layerId = groupLayer.ObjId;
            let layerName = await groupLayer.getName();
            let layerState = await groupLayer.getState();
            let layer = {
              id: layerId,
              layer: groupLayer,
              name: layerName,
              visible: layerState === LayerState.Visible ? '可见' : '不可见',
            };
            layers.push(layer);
          }
        }
      }
      this.setState({ modalVisible: isModalVisible, layerArray: layers });
    } else {
      ToastAndroid.show('请先加载场景！', ToastAndroid.SHORT);
    }
  };

  // 更改地图图层可见性
  jumpPoint = async (item) => {
    let layerArray = this.state.layerArray;
    let index = layerArray.indexOf(item);
    if (index === 2) {
      let viewpoint5 = await Viewpoint.createInstance();
      let dot3d = await Dot3D.createInstance(108.959624, 34.219806, -0.000005);
      viewpoint5.setFocalPoint(dot3d);
      viewpoint5.setHeadingDeg(0.75804232150415196);
      viewpoint5.setPitchDeg(-16.093499328460833);
      viewpoint5.setRange(1000);
      this.sceneView.jumptoViewPoint(viewpoint5, 2.0);
      this.setState({ modalVisible: false });
    }
  };

  // 更改地图图层可见性
  changeMapLayerVisible = async (item) => {
    let layerArray = this.state.layerArray;
    let index = layerArray.indexOf(item);
    let rootLayer3D = item.layer;

    if (item.visible === '可见') {
      // 更改可见为不可见，selected可用于刷新列表
      item.visible = '不可见';

      // 更改图层可见性
      await rootLayer3D.setState(LayerState.UnVisible);

      layerArray[index] = item;
      this.setState({
        layerArray: layerArray,
        selected: '不可见' + item.id,
      });
    } else {
      item.visible = '可见';

      await rootLayer3D.setState(LayerState.Visible);

      layerArray[index] = item;
      this.setState({
        layerArray: layerArray,
        selected: '可见' + item.id,
      });
    }
    await this.sceneView.forceRefresh();
  };

  // 生成图层列表项
  _renderItem = item => {
    return (
      <View style={style.itemView}>
        <TouchableOpacity
          style={style.touchableKey}
          activeOpacity={0.5}
          onPress={() => {
            this.jumpPoint(item);
          }}
        >
          <Text style={style.itemKey}>{item.name}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={style.touchableValue}
          activeOpacity={0.5}
          onPress={() => {
            this.changeMapLayerVisible(item);
          }}
        >
          <Text style={style.itemValue}>{item.visible}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // 列表项分割线
  _separator = () => {
    return <View style={style.separator} />;
  };

  render() {
    return (
      <View style={styles.container}>
        <MGSceneView
          ref='sceneView'
          onGetInstance={this.onGetInstance}
          style={styles.sceneView}
        />

        <View style={styles.controls}>

          <View style={styles.button}>
            <TouchableOpacity
              disabled={this.state.loadSceneDisabled}
              onPress={() => {
                this.loadScene();
              }}
            >
              <Text style={styles.text}>加载场景</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.button}>
            <TouchableOpacity
              onPress={() => {
                this.setModalVisible(true);
              }}
            >
              <Text style={styles.text}>图层管理</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.control}>
            <Text style={styles.label}>透明度</Text>
            <Slider style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              onValueChange={async value => {
                await this.serverLayer3D.setTransparency(value);
              }}
            />
          </View>
        </View>

        <ActivityIndicator
          animating={this.state.showLoading}
          style={[styles.centering, { height: 80 }]}
          size='large' />

        <Modal
          animationType={'slide'}
          transparent={true}
          visible={this.state.modalVisible}
          onRequestClose={() => {
            this.setModalVisible(false);
          }}
        >
          <FlatList
            style={style.flatListBackground}
            data={this.state.layerArray}
            extraData={this.state.layerArray} // 可用于指定其他数据或者当点击项时候刷新列表
            keyExtractor={item => item.id}
            renderItem={({ item }) => this._renderItem(item)}
            ItemSeparatorComponent={this._separator}
          />
        </Modal>

      </View>
    );
  }
}

const style = StyleSheet.create({
  button: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  itemTitle: {
    justifyContent: 'center',
    flexDirection: 'row',
    fontSize: 14,
  },
  flatListBackground: {
    backgroundColor: '#ffffff',
    flex: 1,
    marginLeft: '20%',
    marginRight: '20%',
    marginTop: '20%',
    marginBottom: '20%',
  },

  // 图层列表背景色
  itemView: {
    backgroundColor: '#ffffff',
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'nowrap',
    margin: 5,
  },
  touchableKey: {
    padding: 10,
    flex: 3,
  },
  touchableValue: {
    padding: 10,
    flex: 1,
  },
  // item的图层名称样式
  itemKey: {
    fontSize: 16,
    color: '#333333',
  },
  // item的可见字体样式
  itemValue: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  separator: {
    flex: 1,
    height: 1,
    backgroundColor: '#F5F5F5',
  },
});