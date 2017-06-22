import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {MeasurementsDto} from "./entities/measurements.model";
import {TempSeries} from "./entities/series.model";
import groupArray from 'group-array';
import {config} from '../environments/aws.config';

declare const AWS: any;

AWS.config.update({
  region: config.region,
  // accessKeyId default can be used while using the downloadable version of DynamoDB.
  // For security reasons, do not store AWS Credentials in your files. Use Amazon Cognito instead.
  accessKeyId: config.accessKeyId,
  // secretAccessKey default can be used while using the downloadable version of DynamoDB.
  // For security reasons, do not store AWS Credentials in your files. Use Amazon Cognito instead.
  secretAccessKey: config.secretAccessKey
});

var docClient = new AWS.DynamoDB.DocumentClient();


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css',
    "../../node_modules/font-awesome/css/font-awesome.min.css"],

  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit  {

  sensorId: string;
  options: Object;
  sensorOptions: Object;
  onPointSelect(point) {
    alert(`${point.y} is selected`);
  }
  onSeriesHide(series) {
    alert(`${series.name} is selected`);
  }
  constructor() {

  }
  ngOnInit() {
    this.scanData();
  }

  scanData() {
    var params: any = {
      TableName: "Measurements"

    };
    docClient.scan(params, (err, data) => {
      if (err) {
        console.log( "Unable to scan the table: " + "\n" + JSON.stringify(err, undefined, 2));
      } else {
        var datalist = groupArray(data.Items, 'Field', 'SensorId')

        var seriesData: Array<TempSeries> = [];

        Object.keys(datalist).forEach(function(key) {
          var field = datalist[key];

          Object.keys(field).forEach(function (key) {
            var sensordata = field[key];
            var series: TempSeries = new TempSeries(<string>key);

            for (var measurement of sensordata) {
              series.data.push({
                x: new Date(measurement.Timestamp*1000), y: (measurement.Temp/100)
              });
            }
            seriesData.push(series);
          });
        });

        this.options = {
          chart: {
            type: 'spline',
            zoomType: 'x'
          },
          title: {
            text: 'Temperatur'
          },
          xAxis: {
            type: 'datetime',

            dateTimeLabelFormats: { // don't display the dummy year
              millisecond:"%M:%S.%L",
              second:"%H:%M:%S",
              minute:"%H:%M",
              hour:"%H Uhr",
              day:"%d.%m.%Y",
              week:"Week from %A, %b %e, %Y",
              month:"%B %Y",
              year:"%Y"
            },
            title: {
              text: 'Zeitpunkt'
            }
          },
          yAxis: {
            title: {
              text: 'Temperatur in °C'
            }
            },
          tooltip: {
            headerFormat: '<b>{series.name}</b><br>',
            pointFormat: '{point.y} °C am {point.x:%d.%m.%Y %H:%M:%S}'
          },

          plotOptions: {
            spline: {
              marker: {
                enabled: true,
                radius: 2
              },
              lineWidth: 1,
              states: {
                hover: {
                  lineWidth: 1
                }
              },
              threshold: null
            }
          },
          series: seriesData
        };
      }
    });
  }



  loadSensorDataClick(){
    console.log(this.sensorId)
    var params: any = {
      TableName: "Measurements",
      FilterExpression: "#sensor = :sensor_id",
      ExpressionAttributeNames: {
        "#sensor": "SensorId",
      },
      ExpressionAttributeValues: {
        ":sensor_id": this.sensorId
      }
    };
    docClient.scan(params, (err, data) => {
      if (err) {
        console.log( "Unable to scan the table: " + "\n" + JSON.stringify(err, undefined, 2));
      } else {
        var datalist = groupArray(data.Items, 'Field', 'SensorId')

        var seriesData: Array<TempSeries> = [];

        Object.keys(datalist).forEach(function(key) {
          var field = datalist[key];

          Object.keys(field).forEach(function (key) {
            var sensordata = field[key];
            var series: TempSeries = new TempSeries(<string>key);
            series.type = 'spline';
            series.tooltip = { valueSuffix: ' °C'};
            var humSeries: TempSeries = new TempSeries(<string>key);
            humSeries.type = 'column';
            humSeries.yAxis = 1;
            humSeries.tooltip = { valueSuffix: ' %'};

            for (var measurement of sensordata) {
              series.data.push({
                x: new Date(measurement.Timestamp*1000), y: (measurement.Temp/100)
              });
              humSeries.data.push({
                x: new Date(measurement.Timestamp*1000), y: (measurement.Humidity/100)
              })
            }
            seriesData.push(humSeries);
            seriesData.push(series);
          });
        });

        this.sensorOptions = {
          chart: {
            zoomType: 'x'
          },
          title: {
            text: 'Information for Sensor '+this.sensorId
          },
          xAxis: {
            type: 'datetime',

            dateTimeLabelFormats: { // don't display the dummy year
              millisecond:"%M:%S.%L",
              second:"%H:%M:%S",
              minute:"%H:%M",
              hour:"%H Uhr",
              day:"%d.%m.%Y",
              week:"Week from %A, %b %e, %Y",
              month:"%B %Y",
              year:"%Y"
            },
            title: {
              text: 'Zeitpunkt'
            },
            crosshair: true
          },
          yAxis: [{
            labels: {
              format: '{value}°C'
            },
            title: {
              text: 'Temperatur'
            }
          },
            {
              labels: {
                format: '{value}%'
              },
              title: {
                text: 'Humidity'
              },
              opposite: true
            }],
          tooltip: {
            shared: true,
            headerFormat: '<b>{series.name}</b><br>',
            pointFormat: '{point.y} am {point.x:%d.%m.%Y %H:%M:%S}'
          },

          plotOptions: {
            spline: {
              marker: {
                enabled: true,
                radius: 2
              },
              lineWidth: 1,
              states: {
                hover: {
                  lineWidth: 1
                }
              },
              threshold: null
            }
          },
          series: seriesData
        };
      }
    });
  }


  title = 'app';


}
