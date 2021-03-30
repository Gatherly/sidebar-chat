##### _Engineering Challenge_
# Sidebar  📺 💬

Our main app is an immersive virtual space where users can sporadically form huddles, hear broadcasts, and get the "public gathering" feel of an in-person event from the comfort of their personal computer. 

But just for fun, what if we wanted to have a sister app that delivers a simpler, more intimate video chat experience? Sidebar Chat is the result. 

To be honest, it could use a little work... Maybe you can help?


## Directions
1. **Fork this repo & run it locally** _using the instructions below. (If you are having trouble, feel free to reach out to alicia@gatherly.io or your point of contact.)_
2. **Whip it into shape**. _Find the bugs and issues in the codebase, and fix them! Keep a clean commit history so that when we read though your repo, we can easily understand the problems you identified, and the solutions you are offering._ 
3. **Kick it up a notch** _by adding one (1) more feature that you think will take this app to the next level. What you choose to add is up to you, but you should pick something that can be accomplished within the time limit (this whole challenge should take around 4 hours total), significantly improves user (or possibly developer) experience, and shows off your unique skillset. Some ideas for inspiration include, making the app work on mobile devices, adding screenshare functionality, allowing the host to select the chat's color scheme or creating a super plus build process that deploys the app somewhere on the internet, but feel free to branch out. The choice is up to you, as long as it delivers value._ 

### Local Development
#### Server
```
yarn && yarn start
```
Server will be running on localhost:3030.

#### Database
This project uses a PostgreSQL database locally, and the Heroku Postgres addon in Production.
Generate a clean database locally with `yarn resetdb`.

#### Client
```
cd side-bar-web
source .env.development
yarn
npm rebuild node-sass
yarn start 
```

Navigate to http://localhost:3000/ to view the app.

Note: The current distribution of the node-sass package can fail to compile properly in some environments. The "install-with-rebuild" script runs an extra `npm rebuild node-sass` to avoid build issues.


#### Environment Variables
**.env**
```
ENVIRONMENT=development
POSTGRES_USER=dev
POSTGRES_DB=sidebar
DATABASE_URL=localhost
AWS_ACCESS_KEY=<your_aws_key>
AWS_SECRET_KEY=<your_aws_secret_key>
PORT=3030
```

**/side-bar-web/.env.development**
```
REACT_APP_HOST=http://localhost:3030
```
