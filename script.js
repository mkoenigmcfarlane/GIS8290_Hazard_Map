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
  "esri/symbols/SimpleLineSymbol",
  "esri/Color",
  "esri/dijit/Search",
  "esri/dijit/HomeButton",
  "esri/domUtils",
  "dojo/dom-class",
  "dojo/dom",
  "dojo/dom-construct",
  "dojo/on",
  "dojox/charting/action2d/Tooltip",
  "dojox/charting/Chart",
  "dojox/charting/Chart2D",
  "dojox/charting/plot2d/Bars",
  "dojox/charting/themes/Grasslands",
  "dojox/charting/axis2d/Default",
  "dojo/query",
  "dijit/registry",
  "dijit/layout/TabContainer",
  "dijit/layout/BorderContainer",
  "dijit/layout/ContentPane",
  "dojo/_base/connect",
  "dojo/NodeList-traverse",
  "dojo/domReady!"
],
  function (Map, ArcGISDynamicMapServiceLayer, FeatureLayer, ImageParameters, Popup, PopupTemplate, InfoWindow, InfoTemplate, SimpleFillSymbol, SimpleLineSymbol, Color, Search, HomeButton, domUtils, domClass, dom, domConstruct, on, Tooltip, Chart, Chart2D, Bars, dojoxTheme, axis2d, query, registry, TabContainer, BorderContainer, ContentPane, connect) {

  var fill = new SimpleLineSymbol("solid", null, new Color("#A4CE67"));

  var popup = new Popup({
      fillSymbol: fill,
      titleInBody: false
  }, domConstruct.create("div"));
  domClass.add(popup.domNode, "dark");


    var map = new Map("map", {
      center: [-98, 39],
      zoom: 4,
      basemap: "gray",
      maxZoom: 9,
      infoWindow: popup
    });

      domClass.add(map.infoWindow.domNode, "myTheme");

     //add commas
          function addCommas(nStr){
            nStr += '';
            x = nStr.split('.');
            x1 = x[0];
            x2 = x.length > 1 ? '.' + x[1] : '';
            var rgx = /(\d+)(\d{3})/;
            while (rgx.test(x1)) {
              x1 = x1.replace(rgx, '$1' + ',' + '$2');
            }
            return x1 + x2;
          }

     var info_window = new esri.InfoTemplate();
       info_window.setTitle("<b>${County} County, ${State}</b>");
       info_window.setContent(getWindowContent);
      function getWindowContent(graphic){
      var cp = new ContentPane ({
        style: "height:100%,width:100%"
      });

      var tc = new TabContainer({
        style: "width:100%;height:100%;border-color:#fff;background-color:#DBDBD6;color:#222327",
        useMenu: false,
        useSlider: false,
        doLayout: true,
        tabPosition: "right-h",
      }, domConstruct.create("div"));

      cp.addChild(tc);

      var cp2 = new ContentPane({
        title: "County" + "<br>" + "Information",
        content:
      "<b>County Data</b>"+"<br>"+
			"Population: " + addCommas(graphic.attributes.totpop) +"<br>"+
			"County Area: " + addCommas(graphic.attributes.sq_k) + " sq. mi." + "<br>" +
			"Population Density: " + addCommas(graphic.attributes.pop_den) + " people/sq. mi."+ "<br>" +"<br>"+
      "<b>Cumulative Risk</b>" + "<br>" +
      "Total Risks: " + (graphic.attributes.Cumulative).toString() + "/32" + "<br>" +
      "Highest Risk Total: 24" +
      "<br>" +"&nbsp&nbspSan Bernardino County, CA" + "<br>" +
      "Lowest Risk Total: 9 " +
      "<br>" +"&nbsp&nbspWalsh County, ND" +
      "<br>" +"&nbsp&nbspGarfield County, WA" +
      "<br>" +"&nbsp&nbspBoyd County, NE" +
      "<br>" +"&nbsp&nbspSummit County, CO" +
      "<br>" +"&nbsp&nbspBuena Vista County, VA" +
      "<br>" +"&nbsp&nbspRadford County, VA" +
      "<br>" +"&nbsp&nbspReal County, TX" +
			"<br>"+
			"<br>"+
			"<b>Further Resources</b>" + "<br>"+ "Visit " +
			graphic.attributes.County + " County " + "<a href='" + graphic.attributes.website + "' target='_blank'>Emergency Preparedness Website</a>" + "<br>"+
      "Download " + "<a href='http://www.cdc.gov/phpr/documents/ahpg_final_march_2013.pdf' target='_blank'>CDC Emergency Preparedness Guide</a>"

		,style: "height:335px; width:475px; border-color:#fff;color:#222327; font:sans-serif; "
      });

      tc.startup();

      var cp1 = new ContentPane({
        title: "Risk" + "<br>" + "Concerns",
        style: "height:335px; width:475px; border-color:#fff;color:#222327;"
      });

      tc.addChild(cp1);
      tc.addChild(cp2);
      tc.selectChild(cp1);

      var bar_chart1 = domConstruct.create("div", {id: "BarChart1"},
            domConstruct.create("div"));

      var BarChart1 = new Chart2D(bar_chart1, {
            title: "Risk Assessment",
            titleFont: "normal normal normal 12pt Verdana,Geneva,Arial,Helvetica,sans-serif"
          });
          domClass.add(BarChart1, "chart");

          BarChart1.setTheme(dojoxTheme);
          BarChart1.addPlot("default", {
            type: "Bars",
            markers: true,
            gap: 5,
            htmlLabels: true,
            labels: false,
            labelStyle: "outside",
            labelOffset: 25
          });
          BarChart1.addAxis("x",
            {majorTicks: true,
              minorTicks: false,
              majorTickStep: 1,
              max: 4,
              min: 0,
              labels: labels_x
            });
          BarChart1.addAxis("y", {vertical: true,
            labels: labels,
            majorTicks: false,
            majorTick: {length: 2},
            majorLabels: true,
            majorTickStep: 1,
            minorTicks: false,
            max: 9
          });

          tc.watch("selectedChildWidget", function(name, newVal){
            if ( newVal.title === "Risk") {
              BarChart1.resize(200,200);
            }
          });



      function getColor(risk_value){
        if (risk_value== "1") {return "#FEF0D9";}
        else if (risk_value== "2") {return "#FDCC8A";}
        else if (risk_value== "3") {return "#FC8D59";}
        else if (risk_value== "4") {return "#D7301F";}}

      var wf_color = getColor(graphic.attributes.Wildfire);
      var eq_color = getColor(graphic.attributes.Earthquake);
      var nuc_color = getColor(graphic.attributes.Nuclear);
      var tor_color = getColor(graphic.attributes.Tornadoes);
      var fl_color = getColor(graphic.attributes.Floods);
      var hur_color = getColor(graphic.attributes.Hurricanes);
      var win_color = getColor(graphic.attributes.Winter);
      var vol_color = getColor(graphic.attributes.Volcanoes);
      var tot_color = getColor(graphic.attributes.Cumulative);

      BarChart1.addSeries("Risk", [{
          //   y: graphic.attributes.Cumulative,
          //   tooltip: graphic.attributes.Cumulative,
          //   fill: tot_color,
          //   stroke: {color: "#fff", width: 1.2}
          // },{
            y: graphic.attributes.Wildfire,
            tooltip: graphic.attributes.Wildfire,
            fill: wf_color,
            stroke: {color: "#fff", width: 1.2}
          },{
            y: graphic.attributes.Earthquake,
            tooltip: graphic.attributes.Earthquake,
            fill: eq_color,
            stroke: {color: "#fff", width: 1.2}
          },{
            y: graphic.attributes.Floods,
            tooltip: graphic.attributes.Floods,
            fill: fl_color,
            stroke: {color: "#fff", width: 1.2}
          },{
            y: graphic.attributes.Hurricanes,
            tooltip: graphic.attributes.Hurricanes,
            fill: hur_color,
            stroke: {color: "#fff", width: 1.2}
          },{
            y: graphic.attributes.Winter,
            tooltip: graphic.attributes.Winter,
            fill: win_color,
            stroke: {color: "#fff", width: 1.2}
          },{
            y: graphic.attributes.Tornadoes,
            tooltip: graphic.attributes.Tornadoes,
            fill: tor_color,
            stroke: {color: "#fff", width: 1.2}
          },{
            y: graphic.attributes.Volcanoes,
            tooltip: graphic.attributes.Volcanoes,
            fill: vol_color,
            stroke: {color: "#fff", width: 1.2}
          },{
            y: graphic.attributes.Nuclear,
            tooltip: graphic.attributes.Nuclear,
            fill: nuc_color,
            stroke: {color: "#fff", width: 1.2},
          }
          ]);

          chart1TT = new Tooltip(BarChart1, "default");
      cp1.set("content", BarChart1.node);
      BarChart1.render();
      return cp.domNode;
        }
      ;

    //feature layer containing all risks and set as transparent. popup pulls from this layer for display information
    var featureLayer = new FeatureLayer("http://services.arcgis.com/8df8p0NlLFEShl0r/arcgis/rest/services/RISK/FeatureServer/0",{
      mode: FeatureLayer.MODE_ONDEMAND,
      outFields: ["*"],
      infoTemplate: info_window
    });

    map.addLayer(featureLayer);

    map.infoWindow.resize(575, 600);

    var labels = [{value: 1, text: "<b>Wildfire</b>"}, {value: 2,text: "<b>Earthquake</b>"}, {value: 3,text: "<b>Flood</b>"}, {value: 4,text: "<b>Hurricane</b>"}, {value: 5,text: "<b>Winter Weather</b>"}, {value: 6,text: "<b>Tornado</b>"}, {value: 7,text: "<b>Volcano</b>"}, {value: 8,text: "<b>Nuclear Plant</b>"}, {value: 9,text: " "}];

    var labels_x = [{value: 1, text: "<b>Low</b>"},{value: 2, text: "<b>Moderate</b>"},{value: 3, text: "<b>High</b>"},{value: 4, text: "<b>Very High</b>"}];

    //image parameters are set to be called in the map service construction
    var imageParameters = new ImageParameters();
    imageParameters.layerIds = [0,1,3,4,5,6,7,8,9,10,11,12,13];
    imageParameters.layerOption = ImageParameters.LAYER_OPTION_HIDE;

    //map service containing individual risk layers
    var layer = new ArcGISDynamicMapServiceLayer("https://gis.uspatial.umn.edu/arcgis/rest/services/CrisisMappingFinal3/MapServer",
        {"imageParameters": imageParameters});
    map.addLayer(layer);

    //3 feature layers created for the nuclear sites. 0 and 1 are the buffers. 2 is the points.
    var nuclearLayer0 = new FeatureLayer("https://gis.uspatial.umn.edu/arcgis/rest/services/CrisisMappingFinal3/MapServer/0",{
      visible: false
    });
    map.addLayer(nuclearLayer0);

    var nuclearLayer1 = new FeatureLayer("https://gis.uspatial.umn.edu/arcgis/rest/services/CrisisMappingFinal3/MapServer/1",{
      visible: false
    });
    map.addLayer(nuclearLayer1);

    var nuclearLayer2 = new FeatureLayer("https://gis.uspatial.umn.edu/arcgis/rest/services/CrisisMappingFinal3/MapServer/3",{
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

    var home = new HomeButton({
          map: map
        }, "HomeButton");
        home.startup();

    var s = new Search({
      	sources: [{
      		featureLayer: featureLayer,
      		placeholder: "Search for a County...",
      		enableSuggestions: true,
      		searchFields: ["County"],
      		displayField: "County"
      	}],
      	map: map
      }, "search");
      s.startup();
});
