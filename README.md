# ASESmartFarming
Project for ASE SS2017

## Introduction
The scenario of this project is placed in the agriculture sector. The idea is to monitor the fields for different data so that the farming can be optimized. 

## Design

As a sensor this project uses a [raspberry pi 3](https://www.raspberrypi.org/products/raspberry-pi-3-model-b/) with an [DHT11 sensors module](http://www.uugear.com/portfolio/dht11-humidity-temperature-sensor-module/) for temperature and humidity. By executing a [python](https://www.python.org/) script, this raspberry pi will collect the data provided by the sensors and forwards them to a message broker. Additionally, to test the application with a huge amount of traffic and data a second python script will fake some sensors and publishes to the MOM. This script can run on every client installed python. For testing reasons I executed on an [AWS EC2](https://aws.amazon.com/de/ec2/) instance.

The [Amazon AWS IoT](https://aws.amazon.com/de/iot-platform/how-it-works/) represents the core middleware of the system, which handles the secure connection the sensors, the message broker and the rules engine. For the security each sensor will get a certificate and a public and private key. The AWS IoT MQTT message broker represents the interface for the sensors. On receiving messages the rules engine selects them and stores the data to an [Amazon DynamoDB](https://aws.amazon.com/de/dynamodb/), which is a fully managed NoSQL database service that provides fast and predictable performance with seamless scalability. The configuration is located in the "aws" folder.

The human interface for the customer will be an [Angular](https://angular.io/) application. The data are represented with [Higcharts](https://www.highcharts.com/). This application connects directly to the DynamoDB using the [AWS JavaScript SDK](https://aws.amazon.com/de/sdk-for-browser/). This application runs on a EC2 instance.

## Project Structure

The project is split up into the following parts:

* fakesensor ... python script for the fakesensors

* pi ... python script fot the raspberry pi

* smartfarming ... angular application

## AWS Configuration

### Connect the Sensors

In order to connect a sensor to the AWS Iot, you have to register the thing and create a certificate.
* [Create a thing](http://docs.aws.amazon.com/iot/latest/developerguide/register-device.html)
* [Create a certificate](http://docs.aws.amazon.com/iot/latest/developerguide/create-device-certificate.html)

The certificate must be stored on the device.

### DynamoDB Table
Create the Table Measurements with the following configurations:
```
{
    "Table": {
        "TableArn": "arn:aws:dynamodb:us-west-2:378544987037:table/Measurements",
        "AttributeDefinitions": [
            {
                "AttributeName": "CustomerId",
                "AttributeType": "N"
            },
            {
                "AttributeName": "Field",
                "AttributeType": "S"
            },
            {
                "AttributeName": "SensorId",
                "AttributeType": "S"
            },
            {
                "AttributeName": "Timestamp",
                "AttributeType": "N"
            }
        ],
        "GlobalSecondaryIndexes": [
            {
                "IndexSizeBytes": 222399,
                "IndexName": "CustomerId-Field-index",
                "Projection": {
                    "ProjectionType": "ALL"
                },
                "ProvisionedThroughput": {
                    "NumberOfDecreasesToday": 0,
                    "WriteCapacityUnits": 5,
                    "ReadCapacityUnits": 5
                },
                "IndexStatus": "ACTIVE",
                "KeySchema": [
                    {
                        "KeyType": "HASH",
                        "AttributeName": "CustomerId"
                    },
                    {
                        "KeyType": "RANGE",
                        "AttributeName": "Field"
                    }
                ],
                "IndexArn": "arn:aws:dynamodb:us-west-2:378544987037:table/Measurements/index/CustomerId-Field-index",
                "ItemCount": 3260
            }
        ],
        "ProvisionedThroughput": {
            "NumberOfDecreasesToday": 0,
            "WriteCapacityUnits": 5,
            "ReadCapacityUnits": 5
        },
        "TableSizeBytes": 222399,
        "TableName": "Measurements",
        "TableStatus": "ACTIVE",
        "KeySchema": [
            {
                "KeyType": "HASH",
                "AttributeName": "SensorId"
            },
            {
                "KeyType": "RANGE",
                "AttributeName": "Timestamp"
            }
        ],
        "ItemCount": 3260,
        "CreationDateTime": 1497865061.655
    }
}
```

### IoT-Rules
The following rule stores the sensordata from the sensors to the dynamoDB table:
```
{
    "ruleArn": "arn:aws:iot:us-west-2:378544987037:rule/SaveMeasures",
    "rule": {
        "awsIotSqlVersion": "2016-03-23",
        "sql": "SELECT * FROM 'farming/+'",
        "ruleDisabled": false,
        "actions": [
            {
                "dynamoDBv2": {
                    "putItem": {
                        "tableName": "Measurements"
                    },
                    "roleArn": "arn:aws:iam::378544987037:role/service-role/ASEDB"
                }
            }
        ],
        "ruleName": "SaveMeasures"
    }
}
```

