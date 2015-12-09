# CartoDB 15 Workshop - Making the app interactive

**BEFORE YOU START: Make sure all the datasets we're using for this example and the map are PUBLIC**

## Task 1: Connect the app to your viz.json file

Change the viz.json URL we're passing to `cartodb.createVis` to your own map.

## Task 2: Customize the infowindow

Change the template of the infowindow and add the custom CSS.

```
  sublayer.infowindow.set({
    template: document.getElementById('infowindowTemplate').innerHTML
  });
```
Copy the following CSS to `css/infowindow.css`:

```
.cartodb-infowindow{position:absolute}.Cdb-infowindow{background:#fff;border-radius:4px;position:relative;box-shadow:0 2px 4px 0 rgba(0,0,0,.24);font-family:'Open Sans';cursor:default;transform:translateY(-24px) translateX(4px)}.Cdb-infowindow-container{border-radius:4px;overflow:hidden}.Cdb-infowindow-header-bg,.Cdb-infowindow-inner{padding:20px 24px 18px}.Cdb-infowindow-inner--scroll{padding-right:12px;position:relative}.is-header .Cdb-infowindow-header-bg{padding-bottom:12px}.is-header .Cdb-infowindow-inner{padding-top:12px}.Cdb-infowindow-subtitle{font-size:10px;font-weight:300;line-height:15px;text-transform:uppercase}.Cdb-infowindow-title{font-size:12px;font-weight:300;line-height:16px}.is-scroll{padding-bottom:24px;max-height:200px;overflow:scroll;position:relative}.is-scroll:after{content:"";position:absolute;left:0;right:0;bottom:0;height:32px}.Cdb-infowindow-list{display:none}.Cdb-infowindow-list:first-child{display:block}.Cdb-infowindow-list-item{margin-top:8px}.Cdb-infowindow-list-item:first-child{margin-top:0}.is-header .Cdb-infowindow-media-title{bottom:12px}.Cdb-infowindow-media-title{position:absolute;right:24px;bottom:24px;left:24px}.Cdb-infowindow-header-media{position:relative;overflow:hidden;z-index:1}.Cdb-infowindow-media-item{display:block;width:100%}.Cdb-infowindow-header-media .Cdb-infowindow-title>span{display:inline;padding:2px 0;background-color:rgba(0,0,0,.8);box-shadow:4px 0 0 rgba(0,0,0,.8),-4px 0 0 rgba(0,0,0,.8)}.Cdb-infowindow-header-media .Cdb-infowindow-subtitle{margin-bottom:4px}.Cdb-infowindow-header-media .Cdb-infowindow-subtitle>span{display:inline;padding:2px 0;background-color:rgba(0,0,0,.64);box-shadow:4px 0 0 rgba(0,0,0,.64),-4px 0 0 rgba(0,0,0,.64)}.Cdb-hook{position:absolute;left:24px;bottom:1px;z-index:10}.Cdb-hook:before{content:"";position:absolute;left:0;top:0;width:0;height:0;border-right:24px solid transparent;z-index:3}.Cdb-hook--green.Cdb-hook:before{border-top:16px solid #98E0A8!important}.Cdb-hook--orange.Cdb-hook:before{border-top:16px solid #E68165!important}.Cdb-hook-image:after,.Cdb-hook:after{content:"";position:absolute;left:0;top:3px;width:0;height:0;border-top:16px solid rgba(0,0,0,.14);border-right:24px solid transparent;-webkit-filter:blur(2px);filter:blur(2px);z-index:2}.is-header-image .Cdb-hook-image{position:absolute;height:16px;width:24px;z-index:3;left:24px}.is-header-image .Cdb-hook-image img{margin-left:-24px}.is-header-image .Cdb-hook-image-inner{width:100%;height:100%;overflow:hidden;position:relative;z-index:3}.Cdb-infowindow--light .Cdb-hook:before {border-top: 16px solid #fff;}
```

Click on a point and make sure infowindows look fine!

## Task 3: Use the SQL API to load the stats

Find the `loadStats` function, which should execute a query against your account and update the stats
model.

```
  var statsQuery = "SELECT COUNT(price) AS count, ROUND(AVG(price), 2) AS avg, MAX(price) AS max, MIN(price) AS min FROM airbnb_listings";

  console.log('STATS QUERY', statsQuery);

  cartodb.SQL({ user: 'YOUR_USERNAME'}).execute(statsQuery, function(data) {
    var row = data.rows[0];
    stats.set({
      count: row.count,
      min: row.min,
      max: row.max,
      avg: row.avg
    });
```


## Task 4: Let's add our first widget

The `addWidget` function will create a model that is linked to a widget view for us and bind all the events that update the model.


```
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
```

Checkout the console. Some logs might appear when you click on a filter.

## Task 5: Customize the SQL that is generated

The `generateSQL` function is responsible of generating the SQL that will be applied to the sublayer. Using the conditions of all the filters that are active, we can modify the original sql.

```
var generateSQL = function(originalSQL, widgets) {

  // ...

  var filterConditions = widgets.getActiveFilterConditions();

  if (filterConditions.length) {
    sql += " WHERE " + filterConditions.join(" AND ");
  }

  // ..

}
```

## Task 6: Customize the CartoCSS

The `generateCartoCSS` function is responsible of generating the CartoCSS that will be applied to the sublayer. We want to customize the original cartoCSS when there are no filters applied.

```
var generateCartoCSS = function(originalCartoCSS, widgets) {

  // ...

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
  
  // ...
  
}
```

## Task 7: Apply filters to the stats

The stats are currently not consistent with the results that are being displayed on the map. Go back to the `loadStats` function and make sure the query is adding conditions to filter the stats.


```
var loadStats = function(stats, widgets) {

  // ...

  var statsQuery = "SELECT COUNT(price) AS count, ROUND(AVG(price), 2) AS avg, MAX(price) AS max, MIN(price) AS min FROM airbnb_listings";

  var filterConditions = widgets.getActiveFilterConditions();
  if (filterConditions.length) {
    statsQuery += " WHERE " + filterConditions.join(" AND ");
  }
  

  // ...

}

```


## Task 8: Add two more widgets

Add a first widget that will filter by distance to the closest subway station:

```
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

```

Add another widget that will filter results by price range:


```
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
```

