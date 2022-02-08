(function () {

    var url='https://envdata.blob.core.windows.net/tempdata/temps.csv?sv=2020-10-02&st=2022-01-11T09%3A43%3A32Z&se=2022-12-31T09%3A43%3A00Z&sr=b&sp=r&sig=l%2B5vneBSig8LTuyeefnsSUoRG2gFF8P4ZFZcHOEEQ8A%3D'
    var DateTime
    var parsedDateTime
    var strDateTime
    var Temperatures
    var chart

    d3.csv(url)
      .then(makeChart);

    function filterdata() {
      const fdate = [...DateTime];
      const sdate = [...strDateTime];
      var startdate = document.getElementById('startdate').valueAsNumber;
      var enddate = document.getElementById('enddate').valueAsNumber;

      console.log(startdate > enddate);
      console.log(document.getElementById('startdate').value,startdate)
      console.log(document.getElementById('enddate').value,enddate)

      //check for valid dates
      if (startdate > enddate) {
        console.log('One');
        enddate=fdate[fdate.length-1];
        document.getElementById("enddate").valueAsNumber = enddate;
      } else if (!enddate) {
        console.log('Two: fdate length'+fdate[fdate.length-1]);
        enddate=fdate[fdate.length-1];
        console.log(enddate,fdate[fdate.length-1]);
      } else if (!startdate) {
        console('Three');
        startdate=fdate[0];
      };

      const startindex = fdate.findIndex(function(number) {
              return number > startdate-14400000;
              });
      var endindex = fdate.findIndex(function(number) {
              // enddate + 24h - 4h (to cover the 4h GMT)
              return number > enddate+86400000-14400000;
              });
      if (endindex == -1){
        console.log("Length of fdate is "+fdate.length);
        endindex=fdate.length-1;
      }
      console.log(startdate);
      console.log(startindex);
      console.log(enddate);
      console.log(endindex);


      //slice the array
      const filterDate = fdate.slice(startindex,endindex+1);
      const filterstrDate = sdate.slice(startindex,endindex+1);
      console.log(filterstrDate,filterDate);
      // replace values in the chart
      chart.config.data.labels = filterstrDate;
      // replace data points
      const filterTemp = [...Temperatures];
      filteredDataPoints = filterTemp.slice(startindex,endindex+1);
      console.log(filteredDataPoints)
      chart.config.data.datasets[0].data = filteredDataPoints;
      chart.update();
    }

    function getdate() {
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth()+1; //January is 0!
        var yyyy = today.getFullYear();

        if(dd<10) {
            dd = '0'+dd
       } 

       if(mm<10) {
           mm = '0'+mm
       } 

      today = yyyy + '-' + mm + '-' + dd;
  console.log(today);
  document.getElementById("enddate").value = today;
    }

    function fillCurrentTemp(Temp,Date,currentTemp) {
      document.getElementById(currentTemp).text = "Current Temperature is "+Temp+" recorded on "+Date;
    }

    function makeChart(envdata) {

      // console.log(envdata)
      // Datetime array as strings
      strDateTime = envdata.map(function(d) {
                                              repl = d.DateTime.replace(/-/g,'/');
                                              return repl;
                                            });
      Temperatures = envdata.map(function(d) {return d.Temperature});
      // Datetime array as epoch time
      parsedDateTime = envdata.map(function(d) {
                                                repl = d.DateTime.replace(/-/g,'/');
                                                parts = repl.split('/');
                                                return Date.parse(parts[1]+'/'+parts[0]+'/'+parts[2]+':00:GMT+0400');
                                                //return Date.parse(parts[1]+'/'+parts[0]+'/'+parts[2]+':00');
                                              });

      // Takes every 6th item of the chart (this means we capture hourly events )
      // since the python script on the RPi samples and uploads every 10 minutes
      DateTime = parsedDateTime.filter( (e, i) => i % 6 === 0 );
      strDateTime = strDateTime.filter( (e, i) => i % 6 === 0 );
      Temperatures = Temperatures.filter( (e, i) => i % 6 === 0 );
      


      var chartData = {
          labels: strDateTime,
          datasets: [
            {
              data: Temperatures,
              fill: false,
              borderJoinStyle: 'bevel',
              borderColor: 'rgba(75, 192, 192)',
              tension: 0.4
           }
          ]
        };

      var scalesOptions = {
                        x: {
                          type: 'time',
                          time: {
                            unit: 'day'
                          } 
                        },
                        y: {
                          ticks : {
                            callback: function(value, index, values) {
                            return value + '°C'
                          }
                        }
                      }
                    };


      var panOptions = {  enabled: true, 
                      mode: 'x', 
                      modifierKey: 'shift' 
                    };

      var limitsOptions = {
                x: {min: -200, max: 200, minRange: 50},
                y: {min: -200, max: 200, minRange: 50}
          };

      var dragOptions = {enabled:true, 
                         backgroundColor: 'rgba(255,99,132,0.1)', 
                         borderWidth: 2, 
                         threshold: 1};

      var legendOptions = {display: false};


      chart = new Chart('chart', {
        type: 'line',
        data: chartData,
        maintainAspectRatio: true,
        borderCapStyle: 'round',
        options: {
          // scales : scalesOptions,
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Temperature Chart (°C)' },
            legend: legendOptions,
            zoom: {
              zoom: {
                mode: 'x',
                // limits: limitsOptions,
                wheel: { enabled: true },
                pinch: { enabled: true },
                drag: dragOptions
              },
              pan: panOptions
            }
          },
        }
      });

      fillCurrentTemp(Temperatures[Temperatures.length-1],strDateTime[strDateTime.length-1],"currentTemp");
      document.getElementById ("startdate").valueAsNumber=DateTime[0];
      document.getElementById ("enddate").valueAsNumber=DateTime[DateTime.length-1];
      currentDay = new Date();
      minDay = new Date(DateTime[0])
      document.getElementById ("enddate").setAttribute("max",currentDay.toISOString().split('T')[0]);
      document.getElementById ("enddate").setAttribute("min",minDay.toISOString().split('T')[0]);
      document.getElementById ("startdate").setAttribute("max",currentDay.toISOString().split('T')[0]);
      document.getElementById ("chart").addEventListener ("dblclick", resetZoomChart);
      document.getElementById ("resetchart").addEventListener ("click", resetZoomChart);
      document.getElementById ("startdate").addEventListener ("change", filterdata);
      document.getElementById ("enddate").addEventListener ("change", filterdata);
   }

    function resetZoomChart() {
      chart.config.data.datasets[0].data = Temperatures
      chart.config.data.labels = strDateTime;
      document.getElementById("startdate").value="2022-01-01"
      chart.resetZoom();
    }
})()