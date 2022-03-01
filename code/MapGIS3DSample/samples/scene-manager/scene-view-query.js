import React, { Component } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  DeviceEventEmitter,
} from 'react-native';
import styles from '../styles';
import {
  MGSceneView,
  ServerLayer3D,
  DriverType,
  SRSType,
  Scene,
  SunLightingMode,
  Dot3D,
  Viewpoint,
  ModelCacheLayer3D,
  SelectionProperties,
  SelectionStyle,
  Dot,
  FeatureQuery3D,
  QueryDef,
  Feature3D,
  ObjectManager,
} from '@mapgis/mobile-react-native';

export default class SceneViewQuery extends Component {
  static navigationOptions = { title: '图层查询功能' };

  constructor(props) {
    super(props);
    this.state = {
      showLoading: false,
      isStop: false,
      styleState: 0,
      featureIDs: [],
      selectedItems: [],
      mapInfo: new Map(),
    };
  }

  onGetInstance = sceneView => {
    this.sceneView = sceneView;
    this.openMap();
  };

  openMap = async () => {
    await this.sceneView.setSunLightingMode(SunLightingMode.NONE);
    await this.sceneView.setAutoClipPlaneEnabled(true);

    //初始化场景
    this.setState({ showLoading: true });

    let scene = await Scene.createInstance();

    //影像
    let serverlayer = await ServerLayer3D.createInstance();
    await serverlayer.setDriverType(DriverType.Driver_Type_XYZ);
    await serverlayer.setSRSByString(SRSType.SRS_Type_Global_MERCATOR);

    await serverlayer.setURL('http://wprd0[1234].is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=6&x={x}&y={y}&z={z}&scl=1&ltype=11');

    //m3d模型缓存服务
    this.serverModelCacheLayer = await ServerLayer3D.createInstance();
    let mapServer = await ServerLayer3D.createMapServer(ServerLayer3D.MapServerType.MAPSERVER_TYPE_IGSERVER_SCENE);
    await mapServer.setURL('http://develop.smaryun.com:6163/igs/rest/g3d/jingguan');
    await this.serverModelCacheLayer.setMapServer(mapServer);

    await scene.addLayer(serverlayer);
    await scene.addLayer(this.serverModelCacheLayer);

    let success = await this.sceneView.setSceneAsync(scene)
    if (success) {
      let dot3d = await Dot3D.createInstance(108.961100, 34.220175, 0)
      let viewpointDaYanTa = await Viewpoint.createInstanceByParam(dot3d, 0.75804232150415196, -16.093499328460833, 200);
      await this.sceneView.jumptoViewPoint(viewpointDaYanTa, 2.0);
    }
    this.setState({ showLoading: false });
  };

  componentWillUnmount = () => {
    this.disposeMap();

    this.sceneTapListener.remove();
  };

  disposeMap = async () => {
    await ObjectManager.disposeAll();
  };

  componentDidMount() {
    this.sceneTapListener = DeviceEventEmitter.addListener(
      'com.mapgis.RN.SceneView.SingleTapEvent',
      res => {
        this.onTapEvent(res.x, res.y);
      }
    );
  }

  onTapEvent = async (x, y) => {
    //拾取
    let b = await this.identifyLayer(this.modelCacheLayer, x, y);
    if (b) {
      //高亮显示
      await this.highLightFeature(this.state.featureIDs);

      //在线查询
      await this.igsQuery();
    }
    else {
      await this.reset();
    }

    if (this.state.styleState == 1) {
      this.changeButtonColor('高亮样式1');
    }
    if (this.state.styleState == 2) {
      this.changeButtonColor('高亮样式2');
    }
  };

