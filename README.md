<p align="center">
  <img width="300" alt="analytickitlogo" src="https://analytickit.com/wp-content/uploads/2022/04/cropped-newlogo-small.png">
</p>
<p align="center">
  <!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
<a href='https://analytickit.com/contributors'><img src='https://img.shields.io/badge/all_contributors-218-orange.svg?style=flat-square' /></a>
<!-- ALL-CONTRIBUTORS-BADGE:END -->
  <a href='http://makeapullrequest.com'><img alt='PRs Welcome' src='https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=shields'/></a>
  <a href='https://analytickit.com/slack'><img alt="Join Slack Community" src="https://img.shields.io/badge/slack%20community-join-blue"/></a>
  <img alt="Docker Pulls" src="https://img.shields.io/docker/pulls/analytickit/analytickit"/>
  <img alt="GitHub commit activity" src="https://img.shields.io/github/commit-activity/m/analytickit/analytickit"/>
  <img alt="GitHub closed issues" src="https://img.shields.io/github/issues-closed/analytickit/analytickit"/>
</p>

## analytickit is a product analytics suite, built for engineers

* Automatically track every event on your website or app
* Understand your users and how to improve your product
* Deploy on your own infrastructure to keep control of your data.

## Get started for free

### Option 1: Hobby instance one-line-deploy

For <100K events ingested monthly on Linux with Docker (recommended 4GB memory):

 ```bash 
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/analytickit/analytickit/HEAD/bin/deploy-hobby)" 
 ``` 

### Option 2: Production instance on your infrastructure

Follow our <a href="https://analytickit.com/docs/self-host/overview#deploy">Scaleable Self-Hosting Guide</a> for all
major cloud service providers and on-premise deploys

### Option 3: If you don't need to self-host

Sign up for a free [analytickit Cloud](https://app.analytickit.com/signup) project

## Features

![ui-demo](https://user-images.githubusercontent.com/85295485/144591577-fe97e4a5-5631-4a60-a684-45caf421507f.gif)

We bring all the tools into one place to give you everything you need to build better products:

- **Event-based Analytics** on users or groups - capture your product's usage data to see which users are doing what in
  your application
- **Product data visualizations** [graphs](https://analytickit.com/docs/features/trends)
  , [funnels](https://analytickit.com/docs/features/funnels), [cohorts](https://analytickit.com/docs/features/cohorts)
  , [paths](https://analytickit.com/docs/features/paths), [retention](https://analytickit.com/docs/features/retention),
  and [dashboards](https://analytickit.com/docs/features/dashboards)
- **Complete control** over your data - [host it yourself](https://analytickit.com/docs/self-host/overview#deploy) on
  any infrastructure
- **Session recording** to [watch videos](https://analytickit.com/docs/features/session-recording) of your users'
  behavior, with fine-grained privacy controls
- **Automatically capture** [clicks and pageviews](https://analytickit.com/docs/features/actions) to analyze what your
  users are doing without pushing events manually
- **Feature flags** to understand the impact of new features before rolling them out more widely
- **Heatmaps** to understand how users interact with your product with
  the [analytickit Toolbar](https://analytickit.com/docs/features/toolbar)
- **Automated Analysis** to find [correlations](https://analytickit.com/docs/user-guides/correlation) between successful
  users and their behaviors or attributes
- **Plays nicely with data warehouses** import events or user data from your warehouse by writing a simple
  transformation plugin, and export data with pre-built plugins - such as BigQuery, Redshift, Snowflake and S3
- **Infinitely extensible** use custom [plugins](https://analytickit.com/docs/user-guides/plugins) to extend analytickit
  and integrate with any service or tool
- **Ready-made libraries** for **[JS](https://analytickit.com/docs/integrations/js-integration)
  , [Python](https://analytickit.com/docs/integrations/python-integration)
  , [Ruby](https://analytickit.com/docs/integrations/ruby-integration)
  , [Node](https://analytickit.com/docs/integrations/node-integration)
  , [Go](https://analytickit.com/docs/integrations/go-integration)**
  , [Android](https://analytickit.com/docs/integrations/android-integration)
  , [iOS](https://analytickit.com/docs/integrations/ios-integration)
  , [PHP](https://analytickit.com/docs/integrations/php-integration)
  , [Flutter](https://analytickit.com/docs/integrations/flutter-integration)
  , [React Native](https://analytickit.com/docs/integrations/react-native-integration)
  , [Elixir](https://analytickit.com/docs/integrations/elixir-integration)
  , [Nim](https://github.com/Yardanico/analytickit-nim) + an [API](https://analytickit.com/docs/integrations/api) for
  anything else
- **And much much more...** for a [full list of analytickit features](https://analytickit.com/features).

## Event autocapture

You don't have to spend weeks instrumenting every event on your front-end, point and click at elements from your browser
and turn them into events which you and your team can analyze

<img src="https://analytickit-static-files.s3.us-east-2.amazonaws.com/Documentation-Assets/action-toolbar.gif" width="100%">

## Getting the most of analytickit

See [analytickit Docs](https://analytickit.com/docs/) for in-depth walk-throughs on functionality.

Join our [Slack community](https://analytickit.com/slack) if you need help, want to chat, or are thinking of a new
feature. We're here to help - and to make analytickit even better.

## Philosophy

We help you understand user behavior and build better products without losing control of your data.

In our view, third-party analytics tools do not work in a world of cookie deprecation, GDPR, HIPAA, CCPA, and many other
four-letter acronyms. analytickit is the alternative to sending all of your customers' personal information and usage
data to third-parties.

analytickit is designed to give you every tool you need to understand user behavior, create hypothesis and release
changes to make your product more successful.

## What's cool about this?

analytickit is the only **product-focused** open-source analytics suite, with an event, user and group architecture
that **you can host in any infrastructure**.

We are an open-source alternative to products such as Mixpanel, Amplitude, Heap, HotJar, Pendo or Full Story. We're
designed to be more developer-friendly, with the broadest range of features like session recording, heatmaps, feature
flags, and plugins.

We play nicely with data warehouses and other services - you can _import_ event or user data by writing a plugin to
create transformations, or you can _export_ data by using our existing data exports to BigQuery, Redshift, Snowflake,
etc. All without losing control of your data.

## Developing locally & Contributing

See our Docs for instructions on [developing analytickit locally](https://analytickit.com/docs/developing-locally).

We <3 contributions big or small, check out our [guide on how to get started](https://analytickit.com/docs/contributing)
.

Not sure where to
start? [Book a free, no-pressure pairing session](mailto:tim@analytickit.com?subject=Pairing%20session&body=I'd%20like%20to%20do%20a%20pairing%20session!)
with one of the team.

## We're hiring!

Come help us make analytickit even better. We're growing
fast, [and would love for you to join us](https://analytickit.com/careers).

