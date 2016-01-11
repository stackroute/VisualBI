var app = angular.module('hotChocolate',['ngDragDrop']);

app.controller('queryController', function($scope, $http) {
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

  $scope.mdxQuery = "";
  $scope.executeQueryData = [];

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
      for(var i=0; i < $scope.measures.length; i++) {
        $scope.measures[i].isMember = "yes";
      }
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
                  for(var l=0; l < levels[k].children.length; l++) {
                    levels[k].children[l].isMember = "yes";
                  }
                }
              }
            }
          }
        }
      }
    });
  };

});

app.directive('gridRender', function($http) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      element.on('click', function() {
        $( "#dataTableBody tr" ).replaceWith( "" );
        $http.post('/execute', {
            url: "http://172.23.238.252:8080/pentaho/Xmla?userid=admin&password=password",
            dataSource: "Pentaho",
            catalog: "SampleData",
            statement: buildQuery()
        }).success(function(data) {
            scope.executeQueryData = data;
            renderData(data);
          });
      });

      function buildQuery() {
        var subQuery = ["{}", "{}"];
        for(var i=0; i < 2; i++) {
          var dragItems = scope.items[i].list;
          var len = dragItems.length;
          if(len > 0) {
            for(var j=0; j < len; j++) {
              if(dragItems[j].isMember === "yes") {
                subQuery[i] = "UNION(" + "{" + dragItems[j].unique_name + "}," + subQuery[i] + ")";
              } else {
                subQuery[i] = "UNION(" + dragItems[j].unique_name + ".members," + subQuery[i] + ")";
              }
            }
          }
        }
        scope.mdxQuery = "select " + subQuery[0] + " on columns, " + subQuery[1] + " on rows" + " from [Quadrant Analysis]" ;
        return scope.mdxQuery;
      }

      function renderData(data){
        var addElement, ans, fs, members, tdChild;
        var axes = data.Axes,
            axis = axes.Axis,
            axis0 = axis[0],
            axis1 = axis[1];

            addElement = function(members, tree, level) {
              var child;
              if (members[0] != null) {
                child = members[0];
                if (!tree[child.Caption]) {
                  tree[child.Caption] = {
                    count: 0,
                    children: {}
                  };
                }
                tree[child.Caption].count += 1;
                tree[child.Caption].level = child.index;
                addElement(members.slice(1), tree[child.Caption].children, child.index + 1);
              }
              return tree;
              };


              axis0Child = axis0.reduce((function(acc, member) {
              return addElement(member.Member, acc, 1);
              }), {});
              tdAxis0Child = function(element) {
                var a, ele, name,
                    frag0 = "<tr>";
                for(var axis1MemberIndex=0, axis1MemberLen = axis1[0].Member.length; axis1MemberIndex < axis1MemberLen; axis1MemberIndex++){
                  frag0 += '<th></th>';
                }
                a = (function() {
                      var results, elementArray, prevElementArray;
                          results = [];
                          elementArray = [];
                          prevElementArray = [];
                          elementArray.push(element);
                      while(elementArray.length !== 0){
                        results.push(frag0);
                        for(var index in elementArray){
                          element = elementArray[index];
                          prevElementArray[index] = elementArray[index];
                          for (name in element) {
                            ele = element[name];
                            results.push(("<td colspan='" + ele.count + "' class='level" + ele.level + "'>" + name + "</td>"));
                          }
                        }
                        results.push("</tr>");
                        elementArray = [];
                        for(index in prevElementArray){
                          element = prevElementArray[index];
                          for (name in element) {
                            ele = element[name];
                            if(Object.keys(ele.children).length !== 0){
                              elementArray.push(ele.children);
                            }
                          }
                        }
                      }
                    return results;
                  })();
                return (a.reduce((function(acc, line) {
                  return acc + line;
                }), ""));
              };
            var template0 = $.trim($("#axis0_insersion").html()),
                frag0 = template0.replace(/{{axis0}}/ig,tdAxis0Child(axis0Child));
            $('#dataTableBody').append(frag0);

          var cellData = data.CellData,
              cells = cellData.Cell,
              val = [];
          for (var cellIndex in cells) {
            var valObj = {};
            valObj.value = cells[cellIndex].FmtValue;
            val.push(valObj);
          }
          var count  = 0,
              dataArray = [];
          for (var j = 0, len1 = axis1.length; j < len1; j++) {
            td='';
            var axis1Member = axis1[j].Member;
            var axis1Name = '';
            for(var memIndex1 in axis1Member){
              axis1Name = axis1Name+axis1Member[memIndex1].Caption+".";
            }
            var tempDataObj = {};
            for (var i = 0, len = axis0.length; i < len; i++) {
              td += "<td>"+val[count].value+"</td>";
              count++;
            }
            tempDataObj.td = td;
            dataArray.push(tempDataObj);
          }


          axis1Child = axis1.reduce((function(acc, member) {
            return addElement(member.Member, acc, 1);
          }), {});
          var elementIndex = 0;

          tdAxis1Child = function(element) {
            var a, ele, name;
            if (Object.keys(element).length === 0) {
              return "</tr>";
            }
            else {
              a = (function() {
                var results = [];
              for (name in element) {
                ele = element[name];
                if(Object.keys(ele.children).length === 0){
                  results.push(("<tr><td rowspan='" + ele.count + "' class='level" + ele.level + "'>" + name + "</td>")+dataArray[elementIndex].td);
                  elementIndex += 1;
                }
                else{
                  results.push(("<tr><td rowspan='" + ele.count + "' class='level" + ele.level + "'>" + name + "</td>") + tdAxis1Child(ele.children));
                }
              }
              return results;
            })();
            return (a.reduce((function(acc, line) {
              return acc + line;
            }), "")).slice(4);
          }
        };
        var template1 = $.trim($("#axis1_insersion").html());
        var frag1 = template1.replace(/{{axis1}}/ig,"<tr>"+tdAxis1Child(axis1Child));
        $('#dataTableBody').append(frag1);
      } // end renderData
    } // end link
  }; // end return
}); // end  directive
