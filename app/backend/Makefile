IMAGE := transcendence-back
DOCKER_NAME := transcendence-back1
TAG = 1.0.0

docker-build:
	docker build -t $(IMAGE):$(TAG) .

docker-run:
	docker run -p 3000:3000 --name $(DOCKER_NAME) $(IMAGE):$(TAG)

up: docker-build docker-run

docker-stop:
	docker stop $(DOCKER_NAME)

docker-rm: docker-stop
	docker rm $(DOCKER_NAME)

docker-rmi:
	docker rmi $(IMAGE):$(TAG)

clean: docker-rm docker-rmi

re: clean up

.PHONY: up clean re
