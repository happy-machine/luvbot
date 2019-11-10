![Screnshot](https://i.imgur.com//LMRjQJJs.png)
# luvbot
The infamous bot and playlist-manager for the iluvdrumandbass Spotify playlist.

## Setup
First setup a Spotify account and then visit https://developer.spotify.com/dashboard/  

Procure a **Client ID** and a **Client Secret**

Run the services as follows:

### refresh-token-getter

In order to have a service that persistantly hits the Spotify API without requiring Oauth2 redirects and a login page
You'll need a **refresh token**.  

In order to get a refresh token:
**cd refresh-token-getter** .
copy example.env to a file called .env and edit the file to add the tokens you received from Spotify above.
**npm install**
**npm run start**
visit http://localhost:3333 or whatever port yout set the PORT variable to in your .env file.
**Login with Spotify** and then copy paste the **refresh token** that appears in the browser after login.

You will need this refresh token for your now credentials in the zeit-bot/now.js file you will create.


As the 
### zeit-bot  

First you will need a Telegram bot token. This article explains how to get one:
https://www.siteguarding.com/en/how-to-get-telegram-bot-api-token

Install the NOW cli with **npm install -g now**  

Copy the example-now.json into a file called now.json and populate the new file with the tokens you got from spotify above
and the other variables described in this file

Deploy the service with the command **now** from inside the zeit-bot folder in your terminal.

Connect the instance to your telegram bot via webhook:
>curl -F "url=https://{THE NOE DEPLOYMENT URL RETURNED BY THE COMMAND ABOVE}/new-message" /
>https://api.telegram.org/bot{YOUR TELEGRAM BOT TOKEN}/setWebhook"

You should now be able to chat with the bot via telegram.

### aws-lambda-scheduler
To launch compress the contents of the folder into a zip named exports.zip (replace the example .zip which is the current deployment
or just use serverless or aws cli to upload to aws, and set a cloudwatch event to trigger exports.handler on a cron interval.

The current schedule is half hourly exluding sunday:
>cron(1/30 * ? * Mon-Sat *)

**Note that you will need to create a link containing the urls to add to the playlist, in the example this is
done using a dropbox link.**




