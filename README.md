# ília - Code Challenge NodeJS

## How to run the project

You'll need [Docker](https://www.docker.com/) to run this project.

Make sure you are on the root folder, then run:

``` make up ```

This will create the following containers:
* wallet-service
* wallet-service-db
* users-service
* users-service-db
    
To stop the application, run:

``` make down ```

## REST API

The documentation for the endpoints can be found in the following files (use [Swagger](https://editor-next.swagger.io/) to load the files):

```
ms-transactions.yaml
ms-users.yaml
```

