import React, { Component } from 'react';
import {
  View,
  ToastAndroid,
  Text,
  Button,
  StyleSheet,
  TextInput,
  DeviceEventEmitter,
  FlatList,
} from 'react-native';
import styles from '../styles';
import { MAPX_FILE_PATH } from '../utils';
import { ANN_FILE_PATH } from '../utils';
import {
  Rect,
  MGMapView,
  Dot,
  FeatureQuery,
  Image,
  Annotation,
  VectorLayer,
  QueryDef,
  GeometryType,
  GeoPoint,
  GeoMultiPoint,
} from '@mapgis/mobile-react-native';

/**
 * @content 属性查询
 * @author fjl 2019-7-25 下午2:52:36
 */
export default class MapPopertyQuery extends Component {
  static navigationOptions = { title: '属性查询' };

  constructor() {
    super();
    this.state = {
      result: [],
      text: '',
    };
  }

  onGetInstance = mapView => {
    this.mapView = mapView;
    this.openMap();
  };

  openMap = async () => {
    await this.mapView.registerMapLoadListener();
    await this.mapView.loadFromFile(MAPX_FILE_PATH);
  };

  componentDidMount() {
    this.mapLoadListener = DeviceEventEmitter.addListener(
      'com.mapgis.RN.Mapview.LoadMapListener_Finish',
      async res => {
        if (res.DidFinishLoadingMap) {
          let mapRange = await Rect.createInstance(
            12705276.572663,
            3542912.332349,
            12746062.17078,
            3607262.942711
          );
          await this.mapView.zoomToRange(mapRange, false);
        }
      }
    );
  }

  componentWillUnmount() {
    this.mapLoadListener.remove();
  }

  _featureQuery = async () => {
    //清空绘图层
    let graphicsOverlay = await this.mapView.getGraphicsOverlay();
    await graphicsOverlay.removeAllGraphics();
    //清空标注层
    let annotationsOverlay = await this.mapView.getAnnotationsOverlay();
    await annotationsOverlay.removeAllAnnotations();

    let condition = '';
    if (this.state.text.length === 0) {
      ToastAndroid.show('查询关键字默认为"公园"', ToastAndroid.SHORT);
      condition = "Name like '%公园%'";
    } else {
      condition = "Name like '%" + this.state.text + "%'";
    }
    let map = await this.mapView.getMap();
    let vectorLayer = new VectorLayer();
    //获取查询图层对象（指定区图层）
    for (let i = 0; i < (await map.getLayerCount()); i++) {
      let mapLayer = await map.getLayer(i);
      if ((await mapLayer.getName()) === '四级点') {
        vectorLayer.ObjId = mapLayer.ObjId;
        break;
      }
    }
    if (vectorLayer.ObjId !== '') {
      let query = await FeatureQuery.createInstanceByVectorLayer(vectorLayer);

      let queryDef = await QueryDef.createInstance();
      await queryDef.setPagination(0, 10000);
      await queryDef.setFilter(condition);
      await queryDef.setWithSpatial(true);
      await queryDef.setSubFields('*');
      await query.setQueryDef(queryDef);

      let featurePagedResult = await query.query();
      let getTotalFeatureCount = await featurePagedResult.getTotalFeatureCount();

      let fields = await featurePagedResult.getFields();
      let fieldCount = await fields.getFieldCount();
      let strFieldName = '';
      let IsExistName = false;
      for (let i = 0; i < fieldCount; i++) {
        let field = await fields.getField(i);
        // 获取字段名称
        strFieldName = await field.getFieldName();
        // 显示获取到的属性信息
        if (strFieldName === 'Name') {
          IsExistName = true;
          break;
        } else {
          strFieldName = '';
        }
      }
      let featureName = '';
      let result = [];
      let featureLst = await featurePagedResult.getPage(1);
      for (let j = 0; j < featureLst.length; j++) {
        let feature = await featureLst[j];
        let attributes = await feature.getAttributes();
        // 显示获取到的属性信息
        if (IsExistName === true) {
          //结果要素名称
          featureName = attributes[strFieldName];
          // 结果列表数组
          result.push({ name: featureName, key: j.toString() });
        }
        //获取要素的几何信息（默认查询点要素）
        let fGeometry = await feature.getGeometry();
        let featureType = await fGeometry.getType();
        let dotX = 0;
        let dotY = 0;
        if (featureType === GeometryType.GeoPoint) {
          let geoPoint = new GeoPoint();
          geoPoint.ObjId = fGeometry.ObjId;

          let dots3D = await geoPoint.get();
          dotX = await dots3D.getX();
          dotY = await dots3D.getY();
        } else if (featureType === GeometryType.GeoMultiPoint) {
          let geoPoints = new GeoMultiPoint();
          geoPoints.ObjId = fGeometry.ObjId;

          let dots3D = await geoPoints.get(0);
          dotX = await dots3D.getX();
          dotY = await dots3D.getY();
        }
        let point = await Dot.createInstance(dotX, dotY);
        let bmp = await Image.createInstanceByLocalPath(ANN_FILE_PATH);
        let annotation = await Annotation.createInstance(
          featureName,
          featureName,
          point,
          bmp
        );
        annotation.setCanShowAnnotationView(true);
        await annotationsOverlay.addAnnotation(annotation);
      }

      this.setState({ result });

      await this.mapView.refresh();
      ToastAndroid.show(
        '查询结果总数为：' + getTotalFeatureCount,
        ToastAndroid.SHORT
      );
    }
  };

  renderItem = ({ item }) => (
    <View style={localStyles.item}>
      {<Text style={localStyles.itemValue}>{item.name}</Text>}
    </View>
  );

  _separator = () => {
    return <View style={{ height: 1, backgroundColor: 'black' }} />;
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={[styles.form, { flexDirection: 'row' }]}>
          <TextInput
            style={styles.input}
            returnKeyType="search"
            placeholder="查询四级POI点，请输入关键字"
            placeholderTextColor="#9e9e9e"
            selectionColor="rgba(245,83,61,0.8)"
            onChangeText={text => this.setState({ text })}
            onSubmitEditing={this.search}
          />
          <Button title="属性查询" onPress={this._featureQuery} />
        </View>
        <MGMapView
          ref="mapView"
          onGetInstance={this.onGetInstance}
          style={styles.mapView}
        />
        <FlatList
          style={localStyles.items}
          data={this.state.result}
          renderItem={this.renderItem}
          ItemSeparatorComponent={this._separator}
        />
      </View>
    );
  }
}

const localStyles = StyleSheet.create({
  items: {
    flex: 1,
    backgroundColor: '#292c36',
  },
  item: {
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: 10,
    paddingBottom: 10,
  },
  itemValue: {
    marginLeft: 8,
    color: 'white',
    fontSize: 16,
  },
});
