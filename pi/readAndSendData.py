'''
/*
 * Copyright 2010-2016 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *
 *  http://aws.amazon.com/apache2.0
 *
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */
 '''

from AWSIoTPythonSDK.MQTTLib import AWSIoTMQTTClient
import sys
import logging
import time
import getopt
import datetime
import time
import Adafruit_DHT
import os

timeout = 30


# Custom MQTT message callback
def setIntervall(client, userdata, message):
        print("--------------\n\n")
	print("Set Intervall to: ")
	print(message.payload)
	timeout = message.payload
	print(timeout)
	print("from topic: ")
	print(message.topic)
	print("--------------\n\n")

# Usage
usageInfo = """Usage:
Use certificate based mutual authentication:
python basicPubSub.py -e <endpoint> -r <rootCAFilePath> -c <certFilePath> -k <privateKeyFilePath>
Use MQTT over WebSocket:
python basicPubSub.py -e <endpoint> -r <rootCAFilePath> -w
Type "python basicPubSub.py -h" for available options.
"""
# Help info
helpInfo = """-e, --endpoint
	Your AWS IoT custom endpoint
-r, --rootCA
	Root CA file path
-c, --cert
	Certificate file path
-k, --key
	Private key file path
-w, --websocket
	Use MQTT over WebSocket
-h, --help
	Help information
"""

# Read in command-line parameters
useWebsocket = False
host = ""
rootCAPath = "root-CA.crt"
certificatePath = ""
privateKeyPath = ""
sensorId = ""
field = ""
customerId = ""
try:
	opts, args = getopt.getopt(sys.argv[1:], "hwe:k:c:r:", ["help", "endpoint=", "key=","cert=","rootCA=", "websocket"])
	if len(opts) == 0:
		raise getopt.GetoptError("No input parameters!")
	for opt, arg in opts:
		if opt in ("-h", "--help"):
			print(helpInfo)
			exit(0)
		if opt in ("-s", "--sensor"):
			sensorId = arg
		if opt in ("-x", "--customer"):
			customerId = arg
		if opt in ("-f", "--field"):
			field = arg
		if opt in ("-e", "--endpoint"):
			host = arg
		if opt in ("-r", "--rootCA"):
			rootCAPath = arg
		if opt in ("-c", "--cert"):
			certificatePath = arg
		if opt in ("-k", "--key"):
			privateKeyPath = arg
		if opt in ("-w", "--websocket"):
			useWebsocket = True
except getopt.GetoptError:
	print(usageInfo)
	exit(1)

pconf  = 'sensor.conf'

if "ASESmartFarming/pi" in os.getcwd():
   pconf = os.getcwd() + '/' + pconf
else:
   pconf = os.getcwd() + '/ASESmartFarming/pi/' + pconf

print pconf

if os.path.exists(pconf):
   config = open(pconf, 'r')
   for line in config:
      line = line.split(';')
      customerId = line[0]
      field = line[1]
      sensorId = line[2]
else:
   print pconf+" missing. Please configure your sensors first."
   exit(2)


# Missing configuration notification
missingConfiguration = False
if not sensorId:
	print("Missing configurations at sensor.conf")
	missingConfiguration = True
if not customerId:
	print("Missing configurations at sensor.conf")
	missingConfiguration = True
if not field:
	print("Missing configurations at sensor.conf")
	missingConfiguration = True
if not host:
	print("Missing '-e' or '--endpoint'")
	missingConfiguration = True
if not rootCAPath:
	print("Missing '-r' or '--rootCA'")
	missingConfiguration = True
if not useWebsocket:
	if not certificatePath:
		print("Missing '-c' or '--cert'")
		missingConfiguration = True
	if not privateKeyPath:
		print("Missing '-k' or '--key'")
		missingConfiguration = True
if missingConfiguration:
	exit(2)

# Configure logging
logger = logging.getLogger("AWSIoTPythonSDK.core")
logger.setLevel(logging.DEBUG)
streamHandler = logging.StreamHandler()
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
streamHandler.setFormatter(formatter)
logger.addHandler(streamHandler)

# Init AWSIoTMQTTClient
myAWSIoTMQTTClient = None
if useWebsocket:
	myAWSIoTMQTTClient = AWSIoTMQTTClient(sensorId, useWebsocket=True)
	myAWSIoTMQTTClient.configureEndpoint(host, 443)
	myAWSIoTMQTTClient.configureCredentials(rootCAPath)
else:
	myAWSIoTMQTTClient = AWSIoTMQTTClient(sensorId)
	myAWSIoTMQTTClient.configureEndpoint(host, 8883)
	myAWSIoTMQTTClient.configureCredentials(rootCAPath, privateKeyPath, certificatePath)

# AWSIoTMQTTClient connection configuration
myAWSIoTMQTTClient.configureAutoReconnectBackoffTime(1, 32, 20)
myAWSIoTMQTTClient.configureOfflinePublishQueueing(-1)  # Infinite offline Publish queueing
myAWSIoTMQTTClient.configureDrainingFrequency(2)  # Draining: 2 Hz
myAWSIoTMQTTClient.configureConnectDisconnectTimeout(10)  # 10 sec
myAWSIoTMQTTClient.configureMQTTOperationTimeout(5)  # 5 sec

# Connect and subscribe to AWS IoT
myAWSIoTMQTTClient.connect()
#myAWSIoTMQTTClient.subscribe("farming/"+sensorId+"/intervall", 1, setIntervall)
time.sleep(2)

# Publish to the same topic in a loop forever
loopCount = 0
while True:
	
	humidity, temperature = Adafruit_DHT.read_retry(11, 4)
	if humidity is not None and temperature is not None:
	   print 'Temp={0:0.1f}*C  Humidity={1:0.1f}%'.format(temperature, humidity)
	   payload = "{ \"CustomerId\": "+customerId+", \"Field\":\""+field+"\", \"SensorId\":\""+sensorId+"\", \"Timestamp\":"+str(int(time.time()))+", \"Temp\":"+str(temperature*100)+", \"Humidity\":"+str(humidity*100)+"  }"
	   myAWSIoTMQTTClient.publish("farming/"+sensorId, payload , 1)
	else:
	   print 'Failed to get reading. Try again!'

	loopCount += 1
	time.sleep(timeout)
