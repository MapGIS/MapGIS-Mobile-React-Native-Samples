import React, { Component } from 'react';
import {
  View,
  Picker,
  ToastAndroid,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import styles from '../styles';
import { IGSERVER_DOC_WUHANEDIT_PATH, IGSERVER_BASE_URL } from '../utils';
import {
  MGMapView,
  MapServer,
  ImageLayer,
  Rect,
  FeatureEdit,
  Feature,
  PntInfo,
  LinInfo,
  RegInfo,
  Dot3D,
  GeoMultiPoint,
  GeoVarLine,
  Dot,
  Dots,
  GeoPolygon,
  FeatureQuery,
  TextAnno,
  TextAnnInfo,
  QueryDef,
  IntList,
  Map,
} from '@mapgis/uniform-core-react-native';

export default class MapIGServerEdit extends Component {
  static navigationOptions = { title: '在线要素编辑(固定信息)' };

  constructor() {
    super();
    this.state = {
      selectedOper: 'point',
      selectedData: 'doc',
    };
  }
  onGetInstance = mapView => {
    this.mapView = mapView;
    this.openMap();
  };

  openMap = async () => {
    this.map = await Map.createInstance();

    let mapServer = await ImageLayer.createMapServer(
      MapServer.MapServerType.MAPSERVER_TYPE_IGSERVER_VECTOR
    );
    // 设置服务图层名称
    await mapServer.setName('武汉市地图');
    // 设置服务图层的URL
    await mapServer.setURL(IGSERVER_DOC_WUHANEDIT_PATH);

    let serverLayer = await ImageLayer.createInstance();
    await serverLayer.setMapServer(mapServer);

    if (this.map !== null) {
      await this.map.append(serverLayer);
      let isFinish = await this.mapView.setMapAsync(this.map);
      if (isFinish) {
        ToastAndroid.show('地图加载完成', ToastAndroid.SHORT);
        let rectObj = await Rect.createInstance(
          12713829.688773,
          3560429.023803,
          12743279.560137,
          3606894.376399
        );
        await this.mapView.zoomToRange(rectObj, false);
      } else {
        ToastAndroid.show(
          '在线地图加载失败，请确保网络已连接',
          ToastAndroid.SHORT
        );
      }
    }
  };

  changeEditOperValue = (itemValue, itemIndex) => {
    this.setState({ selectedOper: itemValue });
  };

  changeEditDataValue = (itemValue, itemIndex) => {
    this.setState({ selectedData: itemValue });
  };

  addFeature = async () => {
    if (this.state.selectedOper === 'point') {
      this.addPoint();
    } else if (this.state.selectedOper === 'line') {
      this.addLine();
    } else if (this.state.selectedOper === 'reg') {
      this.addPolygon();
    }
  };

  editFeature = async () => {
    if (this.state.selectedOper === 'point') {
      this.modifyPoint();
    } else if (this.state.selectedOper === 'line') {
      this.modifyLine();
    } else if (this.state.selectedOper === 'reg') {
      this.modifyPolygon();
    }
  };

  deleteFeature = async () => {
    if (this.state.selectedOper === 'point') {
      this.deletePoint();
    } else if (this.state.selectedOper === 'line') {
      this.deleteLine();
    } else if (this.state.selectedOper === 'reg') {
      this.deletePolygon();
    }
  };

  addPoint = async () => {
    //创建要素编辑对象
    let featureEdit = null;
    //根据基地址、地图文档名称、地图ID、图层 ID构造FeatureEdit对象，此种方法需要配置地图文档，并发布到igserver服务器中
    if (this.state.selectedData === 'doc') {
      featureEdit = await FeatureEdit.createInstanceByIGSDoc(
        IGSERVER_BASE_URL,
        'WuHanEdit',
        0,
        8
      ); //一级点图层
    }
    //根据基地址、图层数据地址构造FeatureEdit对象，此种方法可以不用配置地图文档，获取到URL地址直接使用即可
    else if (this.state.selectedData === 'cls') {
      featureEdit = await FeatureEdit.createInstanceByIGSData(
        IGSERVER_BASE_URL,
        'gdbp://MapGisLocal/武汉MKT/sfcls/自绘点'
      );
    }

    //属性
    let attribute = { Name: '自定义站' };

    //几何信息
    let dot = await Dot3D.createInstance(12727052.6, 3578030.02, 0);
    let point = await GeoMultiPoint.createInstance();
    await point.append(dot);

    //样式信息
    let pntInfo = await PntInfo.createInstance();
    await pntInfo.setHeight(600);
    await pntInfo.setWidth(600);
    await pntInfo.setSymID(177);
    await pntInfo.setOutClr1(6); //颜色1

    let pointFeature = await Feature.createInstanceByParam(
      attribute,
      point,
      pntInfo
    );
    //添加
    let result = await featureEdit.append(pointFeature);
    if (result > 0) {
      ToastAndroid.show('添加点成功', ToastAndroid.SHORT);
      await this.mapView.forceRefresh();
    } else {
      ToastAndroid.show('添加点失败', ToastAndroid.SHORT);
    }
  };

  modifyPoint = async () => {
    let featureEdit = null;
    let featureQuery = null;
    //根据基地址、地图文档名称、地图ID、图层 ID构造FeatureEdit对象，此种方法需要配置地图文档，并发布到igserver服务器中
    if (this.state.selectedData === 'doc') {
      featureEdit = await FeatureEdit.createInstanceByIGSDoc(
        IGSERVER_BASE_URL,
        'WuHanEdit',
        0,
        8
      ); //一级点图层
      featureQuery = await FeatureQuery.createInstanceByIGSDoc(
        IGSERVER_BASE_URL,
        'WuHanEdit',
        0,
        8
      ); //一级点图层
    }
    //根据基地址、图层数据地址构造FeatureEdit对象，此种方法可以不用配置地图文档，获取到URL地址直接使用即可
    else if (this.state.selectedData === 'cls') {
      featureEdit = await FeatureEdit.createInstanceByIGSData(
        IGSERVER_BASE_URL,
        'gdbp://MapGisLocal/武汉MKT/sfcls/自绘点'
      );
      featureQuery = await FeatureQuery.createInstanceByIGSData(
        IGSERVER_BASE_URL,
        'gdbp://MapGisLocal/武汉MKT/sfcls/自绘点'
      );
    }

    //属性查询，查询新添加的要素
    //注意sql语句的写法，如果不知道的话可以先在桌面工具中测试是否可用
    let queryDef = await QueryDef.createInstance();
    await queryDef.setSubFields('*');
    await queryDef.setWithSpatial(true);
    await queryDef.setFilter("Name='自定义站'");
    await featureQuery.setQueryDef(queryDef);
    let featurePagedResult = await featureQuery.query();
    let featureLst = await featurePagedResult.getPage(1);

    //属性
    let modiPointAtt = { Address: '南湖' };

    let dot = await Dot3D.createInstance(12722526.57, 3578692.37, 0);
    let modiPoint = await GeoMultiPoint.createInstance();
    await modiPoint.append(dot);

    let modiInfo = await PntInfo.createInstance();
    await modiInfo.setHeight(500);
    await modiInfo.setWidth(500);
    await modiInfo.setLibID(0);
    await modiInfo.setSymID(14);
    await modiInfo.setOutClr1(3);

    if (featureLst.length > 0) {
      let feature = await featureLst[0];
      let id = await feature.getID();

      let lMfVal = await feature.modifyFeatureValue(
        modiPointAtt,
        modiPoint,
        modiInfo
      ); //修改属性信息、几何信息、样式信息
      if (lMfVal > 0) {
        let result = await featureEdit.update(id, feature);
        if (result > 0) {
          ToastAndroid.show('修改点要素成功', ToastAndroid.SHORT);
          await this.mapView.forceRefresh();
        } else {
          ToastAndroid.show('修改点要素失败', ToastAndroid.SHORT);
        }
      }
    } else {
      ToastAndroid.show('未查询到要素', ToastAndroid.SHORT);
    }
  };

  deletePoint = async () => {
    let featureEdit = null;
    let featureQuery = null;
    //根据基地址、地图文档名称、地图ID、图层 ID构造FeatureEdit对象，此种方法需要配置地图文档，并发布到igserver服务器中
    if (this.state.selectedData === 'doc') {
      featureEdit = await FeatureEdit.createInstanceByIGSDoc(
        IGSERVER_BASE_URL,
        'WuHanEdit',
        0,
        8
      ); //一级点图层
      featureQuery = await FeatureQuery.createInstanceByIGSDoc(
        IGSERVER_BASE_URL,
        'WuHanEdit',
        0,
        8
      ); //一级点图层
    }
    //根据基地址、图层数据地址构造FeatureEdit对象，此种方法可以不用配置地图文档，获取到URL地址直接使用即可
    else if (this.state.selectedData === 'cls') {
      featureEdit = await FeatureEdit.createInstanceByIGSData(
        IGSERVER_BASE_URL,
        'gdbp://MapGisLocal/武汉MKT/sfcls/自绘点'
      );
      featureQuery = await FeatureQuery.createInstanceByIGSData(
        IGSERVER_BASE_URL,
        'gdbp://MapGisLocal/武汉MKT/sfcls/自绘点'
      );
    }

    //属性查询，查询新添加的要素
    let queryDef = await QueryDef.createInstance();
    await queryDef.setFilter("Name='自定义站'");//注意sql语句的写法，如果不知道的话可以先在桌面工具中测试是否可用
    await queryDef.setSubFields('*');
    await queryDef.setWithSpatial(true);
    await featureQuery.setQueryDef(queryDef);
    let featurePagedResult = await featureQuery.query();
    let featureLst = await featurePagedResult.getPage(1);

    if (featureLst.length > 0) {
      let feature = await featureLst[0];
      let id = await feature.getID();
      let result = await featureEdit.delete(id);
      if (result > 0) {
        ToastAndroid.show('删除点成功', ToastAndroid.SHORT);
        await this.mapView.forceRefresh();
      } else {
        ToastAndroid.show('删除点失败', ToastAndroid.SHORT);
      }
    } else {
      ToastAndroid.show('未查询到要素', ToastAndroid.SHORT);
    }
  };

  addLine = async () => {
    //创建要素编辑对象
    let featureEdit = null;
    //根据基地址、地图文档名称、地图ID、图层 ID构造FeatureEdit对象，此种方法需要配置地图文档，并发布到igserver服务器中
    if (this.state.selectedData === 'doc') {
      featureEdit = await FeatureEdit.createInstanceByIGSDoc(
        IGSERVER_BASE_URL,
        'WuHanEdit',
        0,
        6
      ); //一级点图层
    }
    //根据基地址、图层数据地址构造FeatureEdit对象，此种方法可以不用配置地图文档，获取到URL地址直接使用即可
    else if (this.state.selectedData === 'cls') {
      featureEdit = await FeatureEdit.createInstanceByIGSData(
        IGSERVER_BASE_URL,
        'gdbp://MapGisLocal/武汉MKT/sfcls/自绘线'
      );
    }

    //属性
    let attribute = { Name_chn: '1道路' };

    //几何信息
    let geoLine = await GeoVarLine.createInstance();

    let dot1 = await Dot.createInstance(12718853.57, 3583174.04);
    let dot2 = await Dot.createInstance(12718935.33, 3574794.53);
    let dot3 = await Dot.createInstance(12725802.44, 3571647.1);
    await geoLine.append2D(dot1);
    await geoLine.append2D(dot2);
    await geoLine.append2D(dot3);

    //样式信息
    let linInfo = await LinInfo.createInstance();
    await linInfo.setOutClr1(2);

    let lineFeature = await Feature.createInstanceByParam(
      attribute,
      geoLine,
      linInfo
    );
    //添加
    let result = await featureEdit.append(lineFeature);
    if (result > 0) {
      ToastAndroid.show('添加线成功', ToastAndroid.SHORT);
      await this.mapView.forceRefresh();
    } else {
      ToastAndroid.show('添加线失败', ToastAndroid.SHORT);
    }
  };

  modifyLine = async () => {
    let featureEdit = null;
    let featureQuery = null;
    //根据基地址、地图文档名称、地图ID、图层 ID构造FeatureEdit对象，此种方法需要配置地图文档，并发布到igserver服务器中
    if (this.state.selectedData === 'doc') {
      featureEdit = await FeatureEdit.createInstanceByIGSDoc(
        IGSERVER_BASE_URL,
        'WuHanEdit',
        0,
        6
      ); //一级点图层
      featureQuery = await FeatureQuery.createInstanceByIGSDoc(
        IGSERVER_BASE_URL,
        'WuHanEdit',
        0,
        6
      ); //一级点图层
    }
    //根据基地址、图层数据地址构造FeatureEdit对象，此种方法可以不用配置地图文档，获取到URL地址直接使用即可
    else if (this.state.selectedData === 'cls') {
      featureEdit = await FeatureEdit.createInstanceByIGSData(
        IGSERVER_BASE_URL,
        'gdbp://MapGisLocal/武汉MKT/sfcls/自绘线'
      );
      featureQuery = await FeatureQuery.createInstanceByIGSData(
        IGSERVER_BASE_URL,
        'gdbp://MapGisLocal/武汉MKT/sfcls/自绘线'
      );
    }

    //属性查询，查询新添加的要素
    let queryDef = await QueryDef.createInstance();
    await queryDef.setFilter("Name_chn='1道路'");
    await queryDef.setSubFields('*');
    await queryDef.setWithSpatial(true);
    await featureQuery.setQueryDef(queryDef);
    let featurePagedResult = await featureQuery.query();
    let featureLst = await featurePagedResult.getPage(1);

    //属性
    let modifyLineAtt = { Name_py: '1daolu' };

    let modiLine = await GeoVarLine.createInstance();

    let dot1 = await Dot.createInstance(12725802.44, 3571647.1);
    let dot2 = await Dot.createInstance(12737640.52, 3581856.17);
    await modiLine.append2D(dot1);
    await modiLine.append2D(dot2);

    //样式信息
    let modiInfo = await LinInfo.createInstance();
    await modiInfo.setOutClr1(3);

    if (featureLst.length > 0) {
      let feature = await featureLst[0];
      let id = await feature.getID();

      let lMfVal = await feature.modifyFeatureValue(
        modifyLineAtt,
        modiLine,
        modiInfo
      ); //修改属性信息、几何信息、样式信息
      if (lMfVal > 0) {
        let result = await featureEdit.update(id, feature);
        if (result > 0) {
          ToastAndroid.show('修改线要素成功', ToastAndroid.SHORT);
          await this.mapView.forceRefresh();
        } else {
          ToastAndroid.show('修改线要素失败', ToastAndroid.SHORT);
        }
      }
    } else {
      ToastAndroid.show('未查询到要素', ToastAndroid.SHORT);
    }
  };

  deleteLine = async () => {
    let featureEdit = null;
    let featureQuery = null;
    //根据基地址、地图文档名称、地图ID、图层 ID构造FeatureEdit对象，此种方法需要配置地图文档，并发布到igserver服务器中
    if (this.state.selectedData === 'doc') {
      featureEdit = await FeatureEdit.createInstanceByIGSDoc(
        IGSERVER_BASE_URL,
        'WuHanEdit',
        0,
        6
      ); //一级点图层
      featureQuery = await FeatureQuery.createInstanceByIGSDoc(
        IGSERVER_BASE_URL,
        'WuHanEdit',
        0,
        6
      ); //一级点图层
    }
    //根据基地址、图层数据地址构造FeatureEdit对象，此种方法可以不用配置地图文档，获取到URL地址直接使用即可
    else if (this.state.selectedData === 'cls') {
      featureEdit = await FeatureEdit.createInstanceByIGSData(
        IGSERVER_BASE_URL,
        'gdbp://MapGisLocal/武汉MKT/sfcls/自绘线'
      );
      featureQuery = await FeatureQuery.createInstanceByIGSData(
        IGSERVER_BASE_URL,
        'gdbp://MapGisLocal/武汉MKT/sfcls/自绘线'
      );
    }

    //属性查询，查询新添加的要素
    let queryDef = await QueryDef.createInstance();
    await queryDef.setFilter("Name_chn='1道路'");
    await queryDef.setSubFields('*');
    await queryDef.setWithSpatial(true);
    await featureQuery.setQueryDef(queryDef);
    let featurePagedResult = await featureQuery.query();
    let featureLst = await featurePagedResult.getPage(1);

    if (featureLst.length > 0) {
      let feature = await featureLst[0];
      let id = await feature.getID();
      let result = await featureEdit.delete(id);
      if (result > 0) {
        ToastAndroid.show('删除线成功', ToastAndroid.SHORT);
        await this.mapView.forceRefresh();
      } else {
        ToastAndroid.show('删除线失败', ToastAndroid.SHORT);
      }
    } else {
      ToastAndroid.show('未查询到要素', ToastAndroid.SHORT);
    }
  };

  addPolygon = async () => {
    //创建要素编辑对象
    let featureEdit = null;
    //根据基地址、地图文档名称、地图ID、图层 ID构造FeatureEdit对象，此种方法需要配置地图文档，并发布到igserver服务器中
    if (this.state.selectedData === 'doc') {
      featureEdit = await FeatureEdit.createInstanceByIGSDoc(
        IGSERVER_BASE_URL,
        'WuHanEdit',
        0,
        3
      ); //一级点图层
    }
    //根据基地址、图层数据地址构造FeatureEdit对象，此种方法可以不用配置地图文档，获取到URL地址直接使用即可
    else if (this.state.selectedData === 'cls') {
      featureEdit = await FeatureEdit.createInstanceByIGSData(
        IGSERVER_BASE_URL,
        'gdbp://MapGisLocal/武汉MKT/sfcls/自绘区'
      );
    }

    //属性
    let attribute = { Name: '1水域' };

    //几何信息
    let geoPolygon = await GeoPolygon.createInstance();

    let dots = await Dots.createInstance();
    let dot1 = await Dot.createInstance(12723229.57, 3570597.11);
    let dot2 = await Dot.createInstance(12725877.54, 3569563.15);
    let dot3 = await Dot.createInstance(12722750.42, 3564973.34);
    let dot4 = await Dot.createInstance(12719875.49, 3566032.53);
    await dots.append(dot1);
    await dots.append(dot2);
    await dots.append(dot3);
    await dots.append(dot4);
    await dots.append(dot1);
    let intList = await IntList.createInstance();
    let size = await dots.size();
    await intList.append(size);
    await geoPolygon.setDots(dots, intList);
    //图形信息
    let regInfo = await RegInfo.createInstance();
    await regInfo.setFillClr(7);
    await regInfo.setAngle(0);
    await regInfo.setFillMode(0);
    await regInfo.setLibID(1);
    await regInfo.setOutPenW(5);

    let regFeature = await Feature.createInstanceByParam(
      attribute,
      geoPolygon,
      regInfo
    );
    //添加
    let result = await featureEdit.append(regFeature);
    if (result > 0) {
      ToastAndroid.show('添加面成功', ToastAndroid.SHORT);
      await this.mapView.forceRefresh();
    } else {
      ToastAndroid.show('添加面失败', ToastAndroid.SHORT);
    }
  };

  modifyPolygon = async () => {
    //创建要素编辑对象
    let featureEdit = null;
    let featureQuery = null;
    //根据基地址、地图文档名称、地图ID、图层 ID构造FeatureEdit对象，此种方法需要配置地图文档，并发布到igserver服务器中
    if (this.state.selectedData === 'doc') {
      featureEdit = await FeatureEdit.createInstanceByIGSDoc(
        IGSERVER_BASE_URL,
        'WuHanEdit',
        0,
        3
      ); //一级点图层
      featureQuery = await FeatureQuery.createInstanceByIGSDoc(
        IGSERVER_BASE_URL,
        'WuHanEdit',
        0,
        3
      ); //一级点图层
    }
    //根据基地址、图层数据地址构造FeatureEdit对象，此种方法可以不用配置地图文档，获取到URL地址直接使用即可
    else if (this.state.selectedData === 'cls') {
      featureEdit = await FeatureEdit.createInstanceByIGSData(
        IGSERVER_BASE_URL,
        'gdbp://MapGisLocal/武汉MKT/sfcls/自绘区'
      );
      featureQuery = await FeatureQuery.createInstanceByIGSData(
        IGSERVER_BASE_URL,
        'gdbp://MapGisLocal/武汉MKT/sfcls/自绘区'
      );
    }

    //属性查询，查询新添加的要素
    let queryDef = await QueryDef.createInstance();
    await queryDef.setSubFields('*');
    await queryDef.setWithSpatial(true);
    await queryDef.setFilter("Name='1水域'");
    await featureQuery.setQueryDef(queryDef);
    let featurePagedResult = await featureQuery.query();
    let featureLst = await featurePagedResult.getPage(1);

    //属性
    let modifyRegAtt = { mpLayer: '1' };

    //几何信息
    let modiPolygon = await GeoPolygon.createInstance();

    let dots = await Dots.createInstance();
    let dot1 = await Dot.createInstance(12716527.6, 3568168.95);
    let dot2 = await Dot.createInstance(12719388.87, 3571498.74);
    let dot3 = await Dot.createInstance(12714419.29, 3571548.93);
    let dot4 = await Dot.createInstance(12714352.36, 3569858.94);
    await dots.append(dot1);
    await dots.append(dot2);
    await dots.append(dot3);
    await dots.append(dot4);
    await dots.append(dot1);
    let intList = await IntList.createInstance();
    let size = await dots.size();
    await intList.append(size);
    await modiPolygon.setDots(dots, intList);

    //样式信息
    let modiInfo = await RegInfo.createInstance();
    await modiInfo.setFillClr(4);
    await modiInfo.setAngle(0);
    await modiInfo.setFillMode(1);
    await modiInfo.setLibID(1);
    await modiInfo.setOutPenW(3);

    if (featureLst.length > 0) {
      let feature = await featureLst[0];
      let id = await feature.getID();

      let lMfVal = await feature.modifyFeatureValue(
        modifyRegAtt,
        modiPolygon,
        modiInfo
      ); //修改属性信息、几何信息、样式信息
      if (lMfVal > 0) {
        let result = await featureEdit.update(id, feature);
        if (result > 0) {
          ToastAndroid.show('修改面要素成功', ToastAndroid.SHORT);
          await this.mapView.forceRefresh();
        } else {
          ToastAndroid.show('修改面要素失败', ToastAndroid.SHORT);
        }
      }
    } else {
      ToastAndroid.show('未查询到要素', ToastAndroid.SHORT);
    }
  };

  deletePolygon = async () => {
    //创建要素编辑对象
    let featureEdit = null;
    let featureQuery = null;
    //根据基地址、地图文档名称、地图ID、图层 ID构造FeatureEdit对象，此种方法需要配置地图文档，并发布到igserver服务器中
    if (this.state.selectedData === 'doc') {
      featureEdit = await FeatureEdit.createInstanceByIGSDoc(
        IGSERVER_BASE_URL,
        'WuHanEdit',
        0,
        3
      ); //一级点图层
      featureQuery = await FeatureQuery.createInstanceByIGSDoc(
        IGSERVER_BASE_URL,
        'WuHanEdit',
        0,
        3
      ); //一级点图层
    }
    //根据基地址、图层数据地址构造FeatureEdit对象，此种方法可以不用配置地图文档，获取到URL地址直接使用即可
    else if (this.state.selectedData === 'cls') {
      featureEdit = await FeatureEdit.createInstanceByIGSData(
        IGSERVER_BASE_URL,
        'gdbp://MapGisLocal/武汉MKT/sfcls/自绘区'
      );
      featureQuery = await FeatureQuery.createInstanceByIGSData(
        IGSERVER_BASE_URL,
        'gdbp://MapGisLocal/武汉MKT/sfcls/自绘区'
      );
    }

    //属性查询，查询新添加的要素
    let queryDef = await QueryDef.createInstance();
    await queryDef.setFilter("Name='1水域'");
    await queryDef.setSubFields('*');
    await queryDef.setWithSpatial(true);
    await featureQuery.setQueryDef(queryDef);
    let featurePagedResult = await featureQuery.query();
    let featureLst = await featurePagedResult.getPage(1);

    if (featureLst.length > 0) {
      let feature = await featureLst[0];
      let id = await feature.getID();
      let result = await featureEdit.delete(id);
      if (result > 0) {
        ToastAndroid.show('删除面成功', ToastAndroid.SHORT);
        await this.mapView.forceRefresh();
      } else {
        ToastAndroid.show('删除面失败', ToastAndroid.SHORT);
      }
    } else {
      ToastAndroid.show('未查询到要素', ToastAndroid.SHORT);
    }
  };

  addAnno = async () => {
    //创建要素编辑对象
    let featureEdit = null;
    //根据基地址、地图文档名称、地图ID、图层 ID构造FeatureEdit对象，此种方法需要配置地图文档，并发布到igserver服务器中
    if (this.state.selectedData === 'doc') {
      featureEdit = await FeatureEdit.createInstanceByIGSDoc(
        IGSERVER_BASE_URL,
        'WuHanEdit',
        0,
        10
      ); //一级点图层
    }
    //根据基地址、图层数据地址构造FeatureEdit对象，此种方法可以不用配置地图文档，获取到URL地址直接使用即可
    else if (this.state.selectedData === 'cls') {
      featureEdit = await FeatureEdit.createInstanceByIGSData(
        IGSERVER_BASE_URL,
        'gdbp://MapGisLocal/武汉MKT/acls/自定义注记'
      );
    }

    //属性
    let annoAtt = { Name: '长江' };

    //几何信息
    let textAnno = await TextAnno.createInstance();
    let dot = await Dot.createInstance(12730310.39, 3586141.71);
    await textAnno.setAnchorDot(dot);
    await textAnno.setText('长江');

    let textAnnInfo = await TextAnnInfo.createInstance();
    await textAnnInfo.setHeight(14);
    await textAnnInfo.setWidth(14);
    await textAnnInfo.setOvprnt(false);
    await textAnnInfo.setColor(4);

    let regFeature = await Feature.createInstanceByParam(
      annoAtt,
      textAnno,
      textAnnInfo
    );
    //添加
    let result = await featureEdit.append(regFeature);
    if (result > 0) {
      ToastAndroid.show('添加注记成功', ToastAndroid.SHORT);
      await this.mapView.forceRefresh();
    } else {
      ToastAndroid.show('添加注记失败', ToastAndroid.SHORT);
    }
  };

  modifyAnno = async () => {
    //创建要素编辑对象
    let featureEdit = null;
    let featureQuery = null;
    //根据基地址、地图文档名称、地图ID、图层 ID构造FeatureEdit对象，此种方法需要配置地图文档，并发布到igserver服务器中
    if (this.state.selectedData === 'doc') {
      featureEdit = await FeatureEdit.createInstanceByIGSDoc(
        IGSERVER_BASE_URL,
        'WuHanEdit',
        0,
        10
      );
      featureQuery = await FeatureQuery.createInstanceByIGSDoc(
        IGSERVER_BASE_URL,
        'WuHanEdit',
        0,
        10
      );
    }
    //根据基地址、图层数据地址构造FeatureEdit对象，此种方法可以不用配置地图文档，获取到URL地址直接使用即可
    else if (this.state.selectedData === 'cls') {
      featureEdit = await FeatureEdit.createInstanceByIGSData(
        IGSERVER_BASE_URL,
        'gdbp://MapGisLocal/武汉MKT/acls/自定义注记'
      );
      featureQuery = await FeatureQuery.createInstanceByIGSData(
        IGSERVER_BASE_URL,
        'gdbp://MapGisLocal/武汉MKT/acls/自定义注记'
      );
    }

    //属性查询，查询新添加的要素
    let queryDef = await QueryDef.createInstance();
    await queryDef.setSubFields('*');
    await queryDef.setWithSpatial(true);
    await queryDef.setFilter("Name='长江'");
    await featureQuery.setQueryDef(queryDef);
    let featurePagedResult = await featureQuery.query();
    let featureLst = await featurePagedResult.getPage(1);

    //属性
    let annoAtt = { mpLayer: '1' };

    //几何信息
    let textAnno = await TextAnno.createInstance();
    let dot = await Dot.createInstance(12738886.35, 3591259.62);
    await textAnno.setAnchorDot(dot);
    await textAnno.setText('天兴洲');

    let textAnnInfo = await TextAnnInfo.createInstance();
    await textAnnInfo.setHeight(11);
    await textAnnInfo.setWidth(11);
    await textAnnInfo.setOvprnt(false);
    await textAnnInfo.setColor(5);

    if (featureLst.length > 0) {
      let feature = await featureLst[0];
      let id = await feature.getID();

      let lMfVal = await feature.modifyFeatureValue(
        annoAtt,
        textAnno,
        textAnnInfo
      ); //修改属性信息、几何信息、样式信息
      if (lMfVal > 0) {
        let result = await featureEdit.update(id, feature);
        if (result > 0) {
          ToastAndroid.show('修改注记成功', ToastAndroid.SHORT);
          await this.mapView.forceRefresh();
        } else {
          ToastAndroid.show('修改注记失败', ToastAndroid.SHORT);
        }
      }
    } else {
      ToastAndroid.show('未查询到要素', ToastAndroid.SHORT);
    }
  };

  deleteAnno = async () => {
    //创建要素编辑对象
    let featureEdit = null;
    let featureQuery = null;
    //根据基地址、地图文档名称、地图ID、图层 ID构造FeatureEdit对象，此种方法需要配置地图文档，并发布到igserver服务器中
    if (this.state.selectedData === 'doc') {
      featureEdit = await FeatureEdit.createInstanceByIGSDoc(
        IGSERVER_BASE_URL,
        'WuHanEdit',
        0,
        10
      );
      featureQuery = await FeatureQuery.createInstanceByIGSDoc(
        IGSERVER_BASE_URL,
        'WuHanEdit',
        0,
        10
      );
    }
    //根据基地址、图层数据地址构造FeatureEdit对象，此种方法可以不用配置地图文档，获取到URL地址直接使用即可
    else if (this.state.selectedData === 'cls') {
      featureEdit = await FeatureEdit.createInstanceByIGSData(
        IGSERVER_BASE_URL,
        'gdbp://MapGisLocal/武汉MKT/acls/自定义注记'
      );
      featureQuery = await FeatureQuery.createInstanceByIGSData(
        IGSERVER_BASE_URL,
        'gdbp://MapGisLocal/武汉MKT/acls/自定义注记'
      );
    }

    //属性查询，查询新添加的要素
    let queryDef = await QueryDef.createInstance();
    await queryDef.setFilter("Name='长江'");
    await queryDef.setSubFields('*');
    await queryDef.setWithSpatial(true);
    await featureQuery.setQueryDef(queryDef);
    let featurePagedResult = await featureQuery.query();
    let featureLst = await featurePagedResult.getPage(1);

    if (featureLst.length > 0) {
      let feature = await featureLst[0];
      let id = await feature.getID();
      let result = await featureEdit.delete(id);
      if (result > 0) {
        ToastAndroid.show('删除注记成功', ToastAndroid.SHORT);
        await this.mapView.forceRefresh();
      } else {
        ToastAndroid.show('删除注记失败', ToastAndroid.SHORT);
      }
    } else {
      ToastAndroid.show('未查询到要素', ToastAndroid.SHORT);
    }
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={[style.pickerView, style.pickerViewWidth]}>
          <Text style={style.text}>图层:</Text>
          <Picker
            style={style.pickerStyle}
            mode="dropdown"
            selectedValue={this.state.selectedOper}
            onValueChange={(itemValue, itemIndex) => {
              this.changeEditOperValue(itemValue, itemIndex);
            }}
          >
            <Picker.Item
              label="点图层"
              value="point"
              itemStyle={style.pickerItem}
            />
            <Picker.Item
              label="线图层"
              value="line"
              itemStyle={style.pickerItem}
            />
            <Picker.Item
              label="区图层"
              value="reg"
              itemStyle={style.pickerItem}
            />
          </Picker>

          <Text style={style.text}>数据:</Text>
          <Picker
            style={style.pickerStyle}
            mode="dropdown"
            selectedValue={this.state.selectedData}
            onValueChange={(itemValue, itemIndex) => {
              this.changeEditDataValue(itemValue, itemIndex);
            }}
          >
            <Picker.Item
              label="地图文档"
              value="doc"
              itemStyle={style.pickerItem}
            />
            <Picker.Item
              label="简单要素类"
              value="cls"
              itemStyle={style.pickerItem}
            />
          </Picker>
        </View>

        <MGMapView
          ref="mapView"
          onGetInstance={this.onGetInstance}
          style={styles.mapView}
        />
        <View style={[styles.buttons, { bottom: 60 }]}>
          <View style={styles.button}>
            <TouchableOpacity onPress={this.addFeature}>
              <Text style={styles.text}>添 加</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.button}>
            <TouchableOpacity onPress={this.editFeature}>
              <Text style={styles.text}>修 改</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.button}>
            <TouchableOpacity onPress={this.deleteFeature}>
              <Text style={styles.text}>删 除</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
}

const style = StyleSheet.create({
  pickerView: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: 'rgba(192,192,192,0.8)',
    paddingTop: 5,
  },
  pickerViewWidth: {
    width: Dimensions.get('window').width,
  },
  pickerStyle: {
    width: 144,
    height: 45,
  },
  pickerItem: {
    width: Dimensions.get('window').width,
    backgroundColor: 'rgba(245,83,61,0.8)',
    color: '#000',
    borderRadius: 15,
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    color: '#000',
    paddingTop: 12,
  },
});
