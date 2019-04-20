#!/bin/sh
docker stop $(docker ps -a -q)                          # Stop all containers
docker rm $(docker ps -a -q)                            # Delete all containers
docker rmi $(docker images -q)                          # Delete all images
docker volume rm $(docker volume ls -qf dangling=true)  # Delete all volumes
echo "Done";