#!/usr/bin/env python3

import aws_cdk as cdk

from cdk.web_stack import WebStack

# TODO: Update these values for your project
CDK_ACCOUNT = "844884166370"
CDK_REGION = "us-west-2"
SITE_NAME = "sol"

app = cdk.App()

env = cdk.Environment(
    account=CDK_ACCOUNT,
    region=CDK_REGION,
)

WebStack(
    app,
    SITE_NAME + "-web-stack",
    site_name=SITE_NAME,
    env=env,
)

app.synth()
