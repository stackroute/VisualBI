/*
   * Copyright 2016 NIIT Ltd, Wipro Ltd.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *    http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *
   * Contributors:
   *
   * 1. Abhilash Kumbhum
   * 2. Anurag Kankanala
   * 3. Bharath Jaina
   * 4. Digvijay Singam
   * 5. Sravani Sanagavarapu
   * 6. Vipul Kumar
*/

var app = angular.module('hotChocolate');

app.factory('executeQueryService', function($http, $rootScope) {
  return {
    render: function (containerDiv, parameters) {
      // var container = angular.element(containerDiv);
       var req = {
          method: 'POST',
          url: '/execute',
          data: parameters
        };
       return new Promise (function(resolve, reject){
         $http(req).then(function(data){
           var graphArray = renderData (containerDiv, data.data);
           if(graphArray !== undefined){
             resolve(graphArray);
           }
           else{
             reject ("Error in rendering the table !!!");
           }
         }, function(err){
           reject(err);
         });
       });
    },
    removeGrid : function (container) {
      container.children().replaceWith('');
    }
  };
});

var renderData =  function (containerBox, data){
  var container = $(containerBox);
  container.css('overflow','hidden');
  container.append('<div id="section_result">'+
      '<div id="topDiv">'+
        '<div id="topLeft">'+
        '</div>'+
        '<div id="topRight">'+
          '<table id="topRight_dataTable">'+
            '<tbody id="topRight_dataTableBody">'+
              '<script id="topRight_insersion">'+
              '</script>'+
            '</tbody>'+
          '</table>'+
        '</div>'+
      '</div>'+
      '<div id="bottomDiv">'+
        '<div id="bottomLeft">'+
          '<table id="bottomLeft_dataTable">'+
            '<tbody id="bottomLeft_dataTableBody">'+
              '<script id="bottomLeft_insersion">'+
              '</script>'+
            '</tbody>'+
          '</table>'+
        '</div>'+
        '<div id="bottomRight">'+
          '<table id="bottomRight_dataTable">'+
            '<tbody id="bottomRight_dataTableBody">'+
              '<script id="bottomRight_insersion">'+
              '</script>'+
            '</tbody>'+
          '</table>'+
      '</div>'+
      '</div>');

  container.find('#topLeft_insersion').append('{{axis_topLeft}}');
  container.find('#topRight_insersion').append('{{axis_topRight}}');
  container.find('#bottomLeft_insersion').append('{{axis_bottomLeft}}');
  container.find('#bottomRight_insersion').append('{{axis_bottomRight}}');
  var axes = data.Axes,
      axis = axes.Axis,
      axis0 = axis[0], //.Tuples.Tuple
      axis1 = axis[1],
      // axis2 = axis[2].Tuples.Tuple,
      axis0Child = {},
      axis1Child = {};
  /************* Function for graphKey *****************/
  var axis0Names = [];
  for (var index0 in axis0){
     var axis0Member = axis0[index0].Member;
     var axis0Name = '';
     for(var memIndex0 in axis0Member){
       axis0Name = axis0Name+axis0Member[memIndex0].Caption+".";
     }
     axis0Name = axis0Name.substring(0,axis0Name.length-1);
     axis0Names.push(axis0Name);
   }

   /************* Headings for Graph Modal *****************/
   var axis1Names = [];
   for (var index1 in axis1){
      var axis1Member = axis1[index1].Member;
      var axis1Name = '';
      for(var memIndex1 in axis1Member){
        axis1Name = axis1Name+axis1Member[memIndex1].Caption+".";
      }
      axis1Name = axis1Name.substring(0,axis1Name.length-1);
      axis1Names.push(axis1Name);
    }

  /***************** Generating tree structure ****************/
  addElement = function(members, tree, level) {
    var child;
    if (members[0] != null) {
      child = members[0];
      if (!tree[child.UName]) {
        tree[child.UName] = {
          count: 0,
          caption: child.Caption,
          children: {}
        };
      }
      tree[child.UName].count += 1;
      tree[child.UName].level = child.index;
      addElement(members.slice(1), tree[child.UName].children, child.index + 1);
    }
    return tree;
  };

  /***************** Graph Arrays *************/
  var graphKey = [];

  /***************** Axis0 Hierarchical Structure **********/
  axis0Child = axis0.reduce((function(acc, member) {
    return addElement(member.Member, acc, 1);
  }), {});

  /* Inserting empty th in #topLeft */
  // frag0_0 = "";
  // for(var axis0MemberIndex=0, axis0MemberLen = axis0[0].Member.length; axis0MemberIndex < axis0MemberLen; axis0MemberIndex++)
  // {
  //   frag0_0 += "<tr>";
  //   for(var axis1MemberIndex=0, axis1MemberLen = axis1[0].Member.length; axis1MemberIndex < axis1MemberLen; axis1MemberIndex++){
  //     frag0_0 += '<th></th>';
  //     if(axis1MemberIndex == axis1MemberLen-1){
  //       frag0_0 += '</tr>';
  //     }
  //   }
  // }
  // var template0_0 = $.trim(container.find("#topLeft_insersion").html()).replace(/{{axis_topLeft}}/ig,frag0_0);
  // container.find('#topLeft_dataTableBody').append(template0_0);  // #dataTableBody





  /************* Function for rendering axis0 *****************/
  tdAxis0Child = function(element) {
    var a, ele, name,
        frag0 = "<tr>";
    // for(var axis1MemberIndex=0, axis1MemberLen = axis1[0].Member.length; axis1MemberIndex < axis1MemberLen; axis1MemberIndex++){
    //   frag0 += '<th></th>';
    // }
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
            results.push(("<th colspan='" + ele.count + "' class='level" + ele.level + "'>" + ele.caption + "</th>"));
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
  // console.log(tdAxis0Child(axis0Child));
  var template0 = $.trim(container.find("#topRight_insersion").html()),
      frag0 = template0.replace(/{{axis_topRight}}/ig,tdAxis0Child(axis0Child));
  container.find('#topRight_dataTableBody').append(frag0);  // #dataTableBody

  /****************************** Data **********************************/
  var cellData = data.CellData,
      cells = cellData.Cell,
      val = [];
  var td = '';
  for (var cellIndex in cells) {
    val[cells[cellIndex].CellOrdinal] = cells[cellIndex].FmtValue;
  }
  var count  = 0,
      dataArray = [],
      graphData = [];
  for (var j = 0, len1 = axis1.length; j < len1; j++) {
    td +='<tr>';
    var tempDataObj = {};
    var graphInnerArray = [];
    for (var i = 0, len = axis0.length; i < len; i++) {
      var graphObj = {};
      if(val[count] !== undefined && val[count] !== null)
      {
        graphObj.key = axis0Names[i];
        graphObj.value = parseFloat(val[count].replace(/,/g,''));
        graphInnerArray.push(graphObj);
      }
      if(val[count] === undefined){
        val[count] = "";
      }
      td += "<td>"+val[count]+"</td>";
      count++;
    }
    td += '</tr>';
    graphData.push(graphInnerArray);
    tempDataObj.td = td;
    dataArray.push(tempDataObj);
  }
  graphData.push(axis1Names);

  /****************************** Axis1 Hierarchical Structure **********************************/
  axis1Child = axis1.reduce((function(acc, member) {
    return addElement(member.Member, acc, 1);
  }), {});
  var elementIndex = 0;

  /************* Function for rendering axis1 *****************/
  var rowId = 0;
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
            results.push(("<tr id='row"+rowId+"' class='dataRow'><th rowspan='" + ele.count + "' class='level" + ele.level + "'>" + ele.caption + "</th></tr>"));
            elementIndex += 1;
            rowId += 1;
          }
          else{
            results.push(("<tr id='row"+rowId+"' class='dataRow'><th rowspan='" + ele.count + "' class='level" + ele.level + "'>" + ele.caption + "</th>") + tdAxis1Child(ele.children));
          }
        }
        return results;
      })();
      return (a.reduce((function(acc, line) {
        return acc + line;
      }), "")).slice(4);
    }
  };
  var template1_1 = $.trim(container.find("#bottomLeft_insersion").html());
  var frag1_1 = template1_1.replace(/{{axis_bottomLeft}}/ig,'<tr '+tdAxis1Child(axis1Child));
  console.log(frag1_1);
  container.find('#bottomLeft_dataTableBody').append(frag1_1);
  /* Appending data in #bottomRight */
  // console.log(td);
  var template1_2 = $.trim(container.find("#bottomRight_insersion").html());
  var frag1_2 = template1_2.replace(/{{axis_bottomRight}}/ig,td);
  container.find('#bottomRight_dataTableBody').append(frag1_2);
  // debugger;
  container.find('#topLeft').css('width',container.find('#bottomLeft').css('width'));
  // console.log(axis0);
  container.find('#topRight').css('max-width', (parseInt(container.width()) - parseInt(container.find('#topLeft').css('width')) - 20));
  container.find('#topLeft').css('height',container.find('#topRight').css('height'));
  container.find('#bottomRight').css('max-width', (parseInt(container.width()) - parseInt(container.find('#bottomLeft').css('width')) - 20));
  console.log(container.height());
  container.find('#bottomRight').css('max-height', (parseInt(container.height()) - parseInt(container.find('#topRight').css('height')) - 20));
  console.log(container.find('#bottomRight').css('height'));
  container.find('#bottomLeft').css('max-height', (parseInt(container.height()) - parseInt(container.find('#topLeft').css('height')) - 20));
  for(var dataColumnIdx= 0, dataColumnLen = axis0.length; dataColumnIdx < dataColumnLen ; dataColumnIdx++ ){
    var width1 = parseInt(container.find('#topRight tr:last-child').children('th:nth-child('+(parseInt(dataColumnIdx)+1)+')').css('width'));
    var width2 = parseInt(container.find('#bottomRight tr').first().children('td:nth-child('+(parseInt(dataColumnIdx)+1)+')').css('width'));
    console.log(width1+" "+width2);
    if(width1 < width2)
    {
      container.find('#topRight tr:last-child').children('th:nth-child('+(parseInt(dataColumnIdx)+1)+')').css('min-width',parseInt(container.find('#bottomRight tr').first().children('td:nth-child('+(parseInt(dataColumnIdx)+1)+')').css('width')));
    }
    else{
      container.find('#bottomRight tr').children('td:nth-child('+(parseInt(dataColumnIdx)+1)+')').css('min-width',parseInt(container.find('#topRight tr:last-child').children('th:nth-child('+(parseInt(dataColumnIdx)+1)+')').css('width')));
    }
  }
  // debugger;
  for(var dataRowIdx= 1, dataRowLen = axis1.length; dataRowIdx <= dataRowLen ; dataRowIdx++ ){
    var height1 = parseInt(container.find('#bottomLeft tr:nth-child('+(parseInt(dataRowIdx)+1)+')').children('th:last-child').css('height'));
    console.log(height1);
    var height2 = parseInt(container.find('#bottomRight tr:nth-child('+(parseInt(dataRowIdx)+1)+')').children('td').css('height'));
    console.log(height2);
    if(height1 < height2)
    {
      container.find('#bottomLeft tr:nth-child('+(parseInt(dataRowIdx)+1)+')').children('th:last-child').css('height',height2);
    }
    else{
      container.find('#bottomRight tr:nth-child('+(parseInt(dataRowIdx)+1)+')').children('td').first().css('height',height1);
    }
  }

  /* Linking scroll bars */
  $('#bottomRight').scroll(function(){
    $('#topRight').scrollLeft($(this).scrollLeft());
    $('#bottomLeft').scrollTop($(this).scrollTop());
    $(this).scrollTop($('#bottomLeft').scrollTop());
  });

  /* Styling the grid */
  $("#bottomLeft tr:nth-child(even)").css('background-color','#A9C9A8');
  $("#bottomLeft tr:nth-child(odd)").css('background-color','rgb(229, 236, 229)');
  $("#bottomRight tr:nth-child(even)").css('background-color','rgb(223, 227, 236)');
  $("#bottomLeft tr:nth-child(even) th:last-child").css('background-color','rgb(223, 227, 236)');
  $("#bottomLeft tr:nth-child(odd) th:last-child").css('background-color','white');
  $("#topRight tr:nth-child(even)").css('background-color','#A9C9A8');
  $("#topRight tr:nth-child(odd)").css('background-color','rgb(229, 236, 229)');
  $("#topRight tr:last-child").css('background-color','rgb(217, 167, 155)');

  return graphData;
};
