#!/bin/bash

# check sequelize db connection
until npx sequelize db:migrate:status
do
    echo ...
    sleep 1
done

# Check if there are any pending migration with sequelize
STATUS=$( npx sequelize db:migrate:status )

if echo $STATUS | grep "down "; then # output contains down migration
  echo "There are pending migrations, please run these manually!"
  exit 2
else
  echo "No pending migration, starting server..."
  exec pm2-runtime server.js
  exit 0
fi
