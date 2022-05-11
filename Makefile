DOCKER_COMPOSE_FILE=docker-compose.yaml

up:
	docker-compose up --build

stop:
	docker-compose -f $(DOCKER_COMPOSE_FILE) stop

status:
	docker-compose -f $(DOCKER_COMPOSE_FILE) ps

clean:
	docker-compose -f $(DOCKER_COMPOSE_FILE) down
