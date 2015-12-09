/**
 * Stats model. It has the following attributes:
 *
 * {
 *   count: 0,
 *   max: 0,
 *   min: 0,
 *   avg: 0
 * }
 * 
 */
var Stats = Backbone.Model.extend({

  defaults: {
    count: 0,
    max: 0,
    min: 0,
    avg: 0
  }
});

/**
 * View for the stats. It listens to changes to the stats model
 * and re-renders when this happens.
 */
var StatsView = Backbone.View.extend({

  initialize: function() {
    this.model.bind('change', this.render, this);
  },

  render: function() {
    var template = _.template(document.getElementById('statsTemplate').innerHTML);
    this.el.innerHTML = template(this.model.toJSON());

    return this;
  }
});

/**
 * Creates a new stats model
 */
var addStats = function() {
  var stats = new Stats();
  return stats;
};

/**
 * Renders the stats
 */
var renderStats = function(stats) {
  var statsView = new StatsView({ model: stats });
  document.getElementById('widgets').appendChild(statsView.render().el);
};