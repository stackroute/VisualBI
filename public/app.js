var app = angular.module('hotChocolate',[]);

app.controller('headerController', function($scope) {
  $scope.headings = ['Columns', 'Rows', 'Filters'];
  $scope.defaultMessage = "Drag measures/dimensions here";
});

app.controller('connectionController', function($scope, $http) {
  $scope.connection = {
    serverUrl: "http://172.23.238.252:8080/pentaho/Xmla%3fuserid=admin%26password=password",
    dataSource: "",
    dataSourceOptions: [],
    catalog: "",
    cube: ""
  };

  $scope.dimensions = [];
  $scope.measures = [];

  $scope.getDimensions = function() {
    $http.get('/discover/getDimensions', {
      params: {
        xmlaServer: $scope.connection.serverUrl,
        pathName: "/"+ $scope.connection.dataSource + "/" + $scope.connection.catalog + "/" + $scope.connection.cube + " Analysis"
      }
    }).success(function(data) {
      $scope.dimensions = data.values;
    });
  };

  $scope.getMeasures = function() {
    $http.get('/discover/getMeasures', {
      params: {
        xmlaServer: $scope.connection.serverUrl,
        pathName: "/"+ $scope.connection.dataSource + "/" + $scope.connection.catalog + "/" + $scope.connection.cube + " Analysis"
      }
    }).success(function(data) {
      $scope.measures = data.values;
    });
  };
});
