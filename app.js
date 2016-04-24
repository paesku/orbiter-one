(function(root, undefined) {
  'use strict';

  var document = root.document;
  var BASE_URL = 'http://www.asterank.com/';
  var API_MPC = BASE_URL + '/api/mpc';
  var API_ASTERANK = 'http://www.asterank.com/api/asterank?query='
  var MPC_QUERY = '?=&limit=';
  var ASTERANK_LIMIT = '&limit=';

  var API_LOOKUP = 'http://www.asterank.com/jpl/lookup?query=';

  var data = null;

  var searchBtn = document.getElementById('search');
  var projects = document.getElementById('projects');
  var projectsTmpl = document.getElementById('projects-template').innerHTML;

  var detailBtn = document.querySelectorAll('js-detail-modal');
  var project = document.getElementById('project');
  var projectTmpl = document.getElementById('project-template').innerHTML;

  init();

  function init() {
    apiRequest();

    searchBtn.addEventListener('click', queryApi);
    document.querySelector('#projects').addEventListener('click', prepareDetails);
  }

  function queryApi() {
    var input = document.getElementById('limit');
    apiRequest(input.value);
  }

  function apiRequest(length) {
    var limit = length || 10;
    var defaultQuery = {
      'price':
        {'$gt': 1}
    };
    var request = new XMLHttpRequest();

    request.withCredentials = false;

    request.addEventListener('readystatechange', function () {
      if (this.readyState === 4) {
        var allOrbits;
        allOrbits = buildRenderData(this.responseText);
        renderProjects(allOrbits);
      }
    });

    request.open('GET', API_ASTERANK + JSON.stringify(defaultQuery) + ASTERANK_LIMIT + limit);
    request.send(data);
  }

  function apiRequestDetail(query) {
    var request = new XMLHttpRequest();

    request.withCredentials = false;

    request.addEventListener('readystatechange', function () {
      if (this.readyState === 4) {
        renderProject(this.responseText, query);
      }
    });

    request.open('GET', API_LOOKUP + query );
    request.send(data);
  }

  function buildRenderData(blankResponse){
    var orbits = [];
    var result = JSON.parse(blankResponse);
    for (var i = 0; i < result.length; i++) {
      var o = result[i];
      o.last_obs = formatDate(o.last_obs);
      o.first_obs = formatDate(o.first_obs);
      o.risk = calculateRisk(o);
      o.spectra = spectraName(o.pdes)
      orbits.push(result[i]);
    }

    return {
      orbits: orbits
    }
  }

  function spectraName(pdes) {
      if (typeof pdes === 'number') {
        var x =  1000000 + pdes;
        var suffix = '_0';

        x = x.toString().concat(suffix);
        return x.substring(1);
      } else {

        return;
      }
  }

  function renderProjects (data) {
    projects.innerHTML = Mustache.render(projectsTmpl, data);
  }

  function renderProject (blankResponse, name) {
    var data = JSON.parse(blankResponse);
    data.nameId = name;
    if (data['Next Pass'].date_iso) {
      data.launch = formatDate(data['Next Pass'].date_iso);
    }

    if (data['Close Approaches']) {
      var array = data['Close Approaches'];
      data.upcomingEvents = [];

      for (var i = 0; i < array.length; i++) {
        var futureEvent = formatDate(array[i].date_iso);
        data.upcomingEvents.push(futureEvent);
      }
    }
    project.innerHTML = Mustache.render(projectTmpl, data);
  }

  function formatDate(date) {
    var lastObservation = moment(date, 'YYYYMMDD').format('YYYY MMM DD');
    var timeAgo = ' (' + moment(date).fromNow() + ')';
    return lastObservation + timeAgo;
  }

  function prepareDetails(e) {
    e.preventDefault;
    if (e.target && e.target.nodeName.toLowerCase() == 'button') {
      var target = e.target.id;
      animateDetails();
      apiRequestDetail(target);
    }
  }

  function calculateRisk(data) {
    return Math.floor(Math.random() * 100) + 1;
  }

  function animateDetails(close) {

    var hideClass = 'slide-out';
    var showClass = 'slide-in';
    var visible = new RegExp('\\b' + showClass + '\\b');
    var hidden = new RegExp('\\b' + hideClass + '\\b');
    var isVisible = project.className.match(hidden);

    if (!isVisible && close) {
      project.classList.remove(showClass);
      project.classList.add(hideClass);
      document.querySelector('#project').removeEventListener('click', animateListener);
    } else if (isVisible) {
      project.classList.remove(hideClass);
      project.classList.add(showClass);
      document.querySelector('#project').addEventListener('click', animateListener);
    }
  }


  function animateListener(e) {
    if (e.target && e.target.nodeName.toLowerCase() == 'button') {
      animateDetails(true);
    }
  }

})(this);
