# portainer-ecr-credentials

This package periodicially updates the credentials Portainer uses to access an Elastic Container Registry (ECR). Accessing ECR from Docker/Portainer[requires using a token that expires every 12 hours,](https://docs.aws.amazon.com/cli/latest/reference/ecr/get-login.html)tied to an IAM user.

## Setup

### On AWS

#### [Set up repository](https://console.aws.amazon.com/ecs/home)

The registry URI is in the format \<registry ID>.dkr.ecr.\<AWS region>.amazonaws.com

#### Set up IAM user

### On Portainer

#### Download the portainer-ecr-credentials image (optional)

#### Configure the portainer-ecr-credentials container

- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY
- AWS_REGION
- REGISTRY_ID
- PORTAINER_URL
- PORTAINER_USERNAME
- PORTAINER_PASSWORD
- REGISTRY_NAME

## What's New

### v0.0.6

- Added option to set registry name in Portainer (REGISTRY_NAME)
- Upgraded to node v14

### v0.0.5

- Removed unnecessary logging

### v0.0.4

- Added Type property in Portainer registry config
- Compatible with Portainer 1.20
- Minor code style changes