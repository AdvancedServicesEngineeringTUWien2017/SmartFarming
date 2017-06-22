# Smartfarming

The human interface for the customer is this Angular application. The data are represented with Higcharts. This application connects directly to the DynamoDB using the AWS JavaScript SDK. In the test environment the application runs on a EC2 instance.

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.1.2.

## Setup
There are following prerequisite to be installed on the system:
* [Node.js](https://nodejs.org/en/)
* [npm](https://www.npmjs.com/)
* [Angular CLI](https://cli.angular.io/)

Run `npm install` to install all requirements. 

To connect to the AWS you have to fill in your credentials to the `environment/aws.config.ts`:

```TypeScript
export var config = {
  "region": "<your aws region>",
  // accessKeyId default can be used while using the downloadable version of DynamoDB.
  // For security reasons, do not store AWS Credentials in your files. Use Amazon Cognito instead.
  "accessKeyId": "<your access key>",
  // secretAccessKey default can be used while using the downloadable version of DynamoDB.
  // For security reasons, do not store AWS Credentials in your files. Use Amazon Cognito instead.
  "secretAccessKey": "<your secret access key>"
}
```

## Start

Run `npm start` for a dev server. Navigate to `http://localhost:4200/`.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
