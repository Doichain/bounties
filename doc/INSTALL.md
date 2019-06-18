### Installation
1. Install meteor and clone this repository, cd into it
2. Run ````meteor npm install``
3. Get a Doichain authToken and userId from your Doichain dApp via REST see: https://github.com/Doichain/dapp/blob/master/doc/en/rest-api.md#authentication
or just do:
```
curl -H "Content-Type: application/json" -X POST -d '{"username":"admin","password":"password"}' http://localhost:4010/api/v1/login #in case your dApp runs on port 4010
```
4. Configure settings.json to connect to your Doichain dApp with your credentials like so:
```
{
 "app": {
    "disableAccountsConfig": true
  },
  "doichain": {
    "debug": true,
    "host": "localhost",
    "port": "4010",
    "ssl": false,
    "dappLogin": {"userId": "DKykxytHpP5YzTSWm", "authToken": "JuBw_Ali7t0X9gLGLw7wfS2BBP_frq5iqDIiAMGyp-6" }
  },
  "Accounts":{"emailTemplates":{"from":"bounties@doichain.org"}}
}
```
5. start / update your meteor docker container (see: https://hub.docker.com/r/abernix/meteord)
```sh
export METEOR_SETTINGS=$(cat settings.json) #this might only work when restarting this container completely

meteor build --architecture=os.linux.x86_64 ../bundle/
docker run -d \
    -e ROOT_URL=https://bounties.doichain.org \
    -e MONGO_URL=mongodb://x:y@IP:27017/bounties \
    -e MAIL_URL=smtps://emailuser:emailpw@emailserver:465 \
    -e METEOR_SETTINGS \
    -p 3003:80 \
         -v /usr/src/bounties/bundle:/bundle \
         --name doichain_bounties_0.x \
          abernix/meteord:node-8-base

#for upgrades please repeat the following
meteor build --architecture=os.linux.x86_64 ../bundle/
#followed by a
docker stop doichain_bounties_0.x; docker start doichain_bounties_0.x
```          

### TODOs
- show username in public (at blocked bounty)
- when a bounty is longer blocked then 10 days after "blocked until" don't show it anymore      
- remove bounty / or disable it from local database if bounty-tag is removed from github
- allowing the admin to put a longer/shorter time frame to block an issue
- send emails to admin / bounty hunter
    - when a bounty was blocked to admin and bounty hunter
    - when a bounty was canceld to admin and bounty hunter
    - when a bounty was requested for approval to admin and bounty hunter
    - when a bounty was approved to bounty hunter
    - when bounty was not getting "request-approval" state admin should be informed by email.

- approve bounty on github (change state to closed)
- Add filtering options (GUI already exists)


### Environment variables
The server reads from the MAIL_URL environment variable to determine how to send mail. The MAIL_URL should reference an SMTP server and use the form smtp://USERNAME:PASSWORD@HOST:PORT or smtps://USERNAME:PASSWORD@HOST:PORT

### DEPLOYMENT
- via docker: https://hub.docker.com/r/abernix/meteord#tag-variations
-  abernix/meteord:node-8-base
    - docker build -t doichain/bounties .
    - https://hub.docker.com/r/abernix/meteord
    (- docker run -d \
          -e ROOT_URL=https://bounties.doichain.org \
          -e MONGO_URL=mongodb://x:y@IP:27017/bounties \
          -e MAIL_URL=smtps://emailuser:emailpw@emailserver:465 \
          -p 3003:80 \
          --name doichain_bounties \
          doichain/bounties)
          
    - meteor build --architecture=os.linux.x86_64 ../bundle/     
    - docker run -d \
          -e ROOT_URL=https://bounties.doichain.org \
          -e MONGO_URL=mongodb://x:y@IP:27017/bounties \
          -e MAIL_URL=smtps://emailuser:emailpw@emailserver:465 \
          -e METEOR_SETTINGS=$(cat settings.json) \
          -p 3003:80 \
           --name doichain_bounties \
          -v /usr/src/bounties/bundle:/bundle \
          --name doichain_bounties_0.4 \
          abernix/meteord:node-8-base
     - for upgrades please repeat ``meteor build --architecture=os.linux.x86_64 ../bundle/`` followed by a ````docker stop doichain_bounties; docker start doichain_bounties```
          
          -e MONGO_OPLOG_URL=mongodb://oplog_url \

### Links and useful information
- Blaze/SpacebarsJS
    - http://blazejs.org/api/spacebars.html#If-Unless
    - https://www.discovermeteor.com/blog/spacebars-secrets-exploring-meteor-new-templating-engine/
- Settings https://blog.meteor.com/the-meteor-chef-making-use-of-settings-json-3ed5be2d0bad
- ReactiveTable for blaze https://github.com/aslagle/reactive-table https://atmospherejs.com/aslagle/reactive-table
- Security package https://atmospherejs.com/ongoworks/security
- Simple Schema https://github.com/aldeed/simple-schema-js
- Meteor autoform https://github.com/aldeed/meteor-autoform#a-basic-update-form
- Define a schema in Metor https://guide.meteor.com/collections.html
- Data loading in Meteor https://guide.meteor.com/data-loading.html

### Deployment
