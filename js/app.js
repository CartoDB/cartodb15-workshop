var main = function(vis, layers) {
  var vizjson = 'https://cartodb15.cartodb.com/api/v2/viz/7c6062ac-9d30-11e5-ab1e-0e3ff518bd15/viz.json';
  var options = {
    shareable: false,
    title: false,
    description: false,
    search: false,
    tiles_loader: true
  };
  cartodb.createVis('map', vizjson, options)
  .done(onVisCreated)
  .error(function(err) { alert('error!'); });
};

var onVisCreated = function(vis, layers) {
  var sublayer = layers[1].getSubLayer(0);

  var originalSQL = sublayer.getSQL();
  var originalCartoCSS = sublayer.getCartoCSS();
  var widgets = new Widgets();

  addWidget(widgets, {
    title: 'Room type',
    filters: [
      {
        title: 'Entire homes or apartments',
        condition: "room_type = 'Entire home/apt'"
      },
      {
        title: 'Shared room',
        condition: "room_type = 'Shared room'"
      },
      {
        title: 'Private room',
        condition: "room_type = 'Private room'"
      }
    ]
  });

  addWidget(widgets, {
    title: 'Distance to subway station',
    filters: [
      {
        title: "2 blocks",
        condition: "distance_to_closest_subway_station <= 0.11"
      },
      {
        title: "6 blocks",
        condition: "distance_to_closest_subway_station <= 0.3"
      }
    ]
  });

  addWidget(widgets, {
    title: 'Price range',
    filters: [
      {
        title: "Under $1000",
        condition: "price < 1000"
      },
      {
        title: "Over $1000",
        condition: "price > 1000"
      }
    ]
  });

  var stats = addStats();
  loadStats(stats, widgets);

  widgets.each(function(widget) {
    widget.bind('change:activeFilter', function() {

      var sql = generateSQL(originalSQL, widgets);
      var cartoCSS = generateCartoCSS(originalCartoCSS, widgets);

      sublayer.set({
        sql: sql,
        cartocss: cartoCSS
      });

      loadStats(stats, widgets);
    });
  });

  renderStats(stats);
  renderWidgets(widgets);
};

var loadStats = function(stats, widgets) {
  var statsQuery = "SELECT COUNT(price) AS count, ROUND(AVG(price), 2) AS avg, MAX(price) AS max, MIN(price) AS min FROM airbnb_listings";

  var filterConditions = widgets.getActiveFilterConditions();
  if (filterConditions.length) {
    statsQuery += " WHERE " + filterConditions.join(" AND ");
  }

  console.log("Stats query: ", statsQuery);

  cartodb.SQL({ user: 'cartodb15'}).execute(statsQuery, function(data) {
    var row = data.rows[0];
    stats.set({
      count: row.count,
      min: row.min,
      max: row.max,
      avg: row.avg
    });
  });
};

var generateSQL = function(originalSQL, widgets) {
  var sql = originalSQL;
  var filterConditions = widgets.getActiveFilterConditions();

  if (filterConditions.length) {
    sql += " WHERE " + filterConditions.join(" AND ");
  }

  console.log("SQL: ", sql);

  return sql;
};

var generateCartoCSS = function(originalCartoCSS, widgets) {
  var cartoCSS = originalCartoCSS;
  var filterConditions = widgets.getActiveFilterConditions();

  if (filterConditions.length) {
    cartoCSS =  "#airbnb_listings {" +
                "   marker-fill-opacity: 0.9;" +
                "   marker-line-color: #FFF;" +
                "   marker-line-width: 0.5;" +
                "   marker-line-opacity: 0.6;" +
                "   marker-placement: point;" +
                "   marker-type: ellipse;" +
                "   marker-width: 6;" +
                "   marker-allow-overlap: true;" +
                "   marker-fill: #006983;" +
                "   [zoom>=13]{marker-width:7;} " +
                "}";
  }

  console.log("CartoCSS: ", cartoCSS);

  return cartoCSS;
};

window.onload = main;