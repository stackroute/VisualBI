var hotChocolate = angular.module("hotChocolate");
hotChocolate.controller('ConnectionModelController',
                        function($scope, $rootScope, $http, $uibModal, addNewConnection,
                                      getAvailableConnections, discover){
    $scope.availableConnections = [];
    $scope.addConnection = false;
    $scope.newConn = {};
    $scope.DataSourceName = "";
    $scope.$watch('DataSourceName', function(newValue, oldValue){
      $rootScope.DataSourceName = newValue;
    });
    $scope.CatalogName = "";
    $scope.$watch('CatalogName', function(newValue, oldValue){
      $rootScope.CatalogName = newValue;
    });
    $scope.CubeName = "";
    $scope.$watch('CubeName', function(newValue, oldValue){
      $rootScope.CubeName = newValue;
    });
    $scope.DataSourceNames = [];
    $scope.CatalogNames = [];
    $scope.CubeNames = [];
    $scope.dimensions = [];
    $scope.measures = [];
    $scope.getCatalogNames = function(DataSourceName){
      // $rootScope.DataSourceName = DataSourceName;
      $scope.CubeNames = [];
      discover.getSource('/'+DataSourceName).then(function(data){
        $scope.CatalogNames = data.data.values;
        console.log($scope.CatalogNames);
      });
    };
    $scope.getCubeNames = function(DataSourceName, CatalogName){
      // $rootScope.DataSourceName =
      console.log('/'+DataSourceName+'/'+CatalogName);
      discover.getSource('/'+DataSourceName+'/'+CatalogName).then(function(data){
        $scope.CubeNames = data.data.values;
        console.log($scope.CubeNames);
      });
    };
    $scope.getChildren = function(DataSourceName, CatalogName, CubeName){
      console.log('/'+DataSourceName+'/'+CatalogName+'/'+CubeName);
      discover.getDimensions('/'+DataSourceName+'/'+CatalogName+'/'+CubeName)
                      .then(function(data){
                         console.log(data.data.values);
                         $scope.dimensions = data.data.values;
      });
      discover.getMeasures('/'+DataSourceName+'/'+CatalogName+'/'+CubeName)
                      .then(function(data){
                            console.log(data.data.values);
                            $scope.measures = data.data.values;
                            for(var i=0; i < $scope.measures.length; i++) {
                              $scope.measures[i].isMember = "yes";
                            }
      });
    };
    $scope.getHierarchies = function(idx) {
      var pathName= "/"+ $scope.DataSourceName +
                    "/" + $scope.CatalogName +
                    "/" + $scope.CubeName +
                    "/" + $scope.dimensions[idx].unique_name;
      discover.getDimensions(pathName)
                      .then(function(data){
                         console.log(data.data.values);
                         $scope.dimensions[idx].children = data.data.values;

            });
    };
    $scope.getLevels = function(dimIdx, hierIdx) {
        var pathName= "/"+ $scope.DataSourceName +
                      "/" + $scope.CatalogName +
                      "/" + $scope.CubeName +
                      "/" + $scope.dimensions[dimIdx].unique_name +
                      "/" + $scope.dimensions[dimIdx].children[hierIdx].unique_name;
        discover.getDimensions(pathName)
                        .then(function(data){
                           console.log(data.data.values);
                           $scope.dimensions[dimIdx].children[hierIdx].children = data.data.values;
                        });
    };
    $scope.getMembers = function(dimIdx, hierIdx, levelIdx) {
      var pathName= "/"+ $scope.DataSourceName +
                    "/" + $scope.CatalogName +
                    "/" + $scope.CubeName +
                    "/" + $scope.dimensions[dimIdx].unique_name +
                    "/" + $scope.dimensions[dimIdx].children[hierIdx].unique_name +
                    "/" + $scope.dimensions[dimIdx].children[hierIdx].children[levelIdx].unique_name;
      discover.getDimensions(pathName)
                      .then(function(data){
                         console.log(data.data.values);
                         $scope.dimensions[dimIdx].children[hierIdx].children[levelIdx].children = data.data.values;
                       });
    };
    $scope.open = function(){
      var response = getAvailableConnections.availableConnections();
      response.then(function(data) {
        $scope.availableConnections = data.data;
        var modalInstance = $uibModal.open({
           animation: $scope.animationsEnabled,
           templateUrl: 'serverCredentials.html',
           controller: 'ModalInstanceCtrl',
           resolve: {
             availableConnections: function(){
               return $scope.availableConnections;
             },
             addConnection: function(){
               return $scope.addConnection;
             },
             newConn: function(){
               return $scope.newConn;
             }
           }
         });
         modalInstance.result.then(function (DataSourceNames) {
           $scope.CatalogNames = [];
           $scope.CubeNames = [];
           $scope.DataSourceNames = DataSourceNames;
         });
       });
     };
     $scope.toggleAnimation = function () {
      $scope.animationsEnabled = !$scope.animationsEnabled;
     };
   });



hotChocolate.controller('ModalInstanceCtrl',
    function ($scope, $uibModalInstance, availableConnections, addNewConnection, saveConnection, discover)
    {
       $scope.availableConnections = availableConnections;
      //  $scope.DataSourceNames = DataSourceNames;
       /*************** What to be done for saving **********/
       $scope.save = function (conn) {
          if(conn!=="? undefined:undefined ?")
        {
          saveConnection.saveConnection(conn)
                        .then(function(data){
                          discover.getSource('/').then(function(data){
                            $scope.DataSourceNames = data.data.values;
                            console.log($scope.DataSourceNames);
                            $uibModalInstance.close($scope.DataSourceNames);
                          }, function(error){
                            $scope.DataSourceNames = [];
                            console.log(error);
                            $uibModalInstance.close();
                          });
                         });
       }};
       $scope.cancel = function () {
         $uibModalInstance.dismiss('cancel');
       };
       $scope.reset = function () {
         $scope.newConn = {};
       };
       $scope.addConn = function(){
         addNewConnection.addNewConnection($scope.newConn)
                          .then(function(){
                            discover.getSource('/').then(function(data){
                              $scope.DataSourceNames = data.data.values;
                              console.log($scope.DataSourceNames);
                              $uibModalInstance.close($scope.DataSourceNames);
                            }, function(error){
                              $scope.DataSourceNames = [];
                              console.log(error);
                              $uibModalInstance.close();
                            });
                        });
        //  $uibModalInstance.close();
       };
       $scope.addNewConnection = function(){
         $scope.addConnection = !$scope.addConnection;
       };
     });
