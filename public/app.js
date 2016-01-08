var app = angular.module('hotChocolate',['ngDragDrop']);

app.controller('queryController', function($scope) {
  $scope.items = [{
                    label: 'Columns',
                    list: []
                  }, {
                    label: 'Rows',
                    list: []
                  }, {
                    label: 'Filters',
                    list: []
                  }];
  $scope.hideMe = function(list) {
    return list.length > 0;
  };
});

app.controller('connectionController', function($scope, $http) {
  $scope.connection = {
    serverUrl: "http://172.23.238.252:8080/pentaho/Xmla%3fuserid=admin%26password=password",
    dataSource: "",
    dataSourceOptions: [],
    catalog: "",
    catalogOptions: [],
    cube: "",
    cubeOptions: []
  };

  $scope.dimensions = [];
  $scope.measures = [];

  $scope.getCatalog = function() {
    $http.get('/discover/getServerDetails', {
      params: {
        xmlaServer: $scope.connection.serverUrl,
        pathName: "/" + $scope.connection.dataSource
      }
    }).success(function(data) {
      $scope.connection.catalogOptions = data.values;
    });
  };

  $scope.getCube = function() {
    $http.get('/discover/getServerDetails', {
      params: {
        xmlaServer: $scope.connection.serverUrl,
        pathName: "/" + $scope.connection.dataSource + "/" + $scope.connection.catalog
      }
    }).success(function(data) {
      $scope.connection.cubeOptions = data.values;
    });
  };

  $scope.getDimensions = function() {
    $http.get('/discover/getDimensions', {
      params: {
        xmlaServer: $scope.connection.serverUrl,
        pathName: "/"+ $scope.connection.dataSource + "/" + $scope.connection.catalog + "/" + $scope.connection.cube
      }
    }).success(function(data) {
      $scope.dimensions = data.values;
    });
  };

  $scope.getMeasures = function() {
    $http.get('/discover/getMeasures', {
      params: {
        xmlaServer: $scope.connection.serverUrl,
        pathName: "/"+ $scope.connection.dataSource + "/" + $scope.connection.catalog + "/" + $scope.connection.cube
      }
    }).success(function(data) {
      $scope.measures = data.values;
    });
  };

  $scope.getHierarchies = function(unique_name) {
    $http.get('/discover/getDimensions', {
      params: {
        xmlaServer: $scope.connection.serverUrl,
        pathName: "/"+ $scope.connection.dataSource + "/" + $scope.connection.catalog + "/" + $scope.connection.cube + "/" + unique_name
      }
    }).success(function(data) {
      var len = $scope.dimensions.length;
      for(var i=0; i < len; i++) {
        if($scope.dimensions[i].unique_name === unique_name) {
          $scope.dimensions[i].children = data.values;
        }
      }
    });
  };

  $scope.getLevels = function(dim_unique_name, hier_unique_name) {
    $http.get('/discover/getDimensions', {
      params: {
        xmlaServer: $scope.connection.serverUrl,
        pathName: "/"+ $scope.connection.dataSource + "/" + $scope.connection.catalog + "/" + $scope.connection.cube + "/" + dim_unique_name + "/" + hier_unique_name
      }
    }).success(function(data) {
      var dim_len = $scope.dimensions.length;
      for(var i=0; i < dim_len; i++) {
        if($scope.dimensions[i].unique_name === dim_unique_name) {
          var hiers = $scope.dimensions[i].children;
          var hier_len = hiers.length;
          for(var j=0; j < hier_len; j++) {
            if(hiers[j].unique_name === hier_unique_name) {
              hiers[j].children = data.values;
            }
          }
        }
      }
    });
  };

  $scope.getMembers = function(dim_unique_name, hier_unique_name, level_unique_name) {
    $http.get('/discover/getDimensions', {
      params: {
        xmlaServer: $scope.connection.serverUrl,
        pathName: "/"+ $scope.connection.dataSource + "/" + $scope.connection.catalog + "/" + $scope.connection.cube + "/" + dim_unique_name + "/" + hier_unique_name + "/" + level_unique_name
      }
    }).success(function(data) {
      var dim_len = $scope.dimensions.length;
      for(var i=0; i < dim_len; i++) {
        if($scope.dimensions[i].unique_name === dim_unique_name) {
          var hiers = $scope.dimensions[i].children;
          var hier_len = hiers.length;
          for(var j=0; j < hier_len; j++) {
            if(hiers[j].unique_name === hier_unique_name) {
              var levels = hiers[j].children;
              var level_len = levels.length;
              for(var k=0; k < level_len; k++) {
                if(levels[k].unique_name === level_unique_name) {
                  levels[k].children = data.values;
                }
              }
            }
          }
        }
      }
    });
  };

});
