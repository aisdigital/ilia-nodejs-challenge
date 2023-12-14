.PHONY: up down migrate-wallet migrate-user migrate

up:
	docker-compose up -d --build

down:
	docker-compose down

migrate-wallet:
	docker-compose run wallet yarn db:migrate

migrate-user:
	docker-compose run user yarn db:migrate

migrate: migrate-wallet migrate-user
