#!/usr/bin/env python3

import aws_cdk as cdk

from cdk.web_stack import WebStack

CDK_ACCOUNT = "{{AWS_ACCOUNT_ID}}"
CDK_REGION = "{{AWS_REGION}}"
SITE_NAME = "{{PROJECT_NAME}}"

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
