# bibliomap

Bibliomap is a tool for real-time viewing in the browser localised usage events generated by [ezPAARSE](https://github.com/ezpaarse-project/ezpaarse).

How could it be useful ?
  * For real-time monitoring your ezproxy EC consultations 
  * For the fun !

Bibliomap uses these softwares:
  * [Log.io](http://logio.org/) for ECs harvesting and for real-time usage events viewing in the browser.
  * [ezpaarse2log.io](https://github.com/ezpaarse-project/ezpaarse2log.io) for real-time listening lines of log comming from log.io-harvester, creating ezPAARSE jobs to generate corresponding usage event and then sending all of this to log.io-server

<p align="center">
<img src="https://docs.google.com/drawings/d/1wx-IudPtbiFurr8FMr84JOEKgfoTSC7DffOu6Ev6RAk/pub?w=828&amp;h=350" />
</p>

## Prerequisites

  * 2 serveurs with Linux OS (ex: debian or ubuntu)
    * 1st server hosts [ezpaarse2log.io](https://github.com/ezpaarse-project/ezpaarse2log.io) see docs to install
    * 2nd server hosts Bibliomap (assume that server ip or hostname is: **{bibliomap-server}**)
  * Install curl and git on **{bibliomap-server}** :
```bash
sudo apt-get install curl git
```
  * Install NodeJS on **{bibliomap-server}** :
```bash
curl https://raw.githubusercontent.com/creationix/nvm/v0.5.1/install.sh | sh
nvm install 0.10
nvm use 0.10
nvm alias default 0.10
```
## Installation

On **{bibliomap-server}**:
```bash
git clone https://github.com/ezpaarse-project/bibliomap.git
cd bibliomap
npm install -g forever

npm install
```


## Configuration

Then open your browser and go to http://bibliomap-ip:50197/ and you will have the nice Bibliomap interface displayed.

<p align="center">
<img src="https://raw.githubusercontent.com/ezpaarse-project/bibliomap/master/bibliomap.png" alt="Running Bibliomap screenshot" />
</p>

## Running Bibliomap

### Start

On **{bibliomap-server}**:
```bash
./etc/init.d/bibliomap start
```

### Status

```bash
./etc/init.d/bibliomap status
```

### Stop

```bash
./etc/init.d/bibliomap stop
```

### Monitoring (log files)

```bash
tail -f ./logs/bibliomap-stderr.log
tail -f ./logs/bibliomap-stdout.log
```