![Screnshot](https://i.imgur.com//LMRjQJJs.png)
# luvbot
The infamous bot and scheduler for the iluvdrumandbass Spotify playlist

## aws-lambda-scheduler
To launch compress the contents of the folder into a zip named exports.zip (replace the example .zip which is the current deployment
or just use serverless or aws cli to upload to aws, and set a cloudwatch event to trigger exports.handler on a cron interval.

The current schedule is:
>cron(1/30 * ? * Mon-Sat *)
which is half hourly exluding sunday.

## zeit-bot  

Install the NOW cli with **npm install -g now** . 

Deploy the service with the command **now** from in the zeit-bot folder in the terminal

Connect the instance to your telegram bot via webhook:
>curl -F "url=https://{THE NOE DEPLOYMENT URL RETURNED BY THE COMMAND ABOVE}/new-message" /
>https://api.telegram.org/bot{YOUR TELEGRAM BOT TOKEN}/setWebhook"

You should now be able to chat with the bot via telegram once the bot is added to a group.