  identifyLayer = async (modelCacheLayer, x, y) => {
    if (this.state.featureIDs.length > 0) {
      this.setState({ featureIDs: [] });
    }

    let dot = await Dot.createInstance(x, y);
    //拾取
    let identifyRes = await this.sceneView.identifyLayer(modelCacheLayer, dot, 0.0, 10);

    //获取到拾取的要素列表
    let elements = await identifyRes.getElements();
    if (elements.length <= 0) {
      return false;
    }

    let ids = this.state.featureIDs;
    let info = this.state.mapInfo;
    for (let i = 0; i < elements.length; i++) {
      let element = elements[i];

      if (element !== null && element !== undefined) {
        //获取拾取要素的属性信息
        let mapAttr = await element.getAttributes();
        let strLayerID = mapAttr.layer_id; //图层id
        let strBatchID = mapAttr.batch_id; //分块id
        let strFeatureID = mapAttr.feature_id; //要素id

        info.set('layerId', strLayerID);
        info.set('batchId', strBatchID);
        info.set('featureId', strFeatureID);

        ids.push(Number(strFeatureID));
      }
    }
    this.setState({ featureIDs: ids, mapInfo: info });

    if (this.state.featureIDs.length > 0)
      return true;
    else
      return false;
  };

  igsQuery = async () => {
    let strBaseURl = 'http://develop.smaryun.com:6163/igs';
    let strDataName = 'gdbp://MapGisLocal/示例数据/ds/三维示例/sfcls/景观_模型';
    //设置查询条件
    let query = await FeatureQuery3D.createInstance(strBaseURl, strDataName);
    let queryDef = await QueryDef.createInstance();
    await queryDef.setFilter('&objectIds=' + this.state.featureIDs[0]);
    await queryDef.setPagination(1, 10);
    await queryDef.setSubFields('*');
    await queryDef.setWithSpatial(true);
    await query.setQueryDef(queryDef);

    //查询
    let queryRes = await query.query3D();
    let count = await queryRes.getPageCount();

    //查询结果展示
    let info = this.state.mapInfo;
    for (let i = 1; i <= count; i++) {
      let features = await queryRes.getPage(i);
      for (let j = 0; j < features.length; j++) {
        let feature = features[j];

        if (feature !== null && feature !== undefined) {
          let feature3D = new Feature3D();
          feature3D.ObjId = feature.ObjId;

          //获取要素的属性信息
          let featureAttr = await feature3D.getAttributes();
          if (featureAttr !== null && featureAttr !== undefined) {
            info.set('floor', featureAttr.楼层);
            info.set('height', featureAttr.层高);
            info.set('type', featureAttr.房屋类型);
          }
        }
      }
    }
    this.setState({ mapInfo: info });
  };

  startIdentifyLayer = async () => {
    if (this.serverModelCacheLayer !== null && this.serverModelCacheLayer !== undefined) {

      let layerCount = await this.serverModelCacheLayer.getLayerCount();
      for (let i = 0; i < layerCount; i++) {
        let layer3D = await this.serverModelCacheLayer.getLayer(i)
        if (layer3D !== null && layer3D !== undefined) {
          this.modelCacheLayer = new ModelCacheLayer3D();
          this.modelCacheLayer.ObjId = layer3D.ObjId;

          await this.sceneView.registerTapListener();
        }
      }

      this.setState({ isStop: false, styleState: 1 });

      await this.highLightFeature(this.state.featureIDs);

      this.changeButtonColor('开始拾取');
    }
  };

  selectionFeature = async () => {
    if (!this.state.isStop) {
      this.setState({ styleState: 1 });

      await this.clearSelection();
      await this.highLightFeature(this.state.featureIDs);

      this.changeButtonColor('高亮样式1');
    }
  };

  selectionFeature2 = async () => {
    if (!this.state.isStop) {
      this.setState({ styleState: 2 });

      await this.clearSelection();
      await this.highLightFeature(this.state.featureIDs);

      this.changeButtonColor('高亮样式2');
    }
  };

  stopIdentifyLayer = async () => {
    await this.sceneView.unregisterTapListener();
    this.setState({ isStop: true });

    await this.reset();
    await this.clearSelection();

    this.changeButtonColor('结束拾取');
  };

  reset = async () => {
    if (this.state.featureIDs.length > 0) {
      this.setState({ featureIDs: [] });
    }

    this.setState({ mapInfo: new Map() });
  };

  clearSelection = async () => {
    if (this.modelCacheLayer !== null && this.modelCacheLayer !== undefined) {
      await this.modelCacheLayer.clearSelection();
    }
  };

