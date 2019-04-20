#!/bin/sh             
docker stop $(docker ps -a -q) --force 				# Stop all containers
docker rm $(docker ps -a -q) --force 				# Delete all containers
docker rmi $(docker images -q) --force 				# Delete all images
docker volume rm $(docker volume ls -qf dangling=true) --force 	# Delete all volumes
echo "Done"
