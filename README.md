# VAPORLOOP

website and API for an experience art project 🦕🍕➰

## Running the application

Clone the application:

```bash
git clone https://github.com/annthurium/vaporloop
cd vaporloop
```

Install the dependencies:

```bash
npm install
```

Copy the `.env.example` file to `.env`.

```bash
cp .env.example .env
```

Fill in your Twilio Account SID and auth token, which cam be found in the [Twilio console](https://www.twilio.com/console/) in the `.env` file.

You'll also need Airtable account credentials which can be found [here](https://airtable.com/api). Click through to the base you want to generate credentials for.

Run the dev server:

```bash
npm start
```

## Deploying the application

The app is automatically deployed to Heroku when new branches are merged in to master.

If you add new environment variables, you'll need to add them to the Heroku console in order for the app to run correctly.
