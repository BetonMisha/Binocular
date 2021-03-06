Pupil
=====

Pupil is a tool for visualizing data from various software-engineering
tools. It works as a command-line tool run from a git-repository. When
run, pupil will gather data from the repository and the GitLab
REST-API and persist it to a configured ArangoDB instance.

Pupil then hosts interactive visualizations about the gathered data
via a web-interface.

## Naming

"Pupil" is the name used in this repository and also the name used in
the source code to refer to itself. In the accompanying master's
thesis, "pupil" is referred to as "zivsed". On the INSO projects page,
it is described as "binocular". Don't get confused, its all the same
thing - naming is hard `¯\_(ツ)_/¯`.

## Dependencies

* node.js >= 8
* ArangoDB (tested with 3.1.28)

## Installation

Pupil is not yet published on the npm registry. To install it, you
should clone this repository and then link it:

``` shell
$ git clone git@gitlab.com:romand/pupil.git
$ cd pupil
pupil$ npm link    # <- this will make the `pupil` executable available in your $PATH
```

### Configuration

As pupil needs to access an ArangoDB instance, you have to configure
the database connection before you can use pupil. This can be done in
the global pupil-configuration file `~/.pupilrc`. Additionally, the
configuration file also stores authentication data for the consumed
REST-APIs. The configuration file is read by the [rc
module](https://www.npmjs.com/package/rc). Check its documentation to
see the supported formats. For the purpose of this README, we'll use
json.

#### Configuration options

- `gitlab`: Object holding gitlab configuration options
  - `url`: The URL to the GitLab-Instance you want to connect to. Use the
         base-url, not the API-URL (see the example)!
  - `token`: The personal access token generated by your GitLab user to
            use for authentication (see
            https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html)
- `github`: Object holding github configuration options
  - `auth`: Can hold any options that the [github npm-module] can take, check its documentation.
- `arango`: Object holding arangodb-configuration
 - `host`: Hostname
 - `port`: Port
 - `user`: username
 - `password`: password


A sample configuration file looks like this:

``` javascript
{
  "gitlab": {
    "url": "https://gitlab.com/",
    "token": "YOUR_GITLAB_API_TOKEN"
  },
  "github": {
    "auth": {
      "type": "basic",
      "username": "YOUR_GITLAB_USER",
      "password": "YOUR_GITLAB_PASSWORD"
    }
  },
  "arango": {
    "host": "localhost",
    "port": 8529,
    "user": "YOUR_ARANGODB_USER",
    "password": "YOUR_ARANGODB_PASSWORD"
  }
}
```


You may override configuration options for specific projects by
placing another `.pupilrc` file in the project's root directory.


## Usage

To run pupil, simply execute `pupil` from the repository you want to
run pupil on (you can try it on the pupil-repo itself!). Pupil will
try to guess reasonable defaults for configuration based on your
`.git/config`. A browser window should pop up automatically with
pupil's web-interface showing the indexing progress and the
visualizations.

## Contributing

For an explanation of pupil's architecture, please see the [Contribution
guidelines for this project](docs/CONTRIBUTING.md)
