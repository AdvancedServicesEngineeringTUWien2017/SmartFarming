# Fake data for testing

to test the application with a huge amount of traffic and data a second python script will fake some sensors and publishes to the MOM. 
This script can run on every client installed python. For testing reasons I executed on an AWS EC2 instance.

The script imitates 6 sensors and publishes every 30 seconds.
The data will be published to the AWS IoT MQTT message broker unter the topic "farming/<fakesenosrId>".

## Setup

### Install SDK
After the checkout of the repository the setup.py file should be run, which installs all necessary SDKs and the AWS root certificate:
```Shell
pi> sudo chmod +x setup.py

pi> sudo ./setup.py
```

### Create the thing in AWS IoT
In order to connect the client to the AWS Iot, you have to register a new thing and create a certificate.
* [Create a thing](http://docs.aws.amazon.com/iot/latest/developerguide/register-device.html)
* [Create a certificate](http://docs.aws.amazon.com/iot/latest/developerguide/create-device-certificate.html)

The certificate must be stored on the client.

## Run
The script can be executed with the following command:
```Shell
# Certificate based mutual authentication
python readAndSendData.py -e <endpoint> -r <rootCAFilePath> -c <certFilePath> -k <privateKeyFilePath>
```
