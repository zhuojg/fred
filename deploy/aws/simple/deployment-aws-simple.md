# Simple AWS Deployment

## Setup IAM User

Create the users: "Attach existing policies directly" with "Administrator Access" and "Billing" to view billing

<img width="394" alt="Screen Shot 2020-04-15 at 1 15 14 PM" src="https://user-images.githubusercontent.com/595772/79367051-31870c00-7f1b-11ea-9b25-fe2129cb0633.png">

Write down the `AWS Access Key ID` and `AWS Secret Access Key`

Do not forget to enable the billing console access: [instruction](https://aws.amazon.com/blogs/security/dont-forget-to-enable-access-to-the-billing-console/)

## Configure AWS CLI

Install awscli

```shell
$ pip3 install awscli
$ aws --version
aws-cli/1.18.39 Python/3.7.7 Darwin/19.4.0 botocore/1.15.39
```

Configure AWS CLI:

- AWS regions and codes: [doc](https://docs.aws.amazon.com/general/latest/gr/rande.html)
  - US East (N. Virginia), code: us-east-1, slightly cheaper than Singapore
  - Asia Pacific (Singapore), code `ap-southeast-1`
- AWS CLI uses two files to store the sensitive credential information (in ~/.aws/credentials) separated from the less sensitive configuration options (in ~/.aws/config). See the [doc](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html).
- Run the following commands to setup and check cli is working (s3 does not have region)
  
```shell
$ aws configure
AWS Access Key ID [None]: A6NxxxxxZDKKB
AWS Secret Access Key [None]: VLxxxx2fZWhr
Default region name [None]: us-east-1
Default output format [None]: json

$ ls ~/.aws
config		credentials

$ aws s3 ls
```

## Configure RDS

<img width="820" alt="Screen Shot 2020-04-17 at 2 28 05 PM" src="https://user-images.githubusercontent.com/595772/79603125-bc9e0880-80b9-11ea-98b3-1acd51285cca.png">
<img width="842" alt="Screen Shot 2020-04-17 at 2 32 23 PM" src="https://user-images.githubusercontent.com/595772/79603136-c293e980-80b9-11ea-8caa-99aa5c3249a7.png">
<img width="808" alt="Screen Shot 2020-04-17 at 2 34 17 PM" src="https://user-images.githubusercontent.com/595772/79603151-ca538e00-80b9-11ea-9a1a-9c4983962a58.png">
<img width="805" alt="Screen Shot 2020-04-17 at 2 35 25 PM" src="https://user-images.githubusercontent.com/595772/79603162-cf184200-80b9-11ea-8402-b8ba3e648da8.png">

Get the password with master user name: fredapp
<img width="1000" alt="Screen Shot 2020-04-17 at 2 41 15 PM" src="https://user-images.githubusercontent.com/595772/79603173-d3dcf600-80b9-11ea-85bf-5aefa652a46d.png">
<img width="597" alt="Screen Shot 2020-04-17 at 2 41 29 PM" src="https://user-images.githubusercontent.com/595772/79603176-d63f5000-80b9-11ea-85b7-9963ce8bbcca.png">

Get the status of database

```shell
$ aws --region us-east-1 rds describe-db-instances \
  --db-instance-identifier fred-db \
  --query 'DBInstances[].{DBInstanceStatus:DBInstanceStatus}'

$ aws --region us-east-1 rds describe-db-instances \
  --db-instance-identifier fred-db
```

Run the following command to get the address of the database

```shell
aws --region us-east-1 rds describe-db-instances \
  --db-instance-identifier fred-db \
  --query 'DBInstances[].{Address:Endpoint.Address}'

  [
    {
        "Address": "fred-db.coaqhaja4wc9.us-east-1.rds.amazonaws.com"
    }
]
```

So, the production URI is:
`postgres://fredapp:<YOUR_PASSWORD>@<YOUR_ADDRESS>:5432/fred_prod`

## Configure ECR and Production Build Images  

### ECR Configuration

AWS ECR (Elastic Container Registry) is part of AWS ECS (Elastic Container Service):

<img width="300" alt="Screen Shot 2020-04-15 at 1 34 04 PM" src="https://user-images.githubusercontent.com/595772/79368725-ddc9f200-7f1d-11ea-842d-a88d6e2557ef.png">

Go to Amazon ECS, click "Repositories", and then add one new repository named fred.  

![image](https://user-images.githubusercontent.com/24386525/100726082-75257c00-33ff-11eb-9eee-fd4194620216.png)

You can get `<AWS_ACCOUNT_ID>`(the number at the start of the URI) and `<ECR_fred_repo_URI>` according to the image above.

### Login to ECS  

You need to login to AWS ECR by using the following command.  
Notice you need to change url according to your region.  
> `aws ecr get-login-password --region us-east-1` generates the long password, which is piped to `docker login` to login with default username "AWS" - don't forget to change the account id or the region you chose. See [doc](https://docs.aws.amazon.com/cli/latest/reference/ecr/get-login-password.html)

```shell
aws ecr get-login-password --region us-east-1 \
      | docker login --username AWS --password-stdin \
      <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com
```

### Test out production images

Test out the production images locally:

```shell
docker-compose down -v
docker-compose -f docker-compose.prod.yml up -d --build
docker-compose exec backend python manage.py reset_db
docker-compose exec backend python manage.py load_data
```

Test it out at http://localhost:3007/ and http://localhost:5001/docs

### Build Production Image

Build single production image with the `prod` tag:

```shell
docker build -f deploy/aws/simple/Dockerfile-aws.deploy -t <ECR_fred_repo_URI>:prod .
```

Given that RDS database is in VPN and cannot be accessed directly from the Internet. We will use the local Postgres to test.

Make the the testing images are still running. Export local environment variable DATABASE_URL using RDS production database URL:

```shell
export DATABASE_URL=postgres://postgres:postgres@localhost:5432/app_prod
```

Start the newly built image (the default Nginx port is 80)

```shell
docker run -d --name fred-aws -e DATABASE_URL="$(echo $DATABASE_URL)" -e "SECRET_KEY=test" -p 8007:80 <ECR-fred-repo-URI>:prod
```

Test it out at http://localhost:8007 and http://localhost:5001/docs

```
$ docker stop fred-aws
$ docker rm fred-aws
```

### Push the Image

Now, let's push the image you just built locally on your computer to the repositories.  
Use the following commands to push.

```shell
docker push <AWS_ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com/fred:prod
```

## Configure CodeBuild

Add the `AmazonEC2ContainerRegistryPowerUser` and `AmazonECS_FullAccess` policy to the `codebuild-my-fra-service-role` role using IAM dashboard.  
<img width="979" alt="Screen Shot 2020-04-15 at 7 47 54 PM" src="https://user-images.githubusercontent.com/595772/79399711-14216480-7f52-11ea-9b2e-59471ead8211.png">

Go to the CodeBuild dashboard and click "Create build project":

<img width="712" alt="Screen Shot 2020-04-15 at 7 27 27 PM" src="https://user-images.githubusercontent.com/595772/79398649-2b128780-7f4f-11ea-982a-9b0426208b20.png">

Enter some basic information

![image](https://user-images.githubusercontent.com/24386525/100726926-8d49cb00-3400-11eb-8daf-bcaeee952f34.png)

Specify the source

![image](https://user-images.githubusercontent.com/24386525/100727066-b79b8880-3400-11eb-8583-f780ffddad4e.png)

Set Webhook

![image](https://user-images.githubusercontent.com/24386525/100727221-e9acea80-3400-11eb-9586-59845a0e9cc7.png)

Set Environment

![image](https://user-images.githubusercontent.com/24386525/100727413-27aa0e80-3401-11eb-85eb-b339d74f5dec.png)

Set Timeout and add Environment variables at the bottom of the Environment card

![image](https://user-images.githubusercontent.com/24386525/100727853-bdde3480-3401-11eb-9043-716644ee437c.png)

Set Buildspec to `deploy/aws/simple/buildspec.yml`

![image](https://user-images.githubusercontent.com/24386525/100728056-0564c080-3402-11eb-9b2e-0b26749c40fc.png)

No other configuration need to be set and you can click `Create build project` now.  

## Configure Load Balancer

<img width="1044" alt="Screen Shot 2020-04-16 at 10 52 32 AM" src="https://user-images.githubusercontent.com/595772/79471286-6ef9a100-7fd0-11ea-8dd6-33f99a29edc6.png">

Create "Application Load Balancer" (ALB):

<img width="430" alt="Screen Shot 2020-04-16 at 10 53 18 AM" src="https://user-images.githubusercontent.com/595772/79471421-9badb880-7fd0-11ea-9bf3-7e82bfabe4b6.png">

<img width="1273" alt="Screen Shot 2020-04-17 at 1 47 50 PM" src="https://user-images.githubusercontent.com/595772/79601176-654a6900-80b6-11ea-953e-680853c67ca9.png">
<img width="1277" alt="Screen Shot 2020-04-17 at 1 49 33 PM" src="https://user-images.githubusercontent.com/595772/79601186-6b404a00-80b6-11ea-9e5b-b9507ad5eadb.png">
<img width="1083" alt="Screen Shot 2020-04-17 at 1 52 06 PM" src="https://user-images.githubusercontent.com/595772/79601211-76937580-80b6-11ea-84fb-367f0c0de4ae.png">

Don't forget to change the value of REACT_APP_USERS_SERVICE_URL in buildspec.yml to the DNS name of the ALB.

Essentially, one ALB is created with one listener at port 80 and then have two rules to forward traffic:

- if path is /, forward to the frontend task group
- if other paths (/users /auth /etc.), forward to the backend task group at port 5000. NOTE only five paths can be specified in the rule.

## Configure ECS

### Create Cluster

Choose `EC2 Linux + Networking`

![image](https://user-images.githubusercontent.com/24386525/100736071-326aa080-340d-11eb-980e-efdb8ef83036.png)

Give your cluster a name, choose EC2 type as `t3.nano`, set number of instances to `2`, and remember to choose `Key pair` because we need to ssh to our instance.  

![image](https://user-images.githubusercontent.com/24386525/100736462-c0468b80-340d-11eb-89a7-14bc9854d192.png)

In networking part, use VPC and all subnets we created. And choose security group we created.  

![image](https://user-images.githubusercontent.com/24386525/100736544-dd7b5a00-340d-11eb-9b5d-335479d60e8b.png)

Click Create and wait a minute.  

### Create Task Definition  

Click `Create new Task Definition` and choose `ECS`  

![image](https://user-images.githubusercontent.com/24386525/100736946-7611da00-340e-11eb-8751-4b9dbdc6b6c3.png)

Give your task definition a name, enter some basic infomation and click `Add container`.  

![image](https://user-images.githubusercontent.com/24386525/100737267-e4ef3300-340e-11eb-8497-412a666489be.png)

There should be a new window. Add infomation follow the instructions. Note that you can get image's url from ECR.

![image](https://user-images.githubusercontent.com/24386525/100737459-2b449200-340f-11eb-9bc0-45e75421c345.png)

Scroll down to find `environment variables`, add the following enrionment variables. `DATABASE_URL` is determined by your RDS.  

![image](https://user-images.githubusercontent.com/595772/79608673-68982180-80c3-11ea-9e1f-52e98d5759be.png)

Click `Add` and now click `Create` to finish.

### Create Service in Cluster  

Come to the page of your cluster, and click `Create` under `Service` tab.

![image](https://user-images.githubusercontent.com/24386525/100737787-98582780-340f-11eb-99b6-572e774d4aa5.png)

Configure as follows

![image](https://user-images.githubusercontent.com/24386525/100737839-ad34bb00-340f-11eb-93f1-9d0288762ed1.png)

No need to change other configurations. Just make sure the Placement Templates is `AZ Balanced Spread`.

Next, configure the Load balancer. Choose `Application Load Balancer` and correct IAM role.

![image](https://user-images.githubusercontent.com/24386525/100737981-e705c180-340f-11eb-92c2-1ff44a87ed01.png)

- Click `Add to load balancer`, and configure as you need. 

> You need to create your own target group, which determines how your traffic is forwarded.  
> The `Production listener port` is the port of your load balancer, when you visit %URL_OF_YOUR_LOAD_BALANCER:PORT, the request will be forwarded to fredend:80.  

![image](https://user-images.githubusercontent.com/24386525/100738038-fab12800-340f-11eb-9f1b-03f2a0eac7bb.png)

Click Next step, and you can set auto scaling.  

`Next step` again, and you can review your configuration. `Click Create` Service if everything looks fine.

Now your service is created.  

## Initialize Database

Get the EC2 instance of the service to login to initialize the database:  

```shell
ssh -i <PATH_OF_YOUR_KEY> ec2-user@<IP_OF_YOUR_EC2>
```

Get <CONTAINER_ID> using `docker ps`, and initialize database in the container.  

```shell
docker exec -it <CONTAINER_ID> sh
root@017ff3d54c29:/usr/src/app# python manage.py reset_db
database reset done!
root@017ff3d54c29:/usr/src/app# python manage.py load_data
user table loaded
author and quote tables loaded
```

Now go to http://LOAD_BALANCER_DNS_NAME:PORT to test out!!
