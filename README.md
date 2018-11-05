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