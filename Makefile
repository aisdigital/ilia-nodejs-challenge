up:
	docker-compose up -d

up-prod:
	docker-compose -f docker-compose.yaml -f docker-compose.prod.yaml up --build -d

down: 
	docker-compose down