import * as cdk from '@aws-cdk/core';
import * as sqs from "@aws-cdk/aws-sqs";
import * as lambda from "@aws-cdk/aws-lambda";
import * as lambdaEvents from "@aws-cdk/aws-lambda-event-sources";

export class SqsToLambdaStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    const lambdaFn = new lambda.Function(this, "sqsLambda", {
      code: lambda.Code.fromAsset('lambda'),
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: 'index.handler',
      reservedConcurrentExecutions: 5,  // only have 5 invocations at a time, having this <5 has a problem
    });

    const queue = new sqs.Queue(this, "Queue", {
      queueName: "testQueue",
      encryption: sqs.QueueEncryption.UNENCRYPTED,
      retentionPeriod: cdk.Duration.days(4),
      visibilityTimeout: cdk.Duration.seconds(30),
      receiveMessageWaitTime: cdk.Duration.seconds(20), 
    });

    lambdaFn.addEventSource(
      new lambdaEvents.SqsEventSource(queue, {
        batchSize: 10,
      })
    );
  }
}
