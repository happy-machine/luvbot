![Screnshot](https://i.imgur.com//LMRjQJJs.png)
# luvbot
The infamous bot and playlist-manager for the iluvdrumandbass Spotify playlist

## aws-lambda-scheduler
To launch compress the contents of the folder into a zip named exports.zip (replace the example .zip which is the current deployment
or just use serverless or aws cli to upload to aws, and set a cloudwatch event to trigger exports.handler on a cron interval.

The current schedule is half hourly exluding sunday:
>cron(1/30 * ? * Mon-Sat *)

## zeit-bot  

Install the NOW cli with **npm install -g now** . 

Deploy the service with the command **now** from inside the zeit-bot folder in your terminal.

Connect the instance to your telegram bot via webhook:
>curl -F "url=https://{THE NOE DEPLOYMENT URL RETURNED BY THE COMMAND ABOVE}/new-message" /
>https://api.telegram.org/bot{YOUR TELEGRAM BOT TOKEN}/setWebhook"

You should now be able to chat with the bot via telegram.

** Note that you will need to create a link containing the urls to add to the playlist, in the example this is
done using a dropbox link **