  highLightFeature = async (featureIDs) => {
    if (featureIDs.length > 0) {
      //高亮样式1
      if (this.modelCacheLayer !== null && this.modelCacheLayer !== undefined) {
        await this.modelCacheLayer.selectFeature(featureIDs[0]);
      }

      //高亮样式2
      if (this.state.styleState === 2) {
        let selPros = await SelectionProperties.createInstance();
        let unSelStyle = await SelectionStyle.createInstance();
        //全透明
        await unSelStyle.setFillColor('rgba(0, 0, 0, 255)');
        await selPros.setUnSelectionStyle(unSelStyle);

        if (this.modelCacheLayer !== null && this.modelCacheLayer !== undefined) {
          await this.modelCacheLayer.setSelectionProperties(selPros);
        }
      }
    }
  };

  changeButtonColor = async (id) => {
    if (id === '开始拾取' || id === '高亮样式1') {
      this.setState({ selectedItems: ['开始拾取', '高亮样式1'] });
    } else if (id === '高亮样式2') {
      this.setState({ selectedItems: ['开始拾取', '高亮样式2'] });
    } else {
      this.setState({ selectedItems: ['结束拾取'] });
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

        <View style={styles.buttons}>
          <View style={styles.button}>
            <TouchableOpacity
              onPress={() => {
                this.startIdentifyLayer();
              }}
            >
              <Text style={{
                fontSize: 16,
                color: this.state.selectedItems.indexOf('开始拾取') > -1 ? ('#ffff00') : ('#fff'),
              }}>开始拾取</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.button}>
            <TouchableOpacity
              onPress={() => {
                this.selectionFeature();
              }}
            >
              <Text style={{
                fontSize: 16,
                color: this.state.selectedItems.indexOf('高亮样式1') > -1 ? ('#ffff00') : ('#fff'),
              }}>高亮样式1</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.button}>
            <TouchableOpacity
              onPress={() => {
                this.selectionFeature2();
              }}
            >
              <Text style={{
                fontSize: 16,
                color: this.state.selectedItems.indexOf('高亮样式2') > -1 ? ('#ffff00') : ('#fff'),
              }}>高亮样式2</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.button}>
            <TouchableOpacity
              onPress={() => {
                this.stopIdentifyLayer();
              }}
            >
              <Text style={{
                fontSize: 16,
                color: this.state.selectedItems.indexOf('结束拾取') > -1 ? ('#ffff00') : ('#fff'),
              }}>结束拾取</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={style.itemView}>
          <Text style={style.itemKey}>图层id</Text>
          <Text style={style.itemValue}>
            {this.state.mapInfo.get('layerId')}
          </Text>

          <Text style={style.itemKey}>分块id</Text>
          <Text style={style.itemValue}>
            {this.state.mapInfo.get('batchId')}
          </Text>

          <Text style={style.itemKey}>要素id</Text>
          <Text style={style.itemValue}>
            {this.state.mapInfo.get('featureId')}
          </Text>

          <Text style={style.itemKey}>楼层</Text>
          <Text style={style.itemValue}>
            {this.state.mapInfo.get('floor')}
          </Text>

          <Text style={style.itemKey}>层高</Text>
          <Text style={style.itemValue}>
            {this.state.mapInfo.get('height')}
          </Text>

          <Text style={style.itemKey}>房屋类型</Text>
          <Text style={style.itemValue}>
            {this.state.mapInfo.get('type')}
          </Text>

        </View>

        <ActivityIndicator
          animating={this.state.showLoading}
          style={[styles.centering, { height: 80 }]}
          size='large' />
      </View>
    );
  }
}

const style = StyleSheet.create({
  itemView: {
    width: 180,
    flexDirection: 'column',
    flexWrap: 'wrap',
    elevation: 4,
    position: 'absolute',
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
    backgroundColor: '#292c36aa',
    paddingLeft: 10,
    paddingRight: 10,
  },
  // item的可见字体样式
  itemKey: {
    fontSize: 14,
    color: '#rgba(245,83,61,0.8)',
    flexDirection: 'column',
    textAlign: 'left',
    flexWrap: 'wrap',
  },
  // item的可见字体样式
  itemValue: {
    fontSize: 14,
    color: '#fff',
    flexDirection: 'column',
    textAlign: 'left',
    flexWrap: 'wrap',
    paddingLeft: 5,
  },
});
