# Her Route
## Inspiration
We were driven to create *her route* by the clear need to improve women's safety while travelling on foot. Concerns about harassment and assault, especially at night, are a daily reality for many women.

## What it does
- Crime-Aware Route Planning: Utilizes real crime data from The Gun Violence Archive and ACLED to determine the safest walking routes.
- User-Friendly Interface: Intuitive design for easy navigation and route customization.
- Customizable Preferences: Users can tailor route preferences based on their comfort level and specific safety concerns.
- Optimized for Vulnerable Individuals: Specifically developed to address the safety concerns of individuals who may feel more vulnerable while walking.

## How we built it
- HTML and JavaScript: The core development languages ensuring a responsive and dynamic user experience.
- Data Source: The Gun Violence Archive and ACLED provide real crime data that informs route planning.
- Hosting: AWS is utilized to host the website, with the domain registered through Spaceship.

## Challenges we ran into
- Hosting: Initial configuration of our AWS instance for website hosting presented unexpected difficulties. These were successfully addressed through careful review of AWS documentation and online tutorials, resulting in a fully functional deployment.
- HTML: We ran into errors while creating visual elements on the front-end website.
## Accomplishments that we're proud of
-Fixing AWS issues, most documentation for AWS was outdated and could not be used. Finding online tutorials helped to resolve hosting issues.
## What we learned
- Hosting: Resolving the AWS configuration challenges highlighted the importance of critically evaluating official documentation and supplementing it with diverse secondary resources to effectively troubleshoot and implement solutions
## What's next for Her Route
- Address the slow speed of the site
- Find more sources for crime data
# Starting local instance
To get started with a local instance hosted on localhost first, initialize npm and install webpack.

```
npm init -y 
npm i -D webpack-dev-server webpack webpack-cli
```
Then, install deck.gl.

```
npm i @deck.gl/{core,google-maps,layers,aggregation-layers}
```
Finally, start the local instance.

```
npm start
```
