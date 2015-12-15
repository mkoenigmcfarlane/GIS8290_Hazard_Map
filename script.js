//var map;

require([
  "esri/map",
  "esri/layers/ArcGISDynamicMapServiceLayer",
  "esri/layers/FeatureLayer",
  "esri/layers/ImageParameters",
  "esri/dijit/Popup",
  "esri/dijit/PopupTemplate",
  "esri/dijit/InfoWindow",
  "esri/InfoTemplate",
  "esri/symbols/SimpleFillSymbol",
  "esri/Color",
  "dojo/dom-class",
  "dojo/dom",
  "dojo/dom-construct",
  "dojo/on",
  "dojox/charting/Chart",
  "dojox/charting/themes/Dollar",
  "dojo/query",
  "dojo/NodeList-traverse",
  "dijit/layout/BorderContainer",
  "dijit/layout/ContentPane",
  "dojo/domReady!"
],
  function (Map, ArcGISDynamicMapServiceLayer, FeatureLayer, ImageParameters, Popup, PopupTemplate, InfoWindow, InfoTemplate, SimpleFillSymbol, Color, domClass, dom, domConstruct, on, Chart, theme, query) {

  var fill = new SimpleFillSymbol("solid", null, new Color("#A4CE67"));
  var popup = new Popup({
      fillSymbol: fill,
      titleInBody: false
  }, domConstruct.create("div"));
  domClass.add(popup.domNode, "dark");

    var infoWindow = new InfoWindow({}, domConstruct.create("div"));
    infoWindow.startup();
    var infoTemplate = new InfoTemplate("Testing", "${*}");

    var map = new Map("map", {
      center: [-98, 37],
      zoom: 4,
      basemap: "gray",
      infoWindow: popup
    });

    var template = new PopupTemplate({
      title: "{NAME}, County",
      description: "Natural Hazard Risk",
      fieldInfos: [{ //define field infos so we can specify an alias
        fieldName: "freq",
        label: "Wildfire"
      },{
        fieldName: "freq",
        label: "Hurricane"
      },{
        fieldName: "freq",
        label: "Flood"
      }],
      mediaInfos:[{ //define the bar chart
        caption: "",
        type:"barchart",
        value:{
          theme: "Dollar",
          fields:["freq","freq","freq"]
        }
      }]
    });

    //feature layer containing all risks and set as transparent. popup pulls from this layer for display information
    var featureLayer = new FeatureLayer("http://services.arcgis.com/8df8p0NlLFEShl0r/arcgis/rest/services/RISK/FeatureServer/0",{
      mode: FeatureLayer.MODE_ONDEMAND,
      outFields: ["*"],
      infoTemplate: template
    });
    map.addLayer(featureLayer);

    //image parameters are set to be called in the map service construction
    var imageParameters = new ImageParameters();
    imageParameters.layerIds = [0,1,3,4,5,6,7,8,9,10,11];
    imageParameters.layerOption = ImageParameters.LAYER_OPTION_HIDE;

    //map service containing individual risk layers
    var layer = new ArcGISDynamicMapServiceLayer("http://gis.uspatial.umn.edu/arcgis/rest/services/CrisisMappingFinal2/MapServer",
        {"imageParameters": imageParameters});
    map.addLayer(layer);

    //3 feature layers created for the nuclear sites. 0 and 1 are the buffers. 2 is the points.
    var nuclearLayer0 = new FeatureLayer("http://gis.uspatial.umn.edu/arcgis/rest/services/CrisisMappingFinal2/MapServer/0",{
      visible: false
    });
    map.addLayer(nuclearLayer0);

    var nuclearLayer1 = new FeatureLayer("http://gis.uspatial.umn.edu/arcgis/rest/services/CrisisMappingFinal2/MapServer/1",{
      visible: false
    });
    map.addLayer(nuclearLayer1);

    var nuclearLayer2 = new FeatureLayer("http://gis.uspatial.umn.edu/arcgis/rest/services/CrisisMappingFinal2/MapServer/3",{
      visible: false
    });
    map.addLayer(nuclearLayer2);

    //function for showing all three nuclear feature layers with one button
    on(dom.byId("nuclearpointscheckbox"), "change", function(){
      var box = dom.byId("nuclearpointscheckbox");
      if (box.checked){
        nuclearLayer0.show();
        nuclearLayer1.show();
        nuclearLayer2.show();
      }
      else {
        nuclearLayer0.hide();
        nuclearLayer1.hide();
        nuclearLayer2.hide();
      }
    });

    //each hazard button has a function for unchecking other hazards off when it is checked. exception: nuclear sites can be visible on top of any hazard.
    var layer_list_checkbox_spans = query('.list-item-span');

    for (var i =0; i < layer_list_checkbox_spans.length;i++){

      on(layer_list_checkbox_spans[i].querySelector("input"),"change", function(){
        //layer 2, state borders, is always visible
        var visible = [2];

        if (this.checked){

          var not_visible = query(this)
                              .parent()
                              .siblings(".list-item-span")
                              .query(".list_item");

          for (var i = 0; i < not_visible.length; i++) {
            not_visible[i].checked = false;
          }
          visible.push(this.value);
          layer.setVisibleLayers(visible);
        }

        else {
          visible.push(-1);
          layer.setVisibleLayers(visible);
        }
      });
    }
});
