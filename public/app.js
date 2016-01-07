var app = angular.module('hotChocolate',[]);

app.controller('headerController', function($scope) {
  $scope.headings = ['Columns', 'Rows', 'Filters'];
  $scope.defaultMessage = "Drag measures/dimensions here";
  $scope.list = [];
  $scope.hideMe = function() {
    return $scope.list.length > 0;
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
});
