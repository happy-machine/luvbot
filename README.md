## luvbot
The infamous bot and scheduler for the iluvdrumandbass Spotify playlist

#aws-lambda-scheduler
>To launch compress the contents of the folder into a zip named exports.zip (replace the example zip which is current deployment
>or just use erverless or aws cli to upload to aws, and set a cloudwatch event to trigger exports.handler on a cron etc

#zeit-bot
Install the NOW cli with *npm install -g now*
Deploy the service with the command *now*
Connect the instance to your telegram bot via webhook:
>curl -F "url=https://{YOUR NOW GENERATED DEPLOYMENT URL}/new-message" /
>https://api.telegram.org/bot{TELEGRAM BOT TOKEN}/setWebhook"

You should now be able to chat with the bot via telegram once the bot is added to a group




