# Running docker

### Backend process

Get project from [client project](https://github.com/yuniorlaureano/GPA.git)

- Clone the project from the above repository
- Navigate to the root folder
- Build the image. You can skip this process if you are planning to use the image hosted at repo: oamroinuy, if not just replace [repo] with your own repo

```
docker build -t [repo]/gpa-backend:latest .
```

- Push the command to your repo

```
docker login
docker push [repo]/gpa-backend:latest
```

- With this you end up with an image in your dockerhub repo

### Front end process

Get project from [server project](https://github.com/yuniorlaureano/gpa-client-vivo.git)

- Clone the project from the above repository
- Navigate to the root folder
- Build the image. You can skip this process if you are planning to use the image hosted at repo: oamroinuy, if not just replace [repo] with your own repo

```
docker build -t [repo]/gpa-frontend:latest .
```

- Push the command to your repo

```
docker login
docker push [repo]/gpa-frontend:latest
```

- With this you end up with an image in your dockerhub repo

### Runnig docker compose

docker-compose up

### Exit

docker-compose down

#

# Copy backup data

After yuou have you compose running, you can restore the backup with the fallowing commands

```
docker run --rm -v gpa-client_sqlserverdata:/volume -v ${pwd}:/backup busybox tar cvf /backup/sqlserverdata.tar /volume
```

```
docker run --rm -v gpa-client_sqlserverdata:/volume -v ${pwd}:/backup busybox tar xvf /backup/sqlserverdata.tar -C /
```
