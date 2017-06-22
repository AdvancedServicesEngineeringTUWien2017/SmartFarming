# Collect data from Raspberry Pi

For this project a [raspberry pi 3](https://www.raspberrypi.org/products/raspberry-pi-3-model-b/) with an [DHT11 sensors module](http://www.uugear.com/portfolio/dht11-humidity-temperature-sensor-module/) for temperature and humidity was used.

The data will be published to the AWS IoT MQTT message broker unter the topic "farming/<senosrId>".

## Setup

### Install Sensor
The DHT11 sensor should be connected to the GPIO 4 pin, as shown in this [Tutorial](http://www.uugear.com/portfolio/dht11-humidity-temperature-sensor-module/). 

### Install SDK
After the checkout of the repository the setup.py file should be run, which installs all necessary SDKs and the AWS root certificate:
```Shell
pi> sudo chmod +x setup.py

pi> sudo ./setup.py
```

### Configure the sensor
To store the data for thr right sensor and customer, you should create a "sensor.conf" file with the following content:
```
<CustomerId>;<Field>;<SensorId>

e.g.
1;field1;sensor_field1_1
```
In the "pi" folder is a sample config, too.

### Create the thing in AWS IoT
In order to connect a sensor to the AWS Iot, you have to register the thing and create a certificate.
* [Create a thing](http://docs.aws.amazon.com/iot/latest/developerguide/register-device.html)
* [Create a certificate](http://docs.aws.amazon.com/iot/latest/developerguide/create-device-certificate.html)

The certificate must be stored on the device.

## Run
The script can be executed with the following command:
```Shell
# Certificate based mutual authentication
python readAndSendData.py -e <endpoint> -r <rootCAFilePath> -c <certFilePath> -k <privateKeyFilePath>
```
