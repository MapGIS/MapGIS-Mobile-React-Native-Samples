import React, { Component } from 'react';
import {
  Alert,
  View,
  ToastAndroid,
  DeviceEventEmitter,
  Text,
  TouchableOpacity,
} from 'react-native';
import styles from '../styles';
import { MAPX_FILE_PATH } from '../utils';
import { ANN_FILE_PATH } from '../utils';
import {
  Rect,
  MGMapView,
  Dot,
  GraphicPoint,
  QueryDef,
  FeatureQuery,
  GraphicPolygon,
  AnnotationView,
  Image,
  Annotation,
  SpaQueryMode,
  GeometryType,
  GeoPoint,
  GeoMultiPoint,
} from '@mapgis/uniform-core-react-native';

/**
 * @content 复合查询
 * @author fjl 2019-7-25 下午2:52:36
 */
export default class MapCompoundQuery extends Component {
  static navigationOptions = { title: '复合查询' };
  constructor() {
    super();
    this.state = {
      queryRect: null,
      firstDot: null,
      secondDot: null,
      isFirstPoint: true,
      isClickTwo: false,
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

  componentWillUnmount() {
    this.mapLoadListener.remove();
  }

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

    DeviceEventEmitter.addListener(
      'com.mapgis.RN.Mapview.single_tap_event',
      async res => {
        let graphicPoint = await GraphicPoint.createInstance();
        let dot = await Dot.createInstance(res.x, res.y);
        await graphicPoint.setPointAndSize(dot, 5);

        if (this.state.isFirstPoint) {
          this.setState({
            isFirstPoint: false,
            firstDot: dot,
            isClickTwo: false,
          });
          this.setState({ isClickTwo: false });
        } else {
          this.setState({
            isFirstPoint: true,
            secondDot: dot,
            isClickTwo: true,
          });
          this.setState({ isClickTwo: true });
        }
        let graphicsOverlay = await this.mapView.getGraphicsOverlay();
        await graphicsOverlay.addGraphic(graphicPoint);
        await this.mapView.refresh();

        if (this.state.isClickTwo) {
          let xmin, xmax, ymin, ymax;

          let leftDot = this.state.firstDot;
          let rightDot = this.state.secondDot;

          xmin = await leftDot.getX();
          xmax = await rightDot.getX();
          ymin = await leftDot.getY();
          ymax = await rightDot.getY();

          let dotArray = [];
          let dot1 = await Dot.createInstance(xmin, ymin);
          let dot2 = await Dot.createInstance(xmin, ymax);
          let dot3 = await Dot.createInstance(xmax, ymax);
          let dot4 = await Dot.createInstance(xmax, ymin);
          dotArray.push(dot1);
          dotArray.push(dot2);
          dotArray.push(dot3);
          dotArray.push(dot4);
          dotArray.push(dot1);
          //为rect赋予范围
          let qryRect = await Rect.createInstance(xmin, ymin, xmax, ymax);
          this.setState({ queryRect: qryRect });

          let graphicPolygon = await GraphicPolygon.createInstance();

          await graphicPolygon.setColor('rgba(130, 130,130, 180)');
          await graphicPolygon.setBorderlineColor('rgba(100, 200, 0, 180)');
          await graphicPolygon.setBorderlineWidth(10);
          await graphicPolygon.setPoints(dotArray, null);

          await graphicsOverlay.removeAllGraphics();
          await graphicsOverlay.addGraphic(graphicPolygon);
          let annotationsOverlay = await this.mapView.getAnnotationsOverlay();
          await annotationsOverlay.removeAllAnnotations();
          await this.mapView.refresh();
          Alert.alert('属性查询条件', "Name like '%公园%'", [
            { text: '查询', onPress: this.featureQuery },
            { text: '取消', onPress: this.queryCancel },
          ]);
        }
      }
    );

    DeviceEventEmitter.addListener(
      'com.mapgis.RN.Mapview.AnnotationListenerA_ViewByAnn',
      async res => {
        let { ObjId } = res;
        let annotation = new Annotation();
        annotation.ObjId = ObjId;
        let annotationView = await AnnotationView.createInstance(
          this.mapView,
          annotation
        );
        return annotationView;
      }
    );
  }

  featureQuery = async () => {
    //清空标注层
    let annotationsOverlay = await this.mapView.getAnnotationsOverlay();
    await annotationsOverlay.removeAllAnnotations();

    let condition = "Name like '%公园%'";

    let queryDef = await QueryDef.createInstance();
    await queryDef.setRect(this.state.queryRect, SpaQueryMode.ModeMBRIntersect);

    let map = await this.mapView.getMap();
    let mapLayer = await map.getLayer(11);
    if (mapLayer != null) {
      let query = await FeatureQuery.createInstanceByVectorLayer(mapLayer);

      await queryDef.setPagination(0, 20);
      await queryDef.setSubFields('*');
      await queryDef.setWithSpatial(true);
      await queryDef.setFilter(condition); //注意sql语句的写法，如果不知道的话可以先在桌面工具中测试是否可用
      await query.setQueryDef(queryDef);

      let featurePagedResult = await query.query();
      let getTotalFeatureCount = await featurePagedResult.getTotalFeatureCount();

      let strFieldName = 'Name';
      let featureName = '';
      let featureLst = await featurePagedResult.getPage(1);
      for (let j = 0; j < featureLst.length; j++) {
        let feature = await featureLst[j];
        let attributes = await feature.getAttributes();
        featureName = attributes[strFieldName];

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
        await annotationsOverlay.addAnnotation(annotation);
        await this.mapView.registerAnnotationListener();
      }
      await this.mapView.forceRefresh();
      ToastAndroid.show(
        '查询结果总数为：' + getTotalFeatureCount,
        ToastAndroid.LONG
      );
    }
  };

  queryCancel = async () => {
    let graphicsOverlay = await this.mapView.getGraphicsOverlay();
    await graphicsOverlay.removeAllGraphics();
    let annotationsOverlay = await this.mapView.getAnnotationsOverlay();
    await annotationsOverlay.removeAllAnnotations();
    await this.mapView.refresh();
  };

  compoundQry = async () => {
    ToastAndroid.show(
      '提示：在地图上点击两点确定范围，属性查询“四级点”图层名称含“公园”的POI点',
      ToastAndroid.LONG
    );

    await this.mapView.registerTapListener();
    let graphicsOverlay = await this.mapView.getGraphicsOverlay();
    await graphicsOverlay.removeAllGraphics();
    //清空标注层
    let annotationsOverlay = await this.mapView.getAnnotationsOverlay();
    await annotationsOverlay.removeAllAnnotations();
    await this.mapView.refresh();
  };

  render() {
    return (
      <View style={styles.container}>
        <MGMapView
          ref="mapView"
          onGetInstance={this.onGetInstance}
          style={styles.mapView}
        />
        <View style={styles.buttons}>
          <View style={styles.button}>
            <TouchableOpacity onPress={this.compoundQry}>
              <Text style={styles.text}>拉框复合查询</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
}
